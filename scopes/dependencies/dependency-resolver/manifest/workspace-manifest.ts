import { SemVer } from 'semver';

import { ComponentsManifestsMap } from '../types';
import { Manifest, ManifestToJsonOptions, ManifestDependenciesObject } from './manifest';

export type WorkspaceManifestToJsonOptions = ManifestToJsonOptions

export class WorkspaceManifest extends Manifest {
  constructor(
    // TODO: please prefer readonly on public
    public name: string,
    public version: SemVer,
    public dependencies: ManifestDependenciesObject,
    private rootDir: string,
    public componentsManifestsMap: ComponentsManifestsMap
  ) {
    super(name, version, dependencies);
  }

  get dir() {
    return this.rootDir;
  }

  getComponentMap() {}

  toJson(options: WorkspaceManifestToJsonOptions = {}): Record<string, any> {
    const manifest = super.toJson(options);
    return manifest;
  }

  toJsonWithDir(options: WorkspaceManifestToJsonOptions = {}): { rootDir: string; manifest: Record<string, any> } {
    return {
      manifest: this.toJson(options),
      rootDir: this.rootDir,
    };
  }
}
