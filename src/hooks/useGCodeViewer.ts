import { useCallback, useEffect } from 'react';
import { useMeasure } from 'react-use';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GCodeLoader } from '../libraries/gCodeLoader';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x2c2c2c, 1);


const scene = new THREE.Scene();

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 500,500, 500 ).normalize();
scene.add( directionalLight );

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, .3 );
directionalLight2.position.set( -500,0, -500 ).normalize();
scene.add( directionalLight2 );

const directionalLight3 = new THREE.DirectionalLight( 0xffffff, .3 );
directionalLight3.position.set( -500,0, 500 ).normalize();
scene.add( directionalLight3 );

const directionalLight4 = new THREE.DirectionalLight( 0xffffff, .2 );
directionalLight4.position.set( 300,-200, -500 ).normalize();
scene.add( directionalLight4 );

const ambientLight = new THREE.AmbientLight( 0xffffff, .3 );
scene.add( ambientLight );



const camera = new THREE.PerspectiveCamera( 75, 1, .1, 1000 );
camera.updateProjectionMatrix();
camera.position.set( 240, 170, 150);
camera.lookAt(new THREE.Vector3(0,0,0));

const loader = new GCodeLoader()

const shellMaterial = new THREE.MeshPhongMaterial( {
	color: new THREE.Color().setHSL( .4, .5, .6 ),
	reflectivity: 0,
	opacity: 0.2,
});
shellMaterial.transparent = true;
const lineMaterial = new THREE.LineBasicMaterial({
	color: new THREE.Color().setHSL( .4, .5, .6 ),
	opacity: .5,
});
lineMaterial.transparent = true;

let controls;

const useGCodeViewer = () => {
	const [sizeRef, { width, height }] = useMeasure();

	useEffect(() => {
		const animate = function () {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};
		const requestID = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(requestID);
		}
	}, []);

	useEffect(() => {
		if (!width || !height) return;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}, [width, height]);

	const registerCanvas = useCallback(container => {
		if (container) {
			if (container.children.length === 0) container.appendChild(renderer.domElement);

			controls = new OrbitControls(camera, container);
			controls.minDistance = 10;
			controls.maxDistance = 400;
		}
	}, [])

	useEffect(() => {
		return controls?.dispose;
	}, [])

	return {
		scene,
		shellMaterial,
		lineMaterial,
		loader,
		sizeRef,
		registerCanvas
	}
};

export default useGCodeViewer;
