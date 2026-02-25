import { DateTime } from "luxon";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  createdAt: ReturnType<typeof DateTime.now>;
}
export const newsPosts: NewsPost[] = [];

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: ReturnType<typeof DateTime.now>;
}
export const items: Item[] = [
  {
    id: "1",
    name: "First Item",
    description: "This is the description for the first item.",
    price: 9.99,
    createdAt: DateTime.now(),
  },
  {
    id: "2",
    name: "Second Item",
    description: "This is the description for the second item.",
    price: 19.99,
    createdAt: DateTime.now(),
  },
];

export interface Release {
  id: string;
  title: string;
  description: string;
  supports: string[];
  createdAt: ReturnType<typeof DateTime.now>;
}
export const releases: Release[] = [
  {
    id: "1",
    title: "First Release",
    description: "This is the description for the first release.",
    supports: ["Feature A", "Feature B"],
    createdAt: DateTime.now(),
  },
  {
    id: "2",
    title: "Second Release",
    description: "This is the description for the second release.",
    supports: ["Feature C", "Feature D"],
    createdAt: DateTime.now(),
  },
  {
    id: "3",
    title: "Third Release",
    description: "This is the description for the third release.",
    supports: ["Feature E", "Feature F"],
    createdAt: DateTime.now(),
  },
];
