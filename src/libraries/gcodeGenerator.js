export const generateGcode = (slices, settings) => {

	const gcodeCommands = slices.flatMap(({ z, shape }) => {
		// inset by half line width
		// inset by line width walls amount of times
		// inset by line width - infill-wall overlap
			// generate infill pattern
		return pathToGcode(shape, z);
	});

	return gcodeCommands.join(`
`);
}

let e=1;
const pathToGcode = (path, z) => {
	let fastMove = true;
	const gcodeCommands = path.map(({ x, y }) => {
		if (fastMove) {
			fastMove = false;
			return `G0 X${x} Y${y} Z${z}`;
		}
		return `G1 X${x} Y${y} Z${z} E${e++}`;
	});

	return gcodeCommands.join(`
`);
}
