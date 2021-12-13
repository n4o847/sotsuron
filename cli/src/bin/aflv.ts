import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { version } from '../../package.json';
import { serve } from '../server';

const AFLPP_DIR = path.join(__dirname, `../../../AFLplusplus`);
const TARGET_DIR = process.cwd();
const AFL_INPUT_DIR = `.afl/input`;
const AFL_OUTPUT_DIR = `.afl/output`;

function getArg(argv: string[], option: string): string | undefined {
  const index = argv.findIndex((arg) => arg === option);
  if (index === -1) return undefined;
  return argv[index + 1];
}

async function cc(argv: string[]) {
  const targetDir = process.cwd();

  await fs.mkdir(path.resolve(targetDir, `.aflv`)).catch((err) => {
    if (err?.code === 'EEXIST') {
      return;
    } else {
      throw err;
    }
  });

  const compiler = spawn(path.join(AFLPP_DIR, 'afl-clang-lto'), argv, {
    env: {
      AFLV_PROFILE: path.resolve(targetDir, `.aflv/profile.json`),
    },
  });

  compiler.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  compiler.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  compiler.on('close', () => {
    console.log('closed');
  });
}

function fuzz(argv: string[]) {
  const targetDir = process.cwd();
  let inputDir = getArg(argv, `-i`);
  let outputDir = getArg(argv, `-o`);

  if (inputDir === undefined) {
    throw new Error(`input directory is not specified`);
  }

  if (outputDir === undefined) {
    throw new Error(`output directory is not specified`);
  }

  inputDir = path.resolve(targetDir, inputDir);
  outputDir = path.resolve(targetDir, outputDir, `default`);

  const fuzzer = spawn(path.join(AFLPP_DIR, 'afl-fuzz'), argv);

  fuzzer.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  fuzzer.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  fuzzer.on('close', () => {
    console.log('closed');
  });

  serve({ targetDir, inputDir, outputDir });
}

async function main(argv: string[]) {
  console.log(`aflv ${version}`);

  switch (argv[0]) {
    case 'cc': {
      await cc(argv.slice(1));
      break;
    }
    case 'fuzz': {
      fuzz(argv.slice(1));
      break;
    }
    default: {
      console.error(`Unknown subcommand: ${argv[0]}`);
      break;
    }
  }
}

main(process.argv.slice(2));

// function main(args: string[]) {
//   const argv = yargs(args)
//     .version(version)
//     .command(`fuzz`, `Execute afl-fuzz`)
//     .help()
//     .parseSync();

//   switch (argv._[0]) {
//     case 'fuzz': {
//       fuzz(args.slice(1));
//       break;
//     }
//     default: {
//       console.error(`Unknown subcommand: ${args[0]}`);
//       break;
//     }
//   }
// }

// main(hideBin(process.argv));
