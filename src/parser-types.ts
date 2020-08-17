export type ParserResult = TagInfo[];

export interface TagInfo {
  name: string;
  /** [start, end] 0-based */
  pos: [number, number],
}
