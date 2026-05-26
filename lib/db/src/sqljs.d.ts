declare module "sql.js" {
  const initSqlJs: (config?: { locateFile?: (fileName: string) => string }) => Promise<any>;

  export default initSqlJs;
}