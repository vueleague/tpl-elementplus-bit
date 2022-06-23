import { MainRuntime } from '@teambit/cli';
import PubsubAspect, { PubsubMain } from '@teambit/pubsub';
import {
  BundlerAspect,
  BundlerContext,
  BundlerMain,
  DevServer,
  DevServerContext,
  BundlerMode,
  Target,
} from '@teambit/bundler';
import { Logger, LoggerAspect, LoggerMain } from '@teambit/logger';
import { Workspace, WorkspaceAspect } from '@teambit/workspace';
import { createServer } from 'vite';

import { ViteAspect } from './vite.aspect';

export class ViteMain {
  constructor(
    /**
     * Pubsub extension.
     */
    public pubsub: PubsubMain,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * bundler extension.
     */
    private bundler: BundlerMain,

    /**
     * Logger extension
     */
    public logger: Logger
  ) {}

  /**
   * create an instance of bit-compliant vite dev server for a set of components
   */
  createDevServer(
    context: DevServerContext,
    transformers: WebpackConfigTransformer[] = [],
    viteServerFactoryFunc: typeof createServer = createServer
  ): DevServer {
    const config = this.createDevServerConfig(
      context.entry,
      this.workspace.path,
      context.id,
      context.rootPath,
      context.publicPath,
      context.title
    ) as any;
    const configMutator = new WebpackConfigMutator(config);
    const transformerContext: WebpackConfigDevServerTransformContext = Object.assign(context, { mode: 'dev' as const });
    const internalTransformers = this.generateTransformers(undefined, transformerContext);

    const afterMutation = runTransformersWithContext(
      configMutator.clone(),
      [...internalTransformers, ...transformers],
      transformerContext
    );
    // @ts-ignore - fix this
    return new ViteBitDevServer(afterMutation.raw, viteServerFactoryFunc);
  }

  private generateTransformers(
    _bundlerContext?: WebpackConfigTransformContext,
    devServerContext?: WebpackConfigDevServerTransformContext,
    target?: Target
  ): Array<WebpackConfigTransformer> {
    const transformers: WebpackConfigTransformer[] = [];
    // TODO: handle dev server
    const hostDeps = target?.hostDependencies || devServerContext?.hostDependencies;
    if (hostDeps) {
      if (target?.aliasHostDependencies || devServerContext?.aliasHostDependencies) {
        const peerAliasesTransformer = generateAddAliasesFromPeersTransformer(hostDeps, this.logger);
        transformers.push(peerAliasesTransformer);
      }
      if (target?.exposeHostDependencies || devServerContext?.exposeHostDependencies) {
        const exposePeersTransformer = generateExposePeersTransformer(hostDeps, this.logger);
        transformers.push(exposePeersTransformer);
      }
      if (target?.externalizeHostDependencies || devServerContext?.externalizeHostDependencies) {
        const externalsTransformer = generateExternalsTransformer(hostDeps);
        transformers.push(externalsTransformer);
      }
    }
    return transformers;
  }

  private createDevServerConfig(
    entry: string[],
    rootPath: string,
    devServerID: string,
    publicRoot: string,
    publicPath: string,
    title?: string
  ) {
    return devServerConfigFactory(devServerID, rootPath, entry, publicRoot, publicPath, this.pubsub, title);
  }

  static slots = [];
  static dependencies = [PubsubAspect, WorkspaceAspect, BundlerAspect, LoggerAspect];

  static runtime = MainRuntime;

  static async provider([pubsub, workspace, bundler, logger]: [PubsubMain, Workspace, BundlerMain, LoggerMain]) {
    const logPublisher = logger.createLogger(ViteAspect.id);
    return new ViteMain(pubsub, workspace, bundler, logPublisher);
  }
}

ViteAspect.addRuntime(ViteMain);

export function runTransformersWithContext(
  config: WebpackConfigMutator,
  transformers: Array<WebpackConfigTransformer | WebpackConfigDevServerTransformer> = [],
  // context: WebpackConfigTransformContext | WebpackConfigDevServerTransformContext
  context: any
): WebpackConfigMutator {
  if (!Array.isArray(transformers)) return config;
  const newConfig = transformers.reduce((acc, transformer) => {
    // @ts-ignore
    return transformer(acc, context);
  }, config);
  return newConfig;
}
