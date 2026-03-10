export interface Pavilion {
  id: string;
  number: number;
  name: string;
  capacity: number;
  description: string;
  features: string[];
  pricePerHour: number;
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
      "Shaded pavilion in the upper left corner of the park, close to the fire pit and train road. Perfect for birthday parties and family reunions with a great view of the action.",
    features: ["Picnic tables", "Shade cover", "Near fire pit", "Train road views"],
    pricePerHour: 65,
    x: 27,
    y: 32,
  },
  {
    id: "pavilion-2",
    number: 2,
    name: "Pavilion 2",
    capacity: 40,
    description:
      "Sits right alongside Pavilion 1 near the fire pit area. Great for groups who want to spread out across two adjacent pavilions for larger gatherings.",
    features: ["Picnic tables", "Shade cover", "Near fire pit", "Adjacent to Pavilion 1"],
    pricePerHour: 65,
    x: 34,
    y: 32,
  },
  {
    id: "pavilion-3",
    number: 3,
    name: "Pavilion 3",
    capacity: 50,
    description:
      "Central pavilion with direct views of the playground — ideal for kids' parties so parents can keep an eye on the fun while enjoying the shade.",
    features: ["Picnic tables", "Shade cover", "Playground views", "Central location"],
    pricePerHour: 75,
    x: 57,
    y: 46,
  },
  {
    id: "pavilion-4",
    number: 4,
    name: "Pavilion 4",
    capacity: 50,
    description:
      "Right next to the playground and gel blaster area. The go-to spot for active groups who want to be in the middle of all the excitement.",
    features: ["Picnic tables", "Shade cover", "Near gel blasters", "Near playground"],
    pricePerHour: 75,
    x: 57,
    y: 57,
  },
  {
    id: "pavilion-5",
    number: 5,
    name: "Pavilion 5",
    capacity: 60,
    description:
      "Our largest covered pavilion — a colorful tent structure near the center of the park. Spacious, festive, and perfect for big celebrations.",
    features: ["Picnic tables (x10)", "Large tent cover", "Center of park", "Great for big groups"],
    pricePerHour: 90,
    x: 50,
    y: 66,
  },
];
