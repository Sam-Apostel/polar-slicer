import './App.css';
import { useState } from 'react';
import GcodeEditor from './components/GcodeEditor';
import GcodeViewer from './components/GcodeViewer';


function App() {
	const [gcode, setGcode] = useState('');
	return (
		<div className="App">

			<GcodeEditor gcode={gcode} onChange={setGcode} />
			<GcodeViewer gcode={gcode} />
		</div>
	);
}

export default App;
