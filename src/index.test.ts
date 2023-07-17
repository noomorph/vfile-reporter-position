import { describe, expect, test } from '@jest/globals';

import { VFile } from 'vfile';
import reporter from './index.js';

describe('vfile-reporter-position', function () {
  test('should report errors and warnings', function () {
    const file1 = vfile('src/test.md', 'hurrra braavo Jawa!');
    const file2 = vfile('src/other/dir/test.md', 'Hallo world!\nHello welt!');

    file1.message(
      '`braavo` is misspelt; did you mean `bravo`?',
      parsePlace('1:8-1:14'),
      'spell:typo'
    );

    const warning = file1.message(
      '`Jawa` is maybe misspelt; did you mean `Java`?',
      parsePlace('1:15-1:18'),
      'spell:warn'
    );
    warning.fatal = false;

    file2.message(
      '`world! and Hello should be together, right?',
      parsePlace('1:7-2:5'),
      'spell:nonsense'
    );

    const result = reporter([file1, file2]);
    expect(result).toMatchSnapshot();
  });
});

/**
 * Parses '1:2-3:4' into { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } }
 * @param str
 */
function parsePlace(str: string) {
  const [start, end] = str.split('-');
  const [startLine, startColumn] = start.split(':');
  const [endLine, endColumn] = end.split(':');
  return {
    start: { line: parseInt(startLine), column: parseInt(startColumn) },
    end: { line: parseInt(endLine), column: parseInt(endColumn) },
  };
}

function vfile(path: string, value: string) {
  return new VFile({ path, value });
}
