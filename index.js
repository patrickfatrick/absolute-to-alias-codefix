#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    location: 'l',
    help: 'h',
    alias: 'a',
    directory: 'd'
  }
});

const { help, location = 'src', alias = '~', directory = process.cwd() } = argv;

if (help) {
  console.log(
    `
    absolute-to-alias-codefix [--location -l][--alias -a][--directory -d]
    
    This codefix exists just to aid in converting your codebase from webpack absolute imports to aliased imports.
    
    Example: if you have "./src" mapped as an absolute location in webpack so you can
    \`import Component from "components/Component.js"\`, this can convert _all_ absolute imports
    from that location to something like \`import Component from "~/components/Component.js"\`.
    
    This script catches ES2015 import statements (both default and named) as well as require statements
    and jest.mock statements.

    Options:
    --help -h view the list of options
    --location -l source location currently being accessed as an absolute, defaults to "src"
    --alias -a alias to use in place of the absolute, defaults to "~"
    --directory -d absolute path to the root of the project, defaults to the current directory
    `
  );
  process.exit();
}

const topLevelFiles = fs
  .readdirSync(path.resolve(directory, location))
  .filter(filename => !/node_modules/.test(filename) && filename.indexOf('.') !== 0)
  .map(filename => filename.replace(/\.[a-z0-9]{1,5}$/i, '').replace(/\./g, '\\.'));

const importRegex = new RegExp(
  `^(import (?:.*)| *\\}) from (['"])(${topLevelFiles.join('|')})`,
  'gm'
);
const requireRegex = new RegExp(`require\\((['"])(${topLevelFiles.join('|')})`, 'g');
const jestRegex = new RegExp(`jest\\.mock\\((['"])(${topLevelFiles.join('|')})`, 'g');

console.log('Converting all files in', chalk.blue(directory));
console.log('Testing against', chalk.green('import'), chalk.yellow(importRegex));
console.log('Testing against', chalk.green('require'), chalk.yellow(requireRegex));
console.log('Testing against', chalk.green('jest'), chalk.yellow(jestRegex));

const convertAll = dir => {
  const contents = fs.readdirSync(dir);

  contents
    .filter(filename => !/node_modules/.test(filename) && filename.indexOf('.') !== 0)
    .forEach(filename => {
      const filepath = path.resolve(dir, filename);

      fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return convertAll(path.resolve(dir, filename));
        if (!/\.jsx?$/.test(filepath)) return;

        const newData = data
          .replace(importRegex, (_, p1, p2, p3) => `${p1} from ${p2}${alias}/${p3}`)
          .replace(requireRegex, (_, p1, p2) => `require(${p1}${alias}/${p2}`)
          .replace(jestRegex, (_, p1, p2) => `jest.mock(${p1}${alias}/${p2}`);

        fs.writeFile(filepath, newData, 'utf8', err => {
          if (err) return console.error(chalk.red(err));
          console.log(chalk.green('FIXED'), filepath);
        });
      });
    });
};

convertAll(directory);
