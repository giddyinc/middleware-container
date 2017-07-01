# middleware-container [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

# middleware-container

```sh
$ npm install --save middleware-container
```

## Overview

Middleware container extends the [boxed-injector](https://github.com/giddyinc/boxed-injector) functionality for use with express middleware. The use case for this is when middleware chains get complex.

The problem that this package solves is:
- Simplifying declarativeness of common middleware packages (multiple middlewares used often around your app - why declare multiple times?)
- Middleware dependency chains (avoid having to declare multiple middleware functions on multiple routes, and having to maintain them in the correct order // with all sub-middlewares)
- Middleware redundancy (sometimes middlewares have dependencies that may get executed multiple times if not composed)

## Usage

middleware-container is built on top of [boxed-injector](https://github.com/giddyinc/boxed-injector)

```js

const MiddlewareContainer = require('middleware-container');
const middlewares = new MiddlewareContainer();

middlewares.register('getOneThing', (req, res, next) => next());

middlewares.register('getAnotherThingThatDependsOnOneThing', (req, res, next) => next(), {
  depends: 'getOneThing'
});

middlewares.register('getSomethingThatDependsOnThePrevious', (req, res, next) => next(), {
  depends: 'getAnotherThingThatDependsOnOneThing'
});

// /foo will have the entire middleware chain executed
app.get('/foo', middlewares.get('getSomethingThatDependsOnThePrevious'), (req, res) => res.send(res.locals));
    

```

[npm-image]: https://badge.fury.io/js/middleware-container.svg
[npm-url]: https://npmjs.org/package/middleware-container
[travis-image]: https://travis-ci.org/giddyinc/middleware-container.svg?branch=master
[travis-url]: https://travis-ci.org/giddyinc/middleware-container
