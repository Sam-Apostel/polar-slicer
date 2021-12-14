import './style.css';
import { useEffect, useState } from 'react';


const GcodeArg = props => {
	const { children: arg } = props;
	const argType = arg.slice(0, 1);
	const argValue = arg.slice(1);
	return (
		<div className={`GcodeArg GcodeArg-${argType}`}>
			<div className="block">
				<span>{argType}</span>
				<span>{argValue}</span>
			</div>
		</div>
	);
};

const Gcode = props => {
	const { children: code } = props;
	const [command, ...args] = code.split(' ');
	const commandType = command.slice(0, 1);
	const commandValue = command.slice(1);

	if (commandType === 'G') {
		if (commandValue === '1') {
			return (
				<div className={`Gcode Gcode-${commandType}-command`}>
					<div className="block">
						Move
						{/* XYZEF */}
					</div>
					{args.length > 0 && args.map(arg => <GcodeArg key={arg}>{arg}</GcodeArg>)}
				</div>
			);
		}
	} else if (commandType === 'M') {
		if (commandValue === '204') {
			return (
				<div className={`Gcode Gcode-${commandType}-command`}>
					<div className="block">
						Acceleration
						{/*
					        P: printing
					        T: travel
					        R: retraction
						 */}
					</div>
					{args.length > 0 && args.map(arg => <GcodeArg key={arg}>{arg}</GcodeArg>)}
				</div>
			);
		}
	}

	return (
		<div className={`Gcode Gcode-${commandType}-command`}>
			<div className="block">
				<span>{commandType}</span>
				<span>{commandValue}</span>
			</div>
			{args.length > 0 && args.map(arg => <GcodeArg key={arg}>{arg}</GcodeArg>)}
		</div>
	);
};

const GcodeLine = props => {
	const { children: value } = props;
	const [code, ...commentParts] = value.split(';');
	const comment = commentParts.join(';').trim();
	const hasCode = Boolean(code.replace(/\s/g, '').length);
	return (
		<div className={`GcodeLine ${hasCode ? '' : 'noCode'}`}>
			{hasCode && <Gcode>{code.trim()}</Gcode>}
			{comment !== '' && <div className="comment">{comment}</div>}
		</div>
	);
};

const GcodeEditor = props => {
	const {
		gcode,
		onChange
	} = props;
	const [newLine, setNewLine] = useState(null);
	const [lineCopy, setLineCopy] = useState(null);

	const lines = gcode.split('\n');

	useEffect(() => {
		if (lineCopy > 0 && lineCopy < lines.length) setNewLine(lines[lines.length - lineCopy]);
		if (lineCopy === 0 ) {
			setNewLine('G1 ');
		}
	}, [lineCopy, lines]);

	return (
		<div className="GcodeEditor">
			{lines.map((line, index) =>
				<GcodeLine key={index}>{line}</GcodeLine>
			)}
			{!newLine && <div onClick={() => setNewLine('G1 ')} className="addLine"><div>+</div>add line</div>}
			{newLine && <div className="newLine"><input
				type="text"
				value={newLine}
				onChange={e => setNewLine(e.target.value)}
				onKeyUp={e => {
					switch (e.key) {
						case 'Enter': {
							onChange(`${gcode}
${e.target.value}`);
							setNewLine('G1 ');
							setLineCopy(null);
							break;
						}
						case 'ArrowUp': {
							setLineCopy(lineCopy => lineCopy + 1)
							break;
						}
						case 'ArrowDown': {
							if (lineCopy !== 0)	setLineCopy(lineCopy => lineCopy - 1);
							break;
						}
						default: break;
					}
				}}
			/><div className="closeNewLine" onClick={() => setNewLine(null)}>×</div></div>}

		</div>
	);
};

export default GcodeEditor;
