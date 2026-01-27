
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
