# Transit Event Detection

The current transit service implements conservative scan-derived event detection.

Implemented:

- Configurable scan interval
- Orb entry detection
- Best exactness neighborhood by minimum orb
- Transit-to-natal aspect event records
- Event windows around the scan-derived closest hit
- Request range limits

Limitations:

- Demo provider positions are deterministic samples.
- Exact times are scan-derived and not numerically refined to Swiss Ephemeris precision.
- Applying/separating state is coarse.
- House crossings are not yet implemented.

Production next step:

- Use Swiss Ephemeris or another verified deterministic provider.
- Add root-finding refinement around sign changes, stations, and exact aspects.
- Fill golden fixtures from trusted reference calculations.
