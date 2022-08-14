import { getInsetPolygon } from './offsetPolygon';
let e;
let newLayer;
export const generateGCode = (slices, settings) => {
	e = 1; // TODO: calculate path length and set extrusion amount
	const gCodeCommands = slices.map(({ z, shapes }, i) => {
		newLayer = i;
		return shapes.map(shape => {
			const offsetShapes = [...Array(settings.walls)].map((_, index) =>
				getInsetPolygon(shape, (settings.line.width / 2) + (settings.line.width * index))
			);
			const roundedPaths = offsetShapes.map(shape => shape.map(({x,y,...shape}) => ({
				x: Math.round(x * 100) / 100,
				y: Math.round(y * 100) / 100,
				...shape
			})));
			return roundedPaths.map(offsetShape => pathToGCode(offsetShape, z)).join('\n\n');
		}).join('\n');
	});

	return gCodeCommands.join(`\n\n`);
}


const pos = {
	x: 0,
	y: 0,
	z: 0
};
const simplifyCommands = true;
const pathToGCode = (path, z) => {
	let fastMove = true;

	const gCodeCommands = path.map(({ x, y, r }) => {
		const newPos = simplifyCommands ? `${pos.x !== x ? `X${x} `:''}${pos.y !== y ? `Y${y} `:''}${pos.z !== z ? `Z${z} `:''}` : `X${x} Y${y} Z${z} `;
		pos.x = x;
		pos.y = y;
		pos.z = z;

		const layerComment = newLayer !== null ? `; start layer ${newLayer}\n` : '';
		newLayer = null;

		if (fastMove) {
			fastMove = false;
			return `${layerComment}G0 ${newPos}`;
		}
		if (r) return `G3 ${newPos}R${r} E${e++}`;
		return `G1 ${newPos}E${e++}`;
	});

	return gCodeCommands.join('\n');
}
