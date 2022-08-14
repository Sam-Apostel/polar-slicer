import { useEffect, useState } from 'react';
import { generateGCode } from '../libraries/gCodeGenerator';
import { getSlices } from '../libraries/slicer';
import { getFaces } from '../libraries/ThreeGeometryHelpers';
import { BufferGeometry, IcosahedronBufferGeometry } from 'three';

const useGCodeGenerator = () => {
	const [gCode, setGCode] = useState('');
	const [geometry, setGeometry] = useState<BufferGeometry>(() => {
		const geom = new IcosahedronBufferGeometry(50);

		geom.computeBoundingBox();
		geom.translate(-geom.boundingBox.min.x + 1, -geom.boundingBox.min.y + 1, -geom.boundingBox.min.z);
		return geom;
	});

	const [settings, setSettings] = useState({
		layerHeight: 1,
		line: {
			width: .4
		},
		walls: 1,
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
		setGCode(generateGCode(slices, settings));
	}, [geometry, settings]);


	return {
		gCode,
		setGCode,
		geometry,
		setGeometry,
		settings,
		setSettings,
		// graphs
	};
};

export default useGCodeGenerator;
