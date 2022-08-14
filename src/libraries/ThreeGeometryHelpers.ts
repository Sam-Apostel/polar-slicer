import { BufferGeometry } from 'three';

export const getFaces = (geometry: BufferGeometry) => {
	const positions = geometry.attributes.position.array
	const indexArray = geometry.index?.array ?? [...Array(positions.length / 3)].map((_, i) => i);
	return [...Array(indexArray.length / 3)].map((_, i) => {
		const indexes = Array.from(indexArray).slice(i * 3, (i + 1) * 3);
		return indexes.map(index => {
			const vertex = Array.from(positions).slice((index) * 3, (index + 1) * 3);
			return {
				x: vertex[0],
				y: vertex[1],
				z: vertex[2]
			};
		});
	})
};
