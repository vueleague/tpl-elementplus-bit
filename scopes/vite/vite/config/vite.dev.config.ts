import { PubsubMain } from '@teambit/pubsub';
import path from 'path';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';

export function configFactory(
  devServerID: string,
  workspaceDir: string,
  entryFiles: string[],
  publicRoot: string,
  publicPath: string,
  pubsub: PubsubMain,
  title?: string,
  favicon?: string
): UserConfig {
  const publicDir = `${publicRoot}/${publicPath}`;

  const config: UserConfig = {
    mode: 'development',
    // devtool
    publicDir,
    logLevel: 'info',
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.mdx', '.md'],
    },
    server: {
      watch: {
        // TODO: add all components from the workspace here
        ignored: ['!**/node_modules/your-package-name/**'],
      },
    },
  };

  return config;
}
