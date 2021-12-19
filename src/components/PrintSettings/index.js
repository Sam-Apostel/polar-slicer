const PrintSettings = props => {
	const {
		settings,
		setSettings
	} = props;
	return <pre style={{
		gridArea: 'settings',
		margin: 0,
		padding: '1rem',
		backgroundColor: 'lch(9% 0 270 / 1)',
		color: 'white',
		borderTop: '5px solid lch(20% 0 270 / 1)'
	}}>
		{JSON.stringify(settings, null, ' ')}
	</pre>
};

export default PrintSettings;
