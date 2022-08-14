import './style.css';
import { useEffect, useState } from 'react';
import React from 'react';


const GCodeArg = props => {
	const { children: arg } = props;
	const argType = arg.slice(0, 1);
	const argValue = arg.slice(1);
	return (
		<div className={`GCodeArg GCodeArg-${argType}`}>
			<span className="type">{argType}:</span>
			<span className="value">{+(+argValue).toFixed(2)}</span>
		</div>
	);
};

const GCode = props => {
	const { children: code } = props;
	const [command, ...args] = code.split(' ');
	const commandType = command.slice(0, 1);
	const commandValue = command.slice(1);
	let commandName = undefined;
	if (commandType === 'G') {
		if (commandValue === '0') {
			commandName = 'Rapid move';
		} else if (commandValue === '1') {
			commandName = 'Move';
		} else if (commandValue === '2') {
			commandName = 'CW arc';
		} else if (commandValue === '3') {
			commandName = 'CCW arc';
		}
	} else if (commandType === 'M') {
		if (commandValue === '204') {
			commandName = 'Acceleration';
		}
	}

	return (
		<div className={`GCode GCode-${commandType}-command GCode-${command}`}>
			<div className="command">
				{commandName ? (
					<span>{commandName}</span>
				) : [
					<span>{commandType}</span>,
					<span>{commandValue}</span>
				]}
			</div>
			{args.length > 0 && args.map(arg => <GCodeArg key={arg}>{arg}</GCodeArg>)}
		</div>
	);
};

const GCodeLine = props => {
	const { children: value } = props;
	const [code, ...commentParts] = value.split(';');
	const comment = commentParts.join(';').trim();
	const hasCode = Boolean(code.replace(/\s/g, '').length);
	return (
		<div className={`GCodeLine ${hasCode ? '' : 'noCode'}`}>
			{hasCode && <GCode>{code.trim()}</GCode>}
			{comment !== '' && <div className="comment">{comment}</div>}
		</div>
	);
};

const GCodeEditor = props => {
	const {
		gCode,
		onChange
	} = props;
	const [newLine, setNewLine] = useState(null);
	const [lineCopy, setLineCopy] = useState(null);

	const lines = gCode.split('\n');

	useEffect(() => {
		if (lineCopy > 0 && lineCopy < lines.length) setNewLine(lines[lines.length - lineCopy]);
		if (lineCopy === 0 ) {
			setNewLine('G1 ');
		}
	}, [lineCopy, lines]);

	return (
		<div className="GCodeEditor">
			{lines.map((line, index) =>
				<GCodeLine key={index}>{line}</GCodeLine>
			)}
			{!newLine && <div onClick={() => setNewLine('G1 ')} className="addLine"><div>+</div>add line</div>}
			{newLine && (
				<div className="newLine">
					<input
						type="text"
						value={newLine}
						onChange={e => setNewLine(e.target.value)}
						onKeyUp={(e) => {
							switch (e.key) {
								case 'Enter': {
									onChange(`${gCode}\n${e.currentTarget.value}`);
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
					/>
					<div className="closeNewLine" onClick={() => setNewLine(null)}>×</div>
				</div>
			)}
		</div>
	);
};

export default GCodeEditor;
