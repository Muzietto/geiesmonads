import fs from 'fs';
import readline from 'readline';
import stream from 'stream';

const instream = fs.createReadStream('./icon_name_occurrences.txt');

const rl = readline.createInterface({ input: instream });

const THE_REGEX = /^.*icon=\'(.+?)'.*$/gm;

rl.on('line', line => {
  const match = THE_REGEX.exec(line);
  if (match !== null) console.log(match[1]);
});

// $ npm run start | sort | uniq
