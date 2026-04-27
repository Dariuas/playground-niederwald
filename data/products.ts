export interface Addon {
  id: string;
  name: string;
  /** Price in cents */
  price: number;
  /** Price in cents when purchased on-site (if different) */
  onSitePrice?: number;
  description: string;
  squareCatalogId: string; // paste from Square Dashboard → Catalog
}

export interface Product {
  id: string;
  name: string;
  /** Price in cents */
  price: number;
  description: string;
  squareCatalogId: string; // paste from Square Dashboard → Catalog
  addonIds: string[];
}

export const addons: Addon[] = [
  {
    id: "child-entry-addon",
    name: "Child Entry Ticket",
    price: 10_00,
    description: "Ages 3–12 — playground, train rides, and jumping blob included. Buy one for each guest!",
    squareCatalogId: "",
  },
  {
    id: "unlimited-train",
    name: "Unlimited Train Rides",
    price: 5_00,
    description: "Upgrade to unlimited train rides for the day",
    squareCatalogId: "",
  },
  {
    id: "gel-blaster-3rounds",
    name: "Gel Blaster (3 Rounds)",
    price: 12_00,
    onSitePrice: 15_00,
    description: "3 rounds of gel blaster fun per kid — save $3 buying online",
    squareCatalogId: "",
  },
  {
    id: "gem-bag-small",
    name: "Gem Mining Bag (Small)",
    price: 13_00,
    description: "Small gem bag for the mining station",
    squareCatalogId: "",
  },
  {
    id: "gem-bag-large",
    name: "Gem Mining Bag (Large)",
    price: 20_00,
    description: "Large gem bag for the mining station",
    squareCatalogId: "",
  },
];

export const products: Product[] = [
  {
    id: "park-entry",
    name: "Park Entry",
    price: 10_00,
    description:
      "General admission includes 2 train rides (ages 2–12) and access to the jumping playground",
    squareCatalogId: "",
    addonIds: [
      "unlimited-train",
      "gel-blaster-3rounds",
      "gem-bag-small",
      "gem-bag-large",
    ],
  },
];

/** Discount applied to addons and food when a pavilion is booked */
export const PAVILION_DISCOUNT = 0.20;
