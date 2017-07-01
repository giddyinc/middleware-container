'use strict';
const connect = require('connect');

const handler = {
  get(target, propKey) {
    const origMethod = target[propKey];
    return function (...args) {
      const origResult = origMethod.apply(this, args);
      if (propKey === 'get') {
        const dep = args[0];
        const graph = target.graph(args[0]);
        const chain = graph
          .reverse()
          .map(key => target.get(key));
        chain.push(target.get(dep));
        return chain.reduce((chain, middleware) => chain.use(middleware), connect());
      }

      return origResult;
    };
  }
};

module.exports = injector => {
  return new Proxy(injector, handler);
};
