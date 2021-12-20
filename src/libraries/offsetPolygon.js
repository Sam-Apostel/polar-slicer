const CLOCKWISE = 'clockwise';
const TOLERANCE = 0.000001;

export const getInsetPolygon = (polygon, distance) => {
	const hasFirstAndLastVertexMatching = 1; // otherwise 0;
	if (distance === 0) return polygon;
	const edges = polygon.reduce((edges, vertex, index) => {
		return [
			...(edges.slice(0, -1) ?? []),
			[...edges[index], vertex],
			[vertex]
		];
	}, [[polygon[polygon.length - 1]]]).slice(hasFirstAndLastVertexMatching, -1);
	const offsetEdges = edges.map(edge => getOffsetEdge(edge, distance));
	let offsetShape = offsetEdges.flatMap((edge, index, edges) => {
		const nextIndex = (index + 1) % offsetEdges.length
		const nextEdge = edges[nextIndex];


		const intersection = getAdjacentEdgesIntersectionPoint(edge, nextEdge);
		if (intersection) {
			return [intersection];
		} else {
			return [
				edge[1],
				{
					...nextEdge[0],
					r: distance,
					direction: CLOCKWISE,
				}
			];
		}
	});
	offsetShape.push(offsetShape[0]);


	// TODO: try to determine if edge should be skipped due to it being too short
	// TODO: split into separate loops when the inset self intersects
	return offsetShape;
};

const getOffsetEdge = (edge, distance) => {
	let v_seg = {
		x: edge[1].x - edge[0].x,
		y: edge[1].y - edge[0].y
	};
	let edgeVector = normalize(v_seg);
	let vector_left = multiply(rotate90degCCW(edgeVector), -distance);
	return translateEdge(edge, vector_left);
};

const normalize = ({x, y}) => {
	const magnitude = Math.sqrt(x * x + y * y);
	if (magnitude === 0) {
		console.error('edge length is 0 and does not have a direction');
		return null;
	}
	return {
		x: x / magnitude,
		y: y / magnitude,
	}
};

const multiply = ({x, y}, value) => ({ x: x * value, y: y * value });

const rotate90degCCW = ({x, y}) => ({ x: -y, y: x });

const translateEdge = (edge, translation) => {
	return edge.map(vertex => translate(vertex, translation));
}

const translate = (vertex, {x, y}) => {
	return {
		x: vertex.x + x,
		y: vertex.y + y
	};
}


const getAdjacentEdgesIntersectionPoint = (a, b) => {
	// we assume adjacent edges are not parallel, incident or perfectly in line
	// they are either
		// 1. not intersecting
		// 2. intersecting

	// quick reject
	const boxA = getEdgeBox(a);
	const boxB = getEdgeBox(b);
	if (!intersectBox2Box(boxA, boxB)) return;


	// Calculate intersection between lines
	let linesIntersection = intersectLine2Line(a, b);

	if (!linesIntersection) return;

	// we already established that the intersection lies on the lines
	// if it is also inside each box, it is an intersection between the edges
	if (intersectVertex2Box(linesIntersection, boxA) && intersectVertex2Box(linesIntersection, boxB)) {
		return linesIntersection;
	}
}

const getEdgeBox = ([start, end]) => {
	return {
		min: {
			x: Math.min(start.x, end.x),
			y: Math.min(start.y, end.y)
		},
		max: {
			x: Math.max(start.x, end.x),
			y: Math.max(start.y, end.y)
		}
	};
}

const intersectBox2Box = (a, b) => {
	if (a.min.x > b.max.x || a.max.x < b.min.x) return false;
	if (a.min.y > b.max.y || a.max.y < b.min.y) return false;
	return true;
};

const intersectLine2Line = (a, b) => {

	let [A1, B1, C1] = getStandard(a);
	let [A2, B2, C2] = getStandard(b);

	/* Cramer's rule */
	let det = A1 * B2 - B1 * A2;
	let detX = C1 * B2 - B1 * C2;
	let detY = A1 * C2 - C1 * A2;

	if (zeroWithTolerance(det)) return;

	if (B1 === 0) {        // vertical line x  = C1/A1, where A1 == +1 or -1
		return {
			x: C1 / A1,
			y: detY / det
		};
	} else if (B2 === 0) {   // vertical line x = C2/A2, where A2 = +1 or -1
		return {
			x: C2 / A2,
			y: detY / det
		};
	} else if (A1 === 0) {   // horizontal line y = C1/B1, where B1 = +1 or -1
		return {
			x: detX / det,
			y: C1 / B1
		};
	} else if (A2 === 0) {   // horizontal line y = C2/B2, where B2 = +1 or -1
		return {
			x: detX / det,
			y: C2 / B2
		};
	} else {
		return {
			x: detX / det,
			y: detY / det
		};
	}
}

const intersectVertex2Box = (vertex, box) => {
	if (vertex.x < box.min.x) return false;
	if (vertex.x > box.max.x) return false;
	if (vertex.y < box.min.y) return false;
	if (vertex.y > box.max.y) return false;
	return true;
}

const getStandard = (edge) => {
	const pt = edge[0];
	let norm = getNormal(edge);
	let dot = getDot(norm, pt);
	if (dot >= 0) {
		norm = getInvertedVector(norm);
		dot = getDot(norm, pt);
	}
	return [norm.x, norm.y, dot];
}

const getNormal = (edge) => {
	let v_seg = {
		x: edge[1].x - edge[0].x,
		y: edge[1].y - edge[0].y
	};
	let edgeVector = normalize(v_seg);
	return rotate90degCCW(edgeVector);
}

const getDot = (a, b) => {
	return (a.x * b.x + a.y * b.y);
}
const getInvertedVector = ({x, y}) => {
	return { x: -x, y: -y };
}

const zeroWithTolerance = (a) => (a < TOLERANCE && a > -TOLERANCE);
