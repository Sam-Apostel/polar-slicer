import './style.css';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GCodeLoader } from './../../libraries/gCodeLoader';
import { useMeasure } from 'react-use';

const GcodeViewer = props => {
	const {
		gcode,
		shell
	} = props;
	const [sizeRef, { width, height }] = useMeasure();
	const canvasRef = useRef();
	const [renderer, setRenderer] = useState();
	const [camera, setCamera] = useState();
	const [scene, setScene] = useState();
	const [loader, setLoader] = useState();
	const [object, setObject] = useState();

	useEffect(() => {
		const renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0x2c2c2c, 1);
		setRenderer(renderer);

		const scene = new THREE.Scene();

		const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set( 500,500, 500 ).normalize();
		scene.add( directionalLight );

		const directionalLight2 = new THREE.DirectionalLight( 0xffffff, .3 );
		directionalLight2.position.set( -500,0, -500 ).normalize();
		scene.add( directionalLight2 );

		const directionalLight3 = new THREE.DirectionalLight( 0xffffff, .3 );
		directionalLight3.position.set( -500,0, 500 ).normalize();
		scene.add( directionalLight3 );

		const directionalLight4 = new THREE.DirectionalLight( 0xffffff, .2 );
		directionalLight4.position.set( 300,-200, -500 ).normalize();
		scene.add( directionalLight4 );

		const ambientLight = new THREE.AmbientLight( 0xffffff, .3 );
		scene.add( ambientLight );


		scene.add();
		setScene(scene);
	}, []);

	useEffect(() => {
		if (!shell || !scene) return;

		const material = new THREE.MeshLambertMaterial( {
			color: new THREE.Color().setHSL( .2, .5, .6 ),
			reflectivity: 0
		});

		const shellMesh = new THREE.Mesh( shell, material )
		shellMesh.position.set(0, 45, 0);
		scene.add(shellMesh);
	}, [shell, scene]);

	useEffect(() => {

		if (!renderer || !scene || !camera) return;
		const animate = function () {
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
		};
		const requestID = requestAnimationFrame( animate );

		return () => {
			cancelAnimationFrame(requestID);
		}
	}, [renderer, scene, camera]);

	useEffect(() => {
		if (!loader) {
			setLoader(new GCodeLoader());
			return;
		}
		if (!gcode || !scene) return;

		scene.remove( object );
		setObject(loader.parse(gcode));

	}, [gcode, loader, scene]);

	useEffect(() => {
		if (!scene || !object) return;
		// object.position.set( - 100, - 20, 100 );
		scene.add(object);
	}, [object, scene]);

	useEffect(() => {
		if (!width || !height) return;
		const aspectRatio = width / height;
		if (!camera) {
			const camera = new THREE.PerspectiveCamera( 75, aspectRatio, .1, 1000 );
			camera.updateProjectionMatrix();
			camera.position.set( 240, 170, 150);
			camera.lookAt(new THREE.Vector3(0,0,0));
			setCamera(camera);

			return;
		}

		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
		if (renderer) renderer.setSize( width, height );

	}, [width, height, renderer, camera]);

	useEffect(() => {
		if (!canvasRef.current || !renderer || !camera) return;
		if (canvasRef.current.children.length === 0) canvasRef.current.appendChild( renderer.domElement );
		const controls = new OrbitControls(camera, canvasRef.current);
		controls.minDistance = 10;
		controls.maxDistance = 400;

		return () => {
			controls.dispose();
		}
	}, [canvasRef, renderer, camera]);

	return (
		<div className="GcodeViewer" ref={sizeRef}>
			<div className="canvas" ref={canvasRef} style={{backgroundColor: 'red'}} />
		</div>
	);
};

export default GcodeViewer;
