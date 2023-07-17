import chalk from 'chalk';

export const warningColor = chalk.yellow;
export const errorColor = chalk.red;
export const sourceColor = chalk.magenta;
export const underlineText = chalk.underline;
export const lineNumberColor = (text: any): string =>
  chalk.bgWhite(chalk.black(text));
