import { DateTime } from "luxon";

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  createdAt: ReturnType<typeof DateTime.now>;
}
export const newsPosts: NewsPost[] = [
  {
    id: "1",
    title: "First News Post",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam fringilla rhoncus nunc. Quisque et elit quis lacus pellentesque accumsan sit amet vel est. Sed in dui turpis. Sed odio eros, aliquam vel augue nec, pretium semper orci. Quisque dictum justo eget ante commodo mollis. Fusce condimentum, ipsum eu varius rutrum, mauris tellus semper augue, vitae facilisis orci metus vitae leo. Donec mollis nisl ac sapien consectetur, eget fermentum ante feugiat. Suspendisse rutrum arcu at mauris finibus tincidunt. In hac habitasse platea dictumst. Vestibulum purus neque, suscipit a fermentum id, semper id nisi. Cras consequat felis nec massa rutrum laoreet. Aliquam ultricies, ante id tincidunt cursus, leo augue pellentesque quam, in rutrum quam sem id tortor. Sed non nisi eu augue placerat iaculis a ut sem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi tincidunt odio nec lectus varius, nec vestibulum turpis posuere. Morbi a libero consectetur, luctus purus et, egestas sapien. Quisque lacus ipsum, vestibulum non arcu sit amet, accumsan vulputate tortor. Proin consectetur libero tellus, a tempus dolor vulputate lobortis. Vivamus nisl nulla, rhoncus sed laoreet quis, malesuada vel enim. Sed finibus metus ac neque semper egestas. Morbi id blandit sem. Maecenas varius purus in sem iaculis, varius tempus justo facilisis. Aliquam pharetra mauris vitae dictum bibendum. Donec varius nibh quam, nec condimentum nulla ornare ut. Aliquam eu nulla aliquam, dictum risus in, porttitor eros. Aliquam condimentum odio vitae metus consectetur, vel blandit nisi aliquam. Maecenas ac tortor ac sem ornare elementum. Sed vel pulvinar mi. Vestibulum aliquam arcu at semper scelerisque. Aliquam erat volutpat. Vestibulum varius tincidunt massa interdum iaculis. In et elementum lectus, vitae aliquet elit. Morbi eget suscipit dui. Nullam lobortis elit sollicitudin, vestibulum libero ac, semper libero. Morbi in luctus mi. Nulla sit amet ultrices ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aenean quis turpis quam. Donec tristique nisl nec imperdiet posuere. Sed non nulla ut elit vulputate scelerisque. Fusce iaculis vulputate ipsum sit amet dignissim. Donec dapibus in dui sit amet suscipit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris quis lorem turpis. Vestibulum vehicula rutrum est, quis porttitor elit vulputate sit amet. In vel justo erat. Vivamus tincidunt metus in augue consequat euismod. Donec vel diam ligula. Proin eu porta tortor, eget placerat ipsum. Vestibulum maximus augue odio, et tristique risus commodo nec. Nunc leo quam, euismod pellentesque augue id, tincidunt luctus ante. Aliquam semper vehicula malesuada. Ut ut rutrum felis. Morbi ullamcorper urna turpis, non rhoncus enim lacinia vitae. In vel dignissim tellus, quis venenatis metus. Fusce vitae erat interdum, aliquet eros sit amet, dapibus arcu. Aliquam at turpis vitae lorem viverra maximus. Vestibulum dictum, felis quis rhoncus ultrices, urna nibh porttitor tortor, non suscipit nisi dui in ipsum. Nulla vel finibus lacus. Nulla auctor eu ipsum dignissim eleifend. Donec eleifend ex vel arcu dapibus rhoncus. Duis congue mattis velit vel auctor. Nunc gravida, felis vel aliquet rutrum, eros ante pharetra ex, ut tristique ex velit sed.",
    createdAt: DateTime.now(),
  },
  {
    id: "2",
    title: "Second News Post",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam fringilla rhoncus nunc. Quisque et elit quis lacus pellentesque accumsan sit amet vel est. Sed in dui turpis. Sed odio eros, aliquam vel augue nec, pretium semper orci. Quisque dictum justo eget ante commodo mollis. Fusce condimentum, ipsum eu varius rutrum, mauris tellus semper augue, vitae facilisis orci metus vitae leo. Donec mollis nisl ac sapien consectetur, eget fermentum ante feugiat. Suspendisse rutrum arcu at mauris finibus tincidunt. In hac habitasse platea dictumst. Vestibulum purus neque, suscipit a fermentum id, semper id nisi. Cras consequat felis nec massa rutrum laoreet. Aliquam ultricies, ante id tincidunt cursus, leo augue pellentesque quam, in rutrum quam sem id tortor. Sed non nisi eu augue placerat iaculis a ut sem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi tincidunt odio nec lectus varius, nec vestibulum turpis posuere. Morbi a libero consectetur, luctus purus et, egestas sapien. Quisque lacus ipsum, vestibulum non arcu sit amet, accumsan vulputate tortor. Proin consectetur libero tellus, a tempus dolor vulputate lobortis. Vivamus nisl nulla, rhoncus sed laoreet quis, malesuada vel enim. Sed finibus metus ac neque semper egestas. Morbi id blandit sem. Maecenas varius purus in sem iaculis, varius tempus justo facilisis. Aliquam pharetra mauris vitae dictum bibendum. Donec varius nibh quam, nec condimentum nulla ornare ut. Aliquam eu nulla aliquam, dictum risus in, porttitor eros. Aliquam condimentum odio vitae metus consectetur, vel blandit nisi aliquam. Maecenas ac tortor ac sem ornare elementum. Sed vel pulvinar mi. Vestibulum aliquam arcu at semper scelerisque. Aliquam erat volutpat. Vestibulum varius tincidunt massa interdum iaculis. In et elementum lectus, vitae aliquet elit. Morbi eget suscipit dui. Nullam lobortis elit sollicitudin, vestibulum libero ac, semper libero. Morbi in luctus mi. Nulla sit amet ultrices ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aenean quis turpis quam. Donec tristique nisl nec imperdiet posuere. Sed non nulla ut elit vulputate scelerisque. Fusce iaculis vulputate ipsum sit amet dignissim. Donec dapibus in dui sit amet suscipit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris quis lorem turpis. Vestibulum vehicula rutrum est, quis porttitor elit vulputate sit amet. In vel justo erat. Vivamus tincidunt metus in augue consequat euismod. Donec vel diam ligula. Proin eu porta tortor, eget placerat ipsum. Vestibulum maximus augue odio, et tristique risus commodo nec. Nunc leo quam, euismod pellentesque augue id, tincidunt luctus ante. Aliquam semper vehicula malesuada. Ut ut rutrum felis. Morbi ullamcorper urna turpis, non rhoncus enim lacinia vitae. In vel dignissim tellus, quis venenatis metus. Fusce vitae erat interdum, aliquet eros sit amet, dapibus arcu. Aliquam at turpis vitae lorem viverra maximus. Vestibulum dictum, felis quis rhoncus ultrices, urna nibh porttitor tortor, non suscipit nisi dui in ipsum. Nulla vel finibus lacus. Nulla auctor eu ipsum dignissim eleifend. Donec eleifend ex vel arcu dapibus rhoncus. Duis congue mattis velit vel auctor. Nunc gravida, felis vel aliquet rutrum, eros ante pharetra ex, ut tristique ex velit sed.",
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
