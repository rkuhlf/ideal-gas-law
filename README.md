## Particle Simulations

This first one is probably easiest to make it a gas simulation.
I have a temperature control, so I'll just add a pressure output.

Currently, I'm adding energy to the system slowly over time. I think it's probably the random movement - it's just as easy to add a bit of randomness in the direction it's already going as in the opposite direction, which does not agree with the fact that the v is squared in kinetic energy.


Problem - when two dots smack into each other, sometimes they teleport to the edge of the screen. This is because the distance between them is zero, which makes the force they are applying very large.

So repulsiveness should have been a property of some kind of simulator settings object.



Unfortunately it only made sense to have a simulation class whenever there was also a grid that needed to be kept in sync, so no there's just a pointless simulation class.