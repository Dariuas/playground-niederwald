export interface DayPricing {
  firstHour: number;
  addHour: number;
}

export interface PavilionSchedule {
  /** Days of week open: 0=Sun, 1=Mon … 6=Sat */
  availableDays: number[];
  openTime: string;   // "HH:MM" 24h
  closeTime: string;  // "HH:MM" 24h
  /** Per-day price overrides — key is day number. Omit day to use default pricing. */
  dayPricing: Record<number, DayPricing>;
}

export interface Pavilion {
  id: string;
  number: number;
  name: string;
  capacity: number;
  description: string;
  features: string[];
  /** Default first-hour price in dollars */
  firstHourPrice: number;
  /** Default additional-hour price in dollars */
  additionalHourPrice: number;
  squareCatalogId: string;
  schedule: PavilionSchedule;
  /** Position as % of map image width/height for overlay marker */
  x: number;
  y: number;
}

// Mon–Wed free, Thu–Sat paid. Closed Sun.
const defaultSchedule: PavilionSchedule = {
  availableDays: [1, 2, 3, 4, 5, 6],
  openTime:  "09:00",
  closeTime: "21:00",
  dayPricing: {
    1: { firstHour: 0,  addHour: 0  },
    2: { firstHour: 0,  addHour: 0  },
    3: { firstHour: 0,  addHour: 0  },
  },
};

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
    schedule: { ...defaultSchedule },
    x: 37,
    y: 43,
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
    schedule: { ...defaultSchedule },
    x: 44,
    y: 43,
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
    schedule: { ...defaultSchedule },
    x: 61,
    y: 41,
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
    schedule: { ...defaultSchedule },
    x: 59,
    y: 53,
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
    schedule: { ...defaultSchedule },
    x: 57,
    y: 63,
  },
  {
    id: "pavilion-6",
    number: 6,
    name: "Games Pavilion",
    capacity: 80,
    description:
      "Our premium pavilion right next to the playground — the ultimate spot for birthday parties. Generous covered space for large groups with direct views of the fun.",
    features: ["Picnic tables (x12)", "Premium covered structure", "Next to playground", "Largest capacity"],
    firstHourPrice: 75,
    additionalHourPrice: 50,
    squareCatalogId: "",
    schedule: {
      availableDays: [1, 2, 3, 4, 5, 6],
      openTime:  "09:00",
      closeTime: "21:00",
      dayPricing: {
        1: { firstHour: 0, addHour: 0 },
        2: { firstHour: 0, addHour: 0 },
        3: { firstHour: 0, addHour: 0 },
      },
    },
    x: 77,
    y: 41,
  },
];
