import {
	BufferGeometry,
	Euler,
	FileLoader,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader,
	EllipseCurve
} from 'three';

class GCodeLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.splitLayer = false;

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( data ) {

		let state = { x: 0, y: 0, z: 0, e: 0, f: 0, extruding: false, relative: false };
		const layers = [];

		let currentLayer = undefined;

		const pathMaterial = new LineBasicMaterial( { color: 0xFF0000 } );
		pathMaterial.name = 'path';

		const extrudingMaterial = new LineBasicMaterial( { color: 0x00FF00 } );
		extrudingMaterial.name = 'extruded';

		const arcMaterial = new LineBasicMaterial( { color: 0x0000FF } );
		arcMaterial.name = 'arc';

		function newLayer( line ) {

			currentLayer = { vertex: [], pathVertex: [], arcVertex: [], z: line.z };
			layers.push( currentLayer );

		}

		//Create lie segment between p1 and p2
		function addSegment( p1, p2 ) {

			if ( currentLayer === undefined ) {

				newLayer( p1 );

			}

			if ( state.extruding ) {

				currentLayer.vertex.push( p1.x, p1.y, p1.z );
				currentLayer.vertex.push( p2.x, p2.y, p2.z );

			} else {

				currentLayer.pathVertex.push( p1.x, p1.y, p1.z );
				currentLayer.pathVertex.push( p2.x, p2.y, p2.z );

			}

		}

		function addArc (p1, p2, center, radius, direction) {
			if ( currentLayer === undefined ) newLayer( p1 );

			function getAngle (p, c) {
				const x = p.x - c.x;
				const y = p.y - c.y;
				return Math.atan2(y, x);
			}

			const curve = new EllipseCurve(
				center.x, center.y,
				radius, radius,
				getAngle(p1, center), getAngle(p2, center),
				direction
			);
			const divisions = 50;
			curve.getPoints(divisions).map((point, index) => {
				return { ...point, z: p1.z + (p2.z - p1.z) / divisions * index}
			})
				.map((point, index, points) => {
					return {
						a: { ...point },
						b: { ...points[index + 1] }
					};
				})
				.slice(0, -1)
				.forEach(({ a, b}) => {
					currentLayer.arcVertex.push( a.x, a.y, a.z );
					currentLayer.arcVertex.push( b.x, b.y, b.z );
				});
		}

		function delta( v1, v2 ) {

			return state.relative ? v2 : v2 - v1;

		}

		function absolute( v1, v2 ) {

			return state.relative ? v1 + v2 : v2;

		}

		const lines = data.replace( /;.+/g, '' ).split( '\n' );

		for ( let i = 0; i < lines.length; i ++ ) {

			const tokens = lines[ i ].split( ' ' );
			const cmd = tokens[ 0 ].toUpperCase();

			const args = {};
			tokens.splice( 1 ).forEach( function ( token ) {

				if ( token[ 0 ] !== undefined ) {

					const key = token[ 0 ].toLowerCase();
					args[ key ] = parseFloat(token.substring(1));

				}

			} );

			//Process commands

			if ( cmd === 'G0' ) {
				// G0 – Fast Movement (optimised for polar kinematics)
				const line = {
					x: args.x !== undefined ? absolute( state.x, args.x ) : state.x,
					y: args.y !== undefined ? absolute( state.y, args.y ) : state.y,
					z: args.z !== undefined ? absolute( state.z, args.z ) : state.z,
					e: args.e !== undefined ? absolute( state.e, args.e ) : state.e,
					f: args.f !== undefined ? absolute( state.f, args.f ) : state.f,
				};

				if ( delta( state.e, line.e ) > 0 ) {

					state.extruding = delta( state.e, line.e ) > 0;

					if ( currentLayer === undefined || line.z !== currentLayer.z ) {

						newLayer( line );

					}

				}
				const getPolar = ({x, y, z}) => {
					return {
						a: Math.atan2(y, x),
						r: Math.sqrt(x * x + y * y),
						z
					};
				}
				const p1 = getPolar(state);
				const p2 = getPolar(line);
				// if (p1.r === 0) p1.a = p2.a; // get rotation from G68
				if (p2.r === 0) p2.a = p1.a;

				const divisions = 50;
				const interpolate = (a, b, segments, step) => a + (b - a) / segments * step;
				[...Array(divisions + 1)]
					.map((_, i) => ({
						a: interpolate(p1.a, p2.a, divisions, i), // TODO choose the shortest direction
						r: interpolate(p1.r, p2.r, divisions, i),
						z: interpolate(p1.z, p2.z, divisions, i),
					}))
					.map(({ a, r, z }) => ({
						x: Math.cos(a) * r,
						y: Math.sin(a) * r,
						z: z
					}))
					.map((point, index, points) => ({
						a: { ...point },
				b: { ...points[index + 1] }
			}))
					.slice(0, -1)
					.forEach( ({a, b}) => {
						addSegment( a, b );
					});

				state = line;

			} else if ( cmd === 'G1' ) {

				// G1 – Linear Movement
				const line = {
					x: args.x !== undefined ? absolute( state.x, args.x ) : state.x,
					y: args.y !== undefined ? absolute( state.y, args.y ) : state.y,
					z: args.z !== undefined ? absolute( state.z, args.z ) : state.z,
					e: args.e !== undefined ? absolute( state.e, args.e ) : state.e,
					f: args.f !== undefined ? absolute( state.f, args.f ) : state.f,
				};

				//Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
				if ( delta( state.e, line.e ) > 0 ) {

					state.extruding = delta( state.e, line.e ) > 0;

					if ( currentLayer === undefined || line.z !== currentLayer.z ) {

						newLayer( line );

					}

				}

				addSegment( state, line );
				state = line;

			} else if ( cmd === 'G2' || cmd === 'G3' ) {

				// G2/G3 - circular Arc Movement ( G2 clock wise and G3 counter clock wise )
				const line = {
					x: args.x !== undefined ? absolute( state.x, args.x ) : state.x,
					y: args.y !== undefined ? absolute( state.y, args.y ) : state.y,
					z: args.z !== undefined ? absolute( state.z, args.z ) : state.z,
					e: args.e !== undefined ? absolute( state.e, args.e ) : state.e,
					f: args.f !== undefined ? absolute( state.f, args.f ) : state.f,
				};

				// TODO add invalid argument cases
				// radius can not be smaller than distance between points / 2 -> draw straight line
				//
				const getCenter = (X1, Y1, X2, Y2, radius, direction) => {
					const Xa = .5 * (X2 - X1);
					const Ya = .5 * (Y2 - Y1);

					const X0 = X1 + Xa;
					const Y0 = Y1 + Ya;

					const a = Math.sqrt(Xa * Xa + Ya * Ya);
					const b = Math.sqrt(Math.abs(radius * radius - a * a));

					const dx = (b * Ya) / a;
					const dy = (b * Xa) / a;

					if (direction) return { x: X0 + dx, y: Y0 - dy };
					return { x: X0 - dx, y: Y0 + dy };
				};

				const radius = args.r;
				const center = getCenter(state.x, state.y, line.x, line.y, radius, cmd === 'G2')

				//Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
				if ( delta( state.e, line.e ) > 0 ) {
					state.extruding = delta( state.e, line.e ) > 0;
					if ( currentLayer === undefined || line.z !== currentLayer.z ) {
						newLayer( line );
					}

				}

				addArc( state, line, center, radius, cmd === 'G2' );
				state = line;
			} else if ( cmd === 'G90' ) {
				//G90: Set to Absolute Positioning
				state.relative = false;
			} else if ( cmd === 'G91' ) {
				//G91: Set to state.relative Positioning
				state.relative = true;
			} else if ( cmd === 'G92' ) {
				//G92: Set Position
				const line = state;
				line.x = args.x !== undefined ? args.x : line.x;
				line.y = args.y !== undefined ? args.y : line.y;
				line.z = args.z !== undefined ? args.z : line.z;
				line.e = args.e !== undefined ? args.e : line.e;
				state = line;
			} else {
				console.warn( 'THREE.GCodeLoader: Command not supported:' + cmd );
			}
		}

		function addObject( vertex, material, i ) {
			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
			const segments = new LineSegments( geometry, material );
			segments.name = 'layer' + i;
			object.add( segments );
		}

		const object = new Group();
		object.name = 'gcode';

		if ( this.splitLayer ) {
			for ( let i = 0; i < layers.length; i ++ ) {
				const layer = layers[ i ];
				addObject( layer.vertex, extrudingMaterial, i );
				addObject( layer.pathVertex, pathMaterial, i );
				addObject( layer.arcVertex, arcMaterial, i );
			}
		} else {

			const vertex = [];
			const pathVertex = [];
			const arcVertex = [];

			for ( let i = 0; i < layers.length; i ++ ) {

				const layer = layers[ i ];
				const layerVertex = layer.vertex;
				const layerPathVertex = layer.pathVertex;
				const layerArcVertex = layer.arcVertex;

				for ( let j = 0; j < layerVertex.length; j ++ ) {
					vertex.push( layerVertex[ j ] );
				}

				for ( let j = 0; j < layerPathVertex.length; j ++ ) {
					pathVertex.push( layerPathVertex[ j ] );
				}

				for ( let j = 0; j < layerArcVertex.length; j ++ ) {
					arcVertex.push( layerArcVertex[ j ] );
				}
			}
			addObject( vertex, extrudingMaterial, layers.length );
			addObject( pathVertex, pathMaterial, layers.length );
			addObject( arcVertex, arcMaterial, layers.length );

		}

		object.quaternion.setFromEuler( new Euler( - Math.PI / 2, 0, 0 ) );

		return object;

	}

}

export { GCodeLoader };
