import { useEffect, useState } from 'react';
import { getSlices } from '../libraries/slicer';

const useGcodeGenerator = () => {
	const [gcode, setGcode] = useState('');
	const [geometry, setGeometry] = useState();

	useEffect(() => {
		if(!geometry) return;
		const positions = geometry.attributes.position.array
		const bounds = {};
		const indexArray = geometry.index?.array ?? [...Array(positions.length / 3)].map((_, i) => i);
		const faces = [...Array(indexArray.length / 3)].map((_,i) => {
			const indexes = [...indexArray.slice(i * 3, (i+1) * 3)];
			const vertices = indexes.map(index => {
				const vertex = [...positions.slice((index) * 3, (index+1) * 3)];
				return {
					x: vertex[0],
					y: vertex[1],
					z: vertex[2]
				};
			});
			vertices.forEach(vertex => {
				if (bounds.bottom === undefined || bounds.bottom > vertex.z) bounds.bottom = vertex.z;
				if (bounds.top === undefined || bounds.top < vertex.z) bounds.top = vertex.z;
			});
			return vertices;
		})

		const slices = getSlices(
			{
				bounds,
				height: bounds.top - bounds.bottom,
				faces
			},
			{
				layerHeight: 1
			}
		);
		let fastMove = true;
		let e=1;
		const gcodeCommands = slices.flatMap(({ z, edges, shape }) => {

			fastMove = true;
			return shape.map(({ x, y }) => {
				if (fastMove) {
					fastMove = false;
					return `G0 X${x} Y${y} Z${z}`;
				}
				return `G1 X${x} Y${y} Z${z} E${e++}`;
			});

		});
		setGcode(gcodeCommands.join(`
`));
	}, [geometry]);

	return [gcode, setGcode, geometry, setGeometry];
};

export default useGcodeGenerator;
