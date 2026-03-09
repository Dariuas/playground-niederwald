export interface Pavilion {
  id: string;
  name: string;
  capacity: number;
  description: string;
  features: string[];
  pricePerHour: number;
  /** Approximate SVG position as percent of map width/height */
  x: number;
  y: number;
}

export const pavilions: Pavilion[] = [
  {
    id: "pavilion-a",
    name: "Pavilion A — Creekside",
    capacity: 50,
    description:
      "Our most popular pavilion, nestled beside the creek with natural shade and a beautiful wooded backdrop. Perfect for birthday parties and family reunions.",
    features: ["Picnic tables (x8)", "Electric outlets", "Running water nearby", "Grill station"],
    pricePerHour: 75,
    x: 20,
    y: 30,
  },
  {
    id: "pavilion-b",
    name: "Pavilion B — Garden View",
    capacity: 30,
    description:
      "A charming mid-size pavilion overlooking the flower garden. Great for smaller celebrations and bridal showers.",
    features: ["Picnic tables (x5)", "String lights", "Nearby restrooms"],
    pricePerHour: 55,
    x: 60,
    y: 25,
  },
  {
    id: "pavilion-c",
    name: "Pavilion C — Main Lawn",
    capacity: 100,
    description:
      "Our largest covered pavilion adjacent to the main lawn. Ideal for corporate events, large family gatherings, and group outings.",
    features: ["Picnic tables (x16)", "Electric outlets", "PA system hookup", "Adjacent parking"],
    pricePerHour: 120,
    x: 40,
    y: 55,
  },
  {
    id: "pavilion-d",
    name: "Pavilion D — Hilltop",
    capacity: 40,
    description:
      "Elevated pavilion with panoramic views of the park. A favorite spot for sunset events and photography sessions.",
    features: ["Picnic tables (x6)", "Scenic overlook", "Breeze & shade"],
    pricePerHour: 65,
    x: 75,
    y: 60,
  },
  {
    id: "pavilion-e",
    name: "Pavilion E — Amphitheater Terrace",
    capacity: 60,
    description:
      "Located adjacent to the amphitheater, this pavilion is perfect for pre-show gatherings and private concert parties.",
    features: ["Picnic tables (x10)", "Amphitheater access", "Bar service available"],
    pricePerHour: 90,
    x: 30,
    y: 78,
  },
];
