
export const getFaces = geometry => {
	const positions = geometry.attributes.position.array
	const indexArray = geometry.index?.array ?? [...Array(positions.length / 3)].map((_, i) => i);
	return [...Array(indexArray.length / 3)].map((_, i) => {
		const indexes = [...indexArray.slice(i * 3, (i + 1) * 3)];
		return indexes.map(index => {
			const vertex = [...positions.slice((index) * 3, (index + 1) * 3)];
			return {
				x: vertex[0],
				y: vertex[1],
				z: vertex[2]
			};
		});
	})
};
