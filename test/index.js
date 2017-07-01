'use strict';

const expect = require('expect');
const MiddlewareContainer = require('../src');
const express = require('express');
const request = require('superagent-bluebird-promise').agent();

describe('middlewares', () => {
  let app;
  let server;
  let middlewares;
  const assignNext = (obj, res, next) => {
    Object.assign(res.locals, obj);
    next();
  };
  const sendLocals = (req, res) => res.send(res.locals);
  before(() => {
    app = express();
    middlewares = new MiddlewareContainer();
    middlewares.register('getApiVersion', (req, res, next) => assignNext({
      v: 1
    }, res, next));
    middlewares.register('getBarry', (req, res, next) => assignNext({
      barry: 'barry'
    }, res, next), {
      depends: 'getBaz'
    });
    middlewares.register('getBaz', (req, res, next) => assignNext({
      baz: 'baz'
    }, res, next));
    middlewares.register('getFoo', (req, res, next) => assignNext({
      foo: 'bar'
    }, res, next), {
      depends: ['getApiVersion', 'getBarry']
    });

    app.get('/v', middlewares.get('getApiVersion'), sendLocals);
    app.get('/foo', middlewares.get('getFoo'), sendLocals);
    app.get('/', sendLocals);
    server = app.listen(3000);
  });
  after(() => {
    server.close();
  });
  it('should export something', () => {
    expect(middlewares).toExist();
  });

  it('base case', () => {
    return request.get('http://localhost:3000').send()
      .then(res => expect(res.body).toEqual({}));
  });
  it('singular case', () => {
    return request.get('http://localhost:3000/v').send()
      .then(res => expect(res.body).toEqual({
        v: 1
      }));
  });
  it('dependent case', () => {
    return request.get('http://localhost:3000/foo').send()
      .then(res => expect(res.body).toEqual({
        v: 1,
        foo: 'bar',
        baz: 'baz',
        barry: 'barry'
      }));
  });

  it('not found case', () => {
    return request.get('http://localhost:3000/cats').send()
      .then(null, res => expect(res.status).toEqual(404));
  });
});
