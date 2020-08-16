import jison, { JisonGrammar } from 'jison';

const grammar: JisonGrammar = {
  lex: {
    startConditions: {
      group: false,
      expression: false,
    },
    rules: [
      ['[\r\n]', '/* ignore newlines */'],
      [['INITIAL', 'group'], '\\(', "this.begin('group'); this.begin('expression');"],
      [['INITIAL'], '"', "this.begin('expression');"],
      [['INITIAL', 'expression'], '(!|-|NOT)', "return 'NOT';"],
      [['INITIAL', 'expression'], '(,|&&|AND)', "return 'AND';"],
      [['INITIAL', 'expression'], '(\\|\\||OR)', "return 'OR';"],
      [['INITIAL', 'expression'], '(?![!-,]|&&|\\|\\||AND|OR|NOT).+', "return 'TAG';"],
      ['[\\s\\S]+', "return 'EXPRESSION';"],
      [['group'], '\\)', 'this.popState();'],
      [['expression'], '\\["()*?\\\\~^]', '/* ignore escaped special chars */'],
      [['expression'], '"', 'this.popState();'],
      ['$', "return 'EOF';"],
    ],
  },

  bnf: {
    expressions: ['expression EOF'],
    e: ['TAG', 'NOT TAG', 'TAG AND TAG', 'TAG OR TAG'],
    expression: ['e', '( e )', 'e AND e', 'e OR e'],
  },
};

const parser = new jison.Parser(grammar);

export default parser;
