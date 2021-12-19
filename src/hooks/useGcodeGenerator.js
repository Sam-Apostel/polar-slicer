import { useEffect, useState } from 'react';
import { generateGcode } from '../libraries/gcodeGenerator';
import { getSlices } from '../libraries/slicer';
import { getFaces } from '../libraries/ThreeGeometryHelpers';

const useGcodeGenerator = () => {
	const [gcode, setGcode] = useState('');
	const [geometries, setGeometries] = useState();
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
		if (!geometries) return;
		if (!settings.layerHeight) return;
		const faces = geometries.map(geometry => getFaces(geometry));
		const boundingBox = geometries[0].boundingBox;
		
		const slices = getSlices(
			{ boundingBox, faces },
			{ layerHeight: settings.layerHeight }
		);
		setGcode(generateGcode(slices, settings));

	}, [geometries, settings]);


	return [gcode, setGcode, geometries, setGeometries, settings, setSettings];
};

export default useGcodeGenerator;
