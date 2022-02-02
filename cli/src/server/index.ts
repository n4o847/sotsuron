import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import express from 'express';
import bodyParser from 'body-parser';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
// @ts-ignore
import webpackClientConfig from '../../webpack.client.dev';

interface ServeOptions {
  targetDir: string;
  inputDir: string;
  outputDir: string;
}

export function serve({ targetDir, outputDir }: ServeOptions) {
  const app = express();
  const port = process.env.PORT || 3000;

  const cachedQueue = new CachedQueue(path.join(outputDir, `default`, `queue`));
  const cachedCrashes = new CachedQueue(
    path.join(outputDir, `default`, `crashes`)
  );

  app.use(bodyParser.json());

  if (process.env.NODE_ENV === 'development') {
    const compiler = webpack(webpackClientConfig);
    app.use(webpackDevMiddleware(compiler));
    app.use(webpackHotMiddleware(compiler));
  }

  if (process.env.NODE_ENV === 'production') {
    const DIST_DIR = path.join(__dirname, '../../dist/client');
    app.use(express.static(DIST_DIR));
  }

  app.get(`/api/hello`, (req, res) => {
    res.json({ message: 'hello' });
  });

  app.get(`/api/queue`, async (req, res) => {
    const queue = await cachedQueue.get();
    res.json(queue);
  });

  app.get(`/api/crashes`, async (req, res) => {
    const crashes = await cachedCrashes.get();
    res.json(crashes);
  });

  app.post('/api/queue', async (req, res) => {
    await addToUserQueue(
      path.join(outputDir, `user`, `queue`),
      req.body['base64']
    );
    const queue = await cachedQueue.get();
    res.json(queue);
  });

  // console.log(options);
  // console.log(path.resolve(options.targetDir, options.outputDir, `default`));

  app.use(`/api/target`, express.static(targetDir));

  app.use(`/api/output`, express.static(path.join(outputDir, `default`)));

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}/`);
  });
}

interface QueueItem {
  filename: string;
  base64: string;
}

class CachedQueue {
  private dir: string;
  private cache: Map<string, QueueItem>;

  constructor(dir: string) {
    this.dir = dir;
    this.cache = new Map();
  }

  async get(): Promise<QueueItem[]> {
    const directory = await fs.readdir(this.dir);
    const queue = directory.filter((filename) => !filename.startsWith(`.`));
    const data = await Promise.all(
      queue.map(
        (filename) =>
          this.cache.get(filename) ??
          fs
            .readFile(path.join(this.dir, filename), { encoding: 'base64' })
            .then((content) => {
              const item: QueueItem = { filename, base64: content };
              this.cache.set(filename, item);
              return item;
            })
      )
    );
    return data;
  }
}

async function addToUserQueue(userQueueDir: string, base64: string) {
  const filename = crypto
    .createHash('md5')
    .update(Buffer.from(base64, 'base64'))
    .digest('hex');
  await fs.mkdir(userQueueDir, { recursive: true });
  await fs.writeFile(path.join(userQueueDir, filename), base64, {
    encoding: 'base64',
  });
}

if (require.main === module) {
  const targetDir = process.argv[2];
  if (!targetDir) {
    throw new Error(`targetDir is not specified`);
  }
  const inputDir = path.resolve(targetDir, `in`);
  const outputDir = path.resolve(targetDir, `out`);
  serve({ targetDir, inputDir, outputDir });
}
