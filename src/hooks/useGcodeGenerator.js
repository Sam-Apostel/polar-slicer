import { useEffect, useState } from 'react';
import { generateGcode } from '../libraries/gcodeGenerator';
import { getSlices } from '../libraries/slicer';
import { getFaces } from '../libraries/ThreeGeometryHelpers';

const useGcodeGenerator = () => {
	const [gcode, setGcode] = useState('');
	const [geometry, setGeometry] = useState();

	useEffect(() => {
		if(!geometry) return;
		const faces = getFaces(geometry);
		const boundingBox = geometry.boundingBox;

		const slices = getSlices(
			{ boundingBox, faces },
			{ layerHeight: 1 }
		);


		setGcode(generateGcode(slices, {
			line: {
				width: .6
			},
			walls: 2,
			infill: {
				type: 'linear',
				rotation: Math.PI / 12,
				density: .2,
			}
		}));
	}, [geometry]);

	return [gcode, setGcode, geometry, setGeometry];
};

export default useGcodeGenerator;
