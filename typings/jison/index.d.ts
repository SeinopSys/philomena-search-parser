/* eslint-disable camelcase */
declare module 'jison' {
  export type JisonRule = [string, string];
  export type JisonRuleWithExpectedStates = [string[], string, string];

  export interface JisonGrammar {
    /* lexical grammar */
    lex: {
      startConditions: {
        [k: strting]: boolean,
      },
      rules: Array<JisonRule | JisonRuleWithExpectedStates>
    },
    /* operator associations and precedence */
    operators?: string[][],
    /* language grammar */
    bnf: {
      [k: string]: string[],
    }
  }

  interface TokenLocationInfo {
    first_line: number,
    last_line: number,
    first_column: number,
    last_column: number,
    /** [start_number, end_number] where the numbers are indexes into the input string, regular zero-based */
    range: [number, number]
  }

  interface ParseErrorHash {
    // For lexer and parser errors:
    /** matched text */
    text: string;
    /** the produced terminal token, if any */
    token: string;
    /** yylineno */
    line: number;

    // For parser (grammar) errors only:
    /** yylloc */
    loc?: number;
    /** string describing the set of expected tokens */
    expected?: string;
    /** TRUE when the parser has a error recovery rule available for this particular error */
    recoverable?: boolean;
  }

  interface JisonParser {
    yy: any,
    trace: () => unknown,
    symbols_: { [name: string]: number },
    terminals_: { [number: number]: string },
    productions_: any[],
    performAction: (yytext: string, yyleng: number, yylineno: number, yy, yystate, $$, _$: TokenLocationInfo) => unknown,
    table: any[],
    defaultActions: any,
    parseError: (str: string, hash: ParseErrorHash) => unknown,
    parse: (input: string) => any,
    lexer: {
      EOF: 1,
      _currentRules: () => unknown,
      begin: (condition: string) => void,
      input: () => string,
      less: (n: number) => unknown,
      lex: () => unknown,
      more: () => unknown,
      next: () => unknown,
      options: {
        /** if true token location info will include a .range[] member */
        ranges: boolean;
        /** flex-like lexing behaviour where the rules are tested exhaustively to find the longest match */
        flex: boolean;
        /**
         * lexer regexes are tested in order and for each matching regex the action code is invoked;
         * the lexer terminates the scan when a token is returned by the action code
         */
        backtrack_lexer: boolean;
      },
      parseError: (str: string, hash: ParseErrorHash) => unknown,
      pastInput: () => unknown,
      performAction: (yy, yy_, $avoiding_name_collisions, YY_START) => unknown,
      popState: () => void,
      pushState: (condition: string) => void,
      setInput: (input: string) => void,
      showPosition: () => unknown,
      test_match: (regex_match_array, rule_index) => unknown,
      topState: () => unknown,
      unput: (str) => unknown,
      upcomingInput: () => unknown,
      rules: any[],
      conditions: { [name: string]: any[] },
    }
  }

  export interface JisonParserFactory {
    new(grammar: JisonGrammar): JisonParserFactory;
    /**
     * Returns the source code for the generated parser
     */
    generate(): string;
    generateAMDModule(): string;
    generateModule(): string;
    generateCommonJSModule(): string;
    parse: (input: string) => any;
    yy: any;
    productions: any[];
    lexer: {
        conditions: {
          [k: string]: {
            inclusive: boolean;
            rules: number[];
          };
        };
        generate(): string;
        generateAMDModule(): string;
        generateModule(): string;
        generateCommonJSModule(): string;
        reject(): unknown;
        rules: RegExp[];
        stateStackSize(): unknown;
        yy: any;
    } & Pick<JisonParser['lexer'], (
      'EOF'
      | 'input'
      | '_currentRules'
      | 'begin'
      | 'less'
      | 'lex'
      | 'more'
      | 'next'
      | 'parseError'
      | 'pastInput'
      | 'performAction'
      | 'popState'
      | 'pushState'
      | 'reject'
      | 'setInput'
      | 'showPosition'
      | 'test_match'
      | 'topState'
      | 'unput'
      | 'upcomingInput'
      | 'yy'
      | 'options'
    )>;
    parseError: JisonParser['parseError'];
  }

  const Parser: JisonParserFactory;
  export = { Parser };
}
