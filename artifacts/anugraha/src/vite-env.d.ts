interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_API_URL?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_ADMIN_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
