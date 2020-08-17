import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import PEG from 'pegjs';
import { ParserResult } from '../src/parser-types';

const grammar = fs.readFileSync(path.resolve(__dirname, '../src/grammar.pegjs')).toString();

const parser = PEG.generate(grammar);

const testTags = ['test tag', 'another tag', 'third tag'];

const getExpected = (numbers: number[], names: string[] = testTags): ParserResult => {
  const data: [number, number][] = [];
  numbers.forEach((el, i) => {
    if (i % 2 === 1) return;

    data.push([el, numbers[i + 1]]);
  });

  return data.map((pos, i) => ({
    pos,
    name: names[i],
  }));
};

const getExpectedString = (string: string): ParserResult => getExpected([0, string.length], [string]);

describe('philomena-search-parser', () => {
  it('should parse a simple tag', () => {
    const tagName = testTags[0];
    const actual = parser.parse(tagName);
    const expected = getExpectedString(tagName);
    expect(actual).deep.equal(expected);
  });

  it('should parse tags with characters that have special meaning', () => {
    let tagName = 'twilight sparkle (mlp)';

    let actual = parser.parse(tagName);
    let expected = getExpectedString(tagName);
    expect(actual).deep.equal(expected);

    tagName = 'marks and recreation';
    actual = parser.parse(tagName);
    expected = getExpectedString(tagName);
    expect(actual).deep.equal(expected);

    tagName = 'once or twice';
    actual = parser.parse(tagName);
    expected = getExpectedString(tagName);
    expect(actual).deep.equal(expected);

    tagName = 'once or twice';
    actual = parser.parse(tagName);
    expected = getExpectedString(tagName);
    expect(actual).deep.equal(expected);
  });

  it('should parse negated tags', () => {
    const tagName = testTags[0];
    const getExpectedNegated = (operator: string, offset = 0): ParserResult => getExpected([
      offset + operator.length,
      offset + operator.length + tagName.length,
    ]);

    let actual = parser.parse(`!${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('!'));
    actual = parser.parse(`!  ${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('!', 2));

    actual = parser.parse(`-${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('-'));
    actual = parser.parse(`-  ${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('-', 2));

    actual = parser.parse(`NOT ${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('NOT', 1));
    actual = parser.parse(`NOT  ${tagName}`);
    expect(actual).deep.equal(getExpectedNegated('NOT', 2));
  });

  it('should parse a comma-separated list of tags and AND clauses', () => {
    let actual = parser.parse(`${testTags[0]}, ${testTags[1]}`);
    expect(actual).deep.equal(getExpected([0, 8, 10, 21]));

    actual = parser.parse(`${testTags[0]} AND ${testTags[1]}`);
    expect(actual).deep.equal(getExpected([0, 8, 13, 24]));

    actual = parser.parse(`${testTags[0]} AND -${testTags[1]}`);
    expect(actual).deep.equal(getExpected([0, 8, 14, 25]));

    actual = parser.parse(`!${testTags[0]} AND ${testTags[1]}`);
    expect(actual).deep.equal(getExpected([1, 9, 14, 25]));
  });

  it('should parse grouped expressions', () => {
    let actual = parser.parse('(test tag AND another tag) || third tag');
    expect(actual).equal(true);

    actual = parser.parse('(!test tag AND !another tag), third tag');
    expect(actual).equal(true);

    actual = parser.parse('(test tag OR -another tag) && third tag');
    expect(actual).equal(true);

    actual = parser.parse('third tag, (test tag OR -another tag)');
    expect(actual).equal(true);

    actual = parser.parse('third tag OR (!test tag AND -another tag)');
    expect(actual).equal(true);
  });
});
