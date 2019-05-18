Artificial Frogeye Design
=========================

## Hardware

### Lens

The lens should be as wide-angle as possible.

### Optical Cable

The lens should connect to a short fiber-optic cable so that the viewing portion of the eye can be placed independently of the rest of the hardware. This also allows the possibility of actively moving the eye and/or physical stabilization.

### Digital Light Sensor

CMOS seems to the the best type for artificial animal eyes - they are cheaper and use less power than CCDs.

Let's start with black and white, if feasible. The design could be simpler and more sensitive at low-light.

I think these should always come as a single piece of hardware with two independent "eyes". They could be arranged for 360 degree vision, wide angle (with a synced overlap area) or binocular.

## Core Software

Some of this should be in the firmware, some in the drivers, some in utility software.

### Resolution

Resolution should be controlled crudely without standard aspect ratios - square only, or possibly to get a greater field of view, octagonal.

      /───────\
     /┌───────┐\
    │ │       │ │
    │ │       │ │
     \└───────┘/
      \───────/

### Receptive Field

Probably specified as a decimal from 4 to 640 (or whatever is ma resolution.) Each field is passed as arguments into a function, then a new visual array collection is created. (1.0 could be used for either general illumination calculation or as a high-resolution pass-through to a separate image processor.)

I am thinking there should be a standard strategy to how receptive fields overlap. Maybe 50% and staggered.

### Multi-Camera Coordination

For combining overlap and calculation parallax.

### Frame Rate

Multiple frame rates are possible, depending on the processing.

## Nice to Have Software

### Basic Detectors

* Edge
* Moving edge
* Convexity
* Looming

### Utilities

* Stabilization
