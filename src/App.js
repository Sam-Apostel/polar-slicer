import './App.css';
import { useEffect } from 'react';
import {
	IcosahedronBufferGeometry,
} from 'three';
import GcodeEditor from './components/GcodeEditor';
import GcodeViewer from './components/GcodeViewer';
import PrintSettings from './components/PrintSettings';
import useGcodeGenerator from './hooks/useGcodeGenerator';


function App() {
	const [
		gcode,
		setGcode,
		geometries,
		setGeometries,
		settings,
		setSettings
	] = useGcodeGenerator();

	useEffect(() => {
		if (!setGeometries) return;
		const geom = new IcosahedronBufferGeometry(50);
		const geomInside = new IcosahedronBufferGeometry(30);
		geom.computeBoundingBox();
		geomInside.computeBoundingBox();
		const centerOffset = -geom.boundingBox.min.z - 1;
		geom.translate(0, 0, centerOffset);
		geomInside.translate(0, 0, centerOffset);

		setGeometries([geom, geomInside]);
	}, [setGeometries])
	return (
		<div className="App">
			<GcodeEditor gcode={gcode} onChange={setGcode} />
			<GcodeViewer gcode={gcode} shells={geometries} />
			<PrintSettings settings={settings} onChange={setSettings} />
		</div>
	);
}

export default App;
