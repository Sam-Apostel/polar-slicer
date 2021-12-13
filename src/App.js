import './App.css';
import { useEffect } from 'react';
import {
	IcosahedronGeometry
} from 'three';
import GcodeEditor from './components/GcodeEditor';
import GcodeViewer from './components/GcodeViewer';
import useGcodeGenerator from './hooks/useGcodeGenerator';


function App() {
	const [gcode, setGcode, geometry, setGeometry] = useGcodeGenerator();

	useEffect(() => {
		setGeometry(new IcosahedronGeometry(50))
	}, [])
	return (
		<div className="App">
			<GcodeEditor gcode={gcode} onChange={setGcode} />
			<GcodeViewer gcode={gcode} shell={geometry} />
		</div>
	);
}

export default App;
