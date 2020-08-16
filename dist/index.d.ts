import { JisonParser } from 'jison';

declare module 'philomena-search-parser' {
  const parser: JisonParser;
  export = parser;
}
