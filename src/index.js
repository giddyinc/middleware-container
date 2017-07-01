'use strict';
const connect = require('connect');
require('proxy-polyfill');

const handler = {
  get(target, propKey) {
    return function (...args) {
      if (propKey !== 'get') {
        return target[propKey].apply(this, args);
      }
      const dep = args[0];
      const graph = target.graph(args[0]);
      const chain = graph
        .reverse()
        .map(key => target.get(key));
      chain.push(target.get(dep));
      return chain.reduce((chain, middleware) => chain.use(middleware), connect());
    };
  }
};

module.exports = injector => {
  return new Proxy(injector, handler);
};
