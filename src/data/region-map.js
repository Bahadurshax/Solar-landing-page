/* ============================================================
   Karakalpakstan map — georeference and routes
   ============================================================

   The map itself is a bitmap (`/images/dotted-map.png`), so pins can't be
   derived from its geometry the way they could from a generated dot field.
   Instead the image is georeferenced once, here, from two anchor points read
   off it — the north-west corner of the republic and the south-eastern tip
   past Turtkul. Everything else is a linear fit between them.

   That keeps the case data honest: each home carries its district's real
   latitude and longitude, and `project` is the only place that knows anything
   about pixels. Re-cropping or replacing the image means retuning two
   constants, not moving six pins by hand. */

export const MAP_W = 1254
export const MAP_H = 1254

const ANCHOR_NW = { lon: 55.95, lat: 45.6, x: 90, y: 35 }
const ANCHOR_SE = { lon: 61.9, lat: 41.2, x: 1200, y: 1073 }

const PX_PER_LON = (ANCHOR_SE.x - ANCHOR_NW.x) / (ANCHOR_SE.lon - ANCHOR_NW.lon)
const PX_PER_LAT = (ANCHOR_SE.y - ANCHOR_NW.y) / (ANCHOR_NW.lat - ANCHOR_SE.lat)

export function project(lon, lat) {
  return {
    x: ANCHOR_NW.x + (lon - ANCHOR_NW.lon) * PX_PER_LON,
    y: ANCHOR_NW.y + (ANCHOR_NW.lat - lat) * PX_PER_LAT,
  }
}

/**
 * A quadratic curve between two projected points, bowed perpendicular to the
 * line so routes arc rather than cut straight across. The bow scales with
 * distance, which keeps short hops from ballooning.
 */
export function routePath(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  if (!distance) return ''

  const bow = Math.min(distance * 0.2, 90)

  /* Unit normal, flipped so the arc always bows toward the top of the map.
     Letting the sign follow the travel direction made westbound routes sag
     below their endpoints while eastbound ones arced above, and the two read
     as different kinds of line rather than one family. */
  let nx = -dy / distance
  let ny = dx / distance
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }

  const mx = (from.x + to.x) / 2 + nx * bow
  const my = (from.y + to.y) / 2 + ny * bow
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}
