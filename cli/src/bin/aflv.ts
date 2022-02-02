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

interface Profile {
  files?: File[];
  basic_blocks: BasicBlock[];
}

interface File {
  id: number;
  directory: string;
  filename: string;
  source?: string;
}

interface BasicBlock {
  id: number;
  instructions: Instruction[];
}

interface Instruction {
  directory: string;
  filename: string;
  line: number;
  file_id?: number;
}

async function cc(argv: string[], options: Partial<{ cxx: boolean }> = {}) {
  const targetDir = process.cwd();
  const profilePath = path.resolve(targetDir, `.aflv/profile.json`);

  await fs.mkdir(path.resolve(targetDir, `.aflv`)).catch((err) => {
    if (err?.code === 'EEXIST') {
      return;
    } else {
      throw err;
    }
  });

  await new Promise((resolve, reject) => {
    const compiler = spawn(
      path.join(AFLPP_DIR, options.cxx ? 'afl-clang-lto++' : 'afl-clang-lto'),
      argv,
      {
        env: {
          ...process.env,
          AFLV_PROFILE: profilePath,
        },
      }
    );

    compiler.stdout.pipe(process.stdout, { end: false });
    compiler.stderr.pipe(process.stderr, { end: false });

    compiler.on('close', resolve);
  });

  await rewriteProfile(profilePath);
}

async function rewriteProfile(profilePath: string) {
  let profile: Profile;

  try {
    profile = JSON.parse(await fs.readFile(profilePath, { encoding: 'utf8' }));
  } catch (e) {
    console.error(e);
    return;
  }

  profile = filterFiles(profile);

  const fileMap = new Map<string, File>();

  for (const block of profile['basic_blocks']) {
    for (const inst of block['instructions']) {
      const absolutePath = path.resolve(inst['directory'], inst['filename']);
      let fileId: number;
      if (!fileMap.has(absolutePath)) {
        fileId = fileMap.size;
        fileMap.set(absolutePath, {
          id: fileId,
          directory: inst['directory'],
          filename: inst['filename'],
        });
      } else {
        fileId = fileMap.get(absolutePath)!.id;
      }
      inst['file_id'] = fileId;
    }
  }

  await Promise.all(
    Array.from(fileMap.entries(), async ([absolutePath, file]) => {
      await fs
        .readFile(absolutePath, { encoding: 'utf8' })
        .then((source) => {
          file['source'] = source;
        })
        .catch((error) => {
          console.error(error);
        });
    })
  );

  profile = {
    files: Array.from(fileMap.values()),
    ...profile,
  };

  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2) + '\n');
}

function filterFiles(profile: Profile): Profile {
  return {
    ...profile,
    basic_blocks: profile['basic_blocks'].map((block) => ({
      ...block,
      instructions: block['instructions'].filter(
        (inst) =>
          // C++
          !inst['filename'].startsWith('/usr/lib/gcc/') &&
          // Rust
          !inst['filename'].startsWith('/rustc/') &&
          // Crystal
          !inst['directory'].startsWith('/usr/share/crystal/src') &&
          !(inst['directory'] === '.' && inst['filename'] === '??')
      ),
    })),
  };
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
  outputDir = path.resolve(targetDir, outputDir);

  const userQueueDir = path.join(outputDir, `user`, `queue`);

  const fuzzer = spawn(
    path.join(AFLPP_DIR, 'afl-fuzz'),
    ['-M', 'default', '-F', userQueueDir, ...argv],
    {
      env: {
        ...process.env,
        AFL_I_DONT_CARE_ABOUT_MISSING_CRASHES: '1',
      },
    }
  );

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
    case 'cxx': {
      await cc(argv.slice(1), { cxx: true });
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
