import { useEffect, useState } from 'react';

const useGcodeGenerator = () => {
	const [gcode, setGcode] = useState('');
	const [geometry, setGeometry] = useState();

	useEffect(() => {
		if(!geometry) return;
		setGcode(`G3 X100 R200`);
		console.log(geometry);
	}, [geometry]);

	return [gcode, setGcode, geometry, setGeometry];
};

export default useGcodeGenerator;
