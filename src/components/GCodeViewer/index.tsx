import './style.css';
import React, { useEffect } from 'react';
import { Euler } from 'three';
import * as THREE from 'three';
import useGCodeViewer from '../../hooks/useGCodeViewer';


const GCodeViewer = props => {
	const {
		gCode,
		shell
	} = props;

	const {
		scene,
		shellMaterial,
		lineMaterial,
		loader,
		sizeRef,
		registerCanvas
	} = useGCodeViewer();

	useEffect(() => {
		const currentShell = scene.getObjectByName('shell');
		const currentLine = scene.getObjectByName('line');
		if (currentShell) scene.remove(currentShell);
		if (currentLine) scene.remove(currentLine);

		if (!shell) return;

		const line = new THREE.LineSegments(new THREE.EdgesGeometry(shell), lineMaterial);
		line.position.set(0, 0, 0);
		line.quaternion.setFromEuler( new Euler( - Math.PI / 2, 0, 0 ) )
		line.name = 'line';
		scene.add(line);

		const shellMesh = new THREE.Mesh(shell, shellMaterial)
		shellMesh.position.set(0, 0, 0);
		shellMesh.quaternion.setFromEuler( new Euler( - Math.PI / 2, 0, 0 ) )
		shellMesh.name = 'shell';
		scene.add(shellMesh);
	}, [shell, scene, shellMaterial, lineMaterial]);

	useEffect(() => {
		const currentPath = scene.getObjectByName('gcode');
		if (currentPath) scene.remove(currentPath);

		if (!gCode) return;

		const path = loader.parse(gCode);
		path.name = 'gcode';
		scene.add(path);
	}, [gCode, scene, loader]);

	return (
		<div className="GCodeViewer" ref={sizeRef}>
			<div className="canvas" ref={registerCanvas} style={{backgroundColor: 'red'}} />
		</div>
	);
};

export default GCodeViewer;
