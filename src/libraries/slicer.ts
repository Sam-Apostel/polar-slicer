/**
 * get slices
 */
import { equalsWithTolerance } from './offsetPolygon';
import { Vertex } from '../types/geometry';

export const getSlices = (geometry, settings) => {
	const height = geometry.boundingBox.max.z;
	const amountOfSlices = Math.ceil(height / settings.layerHeight);
	return [...Array(amountOfSlices)].map((_, layer) => getSlice(geometry, layer * settings.layerHeight));
}

/**
 * get slice
 */
const getSlice = (geometry, zHeight) => {
	const faces = getFacesAtHeight(geometry.faces, zHeight);

	const allEdges = faces.map((face) => getEdgeFromFace(face, zHeight));
		const edges = Array.from(new Set(allEdges));
	const { shapes } = getShapesFromEdges(edges);
	const layer = setWindingDirection(shapes);
	return {
		z: zHeight,
		shapes: layer,
		// graph
	};
}


/**
 * Get faces at Z
 */
const getFacesAtHeight = (vertices, height) => {
	return vertices
		.filter(face => {
			const { below, at, above } = face.reduce((locations, { z }) => {
				if (z > height) return { ...locations, above: locations.above + 1 };
				if (z === height) return { ...locations, at: locations.at + 1 };
				return { ...locations, below: locations.below + 1 };
			}, { below: 0, at: 0, above: 0 });

			// we don't use faces in plane with height
			// we only get the faces that have 2 vertices on the plane and one below (not above)
			return (above && below) || ((at === 2) && below);
		}
	);
}

const xy = ({x, y}) => ({x, y});

/**
 * Get vertex at Z from face
 * @param face a triangle defined by 3 vertices {x, y, z}, the order of the vertices defines the normal of the face
 * @param height the numerical z-value at which to create an edge that lays on the face
 *
 * @returns edge consists of 2 2d vertices, the order defines the normal (all on the z plane described by height)
 */
const getEdgeFromFace = (face, height) => {
	const at = face.filter(({ z }) => z === height);
	const above = face.filter(({ z }) => z > height);
	const below = face.filter(({ z }) => z < height);
	if (at.length === 2) return at.map(xy);
	if (at.length === 1) return [xy(at[0]), vertexAtHeightOnEdge([above[0], below[0]], height)];
	if (above.length === 2) return [vertexAtHeightOnEdge([above[0], below[0]], height), vertexAtHeightOnEdge([above[1], below[0]], height)];
	if (below.length === 2) return [vertexAtHeightOnEdge([above[0], below[0]], height), vertexAtHeightOnEdge([above[0], below[1]], height)];
	console.error('are you sure this face and height intersect?', { face, height });
}

/**
 * interpolate vertex on edge
 */
const vertexAtHeightOnEdge = (edge, height) => {
	const progressOnEdge = (height - edge[0].z) / (edge[1].z - edge[0].z);

	return {
		x: (edge[1].x - edge[0].x) * progressOnEdge + edge[0].x,
		y: (edge[1].y - edge[0].y) * progressOnEdge + edge[0].y,
	};
};

const isSameVertexWithTolerance = (a: Vertex, b: Vertex, tolerance?: number) => {
	// return JSON.stringify(a) === JSON.stringify(b)
	return equalsWithTolerance(a.x, b.x, tolerance)
		&& equalsWithTolerance(a.y, b.y, tolerance);
}


type Edge = [Vertex, Vertex];

// type Loop = Array<Vertex>;

type GraphNode = {
	vertex: Vertex;
	connections: Array<Vertex>
};

type Graph = Map<string, GraphNode>;


/**
 * get shape from vertices
 */
