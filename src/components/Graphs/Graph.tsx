import React from 'react';
import { useState } from 'react';
import Network from "react-graph-vis";

const Graph = ({ graph }) => {
	const [network, setNetwork] = useState<{ fit: () => void}>();

	const labelPrecision = 10000;
	const graphData = {
		nodes: Array.from(graph?.values() ?? []).map(({ vertex }) => ({
			id: JSON.stringify(vertex),
			label: `x:${Math.round(vertex.x * labelPrecision) / labelPrecision}, y:${Math.round(vertex.y * labelPrecision) / labelPrecision}`,
			// label: `x:${vertex.x}, y:${vertex.y}`,
			x: vertex.x * 20,
			y: vertex.y * 20,
			physics: false
		})),
		edges: Array.from(graph?.values() ?? []).flatMap(({ vertex: from, connections }) => {
			return connections.map(to => ({ from: JSON.stringify(from), to: JSON.stringify(to) }));
		})
	};

	return (
		<div className="graph">
			<Network
				graph={graphData}
				options={{
					height: '320px'
				}}
				events={{
					stabilized: () => {
						if (!network) return;
						network.fit()
					},
				}}
				getNetwork={setNetwork}
			/>
		</div>
	)
}

export default Graph;
