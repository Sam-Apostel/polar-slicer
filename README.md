# scripting based Bring Your Own Code slicer for polar printers
Currently this repo only holds a barebones Gcode toolpath viewer for testing purposes.

This project was created in function of a 3d motion platform that uses polar coordinates.

## supported Gcode 

### G1 straight move
ex: 
- `G1 X100 Y20 Z0.35`
- `G1 Z0.35`
- `G1 X13 Z5`

### relative extrusion during moves
ex: 
- extrusion `G1 X100 Y20 Z0.35 E0.6`
- retraction `G1 X100 Y20 Z0.35 E-0.6`
