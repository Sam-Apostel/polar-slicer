/**
 * get slices
 */
const getSlices = (geomety, settings) => {
    const amountOfSlices = geomety.height / settings.layerHeight;
    const slices = [...Array(amountOfSlices)].map((_, layer) => getSlice(geometry, layer * settings.layerHeight));
}

/**
 * get slice
 */
const getSlice = (geometry, zHeight) => {
    const faces = getFacesAtHeight(geometry.faces, zHeight);
    const edges = faces.map((face) => getEdgeFromFace(face, zHeight));
    return getShapeFromEdges(edges);
}


/**
 * Get faces at Z
 */
const getFacesAtHeight = (faces, height) => {
    return faces
        .filter(face => (
            face.vertices.any(vertex => vertex.z < height) && 
            face.vertices.any(vertex => vertex.z > height)
        ));
}

/**
 * Get vertex at Z from face
 */
const getEdgeFromFace = (face, height) => {
    // 2 intersecting edges -> interpolate between vertices
    // 1 intersecting edge -> vertex and interpolation
}

/**
 * interpolate vertex on edge
 */


/**
 * get shape from vertices
 */
const getShapeFromEdges = () => {
    
}
