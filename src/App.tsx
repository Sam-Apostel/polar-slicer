import './App.css';
import React from 'react';
import GCodeEditor from './components/GCodeEditor';
import GCodeViewer from './components/GCodeViewer';
import PrintSettings from './components/PrintSettings';
import useGCodeGenerator from './hooks/useGCodeGenerator';


const App = () => {
	const {
		gCode,
		setGCode,
		geometry,
		setGeometry,
		settings,
		setSettings,
		// graphs
	} = useGCodeGenerator();
	// const [graphLayer, setGraphLayer] = useState(0);

	return (
		<div className="App">
			<GCodeEditor gCode={gCode} onChange={setGCode} />
			{gCode && <GCodeViewer gCode={gCode} shell={geometry} />}
			<PrintSettings
				value={settings}
				onChange={setSettings}
				geometry={geometry}
				setGeometry={setGeometry}
				// setGraphLayer={setGraphLayer}
				// gaphLayer={graphLayer}
				// graphLayers={graphs?.length ?? 0}
			/>
			{/*<Graph graph={graphs?.[graphLayer]} />*/}
		</div>
	);
};

export default App;
