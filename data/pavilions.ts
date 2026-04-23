export interface Pavilion {
  id: string;
  number: number;
  name: string;
  capacity: number;
  description: string;
  features: string[];
  firstHourPrice: number;
  additionalHourPrice: number;
  squareCatalogId: string; // paste from Square Dashboard → Catalog
  /** Position as % of map image width/height for overlay marker */
  x: number;
  y: number;
}

export const pavilions: Pavilion[] = [
  {
    id: "pavilion-1",
    number: 1,
    name: "Pavilion 1",
    capacity: 40,
    description:
      "Shaded pavilion near the fire pit — a great spot for birthday parties and family reunions with views of the train road and easy access to the action.",
    features: ["Picnic tables", "Shade cover", "Near fire pit", "Train road views"],
    firstHourPrice: 30,
    additionalHourPrice: 20,
    squareCatalogId: "",
    x: 36,
    y: 37,
  },
  {
    id: "pavilion-2",
    number: 2,
    name: "Pavilion 2",
    capacity: 40,
    description:
      "Sits right alongside Pavilion 1 near the fire pit area. Great for groups who want to spread out across two adjacent pavilions for larger gatherings.",
    features: ["Picnic tables", "Shade cover", "Near fire pit", "Adjacent to Pavilion 1"],
    firstHourPrice: 30,
    additionalHourPrice: 20,
    squareCatalogId: "",
    x: 44,
    y: 37,
  },
  {
    id: "pavilion-3",
    number: 3,
    name: "Pavilion 3",
    capacity: 50,
    description:
      "Central pavilion with direct views of the playground — ideal for kids' parties so parents can keep an eye on the fun while enjoying the shade.",
    features: ["Picnic tables", "Shade cover", "Playground views", "Central location"],
    firstHourPrice: 30,
    additionalHourPrice: 20,
    squareCatalogId: "",
    x: 61,
    y: 42,
  },
  {
    id: "pavilion-4",
    number: 4,
    name: "Pavilion 4",
    capacity: 50,
    description:
      "Right next to the playground and gel blaster area. The go-to spot for active groups who want to be in the middle of all the excitement.",
    features: ["Picnic tables", "Shade cover", "Near gel blasters", "Near playground"],
    firstHourPrice: 30,
    additionalHourPrice: 20,
    squareCatalogId: "",
    x: 61,
    y: 52,
  },
  {
    id: "pavilion-5",
    number: 5,
    name: "Pavilion 5",
    capacity: 60,
    description:
      "Our largest covered pavilion — a colorful tent structure near the center of the park. Spacious, festive, and perfect for big celebrations.",
    features: ["Picnic tables (x10)", "Large tent cover", "Center of park", "Great for big groups"],
    firstHourPrice: 30,
    additionalHourPrice: 20,
    squareCatalogId: "",
    x: 53,
    y: 62,
  },
  {
    id: "pavilion-6",
    number: 6,
    name: "Playground Pavilion",
    capacity: 80,
    description:
      "Our premium pavilion right next to the playground — the ultimate spot for birthday parties. Generous covered space for large groups with direct views of the fun.",
    features: ["Picnic tables (x12)", "Premium covered structure", "Next to playground", "Largest capacity"],
    firstHourPrice: 75,
    additionalHourPrice: 50,
    squareCatalogId: "",
    x: 30,
    y: 65,
  },
];
