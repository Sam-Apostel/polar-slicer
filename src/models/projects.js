import * as THREE from 'three';
const toiletPaperHolder = require('./_toiletPaperHolder.json');
const knobHook = require('./_knobHook.json');
const cactusPot = require('./_cactusPot.json');
const frameMount = require('./_metalPictureHolder.json');

const triangulate = ([v1, ...vertices]) => {
	const middle = vertices.slice(0, -1);
	return middle.map((vertex, i) => {
		return [v1, vertex, vertices[i + 1]];
	});
};

const getExtrema = (vertices) => vertices.reduce(({ max, min }, vertex) => (
	{
		max: max.map((max, i) => Math.max(max, vertex[i])),
		min: min.map((min, i) => Math.min(min, vertex[i])),
	}
), {
	max: [-Infinity, -Infinity, -Infinity],
	min: [Infinity, Infinity, Infinity]
});


const parseJSONGeometryData = ({ json, name }) => {
	const OGVertices = json.flatMap(({ polygons }) => polygons.flatMap(({ vertices }) => vertices.map(vertex => vertex.map(Math.round))));
	const { max, min } = getExtrema(OGVertices);
	const size = max.map((max, i) => max - min[i]);
	const offCenter = size.map((size, i) => (size / 2) + min[i]);

	const geometries = json.map(({ polygons }) => {
		const geometry = new THREE.BufferGeometry();

		const vertices = new Float32Array(polygons
			.flatMap(({ vertices }) => triangulate(vertices).flat())
			.map(vertex => vertex.map((coord, i) => coord - offCenter[i])) // center object
			.flat());

		geometry
			.setAttribute( 'position', new THREE.BufferAttribute(vertices, 3) )
			.computeVertexNormals();

		geometry.computeBoundingBox();
		geometry.translate(-geometry.boundingBox.min.x + 1, -geometry.boundingBox.min.y + 1, -geometry.boundingBox.min.z);

		return geometry;
	})

	return { geometry: geometries[0], name };
};


const projects = [
	{ json: toiletPaperHolder, name: 'toiletPaperHolder' }, // holes
	{ json: knobHook, name: 'knobHook' }, // multiple embedded objects
	{ json: frameMount, name: 'frameMount' }, // hole and ledge
	{ json: cactusPot, name: 'cactusPot' }, // round paths
].map(parseJSONGeometryData);

export default projects;
