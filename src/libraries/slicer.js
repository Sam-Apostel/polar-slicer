/**
 * get slices
 */
export const getSlices = (geometry, settings) => {
	const height = geometry.boundingBox.max.z;
	const amountOfSlices = Math.ceil(height / settings.layerHeight);
	const slices = [...Array(amountOfSlices)].map((_, layer) => getSlice(geometry, layer * settings.layerHeight));
	return slices;
}

/**
 * get slice
 */
const getSlice = (geometry, zHeight) => {
	const faces = getFacesAtHeight(geometry.faces, zHeight);

	const edges = [...new Set(faces.map((face) => getEdgeFromFace(face, zHeight)))];
	const shape = getShapeFromEdges(edges);
	return {
		z: zHeight,
		shape
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

			// we dont use faces in plane with height
			// we do get the faces that have 2 vertices on the plane
			// this results in these edges having doubles when both top and bottom face are not in plane with height
			return (above && below) || (at === 2);
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
const getEdgeFromFace = (vertices, height) => {
	const at = vertices.filter(({ z }) => z === height);
	const above = vertices.filter(({ z }) => z > height);
	const below = vertices.filter(({ z }) => z < height);
	if (at.length === 2) return at.map(xy);
	if (at.length === 1) return [xy(at[0]), vertexAtHeightOnEdge([above[0], below[0]], height)];
	if (above.length === 2) return [vertexAtHeightOnEdge([above[0], below[0]], height), vertexAtHeightOnEdge([above[1], below[0]], height)];
	if (below.length === 2) return [vertexAtHeightOnEdge([above[0], below[0]], height), vertexAtHeightOnEdge([above[0], below[1]], height)];
	console.error('are you sure this face and height intersect?', { face: { vertices }, height });
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

/**
 * get shape from vertices
 */
const getShapeFromEdges = edges => {
	if (edges.length <= 1) return edges.flatMap(edge => edge);

	let lastVertex = edges[0][1];
	let shape = [lastVertex];
	const usedEdges = [0];
	for (let i = 0; i < edges.length - 1; i++) {
		let direction = 1;
		const nextEdge = edges.find(([start, end], i) => {
			if (usedEdges.includes(i)) return false;
			if (lastVertex.x === start.x && lastVertex.y === start.y) {
				usedEdges.push(i);
				return true;
			}
			if (lastVertex.x === end.x && lastVertex.y === end.y) {
				usedEdges.push(i);
				direction = 0;
				return true;
			}
			return false;
		});
		if (!nextEdge) {
			continue; // TODO: start a new shape
		}
		lastVertex = nextEdge[direction];
		shape.push(nextEdge[direction]);
	}

	// join edges that lie inline with another
	shape = shape.filter((vertex, index, vertices) => {
		const prev = vertices[(index - 1 + vertices.length) % vertices.length];
		const next = vertices[(index + 1) % vertices.length];
		return (distance(prev, vertex) + distance(vertex, next) !== distance(prev, next));
	});



	// TODO: check if the shape has an even or odd amount of parents, this should determine the winding direction
	if (getWindingDirection(shape) === ANTICLOCKWISE) {
		shape.reverse();
	}
	shape.push(shape[0]);
	return shape;

}

const ANTICLOCKWISE = false;
const getWindingDirection = (vertices) => {
	let sum = 0;
	for (let i = 0; i < vertices.length; i++) {
		const v1 = vertices[i];
		const v2 = vertices[(i + 1) % vertices.length];
		sum += (v2.x - v1.x) * (v2.y + v1.y);
	}

	return sum > 0;
}

const distance = (a, b) => {
	const x = b.x - a.x;
	const y = b.y - a.y;

	return Math.sqrt(x * x + y * y);
}
