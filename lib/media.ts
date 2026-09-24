export const HERO_FRAMES = {
  base: "/media/frames/hero/",
  count: 151,
  ext: "jpg",
};

export const frameSrc = (i: number): string =>
  `${HERO_FRAMES.base}${String(i).padStart(4, "0")}.${HERO_FRAMES.ext}`;

export type GallerySlot = {
  tag: string;
  name: string;
  file?: string;
  type?: "image" | "video";
  hint: string;
};

export const GALLERY_SLOTS: GallerySlot[] = [
  {
    tag: "01 / EXTERIOR",
    name: "Wedge DNA",
    file: "/media/car-concept.png",
    type: "image",
    hint: "Replace car-concept.png",
  },
  {
    tag: "02 / INTERIOR",
    name: "Holo Cockpit",
    file: "/media/gallery/interior.png",
    type: "image",
    hint: "interior.png",
  },
  {
    tag: "05 / EXTERIOR",
    name: "Night Sequence",
    file: "/media/gallery/night.mp4",
    type: "video",
    hint: "night.mp4",
  },
  {
    tag: "03 / DETAIL",
    name: "Cryo Wheels",
    file: "/media/gallery/wheels.png",
    type: "image",
    hint: "wheels.png",
  },
  {
    tag: "04 / INTERIOR",
    name: "Command Deck",
    file: "/media/gallery/deck.png",
    type: "image",
    hint: "deck.png",
  },
];