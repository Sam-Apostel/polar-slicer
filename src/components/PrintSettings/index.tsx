import './style.css';
import React, { useEffect, useState } from 'react';
import projects from '../../models/projects';

const PrintSettings = props => {
	const {
		value,
		onChange,
		setGeometry,
		// setGraphLayer,
		// graphLayers,
		// graphLayer
	} = props;

	const [project, setProject] = useState('');

	useEffect(() => {
		if (!project) return;
		if (!setGeometry) return;
		if (!projects[project].geometry) return;
		setGeometry(projects[project].geometry);
	}, [project, setGeometry])

	return (
		<div className="Settings">
			<label>
				<span>model:</span>
				<select value={project} onChange={e => setProject(e.target.value)}>
					<option value="" disabled hidden>Choose here</option>
					{projects.map((project, i) => (
						<option key={project.name} value={i}>{project.name}</option>
					))}
				</select>
			</label>
			<label>
				<span>Layer height:</span>
			<input type="number" value={value.layerHeight} onChange={e => onChange({ ...value, layerHeight: +e.target.value })} step={.1} min={.1} />
			</label>
			<label>
				<span>Line width:</span>
				<input type="number" value={value.line.width} onChange={e => onChange({ ...value, line: { ...value.line, width: +e.target.value } })} step={.1} min={.1} />
			</label>
			<label>
				<span>Walls:</span>
				<input type="number" value={value.walls} onChange={e => onChange({ ...value, walls: +e.target.value })} step={1} min={1} />
			</label>
			{/*<label>*/}
			{/*	<span>Graph layer:</span>*/}
			{/*	<input type="number" value={graphLayer} onChange={e => setGraphLayer(e.target.value)} min={0} max={graphLayers - 1} step={1} />*/}
			{/*</label>*/}
			{/*<pre>*/}
			{/*	{JSON.stringify(value, null, ' ')}*/}
			{/*</pre>*/}
		</div>
	);
};

export default PrintSettings;
