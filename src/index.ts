/**
 * Prints error messages with position and content
 */
import { VFile } from 'vfile';
import { VFileMessage } from 'vfile-message';
import chalk from 'chalk';
import figures from 'figures';
import { parse as pathParse, sep as pathSep } from 'path';

interface FileResult {
  text: string;
  errorsCount: number;
  warningsCount: number;
}

export default reporter;

export const reporter = (files: VFile[], options?: object): string =>
  reporterFileResult(files, options).text;

export const reporterFileResult = (
  files: VFile[],
  _options?: object
): FileResult => {
  const fileResults = files
    .filter(x => x.messages.length > 0)
    .map(x => reportFile(x));
  const summary = mergeResults(fileResults);

  return {
    ...summary,
    text:
      summary.text.length > 0
        ? summary.text + '\n\n' + summaryLine(summary)
        : '',
  };
};

const summaryLine = (summary: FileResult): string => {
  const errorsText = plural(summary.errorsCount, 'error');
  const warningsText = plural(summary.warningsCount, 'warning');

  return `${
    summary.errorsCount > 0 ? errorColor(errorsText) : errorsText
  } and ${
    summary.warningsCount > 0 ? warningColor(warningsText) : warningsText
  }`;
};

const reportFile = (file: VFile): FileResult => {
  const contentLines = file.toString().split('\n');

  const errorMessages = mergeResults(
    file.messages.map(x => reportMessage(file, x, contentLines))
  );
  const header = formatPath(file.path || '<stdin>') + '\n';

  return {
    ...errorMessages,
    text: header + errorMessages.text,
  };
};

const reportMessage = (
  file: VFile,
  message: VFileMessage,
  contentLines: string[]
): FileResult => {
  const fileInfo = ' ' + formatPathWithPosition(file, message) + ' - ';
  const source = message.source ? sourceColor(message.source) : '';
  const ruleId = message.ruleId ? sourceColor(message.ruleId) : '';
  const sourceAndRule =
    source && ruleId ? source + chalk.grey(':') + ruleId : source + ruleId;
  const positionLine = contentLines[message.location.start.line - 1]
    ? '\n\n' + getErrorLine(message, contentLines)
    : '';
  const prefixSymbol = message.warn
    ? warningColor(figures.warning)
    : errorColor(figures.cross);
  const level = message.warn ? warningColor('warning') : errorColor('error');

  const text =
    '  ' +
    prefixSymbol +
    fileInfo +
    level +
    ' ' +
    (sourceAndRule ? sourceAndRule + ' ' : '') +
    message.message +
    positionLine;

  return {
    text,
    errorsCount: message.warn ? 0 : 1,
    warningsCount: message.warn ? 1 : 0,
  };
};

const getErrorLine = (
  message: VFileMessage,
  contentLines: string[]
): string => {
  const prefix = '  ';
  const startLineNumber = message.location.start.line;
  const endLineNumber = message.location.end.line;
  const startColumn = message.location.start.column;
  const text = contentLines[startLineNumber - 1];
  const contentLine = lineNumberColor(startLineNumber) + ' ' + text;
  const dummyLineNumber = startLineNumber.toString().replace(/\d/g, ' ');
  const redLineLength =
    startLineNumber === endLineNumber
      ? message.location.end.column - startColumn
      : text.length - startColumn;
  const redLine =
    lineNumberColor(dummyLineNumber) +
    ' '.repeat(startColumn) +
    errorColor('~'.repeat(redLineLength));
  return prefix + contentLine + '\n' + prefix + redLine + '\n';
};

const mergeResults = (results: FileResult[]): FileResult => {
  const summary: FileResult = {
    text: '',
    errorsCount: 0,
    warningsCount: 0,
  };

  results.forEach(x => {
    if (summary.text.length > 0) summary.text += '\n';
    summary.text += x.text;

    summary.errorsCount += x.errorsCount;
    summary.warningsCount += x.warningsCount;
  });

  return summary;
};

const formatPath = (path: string): string => {
  const parsed = pathParse(path);
  const dir = parsed.dir ? parsed.dir + pathSep : '';
  return chalk.grey(dir) + chalk.bold(parsed.name + parsed.ext);
};

const formatPathWithPosition = (file: VFile, message: VFileMessage) => {
  let result = file.path ? chalk.cyan(file.path) : '';
  let separator = chalk.grey(':');
  if (message.location.start.line && message.location.start.column) {
    if (result.length > 0) result += separator;
    result +=
      chalk.yellow(message.location.start.line) +
      separator +
      chalk.yellow(message.location.start.column);
  }

  return result;
};

const plural = (count: number, text: string): string =>
  count + ' ' + text + (count === 1 ? '' : 's');

const warningColor = chalk.yellow;
const errorColor = chalk.red;
const lineNumberColor = (text: any): string => chalk.bgWhite(chalk.black(text));
const sourceColor = chalk.magenta;
