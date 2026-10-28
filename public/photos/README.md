# Your photos

Each photo appears on its stop's card, in the plain-text version of the site, and on an
easel in the 3D scene. Any file that's missing is simply skipped: no placeholders and
nothing broken.

| File                    | Where it shows up                                      |
| ----------------------- | ------------------------------------------------------ |
| `portrait.jpg`          | Trailhead and summit (round headshot), story page      |
| `college.jpg`           | University of North Georgia stop _(not added yet)_     |
| `events.jpg`            | Events by Design stop _(not added yet)_                |
| `music.jpg`             | Music stop                                             |
| `touchgrass.jpg`        | TouchGrass card                                        |
| `touchgrass-screen.jpg` | The giant phone's screen in 3D                         |
| `challenges.jpg`        | Quant trading senior project stop                      |
| `graduation.jpg`        | Graduation stop                                        |
| `golf.jpg`              | Toolkit stop, for hobbies _(not added yet)_            |

Tips: about 1600px on the long side, under 500 KB each. Landscape works best for the
stop photos, and a square crop works best for `portrait.jpg`. Strip location data before
adding phone photos; this repo is public.

To add a photo to another stop, give that stop a `photo` in `content/journey.ts`.
