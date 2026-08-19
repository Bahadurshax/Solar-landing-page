# Hero parallax — layer assets

What the hero needs to do real depth parallax: the house as its own object, and
the scene behind it as its own object. Four images, two per mode.

Source frames: `public/images/solar-house-day.png` and `solar-house-night.png`,
both **1672 × 941**.

## The split

Two planes is enough and is the safest thing to generate:

| Plane     | Contains                                                                 | Alpha |
| --------- | ------------------------------------------------------------------------ | ----- |
| **back**  | sky, clouds/stars, the trees left and right, fence, lawn and driveway — the scene with the house deleted and the gap filled in | no    |
| **front** | the house plus the planting beds, grasses and the ground it stands on    | yes   |

Stacked front-over-back at identical size they must rebuild the photograph. The
front plane then rises on scroll while the back plane sinks, and because they no
longer share any pixels there is nothing to ghost.

(Optional third plane, only if the first two go well: pull the **treeline** out
of the back plate onto its own alpha layer, so the trees can travel at a speed
between the sky and the house. Worth doing last, not first.)

## Hard constraints

These matter more than the wording of the prompts:

- **1672 × 941**, or an exact 2× at 3344 × 1882. Same for every file.
- **No re-framing.** Same camera position, same crop, same horizon, same
  perspective. The two planes have to line up pixel-for-pixel when stacked — if
  the generator nudges the composition, the house will not sit back down where
  it came from.
- **PNG**, and the front plane needs a real alpha channel. If the tool cannot
  output transparency, put the subject on flat magenta `#FF00FF` and say so —
  that keys out cleanly, unlike white or black, which bleed into the roof and
  the windows.
- **Same light.** Both planes come from one photograph, so the sun direction,
  the shadows, the exposure and the colour grade have to survive the edit.
- The back plate carries the ground all the way to the bottom edge, and the
  front plate carries its own ground with it. Neither should end in mid-air.

## Best route

Run these as **edits on the existing PNGs**, not as fresh text-to-image — an
edit model keeps the scene it is given, and a fresh generation will invent a
different house. Nano Banana, Flux Kontext and Seedream edit all handle this.

For the front plane specifically, Photoshop will beat any generative model:
Select Subject → refine the roofline and the foliage → export PNG. The cutout
edge is the one thing in this whole effect the eye will actually inspect.

---

## 1. Back plate — day

> Remove the house from this photograph completely. Keep the blue sky, the
> clouds, the mature green trees at the left and right edges, the wooden fence
> and the lawn exactly as they are, untouched. Fill the space where the house
> stood with a natural continuation of the same scene: the row of green trees
> carrying on across the middle distance, and the manicured lawn and grey
> concrete driveway carrying on across the foreground. No building anywhere —
> no roof, no solar panels, no walls, no garage, no windows, and none of the
> planting beds or shrubs that belonged to the house. Photorealistic. Identical
> camera angle, identical framing, identical golden daylight and colour grade,
> sharp focus, no vignette, no added subject.

## 2. Front plane — day

> Isolate the house from this photograph onto a fully transparent background.
> Keep the entire building: the dark standing-seam metal roof, every solar
> panel, the white stucco walls, the black garage door, all the windows and the
> glazed entry porch. Keep with it the planting beds, ornamental grasses,
> clipped shrubs and the strip of lawn and grey concrete driveway directly in
> front of the house, out to the bottom edge of the frame. Everything else must
> be transparent: the sky, the clouds, the trees behind and beside the house,
> the fence, and the open lawn at the far left and far right. Clean accurate
> edges along the roofline, the gable and the foliage. Preserve the original
> daylight, the cast shadows and the colour grade. Do not move, rotate or
> rescale the house — it must stay exactly where it is in the frame. Output PNG
> with alpha.

## 3. Back plate — night

> Remove the house from this photograph completely. Keep the deep blue starry
> night sky, the dark silhouetted trees at the left and right edges, the fence
> and the lawn exactly as they are, untouched. Fill the space where the house
> stood with a natural continuation of the same scene: the dark treeline
> carrying on across the middle distance against the stars, and the lawn and
> grey concrete driveway carrying on across the foreground, lit only by the
> faint ambient moonlight already in the picture. No building anywhere — no
> roof, no solar panels, no walls, no lit windows, no porch, and none of the
> planting beds, shrubs or landscape uplights that belonged to the house.
> Photorealistic. Identical camera angle, identical framing, identical night
> exposure and colour grade. Remove the warm light spill the house was casting
> on the ground.

## 4. Front plane — night

> Isolate the house from this photograph onto a fully transparent background.
> Keep the entire building: the dark metal roof, every solar panel, the white
> stucco walls lit by warm wall lamps, the garage door, and all the windows and
> the glazed porch glowing with warm interior light. Keep with it the planting
> beds, ornamental grasses, shrubs, the landscape uplights and the strip of
> lawn and concrete driveway directly in front of the house, out to the bottom
> edge of the frame, including the warm light they cast on the ground.
> Everything else must be transparent: the starry sky, the dark trees behind
> and beside the house, the fence, and the open lawn at the far left and far
> right. Clean accurate edges along the roofline and the foliage. Preserve the
> original night exposure, the warm/cool contrast and the colour grade. Do not
> move, rotate or rescale the house. Output PNG with alpha.

---

## Where to put them

```
public/images/solar-house-day-back.png
public/images/solar-house-day-front.png
public/images/solar-house-night-back.png
public/images/solar-house-night-front.png
```

The originals stay where they are — Our Cases and the footer still use them, and
they remain the fallback for anyone whose browser skips the parallax.

## What to check before handing them over

1. Open the front plane on a coloured background. Look at the roofline against
   the sky and the gable edge — halos and leftover sky fringe are what will give
   the effect away.
2. Stack front over back at 100%. It should look like the original photograph.
   If the house has drifted even slightly, the layers were re-framed and the
   pair is unusable.
3. Look at the back plate where the house used to be. It only ever shows through
   as a sliver behind a moving house, so it does not need to be beautiful — but
   it must not contain a ghost of the roof or a second, smaller house.
