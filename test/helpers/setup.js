/* setup.js */

import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};

global.localStorage = global.sessionStorage = ((store) => (['setItem', 'getItem', 'removeItem', 'clear']
  .reduce((acc, cur) => ({
    ...acc,
    [cur]: cur === 'removeItem' ?
      store.delete.bind(store) :
      store[cur.replace(/Item/, '')].bind(store),
    get length() { return store.size }
  }), {})))(new Map());

copyProps(window, global);
