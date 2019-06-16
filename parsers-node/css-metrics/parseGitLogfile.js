import fs from 'fs';
import readline from 'readline';
import stream from 'stream';
import { gitLogFileP } from './src/git_log_parser';

console.log('starting...');
const instream = fs.createReadStream('./pippo2.txt');

const rl = readline.createInterface({ input: instream });

let buffer = '';

rl.on('line', line => {
  console.log('line is ', line);
  buffer += (line + '§§');
});


rl.on('close', line => {
  console.log('closing...');
  console.log('input is ', buffer);
  const result = gitLogFileP.run(buffer);
  console.log('----->', result.toString());
});

// $ npm run start
