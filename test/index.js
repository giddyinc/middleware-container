'use strict';

const expect = require('expect');
const MiddlewareContainer = require('../src');
const express = require('express');
const request = require('superagent-bluebird-promise').agent();
const sinon = require('sinon');

// mocha --watch
describe('middlewares', () => {
  let app;
  let sandbox;
  let server;
  let middlewares;
  let spy;

  const sendLocals = (req, res) => res.send(res.locals);
  before(done => {
    sandbox = sinon.sandbox.create();
    app = express();

    middlewares = new MiddlewareContainer();
    const assignNext = (obj, res, next) => {
      Object.assign(res.locals, obj);
      spy();
      next();
    };

    middlewares.register('z', (req, res, next) => assignNext({
      z: true
    }, res, next));

    middlewares.register('getApiVersion', (req, res, next) => assignNext({
      v: 1
    }, res, next));

    middlewares.register('getBarry', (req, res, next) => assignNext({
      barry: 'barry'
    }, res, next), {
      depends: ['getBaz', 'z']
    });

    middlewares.register('getBaz', (req, res, next) => assignNext({
      baz: 'baz'
    }, res, next));

    middlewares.register('getBuzz', (req, res, next) => assignNext({
      baz: 'baz'
    }, res, next), {
      depends: 'getBaz'
    });

    middlewares.register('getFoo', (req, res, next) => assignNext({
      foo: 'bar'
    }, res, next), {
      depends: ['getApiVersion', 'getBarry']
    });

    app.get('/v', middlewares.get('getApiVersion'), sendLocals);
    app.get('/foo', middlewares.get('getFoo'), sendLocals);

    // calling two things that depend on getBaz (getBaz, and  getBuzz)
    app.get('/bar', middlewares.get(['getBaz', 'getApiVersion', 'getBuzz']), sendLocals);

    app.get('/', sendLocals);
    server = app.listen(3000, done);
  });

  beforeEach(() => {
    spy = sandbox.spy();
  });

  afterEach(() => sandbox.restore());

  after(() => {
    server.close();
  });

  it('should export something', () => {
    expect(middlewares).toExist();
  });

  it('base case', done => {
    request.get('http://localhost:3000').send()
      .then(res => {
        expect(res.body).toEqual({});
        done();
      }).catch(done);
  });

  it('singular case', done => {
    request.get('http://localhost:3000/v').send()
      .then(res => {
        expect(res.body).toEqual({
          v: 1
        });
        done();
      }).catch(done);
  });

  it('dependent case', () => {
    return request.get('http://localhost:3000/foo').send()
      .then(res => expect(res.body).toEqual({
        v: 1,
        foo: 'bar',
        baz: 'baz',
        barry: 'barry',
        z: true
      }));
  });

  it('array case', () => {
    return request.get('http://localhost:3000/bar').send()
      .then(res => {
        expect(res.body).toEqual({
          v: 1,
          baz: 'baz'
        });
        expect(spy.called).toBe(true);
        expect(spy.callCount).toEqual(4, 'exactly 4 middlewares should be called.');
      });
  });

  it('not found case', () => {
    return request.get('http://localhost:3000/cats').send()
      .then(null, res => expect(res.status).toEqual(404));
  });
});
