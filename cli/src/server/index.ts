import path from 'path';
import express from 'express';
import fs from 'fs/promises';
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
    const directory = await fs.readdir(path.join(outputDir, `queue`));
    const queue = directory.filter((filename) => filename.startsWith(`id:`));
    // console.log({ queue });
    const contents = await Promise.all(
      queue.map((filename) =>
        fs.readFile(path.join(outputDir, `queue`, filename), {
          encoding: 'base64',
        })
      )
    );
    const data = queue.map((filename, i) => {
      const info = Object.fromEntries(
        filename.split(`,`).map((entry) => entry.split(`:`))
      );
      return {
        ...info,
        base64: contents[i],
      };
    });
    res.json(data);
  });

  app.get(`/api/crashes`, async (req, res) => {
    const directory = await fs.readdir(path.join(outputDir, `crashes`));
    const crashes = directory.filter((filename) => filename.startsWith(`id:`));
    const contents = await Promise.all(
      crashes.map((filename) =>
        fs.readFile(path.join(outputDir, `crashes`, filename), {
          encoding: 'base64',
        })
      )
    );
    const data = crashes.map((filename, i) => {
      const info = Object.fromEntries(
        filename.split(`,`).map((entry) => entry.split(`:`))
      );
      return {
        ...info,
        base64: contents[i],
      };
    });
    res.json(data);
  });

  // console.log(options);
  // console.log(path.resolve(options.targetDir, options.outputDir, `default`));

  app.use(`/api/target`, express.static(targetDir));

  app.use(`/api/output`, express.static(outputDir));

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}/`);
  });
}

if (require.main === module) {
  const targetDir = process.argv[2];
  if (!targetDir) {
    throw new Error(`targetDir is not specified`);
  }
  const inputDir = path.resolve(targetDir, `in`);
  const outputDir = path.resolve(targetDir, `out/default`);
  serve({ targetDir, inputDir, outputDir });
}
