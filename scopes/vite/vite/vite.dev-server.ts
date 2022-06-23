import type { DevServer } from '@teambit/bundler';
import type { InlineConfig, UserConfig, ViteDevServer, ResolvedConfig } from 'vite';
import { createServer, resolveConfig } from 'vite';
import type { Server } from 'http';
import { inspect } from 'util';
import { ViteAspect } from './vite.aspect';

export class ViteBitDevServer implements DevServer {
  constructor(private config: UserConfig, private viteServerFactoryFunc: typeof createServer = createServer) {}

  private server: ViteDevServer;

  id = ViteAspect.id;

  displayName = 'Vite dev server';

  getInlineConfig(): InlineConfig {
    const config = Object.assign(
      {
        configFile: false,
        envFile: false,
      },
      this.config
    );
    return config as InlineConfig;
  }

  async getResolveConfig(): Promise<ResolvedConfig> {
    return resolveConfig(this.getInlineConfig(), 'serve');
  }

  private async getServer(): Promise<ViteDevServer> {
    if (this.server) return this.server;
    const inlineConfig = this.getInlineConfig();
    this.server = await this.viteServerFactoryFunc(inlineConfig);
    return this.server;
  }

  displayConfig(): string {
    return inspect(this.config, { depth: 10 });
  }

  async listen(port: number): Promise<Server> {
    // Adding signal listeners to make sure we immediately close the process on sigint / sigterm (otherwise webpack dev server closing will take time)
    this.addSignalListener();

    const server = await this.getServer();
    await server.listen(port);
    return server;
  }

  private addSignalListener() {
    process.on('SIGTERM', () => {
      process.exit();
    });

    process.on('SIGINT', () => {
      process.exit();
    });
  }
}
