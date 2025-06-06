export interface ProjectOptions {
  yes?: boolean;
}

export interface ProjectResult {
  projectName: string;
  gitInitialized: boolean;
  dependenciesInstalled: boolean;
  template: string;
}
