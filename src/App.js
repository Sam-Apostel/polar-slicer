import './App.css';
import { useEffect } from 'react';
import {
	IcosahedronBufferGeometry,
} from 'three';
import GcodeEditor from './components/GcodeEditor';
import GcodeViewer from './components/GcodeViewer';
import useGcodeGenerator from './hooks/useGcodeGenerator';


function App() {
	const [gcode, setGcode, geometry, setGeometry] = useGcodeGenerator();

	useEffect(() => {
		if (!setGeometry) return;
		setGeometry(new IcosahedronBufferGeometry(50))
	}, [setGeometry])
	return (
		<div className="App">
			<GcodeEditor gcode={gcode} onChange={setGcode} />
			<GcodeViewer gcode={gcode} shell={geometry} />
		</div>
	);
}

export default App;
