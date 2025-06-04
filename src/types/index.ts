export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  isCurrentDir: boolean;
  addAuth: boolean;
  addHusky: boolean;
  packageManager: "bun" | "pnpm";
  installDeps: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export interface PackageJson {
  name: string;
  version: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  [key: string]: any;
}
