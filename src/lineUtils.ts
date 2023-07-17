import { VFileMessage } from 'vfile-message';
import { errorColor, lineNumberColor, underlineText } from './formatting.js';

export function getStartLine(message: VFileMessage): number {
  return message.position?.start.line ?? 1;
}

export function getStartColumn(message: VFileMessage): number {
  return message.position?.start.column ?? 1;
}

export function getEndLine(message: VFileMessage): number {
  return message.position?.end.line ?? getStartLine(message);
}

export function getEndColumn(message: VFileMessage): number {
  return message.position?.end.column ?? getStartColumn(message);
}

export function getErrorLine(message: VFileMessage, content: string[]): string {
  const lineStart = getStartLine(message);
  const lineEnd = getEndLine(message);
  const colStart = getStartColumn(message);
  const colEnd = getEndColumn(message);

  let result = '';

  for (let i = lineStart; i <= lineEnd; i++) {
    const line = content[i - 1];
    const prefixStart = '  ' + lineNumberColor(i) + ' ';
    const highlightStart = i === lineStart ? colStart : 1;
    const highlightEnd = i === lineEnd ? colEnd : line.length;
    const beforeHighlight = line.slice(0, highlightStart - 1);
    const highlight = line.slice(highlightStart - 1, highlightEnd);
    const afterHighlight = line.slice(highlightEnd);
    result +=
      prefixStart +
      beforeHighlight +
      underlineText(errorColor(highlight)) +
      afterHighlight +
      '\n';
  }

  return result ? '\n\n' + result : '';
}
