import fs from 'fs';
import readline from 'readline';
import stream from 'stream';
import { prettyCreationsP } from './src/git_log_parser';

console.log('starting...');
const instream = fs.createReadStream('./js_input/mini_pippo4.txt');

const rl = readline.createInterface({ input: instream });
const ws = fs.createWriteStream('./js_output/pippo4.creations.csv');

let buffer = '';

rl.on('line', line => {
  //console.log('line is ', line);
  buffer += (line + '§§');
});


rl.on('close', line => {
  console.log('closing...');
  //console.log('input is ', buffer);
  const result = prettyCreationsP.run(buffer);
  ws.write(pretty(result.value[0]));
  console.log('---RES-->', result.value[0]);
});

// $ npm run start

function pretty(input) {
  return input.toString();
}
