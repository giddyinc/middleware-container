
import { Injector } from 'boxed-injector';
import connect from 'connect';

const handler: ProxyHandler<Injector> = {
  get(target, propKey) {
    return function(...args) {
      if (propKey !== 'get') {
        return target[propKey].apply(this, args);
      }
      const dep: string | string[] = args[0];
      // get the dependency graph
      return target.graph(dep)
        // sorted in order of resolution
        .reverse()
        // ensure the requested node is in the graph
        .concat(dep)
        // create a chained connect which combines all of the middlewares
        .reduce((chain, middleware) => chain.use(target.get(middleware)), connect());
    };
  }
};

export default function() {
  const injector = new Injector();
  return new Proxy(injector, handler);
}
