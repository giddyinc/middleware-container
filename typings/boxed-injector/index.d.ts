
declare module 'boxed-injector' {
  class Injector {
    graph(dep: string | string[]): string[];
    get(name: string): any;
  }
}
