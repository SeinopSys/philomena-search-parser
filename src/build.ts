import { spawn } from 'child_process';
import fs, { realpathSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import PEG from 'pegjs';
import { minify } from 'terser';

const buildPath = realpathSync(path.resolve(__dirname, '../dist'));

const grammar = fs.readFileSync(path.resolve(__dirname, 'grammar.pegjs')).toString();
const parserTypes = fs.readFileSync(path.resolve(__dirname, 'parser-types.ts')).toString();

const parserSource = PEG.generate(grammar, {
  output: 'source',
  format: 'bare',
  // eslint-disable-next-line global-require
  plugins: [require('ts-pegjs')],
});

const tsFile = path.resolve(buildPath, 'index.ts');
// Prepend our custom types and replace the parse function return type
const tamperedParserSource = `${parserTypes}\n\n${parserSource.replace(/^(.*type ParseFunction.* => )any;$/m, '$1ParserResult;')}`;
writeFileSync(tsFile, tamperedParserSource);

const tscExec = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';

const tsc = spawn(path.resolve(__dirname, '../node_modules/.bin', tscExec), ['--project', 'tsconfig.build.json'], { stdio: 'inherit' });

tsc.on('exit', (code: number) => {
  if (code !== 0) {
    process.exit(code);
    return;
  }

  const indexJsPath = path.resolve(buildPath, 'index.js');
  const indexJsMapPath = path.resolve(buildPath, 'index.js.map');
  const indexJs = fs.readFileSync(indexJsPath).toString();
  const indexJsMap = fs.readFileSync(indexJsMapPath).toString();

  minify(indexJs, {
    format: { comments: /generated by/ },
    sourceMap: {
      content: indexJsMap,
      url: 'index.js.map',
    },
  }).then((minifiedSource) => {
    if (!minifiedSource.code) throw new Error('failed to write source');

    writeFileSync(indexJsPath, minifiedSource.code);
    if (typeof minifiedSource.map === 'string') {
      writeFileSync(indexJsMapPath, minifiedSource.map);
    } else {
      unlinkSync(indexJsMapPath);
    }

    unlinkSync(tsFile);
  });
});