const getShapesFromEdges = (edges) => {
	if (edges.length <= 3) return { shapes: [], graph: new Map()};
	const addEdgeToGraph = ([v1, v2]: Edge, graph: Graph): Graph => {
		graph.set(JSON.stringify(v1), { vertex: v1, connections: [...(graph.get(JSON.stringify(v1))?.connections ?? []), v2] });
		graph.set(JSON.stringify(v2), { vertex: v2, connections: [...(graph.get(JSON.stringify(v2))?.connections ?? []), v1] });
		return graph;
	}

	const graph = edges.reduce((graph: Graph, edge: Edge) => addEdgeToGraph(edge, graph), new Map());
	const backupGraph = new Map(JSON.parse(JSON.stringify(Array.from(graph)))) as Graph;

	const getLoop = (current: GraphNode, last: Vertex): Vertex[] => {
		graph.delete(JSON.stringify(current.vertex));
		const nextVertex = current.connections[0];
		if (!nextVertex) return [current.vertex, null];
		if (isSameVertexWithTolerance(nextVertex, last)) return [current.vertex]; // closed loop

		const nextNode = graph.get(JSON.stringify(nextVertex));
		if (!nextNode) return [current.vertex, null];

		const nextConnections = nextNode.connections.filter(vertex => JSON.stringify(vertex) !== JSON.stringify(current.vertex));

		const loopAfter = getLoop({
			vertex: nextVertex,
			connections: nextConnections
		}, last);
		if (loopAfter.at(-1) !== null || current.connections.length === 1) {
			return [
				current.vertex,
				...loopAfter
			];
		}

		const previousVertex = current.connections[1];
		const previousNode = graph.get(JSON.stringify(previousVertex));
		if (!previousNode) return [current.vertex, ...loopAfter];

		const previousConnections = previousNode.connections.filter(vertex => JSON.stringify(vertex) !== JSON.stringify(current.vertex));

		const loopBefore = getLoop({
			vertex: previousVertex,
			connections: previousConnections
		}, loopAfter.at(-2));

		return [
			...loopAfter.reverse().slice(1),
			current.vertex,
			...loopBefore,
		];



	}
	const shapes = [];
	const openPaths = []

	while (graph.size >= 3) {
		const firstNode = graph.entries().next().value[1];
		const shape = getLoop(firstNode, firstNode.vertex);
		if (shape.at(-1) !== null) {
			shapes.push(shape);
		} else {
			const [, ...path] = shape.reverse();
			openPaths.push(path);
		}
	}

	const closedPaths = []
	if (openPaths.length >= 1) {
		while (openPaths.length >= 1) {
			const [currentPath, ...restPaths] = openPaths;
			const { closest, index } = findClosesPath(currentPath, restPaths);
			if (index === -1) {
				openPaths.splice(0, 1);
			} else {
				if (index === 0) {
					closedPaths.push(currentPath);
				} else {
					openPaths[0] = [...currentPath, ...closest];
				}
				openPaths.splice(index, 1);
			}
		}
	}
	if (openPaths.length) console.log(openPaths);

	return {
		shapes: [...shapes, ...closedPaths].map(shape => {
			const simplifiedShape = shape.filter(inLineFilter);
			// TODO: replace edges that follow an arc with an arc
			// merge multiple edges that have the same length and angle between them into an arc

			if (getWindingDirection(simplifiedShape) === ANTICLOCKWISE) return simplifiedShape.reverse();
			return simplifiedShape;
		}),
		graph: backupGraph
	};
};

const ANTICLOCKWISE = false;
const CLOCKWISE = !ANTICLOCKWISE;
const getWindingDirection = (vertices) => {
	let sum = 0;
	for (let i = 0; i < vertices.length; i++) {
		const v1 = vertices[i];
		const v2 = vertices[(i + 1) % vertices.length];
		sum += (v2.x - v1.x) * (v2.y + v1.y);
	}

	return sum > 0;
}

const inLineFilter = (vertex, index, vertices) => {
	const prev = vertices[(index - 1 + vertices.length) % vertices.length];
	const next = vertices[(index + 1) % vertices.length];

	// consecutive equal vertexes will always be in line with each other and should leave one of them behind
	if (isSameVertexWithTolerance(vertex, next) && !isSameVertexWithTolerance(vertex, prev)) return true;

	return !inLineWithTolerance(prev, vertex, next);
};

const inLineWithTolerance = (a: Vertex, b: Vertex, c: Vertex, tolerance?: number) => {
	return equalsWithTolerance(distance(a, b) + distance(b, c), distance(a, c), tolerance)
}

const distance = (a, b) => {
	const x = b.x - a.x;
	const y = b.y - a.y;

	return Math.sqrt(x * x + y * y);
}

const setWindingDirection = (shapes) => {
	const shapesWithNesting = shapes.map((shape, i) => {
		return {
			shape,
			nesting: shapes.filter((_, j) => i !== j).filter(otherShape => isPointInPath(shape[0], otherShape)).length,
		}
	})

	return shapesWithNesting.map(({ shape, nesting }) => {

		if (Boolean(nesting % 2) === CLOCKWISE) {
			shape.reverse();
		}

		shape.push(shape[0]);
		return shape;
	})
};


/**
 * Determine if a vertex is in the polygon.
 *
 * @param vertex
 * @param polygon
 * @returns true if the point is in or on the path
 */
const isPointInPath = (vertex: Vertex, polygon: Vertex[]): boolean => {
	return polygon.reduce((acc, curr) => {
		if (isSameVertexWithTolerance(vertex, curr)) return acc;
		if ((curr.y > vertex.y) !== (acc.prev.y > vertex.y)) {
			const slope = (vertex.x - curr.x) * (acc.prev.y - curr.y) - (acc.prev.x - curr.x) * (vertex.y - curr.y);
			if (slope === 0) return acc;
			if ((slope < 0) !== (acc.prev.y < curr.y)) {
				return { prev: curr, winding: !acc.winding };
			}
		}
		return { ...acc, prev: curr };
	}, { prev: polygon.at(-1), winding: false }).winding;
}

const findClosesPath = (currentPath, paths) => {
	const { closest, index, dist } = paths.reduce(({ closest, dist, index }, path, i) => {
		const distanceByStart = distance(currentPath.at(-1), path[0]);
		const distanceByEnd = distance(currentPath.at(-1), path.at(-1));
		if (distanceByStart < distanceByEnd) {
			if (distanceByStart < dist) {
				return { closest: path, dist: distanceByStart, index: i };
			}
		} else {
			if (distanceByEnd < dist) {
				return { closest: path.reverse(), dist: distanceByEnd, index: i };
			}
		}
		return { closest, dist, index };
	}, { closest: null, dist: Infinity,index: -1 });

	const selfClosingDistance = distance(currentPath.at(-1), currentPath[0]);
	if (selfClosingDistance < dist) {
		if (selfClosingDistance > 0.00001) return { index: -1 };
		return { closest: null, index: 0 };
	}
	if (dist > 0.00001) return { index: -1 };
	return { closest, index: index + 1 };
}

