Place NASA Blue Marble assets for `layers` in this folder.

Recommended first files:
- `world.topobathy.2004-01.jpg`
- `world.topobathy.2004-07.jpg`

The app currently tries local files in this order:
1. `./assets/earth/world.topobathy.2004-01.jpg`
2. `./assets/earth/world.topobathy.2004-07.jpg`
3. fallback remote texture

Suggested source:
- NASA Earth Observatory, Blue Marble: Next Generation
- https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/

Best map variant for the current atlas:
- "Base Map + Topography + Bathymetry"

Future expansion ideas:
- Add all 12 monthly color maps as `world.topobathy.2004-MM.jpg`
- Add a month switcher in the Earth layer UI
- Add separate topography/bathymetry-only textures for alternate Earth styles

Please credit "NASA Earth Observatory" when using or republishing Blue Marble imagery.
