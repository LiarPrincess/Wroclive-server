export interface ResponseModel {
  rss: Rss;
}

export interface Rss {
  $: GeneratedType;
  channel: Channel[];
}

export interface GeneratedType {
  "xmlns:atom": string;
  "xmlns:dc": string;
  version: string;
}

export interface Channel {
  "atom:link": AtomLink[];
  title: string[];
  link: string[];
  description: string[];
  language: string[];
  ttl: string[];
  image: Image[];
  item: Item[];
}

export interface AtomLink {
  $: GeneratedType2;
}

export interface GeneratedType2 {
  href: string;
  rel: string;
  type: string;
}

export interface Image {
  title: string[];
  link: string[];
  url: string[];
  width: string[];
  height: string[];
}

export interface Item {
  title: string[];
  "dc:creator": string[];
  description: string[];
  pubDate: string[];
  guid: string[];
  link: string[];
}
