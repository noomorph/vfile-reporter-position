import vfile from 'vfile';
const reporter = require('../src');

const file1 = vfile({
  path: 'src/test.md',
  contents: 'hurrra braavo Jawa!',
});
file1.message(
  '`braavo` is misspelt; did you mean `bravo`?',
  { start: { line: 1, column: 8 }, end: { line: 1, column: 14 } },
  'spell:typo'
);
const warning = file1.message(
  '`Jawa` is maybe misspelt; did you mean `Java`?',
  { start: { line: 1, column: 16 }, end: { line: 1, column: 20 } },
  'spell:warn'
);
warning.warn = true;

const file2 = vfile({
  path: 'src/other/dir/test.md',
  contents: 'Hallo world!',
});
file2.message(
  '`Hallo` is misspelt; did you mean `Hello`?',
  { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } },
  'spell:typo'
);

const result = reporter([file1, file2]);
console.log(result);
