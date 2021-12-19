import { getInsetPolygon } from './offsetPolygon';

export const generateGcode = (slices, settings) => {

	const gcodeCommands = slices.flatMap(({ z, shapes }) => {
		return shapes.flatMap(shape => {
			const offsetShapes = [...Array(settings.walls)].map((_, index) =>
				getInsetPolygon(shape, (settings.line.width / 2) + (settings.line.width * index))
			);
			const roundedPaths = offsetShapes.map(shape => shape.map(({x,y,...shape}) => ({
				x: Math.round(x * 100) / 100,
				y: Math.round(y * 100) / 100,
				...shape
			})));
			return roundedPaths.flatMap(offsetShape => pathToGcode(offsetShape, z));
		});
	});
	
	return gcodeCommands.join(`
`);
}

let e=1;
const pathToGcode = (path, z) => {
	let fastMove = true;
	const gcodeCommands = path.map(({ x, y, r }) => {
		if (fastMove) {
			fastMove = false;
			return `G0 X${x} Y${y} Z${z}`;
		}
		if (r) return `G2 X${x} Y${y} Z${z} R${r} E${e++}`;
		return `G1 X${x} Y${y} Z${z} E${e++}`;
	});

	return gcodeCommands.join(`
`);
}
