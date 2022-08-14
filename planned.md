# editor
- [ ] grouping commands
  - [ ] group layers
- [ ] visual representation of groups
- [ ] editing commands
- [ ] autocomplete/suggest
- [ ] saving and loading files
- [ ] loops
- [ ] variables
- [ ] functional blocks
- [ ] select line represented in output
- [ ] select layer represented in output

# viewer
- [x] display shell object
- [ ] visualize layers
- [ ] display printed example
- [ ] display build area
- [ ] simulate machine movements
	- [ ] rigging a machine
 	- [ ] reverse kinematics
- [ ] autozoom
- [ ] play toolpath as animation
- [x] arcs
- [x] G0 (rapid move) follows polar coordinates and arcs where necessary
- [ ] G17 G18 G19 (plane selection) applies to G2 and G3 arc moves
- [ ] G68 ( rotate coordinate system ) usefull for G0 from center
- [ ] showing a range of layers
- [ ] visualize extrusion amount

# advanced toolpaths
- [ ] 6 DOF
- [ ] view different machine operations (temperature, feedrate, ...)

# slicer
- [x] convert geometry into slices
- [x] convert slices into G-code
- [ ] infill patterns
  - [ ] dynamic infill density
- [x] multiple walls
  - [ ] detect thin extrusions and space evenly / extrude thinner lines
- [ ] support structures
- [ ] align the start and stop points of consecutive loop
- [ ] feedrates
- [ ] extrusion speeds
- [ ] don't pass over the same point twice when closing a shape


# settings
- [ ] import/export settings 
- [x] layer height
- [ ] variable layer height
- [ ] variable line thickness
- [ ] infill
