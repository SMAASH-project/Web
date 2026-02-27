import { DateTime } from "luxon";
import SlimeArt from "@/assets/SlimeArt.png";
import SlimeArtTransparent from "@/assets/SlimeArtTransparent.png";

export interface NewsPost {
  id: string;
  title: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number;
  content: string;
  createdAt: ReturnType<typeof DateTime.now>;
}
export const newsPosts: NewsPost[] = [
  {
    id: "1",
    image: SlimeArtTransparent,
    imageAlt: "Slime Art Transparent",
    imagePosition: "Right",
    imageSize: 25,
    title: "First News Article",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ipsum lorem, vehicula malesuada consequat in, sodales et nunc. Proin vehicula metus eros, nec luctus ante rutrum ut. Proin elementum vitae elit quis feugiat. Nulla facilisi. Sed vehicula nulla sit amet dui volutpat euismod. Mauris orci dolor, ultricies ut tellus ac, volutpat eleifend mi. Praesent lobortis ex id nisl luctus porttitor. Vestibulum id mollis purus. Proin blandit ex a tristique aliquet. Vivamus varius et ante id aliquet. Sed sit amet arcu urna. Curabitur efficitur ullamcorper ante, quis pellentesque lacus condimentum et. Vestibulum convallis suscipit quam. Maecenas pulvinar commodo ligula vitae dictum. Ut nunc metus, dictum eget est sed, laoreet luctus lorem. Proin tincidunt urna ante, et dictum purus malesuada vitae. Nam id felis ultrices, efficitur turpis vitae, feugiat diam. Donec vestibulum vestibulum tortor eget semper. Pellentesque tristique, mi non pretium eleifend, neque augue dictum risus, sed euismod dui leo in arcu. Maecenas neque justo, finibus sit amet felis non, ultricies pharetra nunc. Pellentesque a est sit amet arcu aliquet hendrerit quis sed velit. Maecenas accumsan fermentum leo, sed porta mi lobortis et. Sed a neque efficitur, lacinia magna vel, malesuada nibh. Etiam urna eros, elementum ac ex commodo, lacinia dignissim est. Suspendisse tempus sagittis scelerisque. Phasellus fringilla in diam et facilisis. Mauris eget placerat mi, id ullamcorper enim. Quisque vitae mauris in urna congue pharetra. Etiam viverra elit eros, eget lobortis purus malesuada vitae. Suspendisse vestibulum mauris et vestibulum aliquam. Donec aliquam nec elit vel sollicitudin. Phasellus turpis arcu, feugiat eget diam in, euismod cursus neque. Mauris in felis nec lectus vulputate aliquet at quis leo. Praesent sagittis vestibulum felis in tempus. Morbi blandit molestie eros, ut pellentesque orci tristique quis. In gravida justo quis nunc vestibulum, suscipit aliquam felis dapibus. Vestibulum sed cursus sapien, at mollis ante. Vivamus cursus dui eu urna lobortis cursus. Praesent elit ex, finibus vitae lacinia eu, rutrum eget justo. Quisque ut ultricies ante, ac elementum odio. Nullam eu tincidunt magna. Suspendisse potenti. Cras ac tempor felis. Nulla convallis lorem nibh, ut efficitur mauris volutpat eu. Duis placerat vehicula condimentum. Nullam lobortis id lorem eget molestie. Curabitur sed luctus sem. In consectetur urna at magna elementum, ut mattis diam efficitur. Maecenas eu massa ornare, imperdiet nulla a, tincidunt velit. Morbi lacinia dui diam, at auctor libero aliquet a. Quisque et sapien vulputate, euismod diam eu, faucibus ex. Nam euismod mattis nulla tincidunt eleifend. Ut sodales sit amet tellus in rutrum. Aenean congue nec lorem quis congue. Quisque mollis dui venenatis, laoreet tellus quis, hendrerit nisi. Suspendisse non leo condimentum, mattis magna et, placerat neque. Proin tellus nulla, accumsan at tincidunt ut, pulvinar non lorem. Vestibulum sagittis ex nec lacus tincidunt tempor. Curabitur lacinia ligula sit amet cursus viverra. Praesent sem ipsum, sollicitudin non auctor nec, consequat sit amet turpis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In pretium pellentesque facilisis. Fusce condimentum erat metus, in mollis lacus maximus id. Praesent commodo, risus vel bibendum luctus, mi leo accumsan eros, ut commodo massa mi.",
    createdAt: DateTime.now(),
  },
  {
    id: "2",
    title: "Second News Article",
    content: `# H1\n ## H2\n ### H3\n ---\n**bold text**\n*italicized text*\n> blockquote\n---\n1. First item\n2. Second item\n3. Third item\n---\n- First item\n- Second item\n- Third item\n---\n\`code\`\n[mkd](https://www.markdownguide.org/cheat-sheet/)\n![alt text](${SlimeArt})`,
    createdAt: DateTime.now(),
  },
  {
    id: "3",
    image: SlimeArt,
    imageAlt: "Slime Art",
    imagePosition: "Top",
    imageSize: 25,
    title: "Third News Article",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ipsum lorem, vehicula malesuada consequat in, sodales et nunc. Proin vehicula metus eros, nec luctus ante rutrum ut. Proin elementum vitae elit quis feugiat. Nulla facilisi. Sed vehicula nulla sit amet dui volutpat euismod. Mauris orci dolor, ultricies ut tellus ac, volutpat eleifend mi. Praesent lobortis ex id nisl luctus porttitor. Vestibulum id mollis purus. Proin blandit ex a tristique aliquet. Vivamus varius et ante id aliquet. Sed sit amet arcu urna. Curabitur efficitur ullamcorper ante, quis pellentesque lacus condimentum et. Vestibulum convallis suscipit quam. Maecenas pulvinar commodo ligula vitae dictum. Ut nunc metus, dictum eget est sed, laoreet luctus lorem. Proin tincidunt urna ante, et dictum purus malesuada vitae. Nam id felis ultrices, efficitur turpis vitae, feugiat diam. Donec vestibulum vestibulum tortor eget semper. Pellentesque tristique, mi non pretium eleifend, neque augue dictum risus, sed euismod dui leo in arcu. Maecenas neque justo, finibus sit amet felis non, ultricies pharetra nunc. Pellentesque a est sit amet arcu aliquet hendrerit quis sed velit. Maecenas accumsan fermentum leo, sed porta mi lobortis et. Sed a neque efficitur, lacinia magna vel, malesuada nibh. Etiam urna eros, elementum ac ex commodo, lacinia dignissim est. Suspendisse tempus sagittis scelerisque. Phasellus fringilla in diam et facilisis. Mauris eget placerat mi, id ullamcorper enim. Quisque vitae mauris in urna congue pharetra. Etiam viverra elit eros, eget lobortis purus malesuada vitae. Suspendisse vestibulum mauris et vestibulum aliquam. Donec aliquam nec elit vel sollicitudin. Phasellus turpis arcu, feugiat eget diam in, euismod cursus neque. Mauris in felis nec lectus vulputate aliquet at quis leo. Praesent sagittis vestibulum felis in tempus. Morbi blandit molestie eros, ut pellentesque orci tristique quis. In gravida justo quis nunc vestibulum, suscipit aliquam felis dapibus. Vestibulum sed cursus sapien, at mollis ante. Vivamus cursus dui eu urna lobortis cursus. Praesent elit ex, finibus vitae lacinia eu, rutrum eget justo. Quisque ut ultricies ante, ac elementum odio. Nullam eu tincidunt magna. Suspendisse potenti. Cras ac tempor felis. Nulla convallis lorem nibh, ut efficitur mauris volutpat eu. Duis placerat vehicula condimentum. Nullam lobortis id lorem eget molestie. Curabitur sed luctus sem. In consectetur urna at magna elementum, ut mattis diam efficitur. Maecenas eu massa ornare, imperdiet nulla a, tincidunt velit. Morbi lacinia dui diam, at auctor libero aliquet a. Quisque et sapien vulputate, euismod diam eu, faucibus ex. Nam euismod mattis nulla tincidunt eleifend. Ut sodales sit amet tellus in rutrum. Aenean congue nec lorem quis congue. Quisque mollis dui venenatis, laoreet tellus quis, hendrerit nisi. Suspendisse non leo condimentum, mattis magna et, placerat neque. Proin tellus nulla, accumsan at tincidunt ut, pulvinar non lorem. Vestibulum sagittis ex nec lacus tincidunt tempor. Curabitur lacinia ligula sit amet cursus viverra. Praesent sem ipsum, sollicitudin non auctor nec, consequat sit amet turpis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In pretium pellentesque facilisis. Fusce condimentum erat metus, in mollis lacus maximus id. Praesent commodo, risus vel bibendum luctus, mi leo accumsan eros, ut commodo massa mi.",
    createdAt: DateTime.now(),
  },
  {
    id: "4",
    title: "Fourth News Article",
    content: `# H1\n ## H2\n ### H3\n ---\n**bold text**\n*italicized text*\n> blockquote\n---\n1. First item\n2. Second item\n3. Third item\n---\n- First item\n- Second item\n- Third item\n---\n\`code\`\n[mkd](https://www.markdownguide.org/cheat-sheet/)\n![alt text](${SlimeArt})`,
    createdAt: DateTime.now(),
  },
];

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
