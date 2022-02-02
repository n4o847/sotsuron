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
    const queue = await getQueue(path.join(outputDir, `default`, `queue`));
    res.json(queue);
  });

  app.get(`/api/crashes`, async (req, res) => {
    const crashes = await getQueue(path.join(outputDir, `default`, `crashes`));
    res.json(crashes);
  });

  app.post('/api/queue', async (req, res) => {
    await addToUserQueue(
      path.join(outputDir, `user`, `queue`),
      req.body['base64']
    );
    const queue = await getQueue(path.join(outputDir, `default`, `queue`));
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

async function getQueue(
  queueDir: string
): Promise<{ filename: string; base64: string }[]> {
  const directory = await fs.readdir(queueDir);
  const queue = directory.filter((filename) => !filename.startsWith(`.`));
  const contents = await Promise.all(
    queue.map((filename) =>
      fs.readFile(path.join(queueDir, filename), {
        encoding: 'base64',
      })
    )
  );
  const data = queue.map((filename, i) => {
    return {
      filename,
      base64: contents[i],
    };
  });
  return data;
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
