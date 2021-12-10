import './style.css';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GCodeLoader } from 'three/examples/jsm/loaders/GCodeLoader';
import { useMeasure } from 'react-use';

const GcodeViewer = props => {
	const {
		gcode
	} = props;
	const [sizeRef, { width, height }] = useMeasure();
	const canvasRef = useRef();
	const [renderer, setRenderer] = useState();
	const [camera, setCamera] = useState();
	const [scene, setScene] = useState();
	const [loader, setLoader] = useState();
	const [object, setObject] = useState();

	useEffect(() => {
		const scene = new THREE.Scene();
		const renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0x2c2c2c, 1);
		setRenderer(renderer);
		setScene(scene);
	}, []);

	useEffect(() => {

		if (!renderer || !scene || !camera) return;
		const animate = function () {
			requestAnimationFrame( animate );
			if (camera) renderer.render( scene, camera );
		};
		const requestID = requestAnimationFrame( animate );

		return () => {
			cancelAnimationFrame(requestID);
		}
	}, [renderer, scene, camera]);

	useEffect(() => {
		if (!loader) {
			setLoader(new GCodeLoader());
			return;
		}
		if (!gcode || !scene) return;

		scene.remove( object );
		setObject(loader.parse(gcode));

	}, [gcode, loader, scene]);

	useEffect(() => {
		if (!scene || !object) return;
		object.position.set( - 100, - 20, 100 );
		scene.add(object);
	}, [object, scene]);

	useEffect(() => {
		if (!width || !height) return;
		const aspectRatio = width / height;
		if (!camera) {
			setCamera(new THREE.PerspectiveCamera( 75, aspectRatio, 0.1, 1000 ));
			return;
		}

		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
		if (renderer) renderer.setSize( width, height );

	}, [width, height, renderer, camera]);

	useEffect(() => {
		if (!canvasRef.current || !renderer || !camera) return;
		canvasRef.current.appendChild( renderer.domElement );
		const controls = new OrbitControls(camera, canvasRef.current);
		controls.minDistance = 10;
		controls.maxDistance = 400;

		return () => {
			controls.dispose();
		}
	}, [canvasRef, renderer, camera]);

	return (
		<div className="GcodeViewer" ref={sizeRef}>
			<div className="canvas" ref={canvasRef} style={{backgroundColor: 'red'}} />
		</div>
	);
};

export default GcodeViewer;
