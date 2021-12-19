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
		geometry,
		setGeometry,
		settings,
		setSettings
	] = useGcodeGenerator();

	useEffect(() => {
		if (!setGeometry) return;
		const geom = new IcosahedronBufferGeometry(50);
		geom.computeBoundingBox();
		geom.translate(0, 0, -geom.boundingBox.min.z);
		setGeometry(geom)
	}, [setGeometry])
	return (
		<div className="App">
			<GcodeEditor gcode={gcode} onChange={setGcode} />
			<GcodeViewer gcode={gcode} shell={geometry} />
			<PrintSettings settings={settings} onChange={setSettings} />
		</div>
	);
}

export default App;
