export interface Event {
  id: string;
  date: string;
  artist: string;
  genre: string;
  description: string;
  ticketUrl?: string;
  imageUrl?: string;
}

export const events: Event[] = [
  {
    id: "1",
    date: "2026-06-14",
    artist: "The Blue Ridge Band",
    genre: "Bluegrass / Country",
    description:
      "An evening of classic Appalachian bluegrass with high harmonies and lightning-fast picking. Bring your lawn chairs and dancing shoes.",
    ticketUrl: "#",
  },
  {
    id: "2",
    date: "2026-07-04",
    artist: "Fireworks & Favorites",
    genre: "Family / Holiday",
    description:
      "Celebrate Independence Day with live patriotic music followed by a spectacular fireworks display over the park.",
    ticketUrl: "#",
  },
  {
    id: "3",
    date: "2026-07-18",
    artist: "Lowcountry Sound System",
    genre: "Reggae / Soul",
    description:
      "Smooth rhythms and soulful grooves from one of the Southeast's most beloved outdoor acts.",
    ticketUrl: "#",
  },
  {
    id: "4",
    date: "2026-08-08",
    artist: "Carolina Cover Kings",
    genre: "Rock / Pop Covers",
    description:
      "Your favorite hits from the 70s through today. The whole family will be singing along.",
    ticketUrl: "#",
  },
  {
    id: "5",
    date: "2026-08-22",
    artist: "Jazz Under the Stars",
    genre: "Jazz / Big Band",
    description:
      "A magical evening of jazz standards performed by a 12-piece ensemble beneath the open sky.",
    ticketUrl: "#",
  },
];
