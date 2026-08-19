/* The three claims the About section makes, in the order a sceptical buyer
   asks them: who actually turns up, what the hardware is built to survive,
   and what happens if the promise on the rest of the page fails.

   Order is also the light. The section runs a full day across its pan, so the
   claim that lands last is the one read at dusk — which is why the guarantee
   is third rather than first. It is the note the section is meant to end on,
   and it ends in the dark with the lights still on.

   Photographs, replacing the seeded Picsum placeholders these three shipped
   with. Imported rather than written as paths so the bundler fingerprints them
   and a wrong filename fails the build instead of leaving a hole in the panel.

   They are matched to the claims by content, which is not the order the
   filenames suggest: `house` is a rooftop array in flat midday sun and belongs
   to the climate claim, while `region` is shot at last light and belongs to
   the guarantee — the panel the pan deliberately reaches at dusk.

   Each `alt` describes the photograph that is actually there. If an image is
   swapped, its alt goes with it. */
import crewsImg from '../assets/solar-panel-installation.jpg'
import climateImg from '../assets/solar-panel-house.jpg'
import guaranteeImg from '../assets/solar-panel-region.jpg'

export const ABOUT_PANELS = [
  {
    id: 'crews',
    number: '01',
    titleLines: ['Our crews live in', 'the districts they wire'],
    body: 'Installers from Nukus, Muynak and Kungrad. When a system needs attention, the person who fitted it is an hour away.',
    image: crewsImg,
    alt: 'An installer in a safety harness kneeling on a roof, drilling a panel into its mounting rail.',
  },
  {
    id: 'climate',
    number: '02',
    titleLines: ['Engineered for', 'this climate'],
    body: 'Dust storms, 45°C summers and hard winters. Every array we fit is rated for all three, and serviced twice a year.',
    image: climateImg,
    alt: 'A tiled roof carrying a solar array, photographed in full midday sun under a clear sky.',
  },
  {
    id: 'guarantee',
    number: '03',
    titleLines: ['The guarantee is', 'a contract'],
    body: 'If your bill is not zero across seven years, we pay the difference. It is written into every install we sign.',
    image: guaranteeImg,
    alt: 'The sun setting behind a row of houses across open grassland at the edge of a settlement.',
  },
]
