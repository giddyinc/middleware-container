
import { Injector } from 'boxed-injector';
import connect from 'connect';
import parallel from 'async.parallel';
import { RequestHandler } from 'express';

const handler: ProxyHandler<Injector> = {
  get(target, propKey) {
    if (propKey === '__target') {
        return target;
    }
    if(typeof target[propKey] !== 'function') {
      return target[propKey];
    }
    return function(...args) {
      if (propKey !== 'get') {
        return target[propKey].apply(this, args);
      }

      const dep: string | string[] = args[0];

      // get the dependency graph
      const graph = target.graph(dep);
      // console.log(graph);

      const [ parallelizable, sequential ] = graph
        .reduce((groups, middleware) => {
          const [ parallelizable, sequential ] = groups;
          // @ts-ignore
          const dependencies = target.instances?.[middleware]?.depends ?? [];
          if(dependencies.length > 0) {
            sequential.push(middleware);
          } else {
            parallelizable.push(middleware);
          }
          return groups;
        }, [[], []] as Readonly<[string[], string[]]>);

      const parallelMiddleware = parallelizable.map(mw => target.get(mw));
      const combinedParallelizable: RequestHandler = (req, res, next) => {
        const asyncFns = parallelMiddleware.map(mw => next => mw(req, res, next));
        return parallel(asyncFns, next);
      };

      const middleware = connect();

      if(parallelizable.length) {
        // console.log('paralellizing middlewares: ', parallelizable);
        middleware.use(combinedParallelizable);
      }

      // console.log('sequencing middlewares: ', sequential);

      return sequential
        // create a chained connect which combines all of the middlewares
        .reduce((chain, middleware) => {
          chain.use(target.get(middleware));
          return chain;
        }, middleware);
    };
  }
};

export default function() {
  const injector = new Injector();
  return new Proxy(injector, handler);
}
