# scripting based Bring Your Own Code slicer for polar printers
Currently this repo only holds a barebones Gcode toolpath viewer for testing purposes.

This project was created in function of a 3d motion platform that uses polar coordinates.

## supported Gcode 

### G0 rapid move (implemented in polar coordinate system)
ex:
- `G0 X100 Y20 Z0.35`
- `G0 Z0.35`
- `G0 X13 Z5`

### G1 straight move
ex: 
- `G1 X100 Y20 Z0.35`
- `G1 Z0.35`
- `G1 X13 Z5`

### G2 & G3 circle arcs based on radius
ex:
- clockwise: `G2 X100 Y100 R70`
- counterclockwise `G3 X0 Y0 Z5 R120`

### relative extrusion during moves
ex: 
- extrusion `G1 X100 Y20 Z0.35 E0.6`
- retraction `G1 X100 Y20 Z0.35 E-0.6`

## supported
✔ THREE.js bufferGeometries (both index and not indexed) \
✔ 1 wall thick slicing \

## limitations
- each slice needs to be 1 continuous path
