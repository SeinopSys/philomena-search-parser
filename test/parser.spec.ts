import { expect } from 'chai';
import parser from '../src/parser';

describe('philomena-search-parser', () => {
  it('should parse a simple tag', () => {
    const actual = parser.parse('test tag');
    expect(actual).equal(true);
  });

  it('should parse a comma-separated list of tags', () => {
    const actual = parser.parse('test tag, another tag');
    expect(actual).equal(true);
  });

  it('should parse negated tags', () => {
    let actual = parser.parse('!test tag');
    expect(actual).equal(true);

    actual = parser.parse('-test tag');
    expect(actual).equal(true);

    actual = parser.parse('NOT test tag');
    expect(actual).equal(true);
  });
});
