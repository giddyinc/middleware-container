
import { Injector } from 'boxed-injector';
import connect from 'connect';
import parallel from 'async.parallel';

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

      const [ parallelizable, sequence ] = graph
        .reduce((maps, middleware) => {
          const [ parallelizable, sequence ] = maps;
          // @ts-ignore
          const dependencies = target.instances?.[middleware]?.depends ?? [];
          if(dependencies.length > 0) {
            sequence.push(middleware);
          } else {
            parallelizable.push(middleware);
          }
          return maps;
        }, [[], []] as Readonly<[string[], string[]]>);

      const combinedParallelizable = (req, res, next) => {
        const wares = parallelizable
          .map(mw => target.get(mw))
          .map(mw => next => mw(req, res, next));
        return parallel(wares, next);
      };

      const middleware = connect();

      if(parallelizable.length) {
        // console.log('paralellizing middlewares: ', parallelizable);
        middleware.use(combinedParallelizable);
      }

      // console.log('sequencing middlewares: ', sequence);

      return sequence
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
