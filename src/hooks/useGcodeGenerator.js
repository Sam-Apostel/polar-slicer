import { useEffect, useState } from 'react';
import { generateGcode } from '../libraries/gcodeGenerator';
import { getSlices } from '../libraries/slicer';
import { getFaces } from '../libraries/ThreeGeometryHelpers';

const useGcodeGenerator = () => {
	const [gcode, setGcode] = useState('');
	const [geometry, setGeometry] = useState();
	const [settings, setSettings] = useState({
		layerHeight: 2,
		line: {
			width: 2
		},
		walls: 2,
		infill: {
			type: 'linear',
			rotation: Math.PI / 12,
			density: .2,
		}
	});

	useEffect(() => {
		if (!geometry) return;
		if (!settings.layerHeight) return;
		const faces = getFaces(geometry);
		const boundingBox = geometry.boundingBox;
		const slices = getSlices(
			{ boundingBox, faces },
			{ layerHeight: settings.layerHeight }
		);
		setGcode(generateGcode(slices, settings));

	}, [geometry, settings]);


	return [gcode, setGcode, geometry, setGeometry, settings, setSettings];
};

export default useGcodeGenerator;
