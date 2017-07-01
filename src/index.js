'use strict';

const Injector = require('boxed-injector').Injector;
const connect = require('connect');
require('proxy-polyfill');

const handler = {
  get(target, propKey) {
    return function (...args) {
      if (propKey !== 'get') {
        return target[propKey].apply(this, args);
      }
      const dep = args[0];
      return target.graph(dep)
        .reverse()
        .map(key => target.get(key))
        .concat(target.get(dep))
        .reduce((chain, middleware) => chain.use(middleware), connect());
    };
  }
};

module.exports = function () {
  const injector = new Injector();
  return new Proxy(injector, handler);
};
