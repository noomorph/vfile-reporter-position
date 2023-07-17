/**
 * Prints error messages with position and content
 */
import { parse as pathParse, sep as pathSep } from 'node:path';
import type { VFile } from 'vfile';
import type { VFileMessage } from 'vfile-message';
import chalk from 'chalk';
import figures from 'figures';
import { getErrorLine } from './lineUtils.js';
import { errorColor, sourceColor, warningColor } from './formatting.js';

interface FileResult {
  text: string;
  errorsCount: number;
  warningsCount: number;
}

const reporter = (files: VFile[], options?: object): string =>
  reporterFileResult(files, options).text;

const reporterFileResult = (files: VFile[], _options?: object): FileResult => {
  const fileResults = files
    .filter((x) => x.messages.length > 0)
    .map((x) => reportFile(x));
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
    file.messages.map((x) => reportMessage(file, x, contentLines))
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

  const positionLine = getErrorLine(message, contentLines);
  const prefixSymbol = message.fatal
    ? errorColor(figures.cross)
    : warningColor(figures.warning);
  const level = message.fatal ? errorColor('error') : warningColor('warning');

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
    errorsCount: message.fatal ? 1 : 0,
    warningsCount: message.fatal ? 0 : 1,
  };
};

const mergeResults = (results: FileResult[]): FileResult => {
  const summary: FileResult = {
    text: '',
    errorsCount: 0,
    warningsCount: 0,
  };

  results.forEach((x) => {
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
  const position = message.position;
  if (position?.start.line && position?.start.column) {
    if (result.length > 0) result += separator;
    result +=
      chalk.yellow(position.start.line) +
      separator +
      chalk.yellow(position.start.column);
  }

  return result;
};

const plural = (count: number, text: string): string =>
  count + ' ' + text + (count === 1 ? '' : 's');

export default reporter;
