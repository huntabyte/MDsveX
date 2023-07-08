(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte/compiler')) :
  typeof define === 'function' && define.amd ? define(['exports', 'svelte/compiler'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mdsvex = {}, global.compiler$1));
}(this, (function (exports, compiler$1) { 'use strict';

  const defineConfig = (config) => config;

  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  // Split a filename into [root, dir, basename, ext], unix version
  // 'root' is just a slash, or nothing.
  var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var splitPath = function(filename) {
    return splitPathRe.exec(filename).slice(1);
  };

  // path.resolve([from ...], to)
  // posix version
  function resolve() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : '/';

      // Skip empty and invalid entries
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  }
  // path.normalize(path)
  // posix version
  function normalize$2(path) {
    var isPathAbsolute = isAbsolute(path),
        trailingSlash = substr(path, -1) === '/';

    // Normalize the path
    path = normalizeArray(filter(path.split('/'), function(p) {
      return !!p;
    }), !isPathAbsolute).join('/');

    if (!path && !isPathAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isPathAbsolute ? '/' : '') + path;
  }
  // posix version
  function isAbsolute(path) {
    return path.charAt(0) === '/';
  }

  // posix version
  function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize$2(filter(paths, function(p, index) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  }


  // path.relative(from, to)
  // posix version
  function relative(from, to) {
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
  }

  var sep = '/';
  var delimiter = ':';

  function dirname(path) {
    var result = splitPath(path),
        root = result[0],
        dir = result[1];

    if (!root && !dir) {
      // No dirname whatsoever
      return '.';
    }

    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  }

  function basename(path, ext) {
    var f = splitPath(path)[2];
    // TODO: make this comparison case-insensitive on windows?
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  }


  function extname(path) {
    return splitPath(path)[3];
  }
  var path = {
    extname: extname,
    basename: basename,
    dirname: dirname,
    sep: sep,
    delimiter: delimiter,
    relative: relative,
    join: join,
    isAbsolute: isAbsolute,
    normalize: normalize$2,
    resolve: resolve
  };
  function filter (xs, f) {
      if (xs.filter) return xs.filter(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
          if (f(xs[i], i, xs)) res.push(xs[i]);
      }
      return res;
  }

  // String.prototype.substr - negative index don't work in IE8
  var substr = 'ab'.substr(-1) === 'b' ?
      function (str, start, len) { return str.substr(start, len) } :
      function (str, start, len) {
          if (start < 0) start = str.length + start;
          return str.substr(start, len);
      }
  ;

  var fs = {};

  var bail_1 = bail;

  function bail(err) {
    if (err) {
      throw err
    }
  }

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  var isBuffer = function isBuffer (obj) {
    return obj != null && obj.constructor != null &&
      typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  };

  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var defineProperty = Object.defineProperty;
  var gOPD = Object.getOwnPropertyDescriptor;

  var isArray = function isArray(arr) {
  	if (typeof Array.isArray === 'function') {
  		return Array.isArray(arr);
  	}

  	return toStr.call(arr) === '[object Array]';
  };

  var isPlainObject = function isPlainObject(obj) {
  	if (!obj || toStr.call(obj) !== '[object Object]') {
  		return false;
  	}

  	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  	// Not own constructor property must be Object
  	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
  		return false;
  	}

  	// Own properties are enumerated firstly, so to speed up,
  	// if last one is own, then all properties are own.
  	var key;
  	for (key in obj) { /**/ }

  	return typeof key === 'undefined' || hasOwn.call(obj, key);
  };

  // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
  var setProperty = function setProperty(target, options) {
  	if (defineProperty && options.name === '__proto__') {
  		defineProperty(target, options.name, {
  			enumerable: true,
  			configurable: true,
  			value: options.newValue,
  			writable: true
  		});
  	} else {
  		target[options.name] = options.newValue;
  	}
  };

  // Return undefined instead of __proto__ if '__proto__' is not an own property
  var getProperty = function getProperty(obj, name) {
  	if (name === '__proto__') {
  		if (!hasOwn.call(obj, name)) {
  			return void 0;
  		} else if (gOPD) {
  			// In early versions of node, obj['__proto__'] is buggy when obj has
  			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
  			return gOPD(obj, name).value;
  		}
  	}

  	return obj[name];
  };

  var extend$2 = function extend() {
  	var options, name, src, copy, copyIsArray, clone;
  	var target = arguments[0];
  	var i = 1;
  	var length = arguments.length;
  	var deep = false;

  	// Handle a deep copy situation
  	if (typeof target === 'boolean') {
  		deep = target;
  		target = arguments[1] || {};
  		// skip the boolean and the target
  		i = 2;
  	}
  	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
  		target = {};
  	}

  	for (; i < length; ++i) {
  		options = arguments[i];
  		// Only deal with non-null/undefined values
  		if (options != null) {
  			// Extend the base object
  			for (name in options) {
  				src = getProperty(target, name);
  				copy = getProperty(options, name);

  				// Prevent never-ending loop
  				if (target !== copy) {
  					// Recurse if we're merging plain objects or arrays
  					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
  						if (copyIsArray) {
  							copyIsArray = false;
  							clone = src && isArray(src) ? src : [];
  						} else {
  							clone = src && isPlainObject(src) ? src : {};
  						}

  						// Never move original objects, clone them
  						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

  					// Don't bring in undefined values
  					} else if (typeof copy !== 'undefined') {
  						setProperty(target, { name: name, newValue: copy });
  					}
  				}
  			}
  		}
  	}

  	// Return the modified object
  	return target;
  };

  var isPlainObj = value => {
  	if (Object.prototype.toString.call(value) !== '[object Object]') {
  		return false;
  	}

  	const prototype = Object.getPrototypeOf(value);
  	return prototype === null || prototype === Object.prototype;
  };

  var slice$3 = [].slice;

  var wrap_1$1 = wrap$2;

  // Wrap `fn`.
  // Can be sync or async; return a promise, receive a completion handler, return
  // new values and errors.
  function wrap$2(fn, callback) {
    var invoked;

    return wrapped

    function wrapped() {
      var params = slice$3.call(arguments, 0);
      var callback = fn.length > params.length;
      var result;

      if (callback) {
        params.push(done);
      }

      try {
        result = fn.apply(null, params);
      } catch (error) {
        // Well, this is quite the pickle.
        // `fn` received a callback and invoked it (thus continuing the pipeline),
        // but later also threw an error.
        // We’re not about to restart the pipeline again, so the only thing left
        // to do is to throw the thing instead.
        if (callback && invoked) {
          throw error
        }

        return done(error)
      }

      if (!callback) {
        if (result && typeof result.then === 'function') {
          result.then(then, done);
        } else if (result instanceof Error) {
          done(result);
        } else {
          then(result);
        }
      }
    }

    // Invoke `next`, only once.
    function done() {
      if (!invoked) {
        invoked = true;

        callback.apply(null, arguments);
      }
    }

    // Invoke `done` with one value.
    // Tracks if an error is passed, too.
    function then(value) {
      done(null, value);
    }
  }

  var trough_1 = trough;

  trough.wrap = wrap_1$1;

  var slice$2 = [].slice;

  // Create new middleware.
  function trough() {
    var fns = [];
    var middleware = {};

    middleware.run = run;
    middleware.use = use;

    return middleware

    // Run `fns`.  Last argument must be a completion handler.
    function run() {
      var index = -1;
      var input = slice$2.call(arguments, 0, -1);
      var done = arguments[arguments.length - 1];

      if (typeof done !== 'function') {
        throw new Error('Expected function as last argument, not ' + done)
      }

      next.apply(null, [null].concat(input));

      // Run the next `fn`, if any.
      function next(err) {
        var fn = fns[++index];
        var params = slice$2.call(arguments, 0);
        var values = params.slice(1);
        var length = input.length;
        var pos = -1;

        if (err) {
          done(err);
          return
        }

        // Copy non-nully input into values.
        while (++pos < length) {
          if (values[pos] === null || values[pos] === undefined) {
            values[pos] = input[pos];
          }
        }

        input = values;

        // Next or done.
        if (fn) {
          wrap_1$1(fn, next).apply(null, input);
        } else {
          done.apply(null, [null].concat(input));
        }
      }
    }

    // Add `fn` to the list.
    function use(fn) {
      if (typeof fn !== 'function') {
        throw new Error('Expected `fn` to be a function, not ' + fn)
      }

      fns.push(fn);

      return middleware
    }
  }

  var own$e = {}.hasOwnProperty;

  var unistUtilStringifyPosition = stringify$4;

  function stringify$4(value) {
    // Nothing.
    if (!value || typeof value !== 'object') {
      return ''
    }

    // Node.
    if (own$e.call(value, 'position') || own$e.call(value, 'type')) {
      return position$1(value.position)
    }

    // Position.
    if (own$e.call(value, 'start') || own$e.call(value, 'end')) {
      return position$1(value)
    }

    // Point.
    if (own$e.call(value, 'line') || own$e.call(value, 'column')) {
      return point(value)
    }

    // ?
    return ''
  }

  function point(point) {
    if (!point || typeof point !== 'object') {
      point = {};
    }

    return index$5(point.line) + ':' + index$5(point.column)
  }

  function position$1(pos) {
    if (!pos || typeof pos !== 'object') {
      pos = {};
    }

    return point(pos.start) + '-' + point(pos.end)
  }

  function index$5(value) {
    return value && typeof value === 'number' ? value : 1
  }

  var vfileMessage = VMessage;

  // Inherit from `Error#`.
  function VMessagePrototype() {}
  VMessagePrototype.prototype = Error.prototype;
  VMessage.prototype = new VMessagePrototype();

  // Message properties.
  var proto$6 = VMessage.prototype;

  proto$6.file = '';
  proto$6.name = '';
  proto$6.reason = '';
  proto$6.message = '';
  proto$6.stack = '';
  proto$6.fatal = null;
  proto$6.column = null;
  proto$6.line = null;

  // Construct a new VMessage.
  //
  // Note: We cannot invoke `Error` on the created context, as that adds readonly
  // `line` and `column` attributes on Safari 9, thus throwing and failing the
  // data.
  function VMessage(reason, position, origin) {
    var parts;
    var range;
    var location;

    if (typeof position === 'string') {
      origin = position;
      position = null;
    }

    parts = parseOrigin(origin);
    range = unistUtilStringifyPosition(position) || '1:1';

    location = {
      start: {line: null, column: null},
      end: {line: null, column: null}
    };

    // Node.
    if (position && position.position) {
      position = position.position;
    }

    if (position) {
      // Position.
      if (position.start) {
        location = position;
        position = position.start;
      } else {
        // Point.
        location.start = position;
      }
    }

    if (reason.stack) {
      this.stack = reason.stack;
      reason = reason.message;
    }

    this.message = reason;
    this.name = range;
    this.reason = reason;
    this.line = position ? position.line : null;
    this.column = position ? position.column : null;
    this.location = location;
    this.source = parts[0];
    this.ruleId = parts[1];
  }

  function parseOrigin(origin) {
    var result = [null, null];
    var index;

    if (typeof origin === 'string') {
      index = origin.indexOf(':');

      if (index === -1) {
        result[1] = origin;
      } else {
        result[0] = origin.slice(0, index);
        result[1] = origin.slice(index + 1);
      }
    }

    return result
  }

  var global$1 = (typeof global !== "undefined" ? global :
              typeof self !== "undefined" ? self :
              typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop$1() {}

  var on = noop$1;
  var addListener = noop$1;
  var once = noop$1;
  var off = noop$1;
  var removeListener = noop$1;
  var removeAllListeners = noop$1;
  var emit = noop$1;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var process$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  function replaceExt(npath, ext) {
    if (typeof npath !== 'string') {
      return npath;
    }

    if (npath.length === 0) {
      return npath;
    }

    var nFileName = path.basename(npath, path.extname(npath)) + ext;
    return path.join(path.dirname(npath), nFileName);
  }

  var replaceExt_1 = replaceExt;

  var core$1 = VFile;

  var own$d = {}.hasOwnProperty;
  var proto$5 = VFile.prototype;

  // Order of setting (least specific to most), we need this because otherwise
  // `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
  // stem can be set.
  var order = ['history', 'path', 'basename', 'stem', 'extname', 'dirname'];

  proto$5.toString = toString;

  // Access full path (`~/index.min.js`).
  Object.defineProperty(proto$5, 'path', {get: getPath, set: setPath});

  // Access parent path (`~`).
  Object.defineProperty(proto$5, 'dirname', {get: getDirname, set: setDirname});

  // Access basename (`index.min.js`).
  Object.defineProperty(proto$5, 'basename', {get: getBasename, set: setBasename});

  // Access extname (`.js`).
  Object.defineProperty(proto$5, 'extname', {get: getExtname, set: setExtname});

  // Access stem (`index.min`).
  Object.defineProperty(proto$5, 'stem', {get: getStem, set: setStem});

  // Construct a new file.
  function VFile(options) {
    var prop;
    var index;
    var length;

    if (!options) {
      options = {};
    } else if (typeof options === 'string' || isBuffer(options)) {
      options = {contents: options};
    } else if ('message' in options && 'messages' in options) {
      return options
    }

    if (!(this instanceof VFile)) {
      return new VFile(options)
    }

    this.data = {};
    this.messages = [];
    this.history = [];
    this.cwd = process$1.cwd();

    // Set path related properties in the correct order.
    index = -1;
    length = order.length;

    while (++index < length) {
      prop = order[index];

      if (own$d.call(options, prop)) {
        this[prop] = options[prop];
      }
    }

    // Set non-path related properties.
    for (prop in options) {
      if (order.indexOf(prop) === -1) {
        this[prop] = options[prop];
      }
    }
  }

  function getPath() {
    return this.history[this.history.length - 1]
  }

  function setPath(path) {
    assertNonEmpty(path, 'path');

    if (path !== this.path) {
      this.history.push(path);
    }
  }

  function getDirname() {
    return typeof this.path === 'string' ? path.dirname(this.path) : undefined
  }

  function setDirname(dirname) {
    assertPath(this.path, 'dirname');
    this.path = path.join(dirname || '', this.basename);
  }

  function getBasename() {
    return typeof this.path === 'string' ? path.basename(this.path) : undefined
  }

  function setBasename(basename) {
    assertNonEmpty(basename, 'basename');
    assertPart(basename, 'basename');
    this.path = path.join(this.dirname || '', basename);
  }

  function getExtname() {
    return typeof this.path === 'string' ? path.extname(this.path) : undefined
  }

  function setExtname(extname) {
    var ext = extname || '';

    assertPart(ext, 'extname');
    assertPath(this.path, 'extname');

    if (ext) {
      if (ext.charAt(0) !== '.') {
        throw new Error('`extname` must start with `.`')
      }

      if (ext.indexOf('.', 1) !== -1) {
        throw new Error('`extname` cannot contain multiple dots')
      }
    }

    this.path = replaceExt_1(this.path, ext);
  }

  function getStem() {
    return typeof this.path === 'string'
      ? path.basename(this.path, this.extname)
      : undefined
  }

  function setStem(stem) {
    assertNonEmpty(stem, 'stem');
    assertPart(stem, 'stem');
    this.path = path.join(this.dirname || '', stem + (this.extname || ''));
  }

  // Get the value of the file.
  function toString(encoding) {
    var value = this.contents || '';
    return isBuffer(value) ? value.toString(encoding) : String(value)
  }

  // Assert that `part` is not a path (i.e., does not contain `path.sep`).
  function assertPart(part, name) {
    if (part.indexOf(path.sep) !== -1) {
      throw new Error(
        '`' + name + '` cannot be a path: did not expect `' + path.sep + '`'
      )
    }
  }

  // Assert that `part` is not empty.
  function assertNonEmpty(part, name) {
    if (!part) {
      throw new Error('`' + name + '` cannot be empty')
    }
  }

  // Assert `path` exists.
  function assertPath(path, name) {
    if (!path) {
      throw new Error('Setting `' + name + '` requires `path` to be set too')
    }
  }

  var vfile = core$1;

  var proto$4 = core$1.prototype;

  proto$4.message = message;
  proto$4.info = info$1;
  proto$4.fail = fail;

  // Create a message with `reason` at `position`.
  // When an error is passed in as `reason`, copies the stack.
  function message(reason, position, origin) {
    var filePath = this.path;
    var message = new vfileMessage(reason, position, origin);

    if (filePath) {
      message.name = filePath + ':' + message.name;
      message.file = filePath;
    }

    message.fatal = false;

    this.messages.push(message);

    return message
  }

  // Fail: creates a vmessage, associates it with the file, and throws it.
  function fail() {
    var message = this.message.apply(this, arguments);

    message.fatal = true;

    throw message
  }

  // Info: creates a vmessage, associates it with the file, and marks the fatality
  // as null.
  function info$1() {
    var message = this.message.apply(this, arguments);

    message.fatal = null;

    return message
  }

  // Expose a frozen processor.
  var unified_1$1 = unified$1().freeze();

  var slice$1 = [].slice;
  var own$c = {}.hasOwnProperty;

  // Process pipeline.
  var pipeline$1 = trough_1()
    .use(pipelineParse$1)
    .use(pipelineRun$1)
    .use(pipelineStringify$1);

  function pipelineParse$1(p, ctx) {
    ctx.tree = p.parse(ctx.file);
  }

  function pipelineRun$1(p, ctx, next) {
    p.run(ctx.tree, ctx.file, done);

    function done(err, tree, file) {
      if (err) {
        next(err);
      } else {
        ctx.tree = tree;
        ctx.file = file;
        next();
      }
    }
  }

  function pipelineStringify$1(p, ctx) {
    var result = p.stringify(ctx.tree, ctx.file);
    var file = ctx.file;

    if (result === undefined || result === null) ; else if (typeof result === 'string' || isBuffer(result)) {
      file.contents = result;
    } else {
      file.result = result;
    }
  }

  // Function to create the first processor.
  function unified$1() {
    var attachers = [];
    var transformers = trough_1();
    var namespace = {};
    var frozen = false;
    var freezeIndex = -1;

    // Data management.
    processor.data = data;

    // Lock.
    processor.freeze = freeze;

    // Plugins.
    processor.attachers = attachers;
    processor.use = use;

    // API.
    processor.parse = parse;
    processor.stringify = stringify;
    processor.run = run;
    processor.runSync = runSync;
    processor.process = process;
    processor.processSync = processSync;

    // Expose.
    return processor

    // Create a new processor based on the processor in the current scope.
    function processor() {
      var destination = unified$1();
      var length = attachers.length;
      var index = -1;

      while (++index < length) {
        destination.use.apply(null, attachers[index]);
      }

      destination.data(extend$2(true, {}, namespace));

      return destination
    }

    // Freeze: used to signal a processor that has finished configuration.
    //
    // For example, take unified itself: it’s frozen.
    // Plugins should not be added to it.
    // Rather, it should be extended, by invoking it, before modifying it.
    //
    // In essence, always invoke this when exporting a processor.
    function freeze() {
      var values;
      var plugin;
      var options;
      var transformer;

      if (frozen) {
        return processor
      }

      while (++freezeIndex < attachers.length) {
        values = attachers[freezeIndex];
        plugin = values[0];
        options = values[1];
        transformer = null;

        if (options === false) {
          continue
        }

        if (options === true) {
          values[1] = undefined;
        }

        transformer = plugin.apply(processor, values.slice(1));

        if (typeof transformer === 'function') {
          transformers.use(transformer);
        }
      }

      frozen = true;
      freezeIndex = Infinity;

      return processor
    }

    // Data management.
    // Getter / setter for processor-specific informtion.
    function data(key, value) {
      if (typeof key === 'string') {
        // Set `key`.
        if (arguments.length === 2) {
          assertUnfrozen$1('data', frozen);

          namespace[key] = value;

          return processor
        }

        // Get `key`.
        return (own$c.call(namespace, key) && namespace[key]) || null
      }

      // Set space.
      if (key) {
        assertUnfrozen$1('data', frozen);
        namespace = key;
        return processor
      }

      // Get space.
      return namespace
    }

    // Plugin management.
    //
    // Pass it:
    // *   an attacher and options,
    // *   a preset,
    // *   a list of presets, attachers, and arguments (list of attachers and
    //     options).
    function use(value) {
      var settings;

      assertUnfrozen$1('use', frozen);

      if (value === null || value === undefined) ; else if (typeof value === 'function') {
        addPlugin.apply(null, arguments);
      } else if (typeof value === 'object') {
        if ('length' in value) {
          addList(value);
        } else {
          addPreset(value);
        }
      } else {
        throw new Error('Expected usable value, not `' + value + '`')
      }

      if (settings) {
        namespace.settings = extend$2(namespace.settings || {}, settings);
      }

      return processor

      function addPreset(result) {
        addList(result.plugins);

        if (result.settings) {
          settings = extend$2(settings || {}, result.settings);
        }
      }

      function add(value) {
        if (typeof value === 'function') {
          addPlugin(value);
        } else if (typeof value === 'object') {
          if ('length' in value) {
            addPlugin.apply(null, value);
          } else {
            addPreset(value);
          }
        } else {
          throw new Error('Expected usable value, not `' + value + '`')
        }
      }

      function addList(plugins) {
        var length;
        var index;

        if (plugins === null || plugins === undefined) ; else if (typeof plugins === 'object' && 'length' in plugins) {
          length = plugins.length;
          index = -1;

          while (++index < length) {
            add(plugins[index]);
          }
        } else {
          throw new Error('Expected a list of plugins, not `' + plugins + '`')
        }
      }

      function addPlugin(plugin, value) {
        var entry = find(plugin);

        if (entry) {
          if (isPlainObj(entry[1]) && isPlainObj(value)) {
            value = extend$2(entry[1], value);
          }

          entry[1] = value;
        } else {
          attachers.push(slice$1.call(arguments));
        }
      }
    }

    function find(plugin) {
      var length = attachers.length;
      var index = -1;
      var entry;

      while (++index < length) {
        entry = attachers[index];

        if (entry[0] === plugin) {
          return entry
        }
      }
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor.
    function parse(doc) {
      var file = vfile(doc);
      var Parser;

      freeze();
      Parser = processor.Parser;
      assertParser$1('parse', Parser);

      if (newable$1(Parser, 'parse')) {
        return new Parser(String(file), file).parse()
      }

      return Parser(String(file), file) // eslint-disable-line new-cap
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), async.
    function run(node, file, cb) {
      assertNode$1(node);
      freeze();

      if (!cb && typeof file === 'function') {
        cb = file;
        file = null;
      }

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        transformers.run(node, vfile(file), done);

        function done(err, tree, file) {
          tree = tree || node;
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(tree);
          } else {
            cb(null, tree, file);
          }
        }
      }
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), sync.
    function runSync(node, file) {
      var complete = false;
      var result;

      run(node, file, done);

      assertDone$1('runSync', 'run', complete);

      return result

      function done(err, tree) {
        complete = true;
        bail_1(err);
        result = tree;
      }
    }

    // Stringify a unist node representation of a file (in string or vfile
    // representation) into a string using the `Compiler` on the processor.
    function stringify(node, doc) {
      var file = vfile(doc);
      var Compiler;

      freeze();
      Compiler = processor.Compiler;
      assertCompiler$1('stringify', Compiler);
      assertNode$1(node);

      if (newable$1(Compiler, 'compile')) {
        return new Compiler(node, file).compile()
      }

      return Compiler(node, file) // eslint-disable-line new-cap
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor, then run transforms on that node, and
    // compile the resulting node using the `Compiler` on the processor, and
    // store that result on the vfile.
    function process(doc, cb) {
      freeze();
      assertParser$1('process', processor.Parser);
      assertCompiler$1('process', processor.Compiler);

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        var file = vfile(doc);

        pipeline$1.run(processor, {file: file}, done);

        function done(err) {
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(file);
          } else {
            cb(null, file);
          }
        }
      }
    }

    // Process the given document (in string or vfile representation), sync.
    function processSync(doc) {
      var complete = false;
      var file;

      freeze();
      assertParser$1('processSync', processor.Parser);
      assertCompiler$1('processSync', processor.Compiler);
      file = vfile(doc);

      process(file, done);

      assertDone$1('processSync', 'process', complete);

      return file

      function done(err) {
        complete = true;
        bail_1(err);
      }
    }
  }

  // Check if `value` is a constructor.
  function newable$1(value, name) {
    return (
      typeof value === 'function' &&
      value.prototype &&
      // A function with keys in its prototype is probably a constructor.
      // Classes’ prototype methods are not enumerable, so we check if some value
      // exists in the prototype.
      (keys$2(value.prototype) || name in value.prototype)
    )
  }

  // Check if `value` is an object with keys.
  function keys$2(value) {
    var key;
    for (key in value) {
      return true
    }

    return false
  }

  // Assert a parser is available.
  function assertParser$1(name, Parser) {
    if (typeof Parser !== 'function') {
      throw new Error('Cannot `' + name + '` without `Parser`')
    }
  }

  // Assert a compiler is available.
  function assertCompiler$1(name, Compiler) {
    if (typeof Compiler !== 'function') {
      throw new Error('Cannot `' + name + '` without `Compiler`')
    }
  }

  // Assert the processor is not frozen.
  function assertUnfrozen$1(name, frozen) {
    if (frozen) {
      throw new Error(
        'Cannot invoke `' +
          name +
          '` on a frozen processor.\nCreate a new processor first, by invoking it: use `processor()` instead of `processor`.'
      )
    }
  }

  // Assert `node` is a unist node.
  function assertNode$1(node) {
    if (!node || typeof node.type !== 'string') {
      throw new Error('Expected node, got `' + node + '`')
    }
  }

  // Assert that `complete` is `true`.
  function assertDone$1(name, asyncName, complete) {
    if (!complete) {
      throw new Error(
        '`' + name + '` finished async. Use `' + asyncName + '` instead'
      )
    }
  }

  var immutable = extend$1;

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function extend$1() {
      var target = {};

      for (var i = 0; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
              if (hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
              }
          }
      }

      return target
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  var inherits_browser = createCommonjsModule(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  });

  var unherit_1 = unherit;

  // Create a custom constructor which can be modified without affecting the
  // original class.
  function unherit(Super) {
    var result;
    var key;
    var value;

    inherits_browser(Of, Super);
    inherits_browser(From, Of);

    // Clone values.
    result = Of.prototype;

    for (key in result) {
      value = result[key];

      if (value && typeof value === 'object') {
        result[key] = 'concat' in value ? value.concat() : immutable(value);
      }
    }

    return Of

    // Constructor accepting a single argument, which itself is an `arguments`
    // object.
    function From(parameters) {
      return Super.apply(this, parameters)
    }

    // Constructor accepting variadic arguments.
    function Of() {
      if (!(this instanceof Of)) {
        return new From(arguments)
      }

      return Super.apply(this, arguments)
    }
  }

  var stateToggle = factory$6;

  // Construct a state `toggler`: a function which inverses `property` in context
  // based on its current value.
  // The by `toggler` returned function restores that value.
  function factory$6(key, state, ctx) {
    return enter

    function enter() {
      var context = ctx || this;
      var current = context[key];

      context[key] = !state;

      return exit

      function exit() {
        context[key] = current;
      }
    }
  }

  var vfileLocation = factory$5;

  function factory$5(file) {
    var contents = indices(String(file));

    return {
      toPosition: offsetToPositionFactory(contents),
      toOffset: positionToOffsetFactory(contents)
    }
  }

  // Factory to get the line and column-based `position` for `offset` in the bound
  // indices.
  function offsetToPositionFactory(indices) {
    return offsetToPosition

    // Get the line and column-based `position` for `offset` in the bound indices.
    function offsetToPosition(offset) {
      var index = -1;
      var length = indices.length;

      if (offset < 0) {
        return {}
      }

      while (++index < length) {
        if (indices[index] > offset) {
          return {
            line: index + 1,
            column: offset - (indices[index - 1] || 0) + 1,
            offset: offset
          }
        }
      }

      return {}
    }
  }

  // Factory to get the `offset` for a line and column-based `position` in the
  // bound indices.
  function positionToOffsetFactory(indices) {
    return positionToOffset

    // Get the `offset` for a line and column-based `position` in the bound
    // indices.
    function positionToOffset(position) {
      var line = position && position.line;
      var column = position && position.column;

      if (!isNaN(line) && !isNaN(column) && line - 1 in indices) {
        return (indices[line - 2] || 0) + column - 1 || 0
      }

      return -1
    }
  }

  // Get indices of line-breaks in `value`.
  function indices(value) {
    var result = [];
    var index = value.indexOf('\n');

    while (index !== -1) {
      result.push(index + 1);
      index = value.indexOf('\n', index + 1);
    }

    result.push(value.length + 1);

    return result
  }

  var _unescape = factory$4;

  var backslash$7 = '\\';

  // Factory to de-escape a value, based on a list at `key` in `ctx`.
  function factory$4(ctx, key) {
    return unescape

    // De-escape a string using the expression at `key` in `ctx`.
    function unescape(value) {
      var previous = 0;
      var index = value.indexOf(backslash$7);
      var escape = ctx[key];
      var queue = [];
      var character;

      while (index !== -1) {
        queue.push(value.slice(previous, index));
        previous = index + 1;
        character = value.charAt(previous);

        // If the following character is not a valid escape, add the slash.
        if (!character || escape.indexOf(character) === -1) {
          queue.push(backslash$7);
        }

        index = value.indexOf(backslash$7, previous + 1);
      }

      queue.push(value.slice(previous));

      return queue.join('')
    }
  }

  var AElig$1 = "Æ";
  var AMP$1 = "&";
  var Aacute$1 = "Á";
  var Acirc$1 = "Â";
  var Agrave$1 = "À";
  var Aring$1 = "Å";
  var Atilde$1 = "Ã";
  var Auml$1 = "Ä";
  var COPY = "©";
  var Ccedil$1 = "Ç";
  var ETH$1 = "Ð";
  var Eacute$1 = "É";
  var Ecirc$1 = "Ê";
  var Egrave$1 = "È";
  var Euml$1 = "Ë";
  var GT$1 = ">";
  var Iacute$1 = "Í";
  var Icirc$1 = "Î";
  var Igrave$1 = "Ì";
  var Iuml$1 = "Ï";
  var LT$1 = "<";
  var Ntilde$1 = "Ñ";
  var Oacute$1 = "Ó";
  var Ocirc$1 = "Ô";
  var Ograve$1 = "Ò";
  var Oslash$1 = "Ø";
  var Otilde$1 = "Õ";
  var Ouml$1 = "Ö";
  var QUOT = "\"";
  var REG = "®";
  var THORN$1 = "Þ";
  var Uacute$1 = "Ú";
  var Ucirc$1 = "Û";
  var Ugrave$1 = "Ù";
  var Uuml$1 = "Ü";
  var Yacute$1 = "Ý";
  var aacute$1 = "á";
  var acirc$1 = "â";
  var acute$1 = "´";
  var aelig$1 = "æ";
  var agrave$1 = "à";
  var amp$1 = "&";
  var aring$1 = "å";
  var atilde$1 = "ã";
  var auml$1 = "ä";
  var brvbar$1 = "¦";
  var ccedil$1 = "ç";
  var cedil$1 = "¸";
  var cent$1 = "¢";
  var copy$1 = "©";
  var curren$1 = "¤";
  var deg$1 = "°";
  var divide$1 = "÷";
  var eacute$1 = "é";
  var ecirc$1 = "ê";
  var egrave$1 = "è";
  var eth$1 = "ð";
  var euml$1 = "ë";
  var frac12$1 = "½";
  var frac14$1 = "¼";
  var frac34$1 = "¾";
  var gt$1 = ">";
  var iacute$1 = "í";
  var icirc$1 = "î";
  var iexcl$1 = "¡";
  var igrave$1 = "ì";
  var iquest$1 = "¿";
  var iuml$1 = "ï";
  var laquo$1 = "«";
  var lt$1 = "<";
  var macr$1 = "¯";
  var micro$1 = "µ";
  var middot$1 = "·";
  var nbsp$1 = " ";
  var not$1 = "¬";
  var ntilde$1 = "ñ";
  var oacute$1 = "ó";
  var ocirc$1 = "ô";
  var ograve$1 = "ò";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var oslash$1 = "ø";
  var otilde$1 = "õ";
  var ouml$1 = "ö";
  var para$1 = "¶";
  var plusmn$1 = "±";
  var pound$1 = "£";
  var quot$1 = "\"";
  var raquo$1 = "»";
  var reg$1 = "®";
  var sect$1 = "§";
  var shy$1 = "­";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var szlig$1 = "ß";
  var thorn$1 = "þ";
  var times$1 = "×";
  var uacute$1 = "ú";
  var ucirc$1 = "û";
  var ugrave$1 = "ù";
  var uml$1 = "¨";
  var uuml$1 = "ü";
  var yacute$1 = "ý";
  var yen$1 = "¥";
  var yuml$1 = "ÿ";
  var index$4 = {
  	AElig: AElig$1,
  	AMP: AMP$1,
  	Aacute: Aacute$1,
  	Acirc: Acirc$1,
  	Agrave: Agrave$1,
  	Aring: Aring$1,
  	Atilde: Atilde$1,
  	Auml: Auml$1,
  	COPY: COPY,
  	Ccedil: Ccedil$1,
  	ETH: ETH$1,
  	Eacute: Eacute$1,
  	Ecirc: Ecirc$1,
  	Egrave: Egrave$1,
  	Euml: Euml$1,
  	GT: GT$1,
  	Iacute: Iacute$1,
  	Icirc: Icirc$1,
  	Igrave: Igrave$1,
  	Iuml: Iuml$1,
  	LT: LT$1,
  	Ntilde: Ntilde$1,
  	Oacute: Oacute$1,
  	Ocirc: Ocirc$1,
  	Ograve: Ograve$1,
  	Oslash: Oslash$1,
  	Otilde: Otilde$1,
  	Ouml: Ouml$1,
  	QUOT: QUOT,
  	REG: REG,
  	THORN: THORN$1,
  	Uacute: Uacute$1,
  	Ucirc: Ucirc$1,
  	Ugrave: Ugrave$1,
  	Uuml: Uuml$1,
  	Yacute: Yacute$1,
  	aacute: aacute$1,
  	acirc: acirc$1,
  	acute: acute$1,
  	aelig: aelig$1,
  	agrave: agrave$1,
  	amp: amp$1,
  	aring: aring$1,
  	atilde: atilde$1,
  	auml: auml$1,
  	brvbar: brvbar$1,
  	ccedil: ccedil$1,
  	cedil: cedil$1,
  	cent: cent$1,
  	copy: copy$1,
  	curren: curren$1,
  	deg: deg$1,
  	divide: divide$1,
  	eacute: eacute$1,
  	ecirc: ecirc$1,
  	egrave: egrave$1,
  	eth: eth$1,
  	euml: euml$1,
  	frac12: frac12$1,
  	frac14: frac14$1,
  	frac34: frac34$1,
  	gt: gt$1,
  	iacute: iacute$1,
  	icirc: icirc$1,
  	iexcl: iexcl$1,
  	igrave: igrave$1,
  	iquest: iquest$1,
  	iuml: iuml$1,
  	laquo: laquo$1,
  	lt: lt$1,
  	macr: macr$1,
  	micro: micro$1,
  	middot: middot$1,
  	nbsp: nbsp$1,
  	not: not$1,
  	ntilde: ntilde$1,
  	oacute: oacute$1,
  	ocirc: ocirc$1,
  	ograve: ograve$1,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	oslash: oslash$1,
  	otilde: otilde$1,
  	ouml: ouml$1,
  	para: para$1,
  	plusmn: plusmn$1,
  	pound: pound$1,
  	quot: quot$1,
  	raquo: raquo$1,
  	reg: reg$1,
  	sect: sect$1,
  	shy: shy$1,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	szlig: szlig$1,
  	thorn: thorn$1,
  	times: times$1,
  	uacute: uacute$1,
  	ucirc: ucirc$1,
  	ugrave: ugrave$1,
  	uml: uml$1,
  	uuml: uuml$1,
  	yacute: yacute$1,
  	yen: yen$1,
  	yuml: yuml$1
  };

  var characterEntitiesLegacy = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AElig: AElig$1,
    AMP: AMP$1,
    Aacute: Aacute$1,
    Acirc: Acirc$1,
    Agrave: Agrave$1,
    Aring: Aring$1,
    Atilde: Atilde$1,
    Auml: Auml$1,
    COPY: COPY,
    Ccedil: Ccedil$1,
    ETH: ETH$1,
    Eacute: Eacute$1,
    Ecirc: Ecirc$1,
    Egrave: Egrave$1,
    Euml: Euml$1,
    GT: GT$1,
    Iacute: Iacute$1,
    Icirc: Icirc$1,
    Igrave: Igrave$1,
    Iuml: Iuml$1,
    LT: LT$1,
    Ntilde: Ntilde$1,
    Oacute: Oacute$1,
    Ocirc: Ocirc$1,
    Ograve: Ograve$1,
    Oslash: Oslash$1,
    Otilde: Otilde$1,
    Ouml: Ouml$1,
    QUOT: QUOT,
    REG: REG,
    THORN: THORN$1,
    Uacute: Uacute$1,
    Ucirc: Ucirc$1,
    Ugrave: Ugrave$1,
    Uuml: Uuml$1,
    Yacute: Yacute$1,
    aacute: aacute$1,
    acirc: acirc$1,
    acute: acute$1,
    aelig: aelig$1,
    agrave: agrave$1,
    amp: amp$1,
    aring: aring$1,
    atilde: atilde$1,
    auml: auml$1,
    brvbar: brvbar$1,
    ccedil: ccedil$1,
    cedil: cedil$1,
    cent: cent$1,
    copy: copy$1,
    curren: curren$1,
    deg: deg$1,
    divide: divide$1,
    eacute: eacute$1,
    ecirc: ecirc$1,
    egrave: egrave$1,
    eth: eth$1,
    euml: euml$1,
    frac12: frac12$1,
    frac14: frac14$1,
    frac34: frac34$1,
    gt: gt$1,
    iacute: iacute$1,
    icirc: icirc$1,
    iexcl: iexcl$1,
    igrave: igrave$1,
    iquest: iquest$1,
    iuml: iuml$1,
    laquo: laquo$1,
    lt: lt$1,
    macr: macr$1,
    micro: micro$1,
    middot: middot$1,
    nbsp: nbsp$1,
    not: not$1,
    ntilde: ntilde$1,
    oacute: oacute$1,
    ocirc: ocirc$1,
    ograve: ograve$1,
    ordf: ordf$1,
    ordm: ordm$1,
    oslash: oslash$1,
    otilde: otilde$1,
    ouml: ouml$1,
    para: para$1,
    plusmn: plusmn$1,
    pound: pound$1,
    quot: quot$1,
    raquo: raquo$1,
    reg: reg$1,
    sect: sect$1,
    shy: shy$1,
    sup1: sup1$1,
    sup2: sup2$1,
    sup3: sup3$1,
    szlig: szlig$1,
    thorn: thorn$1,
    times: times$1,
    uacute: uacute$1,
    ucirc: ucirc$1,
    ugrave: ugrave$1,
    uml: uml$1,
    uuml: uuml$1,
    yacute: yacute$1,
    yen: yen$1,
    yuml: yuml$1,
    'default': index$4
  });

  var index$3 = {
  	"0": "�",
  	"128": "€",
  	"130": "‚",
  	"131": "ƒ",
  	"132": "„",
  	"133": "…",
  	"134": "†",
  	"135": "‡",
  	"136": "ˆ",
  	"137": "‰",
  	"138": "Š",
  	"139": "‹",
  	"140": "Œ",
  	"142": "Ž",
  	"145": "‘",
  	"146": "’",
  	"147": "“",
  	"148": "”",
  	"149": "•",
  	"150": "–",
  	"151": "—",
  	"152": "˜",
  	"153": "™",
  	"154": "š",
  	"155": "›",
  	"156": "œ",
  	"158": "ž",
  	"159": "Ÿ"
  };

  var characterReferenceInvalid = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': index$3
  });

  var isDecimal = decimal$1;

  // Check if the given character code, or the character code at the first
  // character, is decimal.
  function decimal$1(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return code >= 48 && code <= 57 /* 0-9 */
  }

  var isHexadecimal = hexadecimal;

  // Check if the given character code, or the character code at the first
  // character, is hexadecimal.
  function hexadecimal(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return (
      (code >= 97 /* a */ && code <= 102) /* z */ ||
      (code >= 65 /* A */ && code <= 70) /* Z */ ||
      (code >= 48 /* A */ && code <= 57) /* Z */
    )
  }

  var isAlphabetical = alphabetical;

  // Check if the given character code, or the character code at the first
  // character, is alphabetical.
  function alphabetical(character) {
    var code = typeof character === 'string' ? character.charCodeAt(0) : character;

    return (
      (code >= 97 && code <= 122) /* a-z */ ||
      (code >= 65 && code <= 90) /* A-Z */
    )
  }

  var isAlphanumerical = alphanumerical;

  // Check if the given character code, or the character code at the first
  // character, is alphanumerical.
  function alphanumerical(character) {
    return isAlphabetical(character) || isDecimal(character)
  }

  /* eslint-env browser */

  var el;

  var semicolon$2 = 59; //  ';'

  var decodeEntity_browser = decodeEntity;

  function decodeEntity(characters) {
    var entity = '&' + characters + ';';
    var char;

    el = el || document.createElement('i');
    el.innerHTML = entity;
    char = el.textContent;

    // Some entities do not require the closing semicolon (`&not` - for instance),
    // which leads to situations where parsing the assumed entity of &notit; will
    // result in the string `¬it;`.  When we encounter a trailing semicolon after
    // parsing and the entity to decode was not a semicolon (`&semi;`), we can
    // assume that the matching was incomplete
    if (char.charCodeAt(char.length - 1) === semicolon$2 && characters !== 'semi') {
      return false
    }

    // If the decoded string is equal to the input, the entity was not valid
    return char === entity ? false : char
  }

  var legacy = getCjsExportFromNamespace(characterEntitiesLegacy);

  var invalid = getCjsExportFromNamespace(characterReferenceInvalid);

  var parseEntities_1 = parseEntities;

  var own$b = {}.hasOwnProperty;
  var fromCharCode = String.fromCharCode;
  var noop = Function.prototype;

  // Default settings.
  var defaults$3 = {
    warning: null,
    reference: null,
    text: null,
    warningContext: null,
    referenceContext: null,
    textContext: null,
    position: {},
    additional: null,
    attribute: false,
    nonTerminated: true
  };

  // Characters.
  var tab$e = 9; // '\t'
  var lineFeed$j = 10; // '\n'
  var formFeed = 12; // '\f'
  var space$j = 32; // ' '
  var ampersand$1 = 38; // '&'
  var semicolon$1 = 59; // ';'
  var lessThan$8 = 60; // '<'
  var equalsTo$2 = 61; // '='
  var numberSign$1 = 35; // '#'
  var uppercaseX = 88; // 'X'
  var lowercaseX$1 = 120; // 'x'
  var replacementCharacter = 65533; // '�'

  // Reference types.
  var name$1 = 'named';
  var hexa = 'hexadecimal';
  var deci = 'decimal';

  // Map of bases.
  var bases = {};

  bases[hexa] = 16;
  bases[deci] = 10;

  // Map of types to tests.
  // Each type of character reference accepts different characters.
  // This test is used to detect whether a reference has ended (as the semicolon
  // is not strictly needed).
  var tests = {};

  tests[name$1] = isAlphanumerical;
  tests[deci] = isDecimal;
  tests[hexa] = isHexadecimal;

  // Warning types.
  var namedNotTerminated = 1;
  var numericNotTerminated = 2;
  var namedEmpty = 3;
  var numericEmpty = 4;
  var namedUnknown = 5;
  var numericDisallowed = 6;
  var numericProhibited = 7;

  // Warning messages.
  var messages = {};

  messages[namedNotTerminated] =
    'Named character references must be terminated by a semicolon';
  messages[numericNotTerminated] =
    'Numeric character references must be terminated by a semicolon';
  messages[namedEmpty] = 'Named character references cannot be empty';
  messages[numericEmpty] = 'Numeric character references cannot be empty';
  messages[namedUnknown] = 'Named character references must be known';
  messages[numericDisallowed] =
    'Numeric character references cannot be disallowed';
  messages[numericProhibited] =
    'Numeric character references cannot be outside the permissible Unicode range';

  // Wrap to ensure clean parameters are given to `parse`.
  function parseEntities(value, options) {
    var settings = {};
    var option;
    var key;

    if (!options) {
      options = {};
    }

    for (key in defaults$3) {
      option = options[key];
      settings[key] =
        option === null || option === undefined ? defaults$3[key] : option;
    }

    if (settings.position.indent || settings.position.start) {
      settings.indent = settings.position.indent || [];
      settings.position = settings.position.start;
    }

    return parse$7(value, settings)
  }

  // Parse entities.
  // eslint-disable-next-line complexity
  function parse$7(value, settings) {
    var additional = settings.additional;
    var nonTerminated = settings.nonTerminated;
    var handleText = settings.text;
    var handleReference = settings.reference;
    var handleWarning = settings.warning;
    var textContext = settings.textContext;
    var referenceContext = settings.referenceContext;
    var warningContext = settings.warningContext;
    var pos = settings.position;
    var indent = settings.indent || [];
    var length = value.length;
    var index = 0;
    var lines = -1;
    var column = pos.column || 1;
    var line = pos.line || 1;
    var queue = '';
    var result = [];
    var entityCharacters;
    var namedEntity;
    var terminated;
    var characters;
    var character;
    var reference;
    var following;
    var warning;
    var reason;
    var output;
    var entity;
    var begin;
    var start;
    var type;
    var test;
    var prev;
    var next;
    var diff;
    var end;

    if (typeof additional === 'string') {
      additional = additional.charCodeAt(0);
    }

    // Cache the current point.
    prev = now();

    // Wrap `handleWarning`.
    warning = handleWarning ? parseError : noop;

    // Ensure the algorithm walks over the first character and the end
    // (inclusive).
    index--;
    length++;

    while (++index < length) {
      // If the previous character was a newline.
      if (character === lineFeed$j) {
        column = indent[lines] || 1;
      }

      character = value.charCodeAt(index);

      if (character === ampersand$1) {
        following = value.charCodeAt(index + 1);

        // The behaviour depends on the identity of the next character.
        if (
          following === tab$e ||
          following === lineFeed$j ||
          following === formFeed ||
          following === space$j ||
          following === ampersand$1 ||
          following === lessThan$8 ||
          following !== following ||
          (additional && following === additional)
        ) {
          // Not a character reference.
          // No characters are consumed, and nothing is returned.
          // This is not an error, either.
          queue += fromCharCode(character);
          column++;

          continue
        }

        start = index + 1;
        begin = start;
        end = start;

        if (following === numberSign$1) {
          // Numerical entity.
          end = ++begin;

          // The behaviour further depends on the next character.
          following = value.charCodeAt(end);

          if (following === uppercaseX || following === lowercaseX$1) {
            // ASCII hex digits.
            type = hexa;
            end = ++begin;
          } else {
            // ASCII digits.
            type = deci;
          }
        } else {
          // Named entity.
          type = name$1;
        }

        entityCharacters = '';
        entity = '';
        characters = '';
        test = tests[type];
        end--;

        while (++end < length) {
          following = value.charCodeAt(end);

          if (!test(following)) {
            break
          }

          characters += fromCharCode(following);

          // Check if we can match a legacy named reference.
          // If so, we cache that as the last viable named reference.
          // This ensures we do not need to walk backwards later.
          if (type === name$1 && own$b.call(legacy, characters)) {
            entityCharacters = characters;
            entity = legacy[characters];
          }
        }

        terminated = value.charCodeAt(end) === semicolon$1;

        if (terminated) {
          end++;

          namedEntity = type === name$1 ? decodeEntity_browser(characters) : false;

          if (namedEntity) {
            entityCharacters = characters;
            entity = namedEntity;
          }
        }

        diff = 1 + end - start;

        if (!terminated && !nonTerminated) ; else if (!characters) {
          // An empty (possible) entity is valid, unless it’s numeric (thus an
          // ampersand followed by an octothorp).
          if (type !== name$1) {
            warning(numericEmpty, diff);
          }
        } else if (type === name$1) {
          // An ampersand followed by anything unknown, and not terminated, is
          // invalid.
          if (terminated && !entity) {
            warning(namedUnknown, 1);
          } else {
            // If theres something after an entity name which is not known, cap
            // the reference.
            if (entityCharacters !== characters) {
              end = begin + entityCharacters.length;
              diff = 1 + end - begin;
              terminated = false;
            }

            // If the reference is not terminated, warn.
            if (!terminated) {
              reason = entityCharacters ? namedNotTerminated : namedEmpty;

              if (settings.attribute) {
                following = value.charCodeAt(end);

                if (following === equalsTo$2) {
                  warning(reason, diff);
                  entity = null;
                } else if (isAlphanumerical(following)) {
                  entity = null;
                } else {
                  warning(reason, diff);
                }
              } else {
                warning(reason, diff);
              }
            }
          }

          reference = entity;
        } else {
          if (!terminated) {
            // All non-terminated numeric entities are not rendered, and trigger a
            // warning.
            warning(numericNotTerminated, diff);
          }

          // When terminated and number, parse as either hexadecimal or decimal.
          reference = parseInt(characters, bases[type]);

          // Trigger a warning when the parsed number is prohibited, and replace
          // with replacement character.
          if (prohibited(reference)) {
            warning(numericProhibited, diff);
            reference = fromCharCode(replacementCharacter);
          } else if (reference in invalid) {
            // Trigger a warning when the parsed number is disallowed, and replace
            // by an alternative.
            warning(numericDisallowed, diff);
            reference = invalid[reference];
          } else {
            // Parse the number.
            output = '';

            // Trigger a warning when the parsed number should not be used.
            if (disallowed(reference)) {
              warning(numericDisallowed, diff);
            }

            // Stringify the number.
            if (reference > 0xffff) {
              reference -= 0x10000;
              output += fromCharCode((reference >>> (10 & 0x3ff)) | 0xd800);
              reference = 0xdc00 | (reference & 0x3ff);
            }

            reference = output + fromCharCode(reference);
          }
        }

        // Found it!
        // First eat the queued characters as normal text, then eat an entity.
        if (reference) {
          flush();

          prev = now();
          index = end - 1;
          column += end - start + 1;
          result.push(reference);
          next = now();
          next.offset++;

          if (handleReference) {
            handleReference.call(
              referenceContext,
              reference,
              {start: prev, end: next},
              value.slice(start - 1, end)
            );
          }

          prev = next;
        } else {
          // If we could not find a reference, queue the checked characters (as
          // normal characters), and move the pointer to their end.
          // This is possible because we can be certain neither newlines nor
          // ampersands are included.
          characters = value.slice(start - 1, end);
          queue += characters;
          column += characters.length;
          index = end - 1;
        }
      } else {
        // Handle anything other than an ampersand, including newlines and EOF.
        if (
          character === 10 // Line feed
        ) {
          line++;
          lines++;
          column = 0;
        }

        if (character === character) {
          queue += fromCharCode(character);
          column++;
        } else {
          flush();
        }
      }
    }

    // Return the reduced nodes.
    return result.join('')

    // Get current position.
    function now() {
      return {
        line: line,
        column: column,
        offset: index + (pos.offset || 0)
      }
    }

    // “Throw” a parse-error: a warning.
    function parseError(code, offset) {
      var position = now();

      position.column += offset;
      position.offset += offset;

      handleWarning.call(warningContext, messages[code], position, code);
    }

    // Flush `queue` (normal text).
    // Macro invoked before each entity and at the end of `value`.
    // Does nothing when `queue` is empty.
    function flush() {
      if (queue) {
        result.push(queue);

        if (handleText) {
          handleText.call(textContext, queue, {start: prev, end: now()});
        }

        queue = '';
      }
    }
  }

  // Check if `character` is outside the permissible unicode range.
  function prohibited(code) {
    return (code >= 0xd800 && code <= 0xdfff) || code > 0x10ffff
  }

  // Check if `character` is disallowed.
  function disallowed(code) {
    return (
      (code >= 0x0001 && code <= 0x0008) ||
      code === 0x000b ||
      (code >= 0x000d && code <= 0x001f) ||
      (code >= 0x007f && code <= 0x009f) ||
      (code >= 0xfdd0 && code <= 0xfdef) ||
      (code & 0xffff) === 0xffff ||
      (code & 0xffff) === 0xfffe
    )
  }

  var decode = factory$3;

  // Factory to create an entity decoder.
  function factory$3(ctx) {
    decoder.raw = decodeRaw;

    return decoder

    // Normalize `position` to add an `indent`.
    function normalize(position) {
      var offsets = ctx.offset;
      var line = position.line;
      var result = [];

      while (++line) {
        if (!(line in offsets)) {
          break
        }

        result.push((offsets[line] || 0) + 1);
      }

      return {start: position, indent: result}
    }

    // Decode `value` (at `position`) into text-nodes.
    function decoder(value, position, handler) {
      parseEntities_1(value, {
        position: normalize(position),
        warning: handleWarning,
        text: handler,
        reference: handler,
        textContext: ctx,
        referenceContext: ctx
      });
    }

    // Decode `value` (at `position`) into a string.
    function decodeRaw(value, position, options) {
      return parseEntities_1(
        value,
        immutable(options, {position: normalize(position), warning: handleWarning})
      )
    }

    // Handle a warning.
    // See <https://github.com/wooorm/parse-entities> for the warnings.
    function handleWarning(reason, position, code) {
      if (code !== 3) {
        ctx.file.message(reason, position);
      }
    }
  }

  var tokenizer$1 = factory$2;

  // Construct a tokenizer.  This creates both `tokenizeInline` and `tokenizeBlock`.
  function factory$2(type) {
    return tokenize

    // Tokenizer for a bound `type`.
    function tokenize(value, location) {
      var self = this;
      var offset = self.offset;
      var tokens = [];
      var methods = self[type + 'Methods'];
      var tokenizers = self[type + 'Tokenizers'];
      var line = location.line;
      var column = location.column;
      var index;
      var length;
      var method;
      var name;
      var matched;
      var valueLength;

      // Trim white space only lines.
      if (!value) {
        return tokens
      }

      // Expose on `eat`.
      eat.now = now;
      eat.file = self.file;

      // Sync initial offset.
      updatePosition('');

      // Iterate over `value`, and iterate over all tokenizers.  When one eats
      // something, re-iterate with the remaining value.  If no tokenizer eats,
      // something failed (should not happen) and an exception is thrown.
      while (value) {
        index = -1;
        length = methods.length;
        matched = false;

        while (++index < length) {
          name = methods[index];
          method = tokenizers[name];

          // Previously, we had constructs such as footnotes and YAML that used
          // these properties.
          // Those are now external (plus there are userland extensions), that may
          // still use them.
          if (
            method &&
            /* istanbul ignore next */ (!method.onlyAtStart || self.atStart) &&
            /* istanbul ignore next */ (!method.notInList || !self.inList) &&
            /* istanbul ignore next */ (!method.notInBlock || !self.inBlock) &&
            (!method.notInLink || !self.inLink)
          ) {
            valueLength = value.length;

            method.apply(self, [eat, value]);

            matched = valueLength !== value.length;

            if (matched) {
              break
            }
          }
        }

        /* istanbul ignore if */
        if (!matched) {
          self.file.fail(new Error('Infinite loop'), eat.now());
        }
      }

      self.eof = now();

      return tokens

      // Update line, column, and offset based on `value`.
      function updatePosition(subvalue) {
        var lastIndex = -1;
        var index = subvalue.indexOf('\n');

        while (index !== -1) {
          line++;
          lastIndex = index;
          index = subvalue.indexOf('\n', index + 1);
        }

        if (lastIndex === -1) {
          column += subvalue.length;
        } else {
          column = subvalue.length - lastIndex;
        }

        if (line in offset) {
          if (lastIndex !== -1) {
            column += offset[line];
          } else if (column <= offset[line]) {
            column = offset[line] + 1;
          }
        }
      }

      // Get offset.  Called before the first character is eaten to retrieve the
      // range’s offsets.
      function getOffset() {
        var indentation = [];
        var pos = line + 1;

        // Done.  Called when the last character is eaten to retrieve the range’s
        // offsets.
        return function () {
          var last = line + 1;

          while (pos < last) {
            indentation.push((offset[pos] || 0) + 1);

            pos++;
          }

          return indentation
        }
      }

      // Get the current position.
      function now() {
        var pos = {line: line, column: column};

        pos.offset = self.toOffset(pos);

        return pos
      }

      // Store position information for a node.
      function Position(start) {
        this.start = start;
        this.end = now();
      }

      // Throw when a value is incorrectly eaten.  This shouldn’t happen but will
      // throw on new, incorrect rules.
      function validateEat(subvalue) {
        /* istanbul ignore if */
        if (value.slice(0, subvalue.length) !== subvalue) {
          // Capture stack-trace.
          self.file.fail(
            new Error(
              'Incorrectly eaten value: please report this warning on https://git.io/vg5Ft'
            ),
            now()
          );
        }
      }

      // Mark position and patch `node.position`.
      function position() {
        var before = now();

        return update

        // Add the position to a node.
        function update(node, indent) {
          var previous = node.position;
          var start = previous ? previous.start : before;
          var combined = [];
          var n = previous && previous.end.line;
          var l = before.line;

          node.position = new Position(start);

          // If there was already a `position`, this node was merged.  Fixing
          // `start` wasn’t hard, but the indent is different.  Especially
          // because some information, the indent between `n` and `l` wasn’t
          // tracked.  Luckily, that space is (should be?) empty, so we can
          // safely check for it now.
          if (previous && indent && previous.indent) {
            combined = previous.indent;

            if (n < l) {
              while (++n < l) {
                combined.push((offset[n] || 0) + 1);
              }

              combined.push(before.column);
            }

            indent = combined.concat(indent);
          }

          node.position.indent = indent || [];

          return node
        }
      }

      // Add `node` to `parent`s children or to `tokens`.  Performs merges where
      // possible.
      function add(node, parent) {
        var children = parent ? parent.children : tokens;
        var previous = children[children.length - 1];
        var fn;

        if (
          previous &&
          node.type === previous.type &&
          (node.type === 'text' || node.type === 'blockquote') &&
          mergeable(previous) &&
          mergeable(node)
        ) {
          fn = node.type === 'text' ? mergeText : mergeBlockquote;
          node = fn.call(self, previous, node);
        }

        if (node !== previous) {
          children.push(node);
        }

        if (self.atStart && tokens.length !== 0) {
          self.exitStart();
        }

        return node
      }

      // Remove `subvalue` from `value`.  `subvalue` must be at the start of
      // `value`.
      function eat(subvalue) {
        var indent = getOffset();
        var pos = position();
        var current = now();

        validateEat(subvalue);

        apply.reset = reset;
        reset.test = test;
        apply.test = test;

        value = value.slice(subvalue.length);

        updatePosition(subvalue);

        indent = indent();

        return apply

        // Add the given arguments, add `position` to the returned node, and
        // return the node.
        function apply(node, parent) {
          return pos(add(pos(node), parent), indent)
        }

        // Functions just like apply, but resets the content: the line and
        // column are reversed, and the eaten value is re-added.   This is
        // useful for nodes with a single type of content, such as lists and
        // tables.  See `apply` above for what parameters are expected.
        function reset() {
          var node = apply.apply(null, arguments);

          line = current.line;
          column = current.column;
          value = subvalue + value;

          return node
        }

        // Test the position, after eating, and reverse to a not-eaten state.
        function test() {
          var result = pos({});

          line = current.line;
          column = current.column;
          value = subvalue + value;

          return result.position
        }
      }
    }
  }

  // Check whether a node is mergeable with adjacent nodes.
  function mergeable(node) {
    var start;
    var end;

    if (node.type !== 'text' || !node.position) {
      return true
    }

    start = node.position.start;
    end = node.position.end;

    // Only merge nodes which occupy the same size as their `value`.
    return (
      start.line !== end.line || end.column - start.column === node.value.length
    )
  }

  // Merge two text nodes: `node` into `prev`.
  function mergeText(previous, node) {
    previous.value += node.value;

    return previous
  }

  // Merge two blockquotes: `node` into `prev`, unless in CommonMark or gfm modes.
  function mergeBlockquote(previous, node) {
    if (this.options.commonmark || this.options.gfm) {
      return node
    }

    previous.children = previous.children.concat(node.children);

    return previous
  }

  var markdownEscapes = escapes$1;

  var defaults$2 = [
    '\\',
    '`',
    '*',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!',
    '_',
    '>'
  ];

  var gfm = defaults$2.concat(['~', '|']);

  var commonmark = gfm.concat([
    '\n',
    '"',
    '$',
    '%',
    '&',
    "'",
    ',',
    '/',
    ':',
    ';',
    '<',
    '=',
    '?',
    '@',
    '^'
  ]);

  escapes$1.default = defaults$2;
  escapes$1.gfm = gfm;
  escapes$1.commonmark = commonmark;

  // Get markdown escapes.
  function escapes$1(options) {
    var settings = options || {};

    if (settings.commonmark) {
      return commonmark
    }

    return settings.gfm ? gfm : defaults$2
  }

  var blockElements = [
    'address',
    'article',
    'aside',
    'base',
    'basefont',
    'blockquote',
    'body',
    'caption',
    'center',
    'col',
    'colgroup',
    'dd',
    'details',
    'dialog',
    'dir',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hgroup',
    'hr',
    'html',
    'iframe',
    'legend',
    'li',
    'link',
    'main',
    'menu',
    'menuitem',
    'meta',
    'nav',
    'noframes',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'pre',
    'section',
    'source',
    'title',
    'summary',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'title',
    'tr',
    'track',
    'ul'
  ];

  var defaults$1 = {
    position: true,
    gfm: true,
    commonmark: false,
    pedantic: false,
    blocks: blockElements
  };

  var setOptions_1 = setOptions;

  function setOptions(options) {
    var self = this;
    var current = self.options;
    var key;
    var value;

    if (options == null) {
      options = {};
    } else if (typeof options === 'object') {
      options = immutable(options);
    } else {
      throw new Error('Invalid value `' + options + '` for setting `options`')
    }

    for (key in defaults$1) {
      value = options[key];

      if (value == null) {
        value = current[key];
      }

      if (
        (key !== 'blocks' && typeof value !== 'boolean') ||
        (key === 'blocks' && typeof value !== 'object')
      ) {
        throw new Error(
          'Invalid value `' + value + '` for setting `options.' + key + '`'
        )
      }

      options[key] = value;
    }

    self.options = options;
    self.escape = markdownEscapes(options);

    return self
  }

  var convert_1 = convert$1;

  function convert$1(test) {
    if (test == null) {
      return ok$1
    }

    if (typeof test === 'string') {
      return typeFactory$1(test)
    }

    if (typeof test === 'object') {
      return 'length' in test ? anyFactory$1(test) : allFactory(test)
    }

    if (typeof test === 'function') {
      return test
    }

    throw new Error('Expected function, string, or object as test')
  }

  // Utility assert each property in `test` is represented in `node`, and each
  // values are strictly equal.
  function allFactory(test) {
    return all

    function all(node) {
      var key;

      for (key in test) {
        if (node[key] !== test[key]) return false
      }

      return true
    }
  }

  function anyFactory$1(tests) {
    var checks = [];
    var index = -1;

    while (++index < tests.length) {
      checks[index] = convert$1(tests[index]);
    }

    return any

    function any() {
      var index = -1;

      while (++index < checks.length) {
        if (checks[index].apply(this, arguments)) {
          return true
        }
      }

      return false
    }
  }

  // Utility to convert a string into a function which checks a given node’s type
  // for said string.
  function typeFactory$1(test) {
    return type

    function type(node) {
      return Boolean(node && node.type === test)
    }
  }

  // Utility to return true.
  function ok$1() {
    return true
  }

  var color_browser = identity;
  function identity(d) {
    return d
  }

  var unistUtilVisitParents = visitParents;




  var CONTINUE$1 = true;
  var SKIP$1 = 'skip';
  var EXIT$1 = false;

  visitParents.CONTINUE = CONTINUE$1;
  visitParents.SKIP = SKIP$1;
  visitParents.EXIT = EXIT$1;

  function visitParents(tree, test, visitor, reverse) {
    var step;
    var is;

    if (typeof test === 'function' && typeof visitor !== 'function') {
      reverse = visitor;
      visitor = test;
      test = null;
    }

    is = convert_1(test);
    step = reverse ? -1 : 1;

    factory(tree, null, [])();

    function factory(node, index, parents) {
      var value = typeof node === 'object' && node !== null ? node : {};
      var name;

      if (typeof value.type === 'string') {
        name =
          typeof value.tagName === 'string'
            ? value.tagName
            : typeof value.name === 'string'
            ? value.name
            : undefined;

        visit.displayName =
          'node (' + color_browser(value.type + (name ? '<' + name + '>' : '')) + ')';
      }

      return visit

      function visit() {
        var grandparents = parents.concat(node);
        var result = [];
        var subresult;
        var offset;

        if (!test || is(node, index, parents[parents.length - 1] || null)) {
          result = toResult(visitor(node, parents));

          if (result[0] === EXIT$1) {
            return result
          }
        }

        if (node.children && result[0] !== SKIP$1) {
          offset = (reverse ? node.children.length : -1) + step;

          while (offset > -1 && offset < node.children.length) {
            subresult = factory(node.children[offset], offset, grandparents)();

            if (subresult[0] === EXIT$1) {
              return subresult
            }

            offset =
              typeof subresult[1] === 'number' ? subresult[1] : offset + step;
          }
        }

        return result
      }
    }
  }

  function toResult(value) {
    if (value !== null && typeof value === 'object' && 'length' in value) {
      return value
    }

    if (typeof value === 'number') {
      return [CONTINUE$1, value]
    }

    return [value]
  }

  var unistUtilVisit = visit;



  var CONTINUE = unistUtilVisitParents.CONTINUE;
  var SKIP = unistUtilVisitParents.SKIP;
  var EXIT = unistUtilVisitParents.EXIT;

  visit.CONTINUE = CONTINUE;
  visit.SKIP = SKIP;
  visit.EXIT = EXIT;

  function visit(tree, test, visitor, reverse) {
    if (typeof test === 'function' && typeof visitor !== 'function') {
      reverse = visitor;
      visitor = test;
      test = null;
    }

    unistUtilVisitParents(tree, test, overload, reverse);

    function overload(node, parents) {
      var parent = parents[parents.length - 1];
      var index = parent ? parent.children.indexOf(node) : null;
      return visitor(node, index, parent)
    }
  }

  var unistUtilRemovePosition = removePosition;

  function removePosition(node, force) {
    unistUtilVisit(node, force ? hard : soft);
    return node
  }

  function hard(node) {
    delete node.position;
  }

  function soft(node) {
    node.position = undefined;
  }

  var parse_1$2 = parse$6;

  var lineFeed$i = '\n';
  var lineBreaksExpression = /\r\n|\r/g;

  // Parse the bound file.
  function parse$6() {
    var self = this;
    var value = String(self.file);
    var start = {line: 1, column: 1, offset: 0};
    var content = immutable(start);
    var node;

    // Clean non-unix newlines: `\r\n` and `\r` are all changed to `\n`.
    // This should not affect positional information.
    value = value.replace(lineBreaksExpression, lineFeed$i);

    // BOM.
    if (value.charCodeAt(0) === 0xfeff) {
      value = value.slice(1);

      content.column++;
      content.offset++;
    }

    node = {
      type: 'root',
      children: self.tokenizeBlock(value, content),
      position: {start: start, end: self.eof || immutable(start)}
    };

    if (!self.options.position) {
      unistUtilRemovePosition(node, true);
    }

    return node
  }

  // A line containing no characters, or a line containing only spaces (U+0020) or
  // tabs (U+0009), is called a blank line.
  // See <https://spec.commonmark.org/0.29/#blank-line>.
  var reBlankLine = /^[ \t]*(\n|$)/;

  // Note that though blank lines play a special role in lists to determine
  // whether the list is tight or loose
  // (<https://spec.commonmark.org/0.29/#blank-lines>), it’s done by the list
  // tokenizer and this blank line tokenizer does not have to be responsible for
  // that.
  // Therefore, configs such as `blankLine.notInList` do not have to be set here.
  var blankLine_1 = blankLine;

  function blankLine(eat, value, silent) {
    var match;
    var subvalue = '';
    var index = 0;
    var length = value.length;

    while (index < length) {
      match = reBlankLine.exec(value.slice(index));

      if (match == null) {
        break
      }

      index += match[0].length;
      subvalue += match[0];
    }

    if (subvalue === '') {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    eat(subvalue);
  }

  /*!
   * repeat-string <https://github.com/jonschlinkert/repeat-string>
   *
   * Copyright (c) 2014-2015, Jon Schlinkert.
   * Licensed under the MIT License.
   */

  /**
   * Results cache
   */

  var res = '';
  var cache;

  /**
   * Expose `repeat`
   */

  var repeatString = repeat$1;

  /**
   * Repeat the given `string` the specified `number`
   * of times.
   *
   * **Example:**
   *
   * ```js
   * var repeat = require('repeat-string');
   * repeat('A', 5);
   * //=> AAAAA
   * ```
   *
   * @param {String} `string` The string to repeat
   * @param {Number} `number` The number of times to repeat the string
   * @return {String} Repeated string
   * @api public
   */

  function repeat$1(str, num) {
    if (typeof str !== 'string') {
      throw new TypeError('expected a string');
    }

    // cover common, quick use cases
    if (num === 1) return str;
    if (num === 2) return str + str;

    var max = str.length * num;
    if (cache !== str || typeof cache === 'undefined') {
      cache = str;
      res = '';
    } else if (res.length >= max) {
      return res.substr(0, max);
    }

    while (max > res.length && num > 1) {
      if (num & 1) {
        res += str;
      }

      num >>= 1;
      str += str;
    }

    res += str;
    res = res.substr(0, max);
    return res;
  }

  var trimTrailingLines_1 = trimTrailingLines;

  var line = '\n';

  // Remove final newline characters from `value`.
  function trimTrailingLines(value) {
    var val = String(value);
    var index = val.length;

    while (val.charAt(--index) === line) {
      // Empty
    }

    return val.slice(0, index + 1)
  }

  var codeIndented = indentedCode$1;

  var lineFeed$h = '\n';
  var tab$d = '\t';
  var space$i = ' ';

  var tabSize$4 = 4;
  var codeIndent = repeatString(space$i, tabSize$4);

  function indentedCode$1(eat, value, silent) {
    var index = -1;
    var length = value.length;
    var subvalue = '';
    var content = '';
    var subvalueQueue = '';
    var contentQueue = '';
    var character;
    var blankQueue;
    var indent;

    while (++index < length) {
      character = value.charAt(index);

      if (indent) {
        indent = false;

        subvalue += subvalueQueue;
        content += contentQueue;
        subvalueQueue = '';
        contentQueue = '';

        if (character === lineFeed$h) {
          subvalueQueue = character;
          contentQueue = character;
        } else {
          subvalue += character;
          content += character;

          while (++index < length) {
            character = value.charAt(index);

            if (!character || character === lineFeed$h) {
              contentQueue = character;
              subvalueQueue = character;
              break
            }

            subvalue += character;
            content += character;
          }
        }
      } else if (
        character === space$i &&
        value.charAt(index + 1) === character &&
        value.charAt(index + 2) === character &&
        value.charAt(index + 3) === character
      ) {
        subvalueQueue += codeIndent;
        index += 3;
        indent = true;
      } else if (character === tab$d) {
        subvalueQueue += character;
        indent = true;
      } else {
        blankQueue = '';

        while (character === tab$d || character === space$i) {
          blankQueue += character;
          character = value.charAt(++index);
        }

        if (character !== lineFeed$h) {
          break
        }

        subvalueQueue += blankQueue + character;
        contentQueue += character;
      }
    }

    if (content) {
      if (silent) {
        return true
      }

      return eat(subvalue)({
        type: 'code',
        lang: null,
        meta: null,
        value: trimTrailingLines_1(content)
      })
    }
  }

  var codeFenced = fencedCode;

  var lineFeed$g = '\n';
  var tab$c = '\t';
  var space$h = ' ';
  var tilde$3 = '~';
  var graveAccent$2 = '`';

  var minFenceCount = 3;
  var tabSize$3 = 4;

  function fencedCode(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var length = value.length + 1;
    var index = 0;
    var subvalue = '';
    var fenceCount;
    var marker;
    var character;
    var flag;
    var lang;
    var meta;
    var queue;
    var content;
    var exdentedContent;
    var closing;
    var exdentedClosing;
    var indent;
    var now;

    if (!gfm) {
      return
    }

    // Eat initial spacing.
    while (index < length) {
      character = value.charAt(index);

      if (character !== space$h && character !== tab$c) {
        break
      }

      subvalue += character;
      index++;
    }

    indent = index;

    // Eat the fence.
    character = value.charAt(index);

    if (character !== tilde$3 && character !== graveAccent$2) {
      return
    }

    index++;
    marker = character;
    fenceCount = 1;
    subvalue += character;

    while (index < length) {
      character = value.charAt(index);

      if (character !== marker) {
        break
      }

      subvalue += character;
      fenceCount++;
      index++;
    }

    if (fenceCount < minFenceCount) {
      return
    }

    // Eat spacing before flag.
    while (index < length) {
      character = value.charAt(index);

      if (character !== space$h && character !== tab$c) {
        break
      }

      subvalue += character;
      index++;
    }

    // Eat flag.
    flag = '';
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (
        character === lineFeed$g ||
        (marker === graveAccent$2 && character === marker)
      ) {
        break
      }

      if (character === space$h || character === tab$c) {
        queue += character;
      } else {
        flag += queue + character;
        queue = '';
      }

      index++;
    }

    character = value.charAt(index);

    if (character && character !== lineFeed$g) {
      return
    }

    if (silent) {
      return true
    }

    now = eat.now();
    now.column += subvalue.length;
    now.offset += subvalue.length;

    subvalue += flag;
    flag = self.decode.raw(self.unescape(flag), now);

    if (queue) {
      subvalue += queue;
    }

    queue = '';
    closing = '';
    exdentedClosing = '';
    content = '';
    exdentedContent = '';
    var skip = true;

    // Eat content.
    while (index < length) {
      character = value.charAt(index);
      content += closing;
      exdentedContent += exdentedClosing;
      closing = '';
      exdentedClosing = '';

      if (character !== lineFeed$g) {
        content += character;
        exdentedClosing += character;
        index++;
        continue
      }

      // The first line feed is ignored. Others aren’t.
      if (skip) {
        subvalue += character;
        skip = false;
      } else {
        closing += character;
        exdentedClosing += character;
      }

      queue = '';
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$h) {
          break
        }

        queue += character;
        index++;
      }

      closing += queue;
      exdentedClosing += queue.slice(indent);

      if (queue.length >= tabSize$3) {
        continue
      }

      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character !== marker) {
          break
        }

        queue += character;
        index++;
      }

      closing += queue;
      exdentedClosing += queue;

      if (queue.length < fenceCount) {
        continue
      }

      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$h && character !== tab$c) {
          break
        }

        closing += character;
        exdentedClosing += character;
        index++;
      }

      if (!character || character === lineFeed$g) {
        break
      }
    }

    subvalue += content + closing;

    // Get lang and meta from the flag.
    index = -1;
    length = flag.length;

    while (++index < length) {
      character = flag.charAt(index);

      if (character === space$h || character === tab$c) {
        if (!lang) {
          lang = flag.slice(0, index);
        }
      } else if (lang) {
        meta = flag.slice(index);
        break
      }
    }

    return eat(subvalue)({
      type: 'code',
      lang: lang || flag || null,
      meta: meta || null,
      value: exdentedContent
    })
  }

  var trim_1 = createCommonjsModule(function (module, exports) {
  exports = module.exports = trim;

  function trim(str){
    return str.replace(/^\s*|\s*$/g, '');
  }

  exports.left = function(str){
    return str.replace(/^\s*/, '');
  };

  exports.right = function(str){
    return str.replace(/\s*$/, '');
  };
  });
  trim_1.left;
  trim_1.right;

  var interrupt_1 = interrupt;

  function interrupt(interruptors, tokenizers, ctx, parameters) {
    var length = interruptors.length;
    var index = -1;
    var interruptor;
    var config;

    while (++index < length) {
      interruptor = interruptors[index];
      config = interruptor[1] || {};

      if (
        config.pedantic !== undefined &&
        config.pedantic !== ctx.options.pedantic
      ) {
        continue
      }

      if (
        config.commonmark !== undefined &&
        config.commonmark !== ctx.options.commonmark
      ) {
        continue
      }

      if (tokenizers[interruptor[0]].apply(ctx, parameters)) {
        return true
      }
    }

    return false
  }

  var blockquote_1$1 = blockquote$1;

  var lineFeed$f = '\n';
  var tab$b = '\t';
  var space$g = ' ';
  var greaterThan$4 = '>';

  function blockquote$1(eat, value, silent) {
    var self = this;
    var offsets = self.offset;
    var tokenizers = self.blockTokenizers;
    var interruptors = self.interruptBlockquote;
    var now = eat.now();
    var currentLine = now.line;
    var length = value.length;
    var values = [];
    var contents = [];
    var indents = [];
    var add;
    var index = 0;
    var character;
    var rest;
    var nextIndex;
    var content;
    var line;
    var startIndex;
    var prefixed;
    var exit;

    while (index < length) {
      character = value.charAt(index);

      if (character !== space$g && character !== tab$b) {
        break
      }

      index++;
    }

    if (value.charAt(index) !== greaterThan$4) {
      return
    }

    if (silent) {
      return true
    }

    index = 0;

    while (index < length) {
      nextIndex = value.indexOf(lineFeed$f, index);
      startIndex = index;
      prefixed = false;

      if (nextIndex === -1) {
        nextIndex = length;
      }

      while (index < length) {
        character = value.charAt(index);

        if (character !== space$g && character !== tab$b) {
          break
        }

        index++;
      }

      if (value.charAt(index) === greaterThan$4) {
        index++;
        prefixed = true;

        if (value.charAt(index) === space$g) {
          index++;
        }
      } else {
        index = startIndex;
      }

      content = value.slice(index, nextIndex);

      if (!prefixed && !trim_1(content)) {
        index = startIndex;
        break
      }

      if (!prefixed) {
        rest = value.slice(index);

        // Check if the following code contains a possible block.
        if (interrupt_1(interruptors, tokenizers, self, [eat, rest, true])) {
          break
        }
      }

      line = startIndex === index ? content : value.slice(startIndex, nextIndex);

      indents.push(index - startIndex);
      values.push(line);
      contents.push(content);

      index = nextIndex + 1;
    }

    index = -1;
    length = indents.length;
    add = eat(values.join(lineFeed$f));

    while (++index < length) {
      offsets[currentLine] = (offsets[currentLine] || 0) + indents[index];
      currentLine++;
    }

    exit = self.enterBlock();
    contents = self.tokenizeBlock(contents.join(lineFeed$f), now);
    exit();

    return add({type: 'blockquote', children: contents})
  }

  var headingAtx = atxHeading;

  var lineFeed$e = '\n';
  var tab$a = '\t';
  var space$f = ' ';
  var numberSign = '#';

  var maxFenceCount = 6;

  function atxHeading(eat, value, silent) {
    var self = this;
    var pedantic = self.options.pedantic;
    var length = value.length + 1;
    var index = -1;
    var now = eat.now();
    var subvalue = '';
    var content = '';
    var character;
    var queue;
    var depth;

    // Eat initial spacing.
    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$f && character !== tab$a) {
        index--;
        break
      }

      subvalue += character;
    }

    // Eat hashes.
    depth = 0;

    while (++index <= length) {
      character = value.charAt(index);

      if (character !== numberSign) {
        index--;
        break
      }

      subvalue += character;
      depth++;
    }

    if (depth > maxFenceCount) {
      return
    }

    if (!depth || (!pedantic && value.charAt(index + 1) === numberSign)) {
      return
    }

    length = value.length + 1;

    // Eat intermediate white-space.
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$f && character !== tab$a) {
        index--;
        break
      }

      queue += character;
    }

    // Exit when not in pedantic mode without spacing.
    if (!pedantic && queue.length === 0 && character && character !== lineFeed$e) {
      return
    }

    if (silent) {
      return true
    }

    // Eat content.
    subvalue += queue;
    queue = '';
    content = '';

    while (++index < length) {
      character = value.charAt(index);

      if (!character || character === lineFeed$e) {
        break
      }

      if (character !== space$f && character !== tab$a && character !== numberSign) {
        content += queue + character;
        queue = '';
        continue
      }

      while (character === space$f || character === tab$a) {
        queue += character;
        character = value.charAt(++index);
      }

      // `#` without a queue is part of the content.
      if (!pedantic && content && !queue && character === numberSign) {
        content += character;
        continue
      }

      while (character === numberSign) {
        queue += character;
        character = value.charAt(++index);
      }

      while (character === space$f || character === tab$a) {
        queue += character;
        character = value.charAt(++index);
      }

      index--;
    }

    now.column += subvalue.length;
    now.offset += subvalue.length;
    subvalue += content + queue;

    return eat(subvalue)({
      type: 'heading',
      depth: depth,
      children: self.tokenizeInline(content, now)
    })
  }

  var thematicBreak_1$1 = thematicBreak$1;

  var tab$9 = '\t';
  var lineFeed$d = '\n';
  var space$e = ' ';
  var asterisk$4 = '*';
  var dash$7 = '-';
  var underscore$6 = '_';

  var maxCount = 3;

  function thematicBreak$1(eat, value, silent) {
    var index = -1;
    var length = value.length + 1;
    var subvalue = '';
    var character;
    var marker;
    var markerCount;
    var queue;

    while (++index < length) {
      character = value.charAt(index);

      if (character !== tab$9 && character !== space$e) {
        break
      }

      subvalue += character;
    }

    if (
      character !== asterisk$4 &&
      character !== dash$7 &&
      character !== underscore$6
    ) {
      return
    }

    marker = character;
    subvalue += character;
    markerCount = 1;
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character === marker) {
        markerCount++;
        subvalue += queue + marker;
        queue = '';
      } else if (character === space$e) {
        queue += character;
      } else if (
        markerCount >= maxCount &&
        (!character || character === lineFeed$d)
      ) {
        subvalue += queue;

        if (silent) {
          return true
        }

        return eat(subvalue)({type: 'thematicBreak'})
      } else {
        return
      }
    }
  }

  var getIndentation = indentation$1;

  var tab$8 = '\t';
  var space$d = ' ';

  var spaceSize = 1;
  var tabSize$2 = 4;

  // Gets indentation information for a line.
  function indentation$1(value) {
    var index = 0;
    var indent = 0;
    var character = value.charAt(index);
    var stops = {};
    var size;
    var lastIndent = 0;

    while (character === tab$8 || character === space$d) {
      size = character === tab$8 ? tabSize$2 : spaceSize;

      indent += size;

      if (size > 1) {
        indent = Math.floor(indent / size) * size;
      }

      while (lastIndent < indent) {
        stops[++lastIndent] = index;
      }

      character = value.charAt(++index);
    }

    return {indent: indent, stops: stops}
  }

  var removeIndentation = indentation;

  var lineFeed$c = '\n';
  var space$c = ' ';
  var exclamationMark$4 = '!';

  // Remove the minimum indent from every line in `value`.  Supports both tab,
  // spaced, and mixed indentation (as well as possible).
  function indentation(value, maximum) {
    var values = value.split(lineFeed$c);
    var position = values.length + 1;
    var minIndent = Infinity;
    var matrix = [];
    var index;
    var indentation;
    var stops;

    values.unshift(repeatString(space$c, maximum) + exclamationMark$4);

    while (position--) {
      indentation = getIndentation(values[position]);

      matrix[position] = indentation.stops;

      if (trim_1(values[position]).length === 0) {
        continue
      }

      if (indentation.indent) {
        if (indentation.indent > 0 && indentation.indent < minIndent) {
          minIndent = indentation.indent;
        }
      } else {
        minIndent = Infinity;

        break
      }
    }

    if (minIndent !== Infinity) {
      position = values.length;

      while (position--) {
        stops = matrix[position];
        index = minIndent;

        while (index && !(index in stops)) {
          index--;
        }

        values[position] = values[position].slice(stops[index] + 1);
      }
    }

    values.shift();

    return values.join(lineFeed$c)
  }

  var list_1$1 = list$1;

  var asterisk$3 = '*';
  var underscore$5 = '_';
  var plusSign$2 = '+';
  var dash$6 = '-';
  var dot$3 = '.';
  var space$b = ' ';
  var lineFeed$b = '\n';
  var tab$7 = '\t';
  var rightParenthesis$3 = ')';
  var lowercaseX = 'x';

  var tabSize$1 = 4;
  var looseListItemExpression = /\n\n(?!\s*$)/;
  var taskItemExpression = /^\[([ X\tx])][ \t]/;
  var bulletExpression = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/;
  var pedanticBulletExpression = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
  var initialIndentExpression = /^( {1,4}|\t)?/gm;

  function list$1(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var pedantic = self.options.pedantic;
    var tokenizers = self.blockTokenizers;
    var interuptors = self.interruptList;
    var index = 0;
    var length = value.length;
    var start = null;
    var size;
    var queue;
    var ordered;
    var character;
    var marker;
    var nextIndex;
    var startIndex;
    var prefixed;
    var currentMarker;
    var content;
    var line;
    var previousEmpty;
    var empty;
    var items;
    var allLines;
    var emptyLines;
    var item;
    var enterTop;
    var exitBlockquote;
    var spread = false;
    var node;
    var now;
    var end;
    var indented;

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$7 && character !== space$b) {
        break
      }

      index++;
    }

    character = value.charAt(index);

    if (character === asterisk$3 || character === plusSign$2 || character === dash$6) {
      marker = character;
      ordered = false;
    } else {
      ordered = true;
      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (!isDecimal(character)) {
          break
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (
        !queue ||
        !(character === dot$3 || (commonmark && character === rightParenthesis$3))
      ) {
        return
      }

      /* Slightly abusing `silent` mode, whose goal is to make interrupting
       * paragraphs work.
       * Well, that’s exactly what we want to do here: don’t interrupt:
       * 2. here, because the “list” doesn’t start with `1`. */
      if (silent && queue !== '1') {
        return
      }

      start = parseInt(queue, 10);
      marker = character;
    }

    character = value.charAt(++index);

    if (
      character !== space$b &&
      character !== tab$7 &&
      (pedantic || (character !== lineFeed$b && character !== ''))
    ) {
      return
    }

    if (silent) {
      return true
    }

    index = 0;
    items = [];
    allLines = [];
    emptyLines = [];

    while (index < length) {
      nextIndex = value.indexOf(lineFeed$b, index);
      startIndex = index;
      prefixed = false;
      indented = false;

      if (nextIndex === -1) {
        nextIndex = length;
      }

      size = 0;

      while (index < length) {
        character = value.charAt(index);

        if (character === tab$7) {
          size += tabSize$1 - (size % tabSize$1);
        } else if (character === space$b) {
          size++;
        } else {
          break
        }

        index++;
      }

      if (item && size >= item.indent) {
        indented = true;
      }

      character = value.charAt(index);
      currentMarker = null;

      if (!indented) {
        if (
          character === asterisk$3 ||
          character === plusSign$2 ||
          character === dash$6
        ) {
          currentMarker = character;
          index++;
          size++;
        } else {
          queue = '';

          while (index < length) {
            character = value.charAt(index);

            if (!isDecimal(character)) {
              break
            }

            queue += character;
            index++;
          }

          character = value.charAt(index);
          index++;

          if (
            queue &&
            (character === dot$3 || (commonmark && character === rightParenthesis$3))
          ) {
            currentMarker = character;
            size += queue.length + 1;
          }
        }

        if (currentMarker) {
          character = value.charAt(index);

          if (character === tab$7) {
            size += tabSize$1 - (size % tabSize$1);
            index++;
          } else if (character === space$b) {
            end = index + tabSize$1;

            while (index < end) {
              if (value.charAt(index) !== space$b) {
                break
              }

              index++;
              size++;
            }

            if (index === end && value.charAt(index) === space$b) {
              index -= tabSize$1 - 1;
              size -= tabSize$1 - 1;
            }
          } else if (character !== lineFeed$b && character !== '') {
            currentMarker = null;
          }
        }
      }

      if (currentMarker) {
        if (!pedantic && marker !== currentMarker) {
          break
        }

        prefixed = true;
      } else {
        if (!commonmark && !indented && value.charAt(startIndex) === space$b) {
          indented = true;
        } else if (commonmark && item) {
          indented = size >= item.indent || size > tabSize$1;
        }

        prefixed = false;
        index = startIndex;
      }

      line = value.slice(startIndex, nextIndex);
      content = startIndex === index ? line : value.slice(index, nextIndex);

      if (
        currentMarker === asterisk$3 ||
        currentMarker === underscore$5 ||
        currentMarker === dash$6
      ) {
        if (tokenizers.thematicBreak.call(self, eat, line, true)) {
          break
        }
      }

      previousEmpty = empty;
      empty = !prefixed && !trim_1(content).length;

      if (indented && item) {
        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (prefixed) {
        if (emptyLines.length !== 0) {
          spread = true;
          item.value.push('');
          item.trail = emptyLines.concat();
        }

        item = {
          value: [line],
          indent: size,
          trail: []
        };

        items.push(item);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (empty) {
        if (previousEmpty && !commonmark) {
          break
        }

        emptyLines.push(line);
      } else {
        if (previousEmpty) {
          break
        }

        if (interrupt_1(interuptors, tokenizers, self, [eat, line, true])) {
          break
        }

        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      }

      index = nextIndex + 1;
    }

    node = eat(allLines.join(lineFeed$b)).reset({
      type: 'list',
      ordered: ordered,
      start: start,
      spread: spread,
      children: []
    });

    enterTop = self.enterList();
    exitBlockquote = self.enterBlock();
    index = -1;
    length = items.length;

    while (++index < length) {
      item = items[index].value.join(lineFeed$b);
      now = eat.now();

      eat(item)(listItem$2(self, item, now), node);

      item = items[index].trail.join(lineFeed$b);

      if (index !== length - 1) {
        item += lineFeed$b;
      }

      eat(item);
    }

    enterTop();
    exitBlockquote();

    return node
  }

  function listItem$2(ctx, value, position) {
    var offsets = ctx.offset;
    var fn = ctx.options.pedantic ? pedanticListItem : normalListItem;
    var checked = null;
    var task;
    var indent;

    value = fn.apply(null, arguments);

    if (ctx.options.gfm) {
      task = value.match(taskItemExpression);

      if (task) {
        indent = task[0].length;
        checked = task[1].toLowerCase() === lowercaseX;
        offsets[position.line] += indent;
        value = value.slice(indent);
      }
    }

    return {
      type: 'listItem',
      spread: looseListItemExpression.test(value),
      checked: checked,
      children: ctx.tokenizeBlock(value, position)
    }
  }

  // Create a list-item using overly simple mechanics.
  function pedanticListItem(ctx, value, position) {
    var offsets = ctx.offset;
    var line = position.line;

    // Remove the list-item’s bullet.
    value = value.replace(pedanticBulletExpression, replacer);

    // The initial line was also matched by the below, so we reset the `line`.
    line = position.line;

    return value.replace(initialIndentExpression, replacer)

    // A simple replacer which removed all matches, and adds their length to
    // `offset`.
    function replacer($0) {
      offsets[line] = (offsets[line] || 0) + $0.length;
      line++;

      return ''
    }
  }

  // Create a list-item using sane mechanics.
  function normalListItem(ctx, value, position) {
    var offsets = ctx.offset;
    var line = position.line;
    var max;
    var bullet;
    var rest;
    var lines;
    var trimmedLines;
    var index;
    var length;

    // Remove the list-item’s bullet.
    value = value.replace(bulletExpression, replacer);

    lines = value.split(lineFeed$b);

    trimmedLines = removeIndentation(value, getIndentation(max).indent).split(lineFeed$b);

    // We replaced the initial bullet with something else above, which was used
    // to trick `removeIndentation` into removing some more characters when
    // possible.  However, that could result in the initial line to be stripped
    // more than it should be.
    trimmedLines[0] = rest;

    offsets[line] = (offsets[line] || 0) + bullet.length;
    line++;

    index = 0;
    length = lines.length;

    while (++index < length) {
      offsets[line] =
        (offsets[line] || 0) + lines[index].length - trimmedLines[index].length;
      line++;
    }

    return trimmedLines.join(lineFeed$b)

    /* eslint-disable-next-line max-params */
    function replacer($0, $1, $2, $3, $4) {
      bullet = $1 + $2 + $3;
      rest = $4;

      // Make sure that the first nine numbered list items can indent with an
      // extra space.  That is, when the bullet did not receive an extra final
      // space.
      if (Number($2) < 10 && bullet.length % 2 === 1) {
        $2 = space$b + $2;
      }

      max = $1 + repeatString(space$b, $2.length) + $3;

      return max + rest
    }
  }

  var headingSetext = setextHeading;

  var lineFeed$a = '\n';
  var tab$6 = '\t';
  var space$a = ' ';
  var equalsTo$1 = '=';
  var dash$5 = '-';

  var maxIndent = 3;

  var equalsToDepth = 1;
  var dashDepth = 2;

  function setextHeading(eat, value, silent) {
    var self = this;
    var now = eat.now();
    var length = value.length;
    var index = -1;
    var subvalue = '';
    var content;
    var queue;
    var character;
    var marker;
    var depth;

    // Eat initial indentation.
    while (++index < length) {
      character = value.charAt(index);

      if (character !== space$a || index >= maxIndent) {
        index--;
        break
      }

      subvalue += character;
    }

    // Eat content.
    content = '';
    queue = '';

    while (++index < length) {
      character = value.charAt(index);

      if (character === lineFeed$a) {
        index--;
        break
      }

      if (character === space$a || character === tab$6) {
        queue += character;
      } else {
        content += queue + character;
        queue = '';
      }
    }

    now.column += subvalue.length;
    now.offset += subvalue.length;
    subvalue += content + queue;

    // Ensure the content is followed by a newline and a valid marker.
    character = value.charAt(++index);
    marker = value.charAt(++index);

    if (character !== lineFeed$a || (marker !== equalsTo$1 && marker !== dash$5)) {
      return
    }

    subvalue += character;

    // Eat Setext-line.
    queue = marker;
    depth = marker === equalsTo$1 ? equalsToDepth : dashDepth;

    while (++index < length) {
      character = value.charAt(index);

      if (character !== marker) {
        if (character !== lineFeed$a) {
          return
        }

        index--;
        break
      }

      queue += character;
    }

    if (silent) {
      return true
    }

    return eat(subvalue + queue)({
      type: 'heading',
      depth: depth,
      children: self.tokenizeInline(content, now)
    })
  }

  var attributeName$2 = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  var unquoted$2 = '[^"\'=<>`\\u0000-\\u0020]+';
  var singleQuoted$2 = "'[^']*'";
  var doubleQuoted$2 = '"[^"]*"';
  var attributeValue$2 =
    '(?:' + unquoted$2 + '|' + singleQuoted$2 + '|' + doubleQuoted$2 + ')';
  var attribute$2 =
    '(?:\\s+' + attributeName$2 + '(?:\\s*=\\s*' + attributeValue$2 + ')?)';
  var openTag$1 = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute$2 + '*\\s*\\/?>';
  var closeTag$1 = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
  var comment$1 = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
  var processing = '<[?].*?[?]>';
  var declaration = '<![A-Za-z]+\\s+[^>]*>';
  var cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

  var openCloseTag$2 = new RegExp('^(?:' + openTag$1 + '|' + closeTag$1 + ')');

  var tag$2 = new RegExp(
    '^(?:' +
      openTag$1 +
      '|' +
      closeTag$1 +
      '|' +
      comment$1 +
      '|' +
      processing +
      '|' +
      declaration +
      '|' +
      cdata +
      ')'
  );

  var html$4 = {
  	openCloseTag: openCloseTag$2,
  	tag: tag$2
  };

  var openCloseTag$1 = html$4.openCloseTag;

  var htmlBlock = blockHtml$1;

  var tab$5 = '\t';
  var space$9 = ' ';
  var lineFeed$9 = '\n';
  var lessThan$7 = '<';

  var rawOpenExpression$1 = /^<(script|pre|style)(?=(\s|>|$))/i;
  var rawCloseExpression$1 = /<\/(script|pre|style)>/i;
  var commentOpenExpression$1 = /^<!--/;
  var commentCloseExpression$1 = /-->/;
  var instructionOpenExpression$1 = /^<\?/;
  var instructionCloseExpression$1 = /\?>/;
  var directiveOpenExpression$1 = /^<![A-Za-z]/;
  var directiveCloseExpression$1 = />/;
  var cdataOpenExpression$1 = /^<!\[CDATA\[/;
  var cdataCloseExpression$1 = /]]>/;
  var elementCloseExpression$1 = /^$/;
  var otherElementOpenExpression$1 = new RegExp(openCloseTag$1.source + '\\s*$');

  function blockHtml$1(eat, value, silent) {
    var self = this;
    var blocks = self.options.blocks.join('|');
    var elementOpenExpression = new RegExp(
      '^</?(' + blocks + ')(?=(\\s|/?>|$))',
      'i'
    );
    var length = value.length;
    var index = 0;
    var next;
    var line;
    var offset;
    var character;
    var count;
    var sequence;
    var subvalue;

    var sequences = [
      [rawOpenExpression$1, rawCloseExpression$1, true],
      [commentOpenExpression$1, commentCloseExpression$1, true],
      [instructionOpenExpression$1, instructionCloseExpression$1, true],
      [directiveOpenExpression$1, directiveCloseExpression$1, true],
      [cdataOpenExpression$1, cdataCloseExpression$1, true],
      [elementOpenExpression, elementCloseExpression$1, true],
      [otherElementOpenExpression$1, elementCloseExpression$1, false]
    ];

    // Eat initial spacing.
    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$5 && character !== space$9) {
        break
      }

      index++;
    }

    if (value.charAt(index) !== lessThan$7) {
      return
    }

    next = value.indexOf(lineFeed$9, index + 1);
    next = next === -1 ? length : next;
    line = value.slice(index, next);
    offset = -1;
    count = sequences.length;

    while (++offset < count) {
      if (sequences[offset][0].test(line)) {
        sequence = sequences[offset];
        break
      }
    }

    if (!sequence) {
      return
    }

    if (silent) {
      return sequence[2]
    }

    index = next;

    if (!sequence[1].test(line)) {
      while (index < length) {
        next = value.indexOf(lineFeed$9, index + 1);
        next = next === -1 ? length : next;
        line = value.slice(index + 1, next);

        if (sequence[1].test(line)) {
          if (line) {
            index = next;
          }

          break
        }

        index = next;
      }
    }

    subvalue = value.slice(0, index);

    return eat(subvalue)({type: 'html', value: subvalue})
  }

  var isWhitespaceCharacter = whitespace$1;

  var fromCode$1 = String.fromCharCode;
  var re$2 = /\s/;

  // Check if the given character code, or the character code at the first
  // character, is a whitespace character.
  function whitespace$1(character) {
    return re$2.test(
      typeof character === 'number' ? fromCode$1(character) : character.charAt(0)
    )
  }

  var collapseWhiteSpace = collapse;

  // `collapse(' \t\nbar \nbaz\t') // ' bar baz '`
  function collapse(value) {
    return String(value).replace(/\s+/g, ' ')
  }

  var normalize_1$1 = normalize$1;

  // Normalize an identifier.  Collapses multiple white space characters into a
  // single space, and removes casing.
  function normalize$1(value) {
    return collapseWhiteSpace(value).toLowerCase()
  }

  var definition_1 = definition;

  var quotationMark$2 = '"';
  var apostrophe$3 = "'";
  var backslash$6 = '\\';
  var lineFeed$8 = '\n';
  var tab$4 = '\t';
  var space$8 = ' ';
  var leftSquareBracket$2 = '[';
  var rightSquareBracket$2 = ']';
  var leftParenthesis$1 = '(';
  var rightParenthesis$2 = ')';
  var colon$2 = ':';
  var lessThan$6 = '<';
  var greaterThan$3 = '>';

  function definition(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var index = 0;
    var length = value.length;
    var subvalue = '';
    var beforeURL;
    var beforeTitle;
    var queue;
    var character;
    var test;
    var identifier;
    var url;
    var title;

    while (index < length) {
      character = value.charAt(index);

      if (character !== space$8 && character !== tab$4) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);

    if (character !== leftSquareBracket$2) {
      return
    }

    index++;
    subvalue += character;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character === rightSquareBracket$2) {
        break
      } else if (character === backslash$6) {
        queue += character;
        index++;
        character = value.charAt(index);
      }

      queue += character;
      index++;
    }

    if (
      !queue ||
      value.charAt(index) !== rightSquareBracket$2 ||
      value.charAt(index + 1) !== colon$2
    ) {
      return
    }

    identifier = queue;
    subvalue += queue + rightSquareBracket$2 + colon$2;
    index = subvalue.length;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$4 && character !== space$8 && character !== lineFeed$8) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);
    queue = '';
    beforeURL = subvalue;

    if (character === lessThan$6) {
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (!isEnclosedURLCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (character === isEnclosedURLCharacter.delimiter) {
        subvalue += lessThan$6 + queue + character;
        index++;
      } else {
        if (commonmark) {
          return
        }

        index -= queue.length + 1;
        queue = '';
      }
    }

    if (!queue) {
      while (index < length) {
        character = value.charAt(index);

        if (!isUnclosedURLCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }

      subvalue += queue;
    }

    if (!queue) {
      return
    }

    url = queue;
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$4 && character !== space$8 && character !== lineFeed$8) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);
    test = null;

    if (character === quotationMark$2) {
      test = quotationMark$2;
    } else if (character === apostrophe$3) {
      test = apostrophe$3;
    } else if (character === leftParenthesis$1) {
      test = rightParenthesis$2;
    }

    if (!test) {
      queue = '';
      index = subvalue.length;
    } else if (queue) {
      subvalue += queue + character;
      index = subvalue.length;
      queue = '';

      while (index < length) {
        character = value.charAt(index);

        if (character === test) {
          break
        }

        if (character === lineFeed$8) {
          index++;
          character = value.charAt(index);

          if (character === lineFeed$8 || character === test) {
            return
          }

          queue += lineFeed$8;
        }

        queue += character;
        index++;
      }

      character = value.charAt(index);

      if (character !== test) {
        return
      }

      beforeTitle = subvalue;
      subvalue += queue + character;
      index++;
      title = queue;
      queue = '';
    } else {
      return
    }

    while (index < length) {
      character = value.charAt(index);

      if (character !== tab$4 && character !== space$8) {
        break
      }

      subvalue += character;
      index++;
    }

    character = value.charAt(index);

    if (!character || character === lineFeed$8) {
      if (silent) {
        return true
      }

      beforeURL = eat(beforeURL).test().end;
      url = self.decode.raw(self.unescape(url), beforeURL, {nonTerminated: false});

      if (title) {
        beforeTitle = eat(beforeTitle).test().end;
        title = self.decode.raw(self.unescape(title), beforeTitle);
      }

      return eat(subvalue)({
        type: 'definition',
        identifier: normalize_1$1(identifier),
        label: identifier,
        title: title || null,
        url: url
      })
    }
  }

  // Check if `character` can be inside an enclosed URI.
  function isEnclosedURLCharacter(character) {
    return (
      character !== greaterThan$3 &&
      character !== leftSquareBracket$2 &&
      character !== rightSquareBracket$2
    )
  }

  isEnclosedURLCharacter.delimiter = greaterThan$3;

  // Check if `character` can be inside an unclosed URI.
  function isUnclosedURLCharacter(character) {
    return (
      character !== leftSquareBracket$2 &&
      character !== rightSquareBracket$2 &&
      !isWhitespaceCharacter(character)
    )
  }

  var table_1$1 = table$1;

  var tab$3 = '\t';
  var lineFeed$7 = '\n';
  var space$7 = ' ';
  var dash$4 = '-';
  var colon$1 = ':';
  var backslash$5 = '\\';
  var verticalBar = '|';

  var minColumns = 1;
  var minRows = 2;

  var left = 'left';
  var center = 'center';
  var right = 'right';

  function table$1(eat, value, silent) {
    var self = this;
    var index;
    var alignments;
    var alignment;
    var subvalue;
    var row;
    var length;
    var lines;
    var queue;
    var character;
    var hasDash;
    var align;
    var cell;
    var preamble;
    var now;
    var position;
    var lineCount;
    var line;
    var rows;
    var table;
    var lineIndex;
    var pipeIndex;
    var first;

    // Exit when not in gfm-mode.
    if (!self.options.gfm) {
      return
    }

    // Get the rows.
    // Detecting tables soon is hard, so there are some checks for performance
    // here, such as the minimum number of rows, and allowed characters in the
    // alignment row.
    index = 0;
    lineCount = 0;
    length = value.length + 1;
    lines = [];

    while (index < length) {
      lineIndex = value.indexOf(lineFeed$7, index);
      pipeIndex = value.indexOf(verticalBar, index + 1);

      if (lineIndex === -1) {
        lineIndex = value.length;
      }

      if (pipeIndex === -1 || pipeIndex > lineIndex) {
        if (lineCount < minRows) {
          return
        }

        break
      }

      lines.push(value.slice(index, lineIndex));
      lineCount++;
      index = lineIndex + 1;
    }

    // Parse the alignment row.
    subvalue = lines.join(lineFeed$7);
    alignments = lines.splice(1, 1)[0] || [];
    index = 0;
    length = alignments.length;
    lineCount--;
    alignment = false;
    align = [];

    while (index < length) {
      character = alignments.charAt(index);

      if (character === verticalBar) {
        hasDash = null;

        if (alignment === false) {
          if (first === false) {
            return
          }
        } else {
          align.push(alignment);
          alignment = false;
        }

        first = false;
      } else if (character === dash$4) {
        hasDash = true;
        alignment = alignment || null;
      } else if (character === colon$1) {
        if (alignment === left) {
          alignment = center;
        } else if (hasDash && alignment === null) {
          alignment = right;
        } else {
          alignment = left;
        }
      } else if (!isWhitespaceCharacter(character)) {
        return
      }

      index++;
    }

    if (alignment !== false) {
      align.push(alignment);
    }

    // Exit when without enough columns.
    if (align.length < minColumns) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    // Parse the rows.
    position = -1;
    rows = [];

    table = eat(subvalue).reset({type: 'table', align: align, children: rows});

    while (++position < lineCount) {
      line = lines[position];
      row = {type: 'tableRow', children: []};

      // Eat a newline character when this is not the first row.
      if (position) {
        eat(lineFeed$7);
      }

      // Eat the row.
      eat(line).reset(row, table);

      length = line.length + 1;
      index = 0;
      queue = '';
      cell = '';
      preamble = true;

      while (index < length) {
        character = line.charAt(index);

        if (character === tab$3 || character === space$7) {
          if (cell) {
            queue += character;
          } else {
            eat(character);
          }

          index++;
          continue
        }

        if (character === '' || character === verticalBar) {
          if (preamble) {
            eat(character);
          } else {
            if ((cell || character) && !preamble) {
              subvalue = cell;

              if (queue.length > 1) {
                if (character) {
                  subvalue += queue.slice(0, -1);
                  queue = queue.charAt(queue.length - 1);
                } else {
                  subvalue += queue;
                  queue = '';
                }
              }

              now = eat.now();

              eat(subvalue)(
                {type: 'tableCell', children: self.tokenizeInline(cell, now)},
                row
              );
            }

            eat(queue + character);

            queue = '';
            cell = '';
          }
        } else {
          if (queue) {
            cell += queue;
            queue = '';
          }

          cell += character;

          if (character === backslash$5 && index !== length - 2) {
            cell += line.charAt(index + 1);
            index++;
          }
        }

        preamble = false;
        index++;
      }

      // Eat the alignment row.
      if (!position) {
        eat(lineFeed$7 + alignments);
      }
    }

    return table
  }

  var paragraph_1$1 = paragraph$1;

  var tab$2 = '\t';
  var lineFeed$6 = '\n';
  var space$6 = ' ';

  var tabSize = 4;

  // Tokenise paragraph.
  function paragraph$1(eat, value, silent) {
    var self = this;
    var settings = self.options;
    var commonmark = settings.commonmark;
    var tokenizers = self.blockTokenizers;
    var interruptors = self.interruptParagraph;
    var index = value.indexOf(lineFeed$6);
    var length = value.length;
    var position;
    var subvalue;
    var character;
    var size;
    var now;

    while (index < length) {
      // Eat everything if there’s no following newline.
      if (index === -1) {
        index = length;
        break
      }

      // Stop if the next character is NEWLINE.
      if (value.charAt(index + 1) === lineFeed$6) {
        break
      }

      // In commonmark-mode, following indented lines are part of the paragraph.
      if (commonmark) {
        size = 0;
        position = index + 1;

        while (position < length) {
          character = value.charAt(position);

          if (character === tab$2) {
            size = tabSize;
            break
          } else if (character === space$6) {
            size++;
          } else {
            break
          }

          position++;
        }

        if (size >= tabSize && character !== lineFeed$6) {
          index = value.indexOf(lineFeed$6, index + 1);
          continue
        }
      }

      subvalue = value.slice(index + 1);

      // Check if the following code contains a possible block.
      if (interrupt_1(interruptors, tokenizers, self, [eat, subvalue, true])) {
        break
      }

      position = index;
      index = value.indexOf(lineFeed$6, index + 1);

      if (index !== -1 && trim_1(value.slice(position, index)) === '') {
        index = position;
        break
      }
    }

    subvalue = value.slice(0, index);

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    now = eat.now();
    subvalue = trimTrailingLines_1(subvalue);

    return eat(subvalue)({
      type: 'paragraph',
      children: self.tokenizeInline(subvalue, now)
    })
  }

  var _escape$1 = locate$9;

  function locate$9(value, fromIndex) {
    return value.indexOf('\\', fromIndex)
  }

  var _escape = escape$1;
  escape$1.locator = _escape$1;

  var lineFeed$5 = '\n';
  var backslash$4 = '\\';

  function escape$1(eat, value, silent) {
    var self = this;
    var character;
    var node;

    if (value.charAt(0) === backslash$4) {
      character = value.charAt(1);

      if (self.escape.indexOf(character) !== -1) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        if (character === lineFeed$5) {
          node = {type: 'break'};
        } else {
          node = {type: 'text', value: character};
        }

        return eat(backslash$4 + character)(node)
      }
    }
  }

  var tag$1 = locate$8;

  function locate$8(value, fromIndex) {
    return value.indexOf('<', fromIndex)
  }

  var autoLink_1 = autoLink;
  autoLink.locator = tag$1;
  autoLink.notInLink = true;

  var lessThan$5 = '<';
  var greaterThan$2 = '>';
  var atSign$1 = '@';
  var slash$3 = '/';
  var mailto = 'mailto:';
  var mailtoLength = mailto.length;

  function autoLink(eat, value, silent) {
    var self = this;
    var subvalue = '';
    var length = value.length;
    var index = 0;
    var queue = '';
    var hasAtCharacter = false;
    var link = '';
    var character;
    var now;
    var content;
    var tokenizers;
    var exit;

    if (value.charAt(0) !== lessThan$5) {
      return
    }

    index++;
    subvalue = lessThan$5;

    while (index < length) {
      character = value.charAt(index);

      if (
        isWhitespaceCharacter(character) ||
        character === greaterThan$2 ||
        character === atSign$1 ||
        (character === ':' && value.charAt(index + 1) === slash$3)
      ) {
        break
      }

      queue += character;
      index++;
    }

    if (!queue) {
      return
    }

    link += queue;
    queue = '';

    character = value.charAt(index);
    link += character;
    index++;

    if (character === atSign$1) {
      hasAtCharacter = true;
    } else {
      if (character !== ':' || value.charAt(index + 1) !== slash$3) {
        return
      }

      link += slash$3;
      index++;
    }

    while (index < length) {
      character = value.charAt(index);

      if (isWhitespaceCharacter(character) || character === greaterThan$2) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);

    if (!queue || character !== greaterThan$2) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    link += queue;
    content = link;
    subvalue += link + character;
    now = eat.now();
    now.column++;
    now.offset++;

    if (hasAtCharacter) {
      if (link.slice(0, mailtoLength).toLowerCase() === mailto) {
        content = content.slice(mailtoLength);
        now.column += mailtoLength;
        now.offset += mailtoLength;
      } else {
        link = mailto + link;
      }
    }

    // Temporarily remove all tokenizers except text in autolinks.
    tokenizers = self.inlineTokenizers;
    self.inlineTokenizers = {text: tokenizers.text};

    exit = self.enterLink();

    content = self.tokenizeInline(content, now);

    self.inlineTokenizers = tokenizers;
    exit();

    return eat(subvalue)({
      type: 'link',
      title: null,
      url: parseEntities_1(link, {nonTerminated: false}),
      children: content
    })
  }

  var ccount_1 = ccount;

  function ccount(value, character) {
    var val = String(value);
    var count = 0;
    var index;

    if (typeof character !== 'string' || character.length !== 1) {
      throw new Error('Expected character')
    }

    index = val.indexOf(character);

    while (index !== -1) {
      count++;
      index = val.indexOf(character, index + 1);
    }

    return count
  }

  var url$1 = locate$7;

  var values = ['www.', 'http://', 'https://'];

  function locate$7(value, fromIndex) {
    var min = -1;
    var index;
    var length;
    var position;

    if (!this.options.gfm) {
      return min
    }

    length = values.length;
    index = -1;

    while (++index < length) {
      position = value.indexOf(values[index], fromIndex);

      if (position !== -1 && (min === -1 || position < min)) {
        min = position;
      }
    }

    return min
  }

  var url_1 = url;
  url.locator = url$1;
  url.notInLink = true;

  var exclamationMark$3 = 33; // '!'
  var ampersand = 38; // '&'
  var rightParenthesis$1 = 41; // ')'
  var asterisk$2 = 42; // '*'
  var comma$1 = 44; // ','
  var dash$3 = 45; // '-'
  var dot$2 = 46; // '.'
  var colon = 58; // ':'
  var semicolon = 59; // ';'
  var questionMark$1 = 63; // '?'
  var lessThan$4 = 60; // '<'
  var underscore$4 = 95; // '_'
  var tilde$2 = 126; // '~'

  var leftParenthesisCharacter = '(';
  var rightParenthesisCharacter = ')';

  function url(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var tokenizers = self.inlineTokenizers;
    var length = value.length;
    var previousDot = -1;
    var protocolless = false;
    var dots;
    var lastTwoPartsStart;
    var start;
    var index;
    var pathStart;
    var path;
    var code;
    var end;
    var leftCount;
    var rightCount;
    var content;
    var children;
    var url;
    var exit;

    if (!gfm) {
      return
    }

    // `WWW.` doesn’t work.
    if (value.slice(0, 4) === 'www.') {
      protocolless = true;
      index = 4;
    } else if (value.slice(0, 7).toLowerCase() === 'http://') {
      index = 7;
    } else if (value.slice(0, 8).toLowerCase() === 'https://') {
      index = 8;
    } else {
      return
    }

    // Act as if the starting boundary is a dot.
    previousDot = index - 1;

    // Parse a valid domain.
    start = index;
    dots = [];

    while (index < length) {
      code = value.charCodeAt(index);

      if (code === dot$2) {
        // Dots may not appear after each other.
        if (previousDot === index - 1) {
          break
        }

        dots.push(index);
        previousDot = index;
        index++;
        continue
      }

      if (
        isDecimal(code) ||
        isAlphabetical(code) ||
        code === dash$3 ||
        code === underscore$4
      ) {
        index++;
        continue
      }

      break
    }

    // Ignore a final dot:
    if (code === dot$2) {
      dots.pop();
      index--;
    }

    // If there are not dots, exit.
    if (dots[0] === undefined) {
      return
    }

    // If there is an underscore in the last two domain parts, exit:
    // `www.example.c_m` and `www.ex_ample.com` are not OK, but
    // `www.sub_domain.example.com` is.
    lastTwoPartsStart = dots.length < 2 ? start : dots[dots.length - 2] + 1;

    if (value.slice(lastTwoPartsStart, index).indexOf('_') !== -1) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    end = index;
    pathStart = index;

    // Parse a path.
    while (index < length) {
      code = value.charCodeAt(index);

      if (isWhitespaceCharacter(code) || code === lessThan$4) {
        break
      }

      index++;

      if (
        code === exclamationMark$3 ||
        code === asterisk$2 ||
        code === comma$1 ||
        code === dot$2 ||
        code === colon ||
        code === questionMark$1 ||
        code === underscore$4 ||
        code === tilde$2
      ) ; else {
        end = index;
      }
    }

    index = end;

    // If the path ends in a closing paren, and the count of closing parens is
    // higher than the opening count, then remove the supefluous closing parens.
    if (value.charCodeAt(index - 1) === rightParenthesis$1) {
      path = value.slice(pathStart, index);
      leftCount = ccount_1(path, leftParenthesisCharacter);
      rightCount = ccount_1(path, rightParenthesisCharacter);

      while (rightCount > leftCount) {
        index = pathStart + path.lastIndexOf(rightParenthesisCharacter);
        path = value.slice(pathStart, index);
        rightCount--;
      }
    }

    if (value.charCodeAt(index - 1) === semicolon) {
      // GitHub doesn’t document this, but final semicolons aren’t paret of the
      // URL either.
      index--;

      // // If the path ends in what looks like an entity, it’s not part of the path.
      if (isAlphabetical(value.charCodeAt(index - 1))) {
        end = index - 2;

        while (isAlphabetical(value.charCodeAt(end))) {
          end--;
        }

        if (value.charCodeAt(end) === ampersand) {
          index = end;
        }
      }
    }

    content = value.slice(0, index);
    url = parseEntities_1(content, {nonTerminated: false});

    if (protocolless) {
      url = 'http://' + url;
    }

    exit = self.enterLink();

    // Temporarily remove all tokenizers except text in url.
    self.inlineTokenizers = {text: tokenizers.text};
    children = self.tokenizeInline(content, eat.now());
    self.inlineTokenizers = tokenizers;

    exit();

    return eat(content)({type: 'link', title: null, url: url, children: children})
  }

  var plusSign$1 = 43; // '+'
  var dash$2 = 45; // '-'
  var dot$1 = 46; // '.'
  var underscore$3 = 95; // '_'

  var email$1 = locate$6;

  // See: <https://github.github.com/gfm/#extended-email-autolink>
  function locate$6(value, fromIndex) {
    var self = this;
    var at;
    var position;

    if (!this.options.gfm) {
      return -1
    }

    at = value.indexOf('@', fromIndex);

    if (at === -1) {
      return -1
    }

    position = at;

    if (position === fromIndex || !isGfmAtext(value.charCodeAt(position - 1))) {
      return locate$6.call(self, value, at + 1)
    }

    while (position > fromIndex && isGfmAtext(value.charCodeAt(position - 1))) {
      position--;
    }

    return position
  }

  function isGfmAtext(code) {
    return (
      isDecimal(code) ||
      isAlphabetical(code) ||
      code === plusSign$1 ||
      code === dash$2 ||
      code === dot$1 ||
      code === underscore$3
    )
  }

  var email_1 = email;
  email.locator = email$1;
  email.notInLink = true;

  var plusSign = 43; // '+'
  var dash$1 = 45; // '-'
  var dot = 46; // '.'
  var atSign = 64; // '@'
  var underscore$2 = 95; // '_'

  function email(eat, value, silent) {
    var self = this;
    var gfm = self.options.gfm;
    var tokenizers = self.inlineTokenizers;
    var index = 0;
    var length = value.length;
    var firstDot = -1;
    var code;
    var content;
    var children;
    var exit;

    if (!gfm) {
      return
    }

    code = value.charCodeAt(index);

    while (
      isDecimal(code) ||
      isAlphabetical(code) ||
      code === plusSign ||
      code === dash$1 ||
      code === dot ||
      code === underscore$2
    ) {
      code = value.charCodeAt(++index);
    }

    if (index === 0) {
      return
    }

    if (code !== atSign) {
      return
    }

    index++;

    while (index < length) {
      code = value.charCodeAt(index);

      if (
        isDecimal(code) ||
        isAlphabetical(code) ||
        code === dash$1 ||
        code === dot ||
        code === underscore$2
      ) {
        index++;

        if (firstDot === -1 && code === dot) {
          firstDot = index;
        }

        continue
      }

      break
    }

    if (
      firstDot === -1 ||
      firstDot === index ||
      code === dash$1 ||
      code === underscore$2
    ) {
      return
    }

    if (code === dot) {
      index--;
    }

    content = value.slice(0, index);

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    exit = self.enterLink();

    // Temporarily remove all tokenizers except text in url.
    self.inlineTokenizers = {text: tokenizers.text};
    children = self.tokenizeInline(content, eat.now());
    self.inlineTokenizers = tokenizers;

    exit();

    return eat(content)({
      type: 'link',
      title: null,
      url: 'mailto:' + parseEntities_1(content, {nonTerminated: false}),
      children: children
    })
  }

  var tag = html$4.tag;

  var htmlInline = inlineHTML;
  inlineHTML.locator = tag$1;

  var lessThan$3 = '<';
  var questionMark = '?';
  var exclamationMark$2 = '!';
  var slash$2 = '/';

  var htmlLinkOpenExpression = /^<a /i;
  var htmlLinkCloseExpression = /^<\/a>/i;

  function inlineHTML(eat, value, silent) {
    var self = this;
    var length = value.length;
    var character;
    var subvalue;

    if (value.charAt(0) !== lessThan$3 || length < 3) {
      return
    }

    character = value.charAt(1);

    if (
      !isAlphabetical(character) &&
      character !== questionMark &&
      character !== exclamationMark$2 &&
      character !== slash$2
    ) {
      return
    }

    subvalue = value.match(tag);

    if (!subvalue) {
      return
    }

    /* istanbul ignore if - not used yet. */
    if (silent) {
      return true
    }

    subvalue = subvalue[0];

    if (!self.inLink && htmlLinkOpenExpression.test(subvalue)) {
      self.inLink = true;
    } else if (self.inLink && htmlLinkCloseExpression.test(subvalue)) {
      self.inLink = false;
    }

    return eat(subvalue)({type: 'html', value: subvalue})
  }

  var link$3 = locate$5;

  function locate$5(value, fromIndex) {
    var link = value.indexOf('[', fromIndex);
    var image = value.indexOf('![', fromIndex);

    if (image === -1) {
      return link
    }

    // Link can never be `-1` if an image is found, so we don’t need to check
    // for that :)
    return link < image ? link : image
  }

  var link_1$1 = link$2;
  link$2.locator = link$3;

  var lineFeed$4 = '\n';
  var exclamationMark$1 = '!';
  var quotationMark$1 = '"';
  var apostrophe$2 = "'";
  var leftParenthesis = '(';
  var rightParenthesis = ')';
  var lessThan$2 = '<';
  var greaterThan$1 = '>';
  var leftSquareBracket$1 = '[';
  var backslash$3 = '\\';
  var rightSquareBracket$1 = ']';
  var graveAccent$1 = '`';

  function link$2(eat, value, silent) {
    var self = this;
    var subvalue = '';
    var index = 0;
    var character = value.charAt(0);
    var pedantic = self.options.pedantic;
    var commonmark = self.options.commonmark;
    var gfm = self.options.gfm;
    var closed;
    var count;
    var opening;
    var beforeURL;
    var beforeTitle;
    var subqueue;
    var hasMarker;
    var isImage;
    var content;
    var marker;
    var length;
    var title;
    var depth;
    var queue;
    var url;
    var now;
    var exit;
    var node;

    // Detect whether this is an image.
    if (character === exclamationMark$1) {
      isImage = true;
      subvalue = character;
      character = value.charAt(++index);
    }

    // Eat the opening.
    if (character !== leftSquareBracket$1) {
      return
    }

    // Exit when this is a link and we’re already inside a link.
    if (!isImage && self.inLink) {
      return
    }

    subvalue += character;
    queue = '';
    index++;

    // Eat the content.
    length = value.length;
    now = eat.now();
    depth = 0;

    now.column += index;
    now.offset += index;

    while (index < length) {
      character = value.charAt(index);
      subqueue = character;

      if (character === graveAccent$1) {
        // Inline-code in link content.
        count = 1;

        while (value.charAt(index + 1) === graveAccent$1) {
          subqueue += character;
          index++;
          count++;
        }

        if (!opening) {
          opening = count;
        } else if (count >= opening) {
          opening = 0;
        }
      } else if (character === backslash$3) {
        // Allow brackets to be escaped.
        index++;
        subqueue += value.charAt(index);
      } else if ((!opening || gfm) && character === leftSquareBracket$1) {
        // In GFM mode, brackets in code still count.  In all other modes,
        // they don’t.
        depth++;
      } else if ((!opening || gfm) && character === rightSquareBracket$1) {
        if (depth) {
          depth--;
        } else {
          if (value.charAt(index + 1) !== leftParenthesis) {
            return
          }

          subqueue += leftParenthesis;
          closed = true;
          index++;

          break
        }
      }

      queue += subqueue;
      subqueue = '';
      index++;
    }

    // Eat the content closing.
    if (!closed) {
      return
    }

    content = queue;
    subvalue += queue + subqueue;
    index++;

    // Eat white-space.
    while (index < length) {
      character = value.charAt(index);

      if (!isWhitespaceCharacter(character)) {
        break
      }

      subvalue += character;
      index++;
    }

    // Eat the URL.
    character = value.charAt(index);
    queue = '';
    beforeURL = subvalue;

    if (character === lessThan$2) {
      index++;
      beforeURL += lessThan$2;

      while (index < length) {
        character = value.charAt(index);

        if (character === greaterThan$1) {
          break
        }

        if (commonmark && character === lineFeed$4) {
          return
        }

        queue += character;
        index++;
      }

      if (value.charAt(index) !== greaterThan$1) {
        return
      }

      subvalue += lessThan$2 + queue + greaterThan$1;
      url = queue;
      index++;
    } else {
      character = null;
      subqueue = '';

      while (index < length) {
        character = value.charAt(index);

        if (
          subqueue &&
          (character === quotationMark$1 ||
            character === apostrophe$2 ||
            (commonmark && character === leftParenthesis))
        ) {
          break
        }

        if (isWhitespaceCharacter(character)) {
          if (!pedantic) {
            break
          }

          subqueue += character;
        } else {
          if (character === leftParenthesis) {
            depth++;
          } else if (character === rightParenthesis) {
            if (depth === 0) {
              break
            }

            depth--;
          }

          queue += subqueue;
          subqueue = '';

          if (character === backslash$3) {
            queue += backslash$3;
            character = value.charAt(++index);
          }

          queue += character;
        }

        index++;
      }

      subvalue += queue;
      url = queue;
      index = subvalue.length;
    }

    // Eat white-space.
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (!isWhitespaceCharacter(character)) {
        break
      }

      queue += character;
      index++;
    }

    character = value.charAt(index);
    subvalue += queue;

    // Eat the title.
    if (
      queue &&
      (character === quotationMark$1 ||
        character === apostrophe$2 ||
        (commonmark && character === leftParenthesis))
    ) {
      index++;
      subvalue += character;
      queue = '';
      marker = character === leftParenthesis ? rightParenthesis : character;
      beforeTitle = subvalue;

      // In commonmark-mode, things are pretty easy: the marker cannot occur
      // inside the title.  Non-commonmark does, however, support nested
      // delimiters.
      if (commonmark) {
        while (index < length) {
          character = value.charAt(index);

          if (character === marker) {
            break
          }

          if (character === backslash$3) {
            queue += backslash$3;
            character = value.charAt(++index);
          }

          index++;
          queue += character;
        }

        character = value.charAt(index);

        if (character !== marker) {
          return
        }

        title = queue;
        subvalue += queue + character;
        index++;

        while (index < length) {
          character = value.charAt(index);

          if (!isWhitespaceCharacter(character)) {
            break
          }

          subvalue += character;
          index++;
        }
      } else {
        subqueue = '';

        while (index < length) {
          character = value.charAt(index);

          if (character === marker) {
            if (hasMarker) {
              queue += marker + subqueue;
              subqueue = '';
            }

            hasMarker = true;
          } else if (!hasMarker) {
            queue += character;
          } else if (character === rightParenthesis) {
            subvalue += queue + marker + subqueue;
            title = queue;
            break
          } else if (isWhitespaceCharacter(character)) {
            subqueue += character;
          } else {
            queue += marker + subqueue + character;
            subqueue = '';
            hasMarker = false;
          }

          index++;
        }
      }
    }

    if (value.charAt(index) !== rightParenthesis) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    subvalue += rightParenthesis;

    url = self.decode.raw(self.unescape(url), eat(beforeURL).test().end, {
      nonTerminated: false
    });

    if (title) {
      beforeTitle = eat(beforeTitle).test().end;
      title = self.decode.raw(self.unescape(title), beforeTitle);
    }

    node = {
      type: isImage ? 'image' : 'link',
      title: title || null,
      url: url
    };

    if (isImage) {
      node.alt = self.decode.raw(self.unescape(content), now) || null;
    } else {
      exit = self.enterLink();
      node.children = self.tokenizeInline(content, now);
      exit();
    }

    return eat(subvalue)(node)
  }

  var reference_1 = reference;
  reference.locator = link$3;

  var link$1 = 'link';
  var image$2 = 'image';
  var shortcut = 'shortcut';
  var collapsed = 'collapsed';
  var full = 'full';
  var exclamationMark = '!';
  var leftSquareBracket = '[';
  var backslash$2 = '\\';
  var rightSquareBracket = ']';

  function reference(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var character = value.charAt(0);
    var index = 0;
    var length = value.length;
    var subvalue = '';
    var intro = '';
    var type = link$1;
    var referenceType = shortcut;
    var content;
    var identifier;
    var now;
    var node;
    var exit;
    var queue;
    var bracketed;
    var depth;

    // Check whether we’re eating an image.
    if (character === exclamationMark) {
      type = image$2;
      intro = character;
      character = value.charAt(++index);
    }

    if (character !== leftSquareBracket) {
      return
    }

    index++;
    intro += character;
    queue = '';

    // Eat the text.
    depth = 0;

    while (index < length) {
      character = value.charAt(index);

      if (character === leftSquareBracket) {
        bracketed = true;
        depth++;
      } else if (character === rightSquareBracket) {
        if (!depth) {
          break
        }

        depth--;
      }

      if (character === backslash$2) {
        queue += backslash$2;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }

    subvalue = queue;
    content = queue;
    character = value.charAt(index);

    if (character !== rightSquareBracket) {
      return
    }

    index++;
    subvalue += character;
    queue = '';

    if (!commonmark) {
      // The original markdown syntax definition explicitly allows for whitespace
      // between the link text and link label; commonmark departs from this, in
      // part to improve support for shortcut reference links
      while (index < length) {
        character = value.charAt(index);

        if (!isWhitespaceCharacter(character)) {
          break
        }

        queue += character;
        index++;
      }
    }

    character = value.charAt(index);

    if (character === leftSquareBracket) {
      identifier = '';
      queue += character;
      index++;

      while (index < length) {
        character = value.charAt(index);

        if (character === leftSquareBracket || character === rightSquareBracket) {
          break
        }

        if (character === backslash$2) {
          identifier += backslash$2;
          character = value.charAt(++index);
        }

        identifier += character;
        index++;
      }

      character = value.charAt(index);

      if (character === rightSquareBracket) {
        referenceType = identifier ? full : collapsed;
        queue += identifier + character;
        index++;
      } else {
        identifier = '';
      }

      subvalue += queue;
      queue = '';
    } else {
      if (!content) {
        return
      }

      identifier = content;
    }

    // Brackets cannot be inside the identifier.
    if (referenceType !== full && bracketed) {
      return
    }

    subvalue = intro + subvalue;

    if (type === link$1 && self.inLink) {
      return null
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    now = eat.now();
    now.column += intro.length;
    now.offset += intro.length;
    identifier = referenceType === full ? identifier : content;

    node = {
      type: type + 'Reference',
      identifier: normalize_1$1(identifier),
      label: identifier,
      referenceType: referenceType
    };

    if (type === link$1) {
      exit = self.enterLink();
      node.children = self.tokenizeInline(content, now);
      exit();
    } else {
      node.alt = self.decode.raw(self.unescape(content), now) || null;
    }

    return eat(subvalue)(node)
  }

  var strong$2 = locate$4;

  function locate$4(value, fromIndex) {
    var asterisk = value.indexOf('**', fromIndex);
    var underscore = value.indexOf('__', fromIndex);

    if (underscore === -1) {
      return asterisk
    }

    if (asterisk === -1) {
      return underscore
    }

    return underscore < asterisk ? underscore : asterisk
  }

  var strong_1$1 = strong$1;
  strong$1.locator = strong$2;

  var backslash$1 = '\\';
  var asterisk$1 = '*';
  var underscore$1 = '_';

  function strong$1(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var previous;

    if (
      (character !== asterisk$1 && character !== underscore$1) ||
      value.charAt(++index) !== character
    ) {
      return
    }

    pedantic = self.options.pedantic;
    marker = character;
    subvalue = marker + marker;
    length = value.length;
    index++;
    queue = '';
    character = '';

    if (pedantic && isWhitespaceCharacter(value.charAt(index))) {
      return
    }

    while (index < length) {
      previous = character;
      character = value.charAt(index);

      if (
        character === marker &&
        value.charAt(index + 1) === marker &&
        (!pedantic || !isWhitespaceCharacter(previous))
      ) {
        character = value.charAt(index + 2);

        if (character !== marker) {
          if (!trim_1(queue)) {
            return
          }

          /* istanbul ignore if - never used (yet) */
          if (silent) {
            return true
          }

          now = eat.now();
          now.column += 2;
          now.offset += 2;

          return eat(subvalue + queue + subvalue)({
            type: 'strong',
            children: self.tokenizeInline(queue, now)
          })
        }
      }

      if (!pedantic && character === backslash$1) {
        queue += character;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }
  }

  var isWordCharacter = wordCharacter;

  var fromCode = String.fromCharCode;
  var re$1 = /\w/;

  // Check if the given character code, or the character code at the first
  // character, is a word character.
  function wordCharacter(character) {
    return re$1.test(
      typeof character === 'number' ? fromCode(character) : character.charAt(0)
    )
  }

  var emphasis$2 = locate$3;

  function locate$3(value, fromIndex) {
    var asterisk = value.indexOf('*', fromIndex);
    var underscore = value.indexOf('_', fromIndex);

    if (underscore === -1) {
      return asterisk
    }

    if (asterisk === -1) {
      return underscore
    }

    return underscore < asterisk ? underscore : asterisk
  }

  var emphasis_1$1 = emphasis$1;
  emphasis$1.locator = emphasis$2;

  var asterisk = '*';
  var underscore = '_';
  var backslash = '\\';

  function emphasis$1(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var previous;

    if (character !== asterisk && character !== underscore) {
      return
    }

    pedantic = self.options.pedantic;
    subvalue = character;
    marker = character;
    length = value.length;
    index++;
    queue = '';
    character = '';

    if (pedantic && isWhitespaceCharacter(value.charAt(index))) {
      return
    }

    while (index < length) {
      previous = character;
      character = value.charAt(index);

      if (character === marker && (!pedantic || !isWhitespaceCharacter(previous))) {
        character = value.charAt(++index);

        if (character !== marker) {
          if (!trim_1(queue) || previous === marker) {
            return
          }

          if (!pedantic && marker === underscore && isWordCharacter(character)) {
            queue += marker;
            continue
          }

          /* istanbul ignore if - never used (yet) */
          if (silent) {
            return true
          }

          now = eat.now();
          now.column++;
          now.offset++;

          return eat(subvalue + queue + marker)({
            type: 'emphasis',
            children: self.tokenizeInline(queue, now)
          })
        }

        queue += marker;
      }

      if (!pedantic && character === backslash) {
        queue += character;
        character = value.charAt(++index);
      }

      queue += character;
      index++;
    }
  }

  var _delete$2 = locate$2;

  function locate$2(value, fromIndex) {
    return value.indexOf('~~', fromIndex)
  }

  var _delete$1 = strikethrough$1;
  strikethrough$1.locator = _delete$2;

  var tilde$1 = '~';
  var fence$1 = '~~';

  function strikethrough$1(eat, value, silent) {
    var self = this;
    var character = '';
    var previous = '';
    var preceding = '';
    var subvalue = '';
    var index;
    var length;
    var now;

    if (
      !self.options.gfm ||
      value.charAt(0) !== tilde$1 ||
      value.charAt(1) !== tilde$1 ||
      isWhitespaceCharacter(value.charAt(2))
    ) {
      return
    }

    index = 1;
    length = value.length;
    now = eat.now();
    now.column += 2;
    now.offset += 2;

    while (++index < length) {
      character = value.charAt(index);

      if (
        character === tilde$1 &&
        previous === tilde$1 &&
        (!preceding || !isWhitespaceCharacter(preceding))
      ) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        return eat(fence$1 + subvalue + fence$1)({
          type: 'delete',
          children: self.tokenizeInline(subvalue, now)
        })
      }

      subvalue += previous;
      preceding = previous;
      previous = character;
    }
  }

  var codeInline$1 = locate$1;

  function locate$1(value, fromIndex) {
    return value.indexOf('`', fromIndex)
  }

  var codeInline = inlineCode$1;
  inlineCode$1.locator = codeInline$1;

  var lineFeed$3 = 10; //  '\n'
  var space$5 = 32; // ' '
  var graveAccent = 96; //  '`'

  function inlineCode$1(eat, value, silent) {
    var length = value.length;
    var index = 0;
    var openingFenceEnd;
    var closingFenceStart;
    var closingFenceEnd;
    var code;
    var next;
    var found;

    while (index < length) {
      if (value.charCodeAt(index) !== graveAccent) {
        break
      }

      index++;
    }

    if (index === 0 || index === length) {
      return
    }

    openingFenceEnd = index;
    next = value.charCodeAt(index);

    while (index < length) {
      code = next;
      next = value.charCodeAt(index + 1);

      if (code === graveAccent) {
        if (closingFenceStart === undefined) {
          closingFenceStart = index;
        }

        closingFenceEnd = index + 1;

        if (
          next !== graveAccent &&
          closingFenceEnd - closingFenceStart === openingFenceEnd
        ) {
          found = true;
          break
        }
      } else if (closingFenceStart !== undefined) {
        closingFenceStart = undefined;
        closingFenceEnd = undefined;
      }

      index++;
    }

    if (!found) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    // Remove the initial and final space (or line feed), iff they exist and there
    // are non-space characters in the content.
    index = openingFenceEnd;
    length = closingFenceStart;
    code = value.charCodeAt(index);
    next = value.charCodeAt(length - 1);
    found = false;

    if (
      length - index > 2 &&
      (code === space$5 || code === lineFeed$3) &&
      (next === space$5 || next === lineFeed$3)
    ) {
      index++;
      length--;

      while (index < length) {
        code = value.charCodeAt(index);

        if (code !== space$5 && code !== lineFeed$3) {
          found = true;
          break
        }

        index++;
      }

      if (found === true) {
        openingFenceEnd++;
        closingFenceStart--;
      }
    }

    return eat(value.slice(0, closingFenceEnd))({
      type: 'inlineCode',
      value: value.slice(openingFenceEnd, closingFenceStart)
    })
  }

  var _break$2 = locate;

  function locate(value, fromIndex) {
    var index = value.indexOf('\n', fromIndex);

    while (index > fromIndex) {
      if (value.charAt(index - 1) !== ' ') {
        break
      }

      index--;
    }

    return index
  }

  var _break$1 = hardBreak$1;
  hardBreak$1.locator = _break$2;

  var space$4 = ' ';
  var lineFeed$2 = '\n';
  var minBreakLength = 2;

  function hardBreak$1(eat, value, silent) {
    var length = value.length;
    var index = -1;
    var queue = '';
    var character;

    while (++index < length) {
      character = value.charAt(index);

      if (character === lineFeed$2) {
        if (index < minBreakLength) {
          return
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        queue += character;

        return eat(queue)({type: 'break'})
      }

      if (character !== space$4) {
        return
      }

      queue += character;
    }
  }

  var text_1$2 = text$3;

  function text$3(eat, value, silent) {
    var self = this;
    var methods;
    var tokenizers;
    var index;
    var length;
    var subvalue;
    var position;
    var tokenizer;
    var name;
    var min;
    var now;

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    methods = self.inlineMethods;
    length = methods.length;
    tokenizers = self.inlineTokenizers;
    index = -1;
    min = value.length;

    while (++index < length) {
      name = methods[index];

      if (name === 'text' || !tokenizers[name]) {
        continue
      }

      tokenizer = tokenizers[name].locator;

      if (!tokenizer) {
        eat.file.fail('Missing locator: `' + name + '`');
      }

      position = tokenizer.call(self, value, 1);

      if (position !== -1 && position < min) {
        min = position;
      }
    }

    subvalue = value.slice(0, min);
    now = eat.now();

    self.decode(subvalue, now, handler);

    function handler(content, position, source) {
      eat(source || content)({type: 'text', value: content});
    }
  }

  var parser$1 = Parser;

  function Parser(doc, file) {
    this.file = file;
    this.offset = {};
    this.options = immutable(this.options);
    this.setOptions({});

    this.inList = false;
    this.inBlock = false;
    this.inLink = false;
    this.atStart = true;

    this.toOffset = vfileLocation(file).toOffset;
    this.unescape = _unescape(this, 'escape');
    this.decode = decode(this);
  }

  var proto$3 = Parser.prototype;

  // Expose core.
  proto$3.setOptions = setOptions_1;
  proto$3.parse = parse_1$2;

  // Expose `defaults`.
  proto$3.options = defaults$1;

  // Enter and exit helpers.
  proto$3.exitStart = stateToggle('atStart', true);
  proto$3.enterList = stateToggle('inList', false);
  proto$3.enterLink = stateToggle('inLink', false);
  proto$3.enterBlock = stateToggle('inBlock', false);

  // Nodes that can interupt a paragraph:
  //
  // ```markdown
  // A paragraph, followed by a thematic break.
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the paragraph.
  proto$3.interruptParagraph = [
    ['thematicBreak'],
    ['list'],
    ['atxHeading'],
    ['fencedCode'],
    ['blockquote'],
    ['html'],
    ['setextHeading', {commonmark: false}],
    ['definition', {commonmark: false}]
  ];

  // Nodes that can interupt a list:
  //
  // ```markdown
  // - One
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the list.
  proto$3.interruptList = [
    ['atxHeading', {pedantic: false}],
    ['fencedCode', {pedantic: false}],
    ['thematicBreak', {pedantic: false}],
    ['definition', {commonmark: false}]
  ];

  // Nodes that can interupt a blockquote:
  //
  // ```markdown
  // > A paragraph.
  // ___
  // ```
  //
  // In the above example, the thematic break “interupts” the blockquote.
  proto$3.interruptBlockquote = [
    ['indentedCode', {commonmark: true}],
    ['fencedCode', {commonmark: true}],
    ['atxHeading', {commonmark: true}],
    ['setextHeading', {commonmark: true}],
    ['thematicBreak', {commonmark: true}],
    ['html', {commonmark: true}],
    ['list', {commonmark: true}],
    ['definition', {commonmark: false}]
  ];

  // Handlers.
  proto$3.blockTokenizers = {
    blankLine: blankLine_1,
    indentedCode: codeIndented,
    fencedCode: codeFenced,
    blockquote: blockquote_1$1,
    atxHeading: headingAtx,
    thematicBreak: thematicBreak_1$1,
    list: list_1$1,
    setextHeading: headingSetext,
    html: htmlBlock,
    definition: definition_1,
    table: table_1$1,
    paragraph: paragraph_1$1
  };

  proto$3.inlineTokenizers = {
    escape: _escape,
    autoLink: autoLink_1,
    url: url_1,
    email: email_1,
    html: htmlInline,
    link: link_1$1,
    reference: reference_1,
    strong: strong_1$1,
    emphasis: emphasis_1$1,
    deletion: _delete$1,
    code: codeInline,
    break: _break$1,
    text: text_1$2
  };

  // Expose precedence.
  proto$3.blockMethods = keys$1(proto$3.blockTokenizers);
  proto$3.inlineMethods = keys$1(proto$3.inlineTokenizers);

  // Tokenizers.
  proto$3.tokenizeBlock = tokenizer$1('block');
  proto$3.tokenizeInline = tokenizer$1('inline');
  proto$3.tokenizeFactory = tokenizer$1;

  // Get all keys in `value`.
  function keys$1(value) {
    var result = [];
    var key;

    for (key in value) {
      result.push(key);
    }

    return result
  }

  var remarkParse = parse$5;
  parse$5.Parser = parser$1;

  function parse$5(options) {
    var settings = this.data('settings');
    var Local = unherit_1(parser$1);

    Local.prototype.options = immutable(Local.prototype.options, settings, options);

    this.Parser = Local;
  }

  var mdastUtilDefinitions$1 = getDefinitionFactory$1;

  var own$a = {}.hasOwnProperty;

  // Get a definition in `node` by `identifier`.
  function getDefinitionFactory$1(node, options) {
    return getterFactory$1(gather$1(node, options))
  }

  // Gather all definitions in `node`
  function gather$1(node, options) {
    var cache = {};

    if (!node || !node.type) {
      throw new Error('mdast-util-definitions expected node')
    }

    unistUtilVisit(node, 'definition', options && options.commonmark ? commonmark : normal);

    return cache

    function commonmark(definition) {
      var id = normalise$1(definition.identifier);
      if (!own$a.call(cache, id)) {
        cache[id] = definition;
      }
    }

    function normal(definition) {
      cache[normalise$1(definition.identifier)] = definition;
    }
  }

  // Factory to get a node from the given definition-cache.
  function getterFactory$1(cache) {
    return getter

    // Get a node from the bound definition-cache.
    function getter(identifier) {
      var id = identifier && normalise$1(identifier);
      return id && own$a.call(cache, id) ? cache[id] : null
    }
  }

  function normalise$1(identifier) {
    return identifier.toUpperCase()
  }

  var parse_1$1 = parse$4;
  var stringify_1$1 = stringify$3;

  var empty$2 = '';
  var space$3 = ' ';
  var whiteSpace$1 = /[ \t\n\r\f]+/g;

  function parse$4(value) {
    var input = String(value || empty$2).trim();
    return input === empty$2 ? [] : input.split(whiteSpace$1)
  }

  function stringify$3(values) {
    return values.join(space$3).trim()
  }

  var spaceSeparatedTokens = {
  	parse: parse_1$1,
  	stringify: stringify_1$1
  };

  var isAbsoluteUrl = url => {
  	if (typeof url !== 'string') {
  		throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
  	}

  	// Don't match Windows paths `c:\`
  	if (/^[a-zA-Z]:\\/.test(url)) {
  		return false;
  	}

  	// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  	// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  	return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
  };

  var spaceSeparated$4 = spaceSeparatedTokens.parse;



  var remarkExternalLinks = externalLinks;

  var defaultTarget = '_blank';
  var defaultRel = ['nofollow', 'noopener', 'noreferrer'];
  var defaultProtocols = ['http', 'https'];

  function externalLinks(options) {
    var settings = options || {};
    var target = settings.target;
    var rel = settings.rel;
    var protocols = settings.protocols || defaultProtocols;
    var content = settings.content;
    var contentProperties = settings.contentProperties || {};

    if (typeof rel === 'string') {
      rel = spaceSeparated$4(rel);
    }

    if (content && typeof content === 'object' && !('length' in content)) {
      content = [content];
    }

    return transform

    function transform(tree) {
      var definition = mdastUtilDefinitions$1(tree);

      unistUtilVisit(tree, ['link', 'linkReference'], visitor);

      function visitor(node) {
        var ctx = node.type === 'link' ? node : definition(node.identifier);
        var protocol;
        var data;
        var props;

        if (!ctx) return

        protocol = ctx.url.slice(0, ctx.url.indexOf(':'));

        if (isAbsoluteUrl(ctx.url) && protocols.indexOf(protocol) !== -1) {
          data = node.data || (node.data = {});
          props = data.hProperties || (data.hProperties = {});

          if (target !== false) {
            props.target = target || defaultTarget;
          }

          if (rel !== false) {
            props.rel = (rel || defaultRel).concat();
          }

          if (content) {
            // `fragment` is not a known mdast node, but unknown nodes with
            // children are handled as elements by `mdast-util-to-hast`:
            // See: <https://github.com/syntax-tree/mdast-util-to-hast#notes>.
            node.children.push({
              type: 'fragment',
              children: [],
              data: {
                hName: 'span',
                hProperties: extend$2(true, contentProperties),
                hChildren: extend$2(true, content)
              }
            });
          }
        }
      }
    }
  }

  var format = createCommonjsModule(function (module) {
  (function() {

    //// Export the API
    var namespace;

    // CommonJS / Node module
    {
      namespace = module.exports = format;
    }

    namespace.format = format;
    namespace.vsprintf = vsprintf;

    if (typeof console !== 'undefined' && typeof console.log === 'function') {
      namespace.printf = printf;
    }

    function printf(/* ... */) {
      console.log(format.apply(null, arguments));
    }

    function vsprintf(fmt, replacements) {
      return format.apply(null, [fmt].concat(replacements));
    }

    function format(fmt) {
      var argIndex = 1 // skip initial format argument
        , args = [].slice.call(arguments)
        , i = 0
        , n = fmt.length
        , result = ''
        , c
        , escaped = false
        , arg
        , tmp
        , leadingZero = false
        , precision
        , nextArg = function() { return args[argIndex++]; }
        , slurpNumber = function() {
            var digits = '';
            while (/\d/.test(fmt[i])) {
              digits += fmt[i++];
              c = fmt[i];
            }
            return digits.length > 0 ? parseInt(digits) : null;
          }
        ;
      for (; i < n; ++i) {
        c = fmt[i];
        if (escaped) {
          escaped = false;
          if (c == '.') {
            leadingZero = false;
            c = fmt[++i];
          }
          else if (c == '0' && fmt[i + 1] == '.') {
            leadingZero = true;
            i += 2;
            c = fmt[i];
          }
          else {
            leadingZero = true;
          }
          precision = slurpNumber();
          switch (c) {
          case 'b': // number in binary
            result += parseInt(nextArg(), 10).toString(2);
            break;
          case 'c': // character
            arg = nextArg();
            if (typeof arg === 'string' || arg instanceof String)
              result += arg;
            else
              result += String.fromCharCode(parseInt(arg, 10));
            break;
          case 'd': // number in decimal
            result += parseInt(nextArg(), 10);
            break;
          case 'f': // floating point number
            tmp = String(parseFloat(nextArg()).toFixed(precision || 6));
            result += leadingZero ? tmp : tmp.replace(/^0/, '');
            break;
          case 'j': // JSON
            result += JSON.stringify(nextArg());
            break;
          case 'o': // number in octal
            result += '0' + parseInt(nextArg(), 10).toString(8);
            break;
          case 's': // string
            result += nextArg();
            break;
          case 'x': // lowercase hexadecimal
            result += '0x' + parseInt(nextArg(), 10).toString(16);
            break;
          case 'X': // uppercase hexadecimal
            result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();
            break;
          default:
            result += c;
            break;
          }
        } else if (c === '%') {
          escaped = true;
        } else {
          result += c;
        }
      }
      return result;
    }

  }());
  });

  var fault = create$3(Error);

  var fault_1 = fault;

  fault.eval = create$3(EvalError);
  fault.range = create$3(RangeError);
  fault.reference = create$3(ReferenceError);
  fault.syntax = create$3(SyntaxError);
  fault.type = create$3(TypeError);
  fault.uri = create$3(URIError);

  fault.create = create$3;

  // Create a new `EConstructor`, with the formatted `format` as a first argument.
  function create$3(EConstructor) {
    FormattedError.displayName = EConstructor.displayName || EConstructor.name;

    return FormattedError

    function FormattedError(format$1) {
      if (format$1) {
        format$1 = format.apply(null, arguments);
      }

      return new EConstructor(format$1)
    }
  }

  var matters_1 = matters;

  var own$9 = {}.hasOwnProperty;

  var markers = {
    yaml: '-',
    toml: '+'
  };

  function matters(options) {
    var results = [];
    var index = -1;
    var length;

    // One preset or matter.
    if (typeof options === 'string' || !('length' in options)) {
      options = [options];
    }

    length = options.length;

    while (++index < length) {
      results[index] = matter(options[index]);
    }

    return results
  }

  function matter(option) {
    var result = option;

    if (typeof result === 'string') {
      if (!own$9.call(markers, result)) {
        throw fault_1('Missing matter definition for `%s`', result)
      }

      result = {type: result, marker: markers[result]};
    } else if (typeof result !== 'object') {
      throw fault_1('Expected matter to be an object, not `%j`', result)
    }

    if (!own$9.call(result, 'type')) {
      throw fault_1('Missing `type` in matter `%j`', result)
    }

    if (!own$9.call(result, 'fence') && !own$9.call(result, 'marker')) {
      throw fault_1('Missing `marker` or `fence` in matter `%j`', result)
    }

    return result
  }

  var fence_1 = fence;

  function fence(matter, prop) {
    var marker;

    if (matter.marker) {
      marker = pick(matter.marker, prop);
      return marker + marker + marker
    }

    return pick(matter.fence, prop)
  }

  function pick(schema, prop) {
    return typeof schema === 'string' ? schema : schema[prop]
  }

  var parse$3 = create$2;

  function create$2(matter) {
    var name = matter.type + 'FrontMatter';
    var open = fence_1(matter, 'open');
    var close = fence_1(matter, 'close');
    var newline = '\n';
    var anywhere = matter.anywhere;

    frontmatter.displayName = name;
    frontmatter.onlyAtStart = typeof anywhere === 'boolean' ? !anywhere : true;

    return [name, frontmatter]

    function frontmatter(eat, value, silent) {
      var index = open.length;
      var offset;

      if (value.slice(0, index) !== open || value.charAt(index) !== newline) {
        return
      }

      offset = value.indexOf(close, index);

      while (offset !== -1 && value.charAt(offset - 1) !== newline) {
        index = offset + close.length;
        offset = value.indexOf(close, index);
      }

      if (offset !== -1) {
        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        return eat(value.slice(0, offset + close.length))({
          type: matter.type,
          value: value.slice(open.length + 1, offset - 1)
        })
      }
    }
  }

  var compile = create$1;

  function create$1(matter) {
    var type = matter.type;
    var open = fence_1(matter, 'open');
    var close = fence_1(matter, 'close');

    frontmatter.displayName = type + 'FrontMatter';

    return [type, frontmatter]

    function frontmatter(node) {
      return open + (node.value ? '\n' + node.value : '') + '\n' + close
    }
  }

  var remarkFrontmatter = frontmatter;

  function frontmatter(options) {
    var parser = this.Parser;
    var compiler = this.Compiler;
    var config = matters_1(options || ['yaml']);

    if (isRemarkParser(parser)) {
      attachParser(parser, config);
    }

    if (isRemarkCompiler(compiler)) {
      attachCompiler(compiler, config);
    }
  }

  function attachParser(parser, matters) {
    var proto = parser.prototype;
    var tokenizers = wrap$1(parse$3, matters);
    var names = [];
    var key;

    for (key in tokenizers) {
      names.push(key);
    }

    proto.blockMethods = names.concat(proto.blockMethods);
    proto.blockTokenizers = Object.assign({}, tokenizers, proto.blockTokenizers);
  }

  function attachCompiler(compiler, matters) {
    var proto = compiler.prototype;
    proto.visitors = Object.assign({}, wrap$1(compile, matters), proto.visitors);
  }

  function wrap$1(func, matters) {
    var result = {};
    var length = matters.length;
    var index = -1;
    var tuple;

    while (++index < length) {
      tuple = func(matters[index]);
      result[tuple[0]] = tuple[1];
    }

    return result
  }

  function isRemarkParser(parser) {
    return Boolean(parser && parser.prototype && parser.prototype.blockTokenizers)
  }

  function isRemarkCompiler(compiler) {
    return Boolean(compiler && compiler.prototype && compiler.prototype.visitors)
  }

  var unistBuilder = u;

  function u(type, props, value) {
    var node;

    if (
      (value === null || value === undefined) &&
      (typeof props !== 'object' || Array.isArray(props))
    ) {
      value = props;
      props = {};
    }

    node = Object.assign({type: String(type)}, props);

    if (Array.isArray(value)) {
      node.children = value;
    } else if (value !== null && value !== undefined) {
      node.value = String(value);
    }

    return node
  }

  var start = factory$1('start');
  var end = factory$1('end');

  var unistUtilPosition = position;

  position.start = start;
  position.end = end;

  function position(node) {
    return {start: start(node), end: end(node)}
  }

  function factory$1(type) {
    point.displayName = type;

    return point

    function point(node) {
      var point = (node && node.position && node.position[type]) || {};

      return {
        line: point.line || null,
        column: point.column || null,
        offset: isNaN(point.offset) ? null : point.offset
      }
    }
  }

  var unistUtilGenerated = generated;

  function generated(node) {
    var position = optional(optional(node).position);
    var start = optional(position.start);
    var end = optional(position.end);

    return !start.line || !start.column || !end.line || !end.column
  }

  function optional(value) {
    return value && typeof value === 'object' ? value : {}
  }

  var mdastUtilDefinitions = getDefinitionFactory;

  var own$8 = {}.hasOwnProperty;

  // Get a definition in `node` by `identifier`.
  function getDefinitionFactory(node, options) {
    return getterFactory(gather(node, options))
  }

  // Gather all definitions in `node`
  function gather(node, options) {
    var cache = {};

    if (!node || !node.type) {
      throw new Error('mdast-util-definitions expected node')
    }

    unistUtilVisit(node, 'definition', options && options.commonmark ? commonmark : normal);

    return cache

    function commonmark(definition) {
      var id = normalise(definition.identifier);
      if (!own$8.call(cache, id)) {
        cache[id] = definition;
      }
    }

    function normal(definition) {
      cache[normalise(definition.identifier)] = definition;
    }
  }

  // Factory to get a node from the given definition-cache.
  function getterFactory(cache) {
    return getter

    // Get a node from the bound definition-cache.
    function getter(identifier) {
      var id = identifier && normalise(identifier);
      return id && own$8.call(cache, id) ? cache[id] : null
    }
  }

  function normalise(identifier) {
    return identifier.toUpperCase()
  }

  var all_1$1 = all$2;



  function all$2(h, parent) {
    var nodes = parent.children || [];
    var length = nodes.length;
    var values = [];
    var index = -1;
    var result;
    var head;

    while (++index < length) {
      result = one_1$1(h, nodes[index], parent);

      if (result) {
        if (index && nodes[index - 1].type === 'break') {
          if (result.value) {
            result.value = result.value.replace(/^\s+/, '');
          }

          head = result.children && result.children[0];

          if (head && head.value) {
            head.value = head.value.replace(/^\s+/, '');
          }
        }

        values = values.concat(result);
      }
    }

    return values
  }

  var one_1$1 = one$2;




  var own$7 = {}.hasOwnProperty;

  // Transform an unknown node.
  function unknown(h, node) {
    if (text$2(node)) {
      return h.augment(node, unistBuilder('text', node.value))
    }

    return h(node, 'div', all_1$1(h, node))
  }

  // Visit a node.
  function one$2(h, node, parent) {
    var type = node && node.type;
    var fn = own$7.call(h.handlers, type) ? h.handlers[type] : h.unknownHandler;

    // Fail on non-nodes.
    if (!type) {
      throw new Error('Expected node, got `' + node + '`')
    }

    return (typeof fn === 'function' ? fn : unknown)(h, node, parent)
  }

  // Check if the node should be renderered as a text node.
  function text$2(node) {
    var data = node.data || {};

    if (
      own$7.call(data, 'hName') ||
      own$7.call(data, 'hProperties') ||
      own$7.call(data, 'hChildren')
    ) {
      return false
    }

    return 'value' in node
  }

  var thematicBreak_1 = thematicBreak;

  function thematicBreak(h, node) {
    return h(node, 'hr')
  }

  var wrap_1 = wrap;



  // Wrap `nodes` with line feeds between each entry.
  // Optionally adds line feeds at the start and end.
  function wrap(nodes, loose) {
    var result = [];
    var index = -1;
    var length = nodes.length;

    if (loose) {
      result.push(unistBuilder('text', '\n'));
    }

    while (++index < length) {
      if (index) {
        result.push(unistBuilder('text', '\n'));
      }

      result.push(nodes[index]);
    }

    if (loose && nodes.length !== 0) {
      result.push(unistBuilder('text', '\n'));
    }

    return result
  }

  var list_1 = list;




  function list(h, node) {
    var props = {};
    var name = node.ordered ? 'ol' : 'ul';
    var items;
    var index = -1;
    var length;

    if (typeof node.start === 'number' && node.start !== 1) {
      props.start = node.start;
    }

    items = all_1$1(h, node);
    length = items.length;

    // Like GitHub, add a class for custom styling.
    while (++index < length) {
      if (
        items[index].properties.className &&
        items[index].properties.className.indexOf('task-list-item') !== -1
      ) {
        props.className = ['contains-task-list'];
        break
      }
    }

    return h(node, name, props, wrap_1(items, true))
  }

  var footer = generateFootnotes;





  function generateFootnotes(h) {
    var footnoteById = h.footnoteById;
    var footnoteOrder = h.footnoteOrder;
    var length = footnoteOrder.length;
    var index = -1;
    var listItems = [];
    var def;
    var backReference;
    var content;
    var tail;

    while (++index < length) {
      def = footnoteById[footnoteOrder[index].toUpperCase()];

      if (!def) {
        continue
      }

      content = def.children.concat();
      tail = content[content.length - 1];
      backReference = {
        type: 'link',
        url: '#fnref-' + def.identifier,
        data: {hProperties: {className: ['footnote-backref']}},
        children: [{type: 'text', value: '↩'}]
      };

      if (!tail || tail.type !== 'paragraph') {
        tail = {type: 'paragraph', children: []};
        content.push(tail);
      }

      tail.children.push(backReference);

      listItems.push({
        type: 'listItem',
        data: {hProperties: {id: 'fn-' + def.identifier}},
        children: content,
        position: def.position
      });
    }

    if (listItems.length === 0) {
      return null
    }

    return h(
      null,
      'div',
      {className: ['footnotes']},
      wrap_1(
        [
          thematicBreak_1(h),
          list_1(h, {type: 'list', ordered: true, children: listItems})
        ],
        true
      )
    )
  }

  var blockquote_1 = blockquote;




  function blockquote(h, node) {
    return h(node, 'blockquote', wrap_1(all_1$1(h, node), true))
  }

  var _break = hardBreak;



  function hardBreak(h, node) {
    return [h(node, 'br'), unistBuilder('text', '\n')]
  }

  var detab_1 = detab;



  var tab$1 = 0x09;
  var lineFeed$1 = 0x0a;
  var carriageReturn = 0x0d;

  // Replace tabs with spaces, being smart about which column the tab is at and
  // which size should be used.
  function detab(value, size) {
    var string = typeof value === 'string';
    var length = string && value.length;
    var start = 0;
    var index = -1;
    var column = -1;
    var tabSize = size || 4;
    var results = [];
    var code;
    var add;

    if (!string) {
      throw new Error('detab expected string')
    }

    while (++index < length) {
      code = value.charCodeAt(index);

      if (code === tab$1) {
        add = tabSize - ((column + 1) % tabSize);
        column += add;
        results.push(value.slice(start, index) + repeatString(' ', add));
        start = index + 1;
      } else if (code === lineFeed$1 || code === carriageReturn) {
        column = -1;
      } else {
        column++;
      }
    }

    results.push(value.slice(start));

    return results.join('')
  }

  var code_1 = code;



function code(h, node) {
    var value = node.value ? detab_1(node.value + '\n') : '';
    var lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/);
    var props = {};

    if (lang) {
        props.className = ['language-' + lang];
    }

    code = h(node, 'code', props, [unistBuilder('text', value)]);

    if (node.meta) {
        code.data = {meta: node.meta}
    }

    return h(node.position, 'pre', [code])
}

  var _delete = strikethrough;



  function strikethrough(h, node) {
    return h(node, 'del', all_1$1(h, node))
  }

  var emphasis_1 = emphasis;



  function emphasis(h, node) {
    return h(node, 'em', all_1$1(h, node))
  }

  var footnoteReference_1 = footnoteReference;



  function footnoteReference(h, node) {
    var footnoteOrder = h.footnoteOrder;
    var identifier = String(node.identifier);

    if (footnoteOrder.indexOf(identifier) === -1) {
      footnoteOrder.push(identifier);
    }

    return h(node.position, 'sup', {id: 'fnref-' + identifier}, [
      h(node, 'a', {href: '#fn-' + identifier, className: ['footnote-ref']}, [
        unistBuilder('text', node.label || identifier)
      ])
    ])
  }

  var footnote_1 = footnote;



  function footnote(h, node) {
    var footnoteById = h.footnoteById;
    var footnoteOrder = h.footnoteOrder;
    var identifier = 1;

    while (identifier in footnoteById) {
      identifier++;
    }

    identifier = String(identifier);

    // No need to check if `identifier` exists in `footnoteOrder`, it’s guaranteed
    // to not exist because we just generated it.
    footnoteOrder.push(identifier);

    footnoteById[identifier] = {
      type: 'footnoteDefinition',
      identifier: identifier,
      children: [{type: 'paragraph', children: node.children}],
      position: node.position
    };

    return footnoteReference_1(h, {
      type: 'footnoteReference',
      identifier: identifier,
      position: node.position
    })
  }

  var heading_1 = heading;



  function heading(h, node) {
    return h(node, 'h' + node.depth, all_1$1(h, node))
  }

  var html_1$1 = html$3;



  // Return either a `raw` node in dangerous mode, otherwise nothing.
  function html$3(h, node) {
    return h.dangerous ? h.augment(node, unistBuilder('raw', node.value)) : null
  }

  var encodeCache = {};


  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //
  function getEncodeCache(exclude) {
    var i, ch, cache = encodeCache[exclude];
    if (cache) { return cache; }

    cache = encodeCache[exclude] = [];

    for (i = 0; i < 128; i++) {
      ch = String.fromCharCode(i);

      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
      }
    }

    for (i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache;
  }


  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //
  function encode$1(string, exclude, keepEscaped) {
    var i, l, code, nextCode, cache,
        result = '';

    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped  = exclude;
      exclude = encode$1.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    cache = getEncodeCache(exclude);

    for (i = 0, l = string.length; i < l; i++) {
      code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue;
        }
      }

      if (code < 128) {
        result += cache[code];
        continue;
      }

      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
          nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue;
          }
        }
        result += '%EF%BF%BD';
        continue;
      }

      result += encodeURIComponent(string[i]);
    }

    return result;
  }

  encode$1.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
  encode$1.componentChars = "-_.!~*'()";


  var encode_1 = encode$1;

  var revert_1 = revert;




  // Return the content of a reference without definition as Markdown.
  function revert(h, node) {
    var subtype = node.referenceType;
    var suffix = ']';
    var contents;
    var head;
    var tail;

    if (subtype === 'collapsed') {
      suffix += '[]';
    } else if (subtype === 'full') {
      suffix += '[' + (node.label || node.identifier) + ']';
    }

    if (node.type === 'imageReference') {
      return unistBuilder('text', '![' + node.alt + suffix)
    }

    contents = all_1$1(h, node);
    head = contents[0];

    if (head && head.type === 'text') {
      head.value = '[' + head.value;
    } else {
      contents.unshift(unistBuilder('text', '['));
    }

    tail = contents[contents.length - 1];

    if (tail && tail.type === 'text') {
      tail.value += suffix;
    } else {
      contents.push(unistBuilder('text', suffix));
    }

    return contents
  }

  var imageReference_1 = imageReference;




  function imageReference(h, node) {
    var def = h.definition(node.identifier);
    var props;

    if (!def) {
      return revert_1(h, node)
    }

    props = {src: encode_1(def.url || ''), alt: node.alt};

    if (def.title !== null && def.title !== undefined) {
      props.title = def.title;
    }

    return h(node, 'img', props)
  }

  var image_1 = image$1;

  function image$1(h, node) {
    var props = {src: encode_1(node.url), alt: node.alt};

    if (node.title !== null && node.title !== undefined) {
      props.title = node.title;
    }

    return h(node, 'img', props)
  }

  var inlineCode_1 = inlineCode;




  function inlineCode(h, node) {
    return h(node, 'code', [unistBuilder('text', collapseWhiteSpace(node.value))])
  }

  var linkReference_1 = linkReference;





  function linkReference(h, node) {
    var def = h.definition(node.identifier);
    var props;

    if (!def) {
      return revert_1(h, node)
    }

    props = {href: encode_1(def.url || '')};

    if (def.title !== null && def.title !== undefined) {
      props.title = def.title;
    }

    return h(node, 'a', props, all_1$1(h, node))
  }

  var link_1 = link;

  function link(h, node) {
    var props = {href: encode_1(node.url)};

    if (node.title !== null && node.title !== undefined) {
      props.title = node.title;
    }

    return h(node, 'a', props, all_1$1(h, node))
  }

  var listItem_1 = listItem$1;





  function listItem$1(h, node, parent) {
    var children = node.children;
    var head = children[0];
    var raw = all_1$1(h, node);
    var loose = parent ? listLoose(parent) : listItemLoose(node);
    var props = {};
    var result;
    var container;
    var index;
    var length;
    var child;

    // Tight lists should not render `paragraph` nodes as `p` elements.
    if (loose) {
      result = raw;
    } else {
      result = [];
      length = raw.length;
      index = -1;

      while (++index < length) {
        child = raw[index];

        if (child.tagName === 'p') {
          result = result.concat(child.children);
        } else {
          result.push(child);
        }
      }
    }

    if (typeof node.checked === 'boolean') {
      if (loose && (!head || head.type !== 'paragraph')) {
        result.unshift(h(null, 'p', []));
      }

      container = loose ? result[0].children : result;

      if (container.length !== 0) {
        container.unshift(unistBuilder('text', ' '));
      }

      container.unshift(
        h(null, 'input', {
          type: 'checkbox',
          checked: node.checked,
          disabled: true
        })
      );

      // According to github-markdown-css, this class hides bullet.
      // See: <https://github.com/sindresorhus/github-markdown-css>.
      props.className = ['task-list-item'];
    }

    if (loose && result.length !== 0) {
      result = wrap_1(result, true);
    }

    return h(node, 'li', props, result)
  }

  function listLoose(node) {
    var loose = node.spread;
    var children = node.children;
    var length = children.length;
    var index = -1;

    while (!loose && ++index < length) {
      loose = listItemLoose(children[index]);
    }

    return loose
  }

  function listItemLoose(node) {
    var spread = node.spread;

    return spread === undefined || spread === null
      ? node.children.length > 1
      : spread
  }

  var paragraph_1 = paragraph;



  function paragraph(h, node) {
    return h(node, 'p', all_1$1(h, node))
  }

  var root_1 = root;





  function root(h, node) {
    return h.augment(node, unistBuilder('root', wrap_1(all_1$1(h, node))))
  }

  var strong_1 = strong;



  function strong(h, node) {
    return h(node, 'strong', all_1$1(h, node))
  }

  var table_1 = table;





  function table(h, node) {
    var rows = node.children;
    var index = rows.length;
    var align = node.align;
    var alignLength = align.length;
    var result = [];
    var pos;
    var row;
    var out;
    var name;
    var cell;

    while (index--) {
      row = rows[index].children;
      name = index === 0 ? 'th' : 'td';
      pos = alignLength;
      out = [];

      while (pos--) {
        cell = row[pos];
        out[pos] = h(cell, name, {align: align[pos]}, cell ? all_1$1(h, cell) : []);
      }

      result[index] = h(rows[index], 'tr', wrap_1(out, true));
    }

    return h(
      node,
      'table',
      wrap_1(
        [
          h(result[0].position, 'thead', wrap_1([result[0]], true)),
          h(
            {
              start: unistUtilPosition.start(result[1]),
              end: unistUtilPosition.end(result[result.length - 1])
            },
            'tbody',
            wrap_1(result.slice(1), true)
          )
        ],
        true
      )
    )
  }

  var trimLines_1 = trimLines;

  var ws = /[ \t]*\n+[ \t]*/g;
  var newline$1 = '\n';

  function trimLines(value) {
    return String(value).replace(ws, newline$1)
  }

  var text_1$1 = text$1;




  function text$1(h, node) {
    return h.augment(node, unistBuilder('text', trimLines_1(node.value)))
  }

  var handlers$1 = {
    blockquote: blockquote_1,
    break: _break,
    code: code_1,
    delete: _delete,
    emphasis: emphasis_1,
    footnoteReference: footnoteReference_1,
    footnote: footnote_1,
    heading: heading_1,
    html: html_1$1,
    imageReference: imageReference_1,
    image: image_1,
    inlineCode: inlineCode_1,
    linkReference: linkReference_1,
    link: link_1,
    listItem: listItem_1,
    list: list_1,
    paragraph: paragraph_1,
    root: root_1,
    strong: strong_1,
    table: table_1,
    text: text_1$1,
    thematicBreak: thematicBreak_1,
    toml: ignore,
    yaml: ignore,
    definition: ignore,
    footnoteDefinition: ignore
  };

  // Return nothing for nodes that are ignored.
  function ignore() {
    return null
  }

  var lib$2 = toHast;










  var own$6 = {}.hasOwnProperty;

  var deprecationWarningIssued = false;

  // Factory to transform.
  function factory(tree, options) {
    var settings = options || {};

    // Issue a warning if the deprecated tag 'allowDangerousHTML' is used
    if (settings.allowDangerousHTML !== undefined && !deprecationWarningIssued) {
      deprecationWarningIssued = true;
      console.warn(
        'mdast-util-to-hast: deprecation: `allowDangerousHTML` is nonstandard, use `allowDangerousHtml` instead'
      );
    }

    var dangerous = settings.allowDangerousHtml || settings.allowDangerousHTML;
    var footnoteById = {};

    h.dangerous = dangerous;
    h.definition = mdastUtilDefinitions(tree, settings);
    h.footnoteById = footnoteById;
    h.footnoteOrder = [];
    h.augment = augment;
    h.handlers = Object.assign({}, handlers$1, settings.handlers);
    h.unknownHandler = settings.unknownHandler;

    unistUtilVisit(tree, 'footnoteDefinition', onfootnotedefinition);

    return h

    // Finalise the created `right`, a hast node, from `left`, an mdast node.
    function augment(left, right) {
      var data;
      var ctx;

      // Handle `data.hName`, `data.hProperties, `data.hChildren`.
      if (left && 'data' in left) {
        data = left.data;

        if (right.type === 'element' && data.hName) {
          right.tagName = data.hName;
        }

        if (right.type === 'element' && data.hProperties) {
          right.properties = Object.assign({}, right.properties, data.hProperties);
        }

        if (right.children && data.hChildren) {
          right.children = data.hChildren;
        }
      }

      ctx = left && left.position ? left : {position: left};

      if (!unistUtilGenerated(ctx)) {
        right.position = {
          start: unistUtilPosition.start(ctx),
          end: unistUtilPosition.end(ctx)
        };
      }

      return right
    }

    // Create an element for `node`.
    function h(node, tagName, props, children) {
      if (
        (children === undefined || children === null) &&
        typeof props === 'object' &&
        'length' in props
      ) {
        children = props;
        props = {};
      }

      return augment(node, {
        type: 'element',
        tagName: tagName,
        properties: props || {},
        children: children || []
      })
    }

    function onfootnotedefinition(definition) {
      var id = String(definition.identifier).toUpperCase();

      // Mimick CM behavior of link definitions.
      // See: <https://github.com/syntax-tree/mdast-util-definitions/blob/8d48e57/index.js#L26>.
      if (!own$6.call(footnoteById, id)) {
        footnoteById[id] = definition;
      }
    }
  }

  // Transform `tree`, which is an mdast node, to a hast node.
  function toHast(tree, options) {
    var h = factory(tree, options);
    var node = one_1$1(h, tree);
    var foot = footer(h);

    if (foot) {
      node.children = node.children.concat(unistBuilder('text', '\n'), foot);
    }

    return node
  }

  var mdastUtilToHast = lib$2;

  var remarkRehype = remark2rehype;

  // Attacher.
  // If a destination is given, runs the destination with the new hast tree
  // (bridge mode).
  // Without destination, returns the tree: further plugins run on that tree
  // (mutate mode).
  function remark2rehype(destination, options) {
    if (destination && !destination.process) {
      options = destination;
      destination = null;
    }

    return destination ? bridge(destination, options) : mutate(options)
  }

  // Bridge mode.
  // Runs the destination with the new hast tree.
  function bridge(destination, options) {
    return transformer

    function transformer(node, file, next) {
      destination.run(mdastUtilToHast(node, options), file, done);

      function done(err) {
        next(err);
      }
    }
  }

  // Mutate-mode.
  // Further transformers run on the hast tree.
  function mutate(options) {
    return transformer

    function transformer(node) {
      return mdastUtilToHast(node, options)
    }
  }

  var schema$1 = Schema$2;

  var proto$2 = Schema$2.prototype;

  proto$2.space = null;
  proto$2.normal = {};
  proto$2.property = {};

  function Schema$2(property, normal, space) {
    this.property = property;
    this.normal = normal;

    if (space) {
      this.space = space;
    }
  }

  var merge_1 = merge$1;

  function merge$1(definitions) {
    var length = definitions.length;
    var property = [];
    var normal = [];
    var index = -1;
    var info;
    var space;

    while (++index < length) {
      info = definitions[index];
      property.push(info.property);
      normal.push(info.normal);
      space = info.space;
    }

    return new schema$1(
      immutable.apply(null, property),
      immutable.apply(null, normal),
      space
    )
  }

  var normalize_1 = normalize;

  function normalize(value) {
    return value.toLowerCase()
  }

  var info = Info;

  var proto$1 = Info.prototype;

  proto$1.space = null;
  proto$1.attribute = null;
  proto$1.property = null;
  proto$1.boolean = false;
  proto$1.booleanish = false;
  proto$1.overloadedBoolean = false;
  proto$1.number = false;
  proto$1.commaSeparated = false;
  proto$1.spaceSeparated = false;
  proto$1.commaOrSpaceSeparated = false;
  proto$1.mustUseProperty = false;
  proto$1.defined = false;

  function Info(property, attribute) {
    this.property = property;
    this.attribute = attribute;
  }

  var powers = 0;

  var boolean_1 = increment();
  var booleanish$2 = increment();
  var overloadedBoolean$1 = increment();
  var number$3 = increment();
  var spaceSeparated$3 = increment();
  var commaSeparated$2 = increment();
  var commaOrSpaceSeparated$1 = increment();

  function increment() {
    return Math.pow(2, ++powers)
  }

  var types = {
  	boolean: boolean_1,
  	booleanish: booleanish$2,
  	overloadedBoolean: overloadedBoolean$1,
  	number: number$3,
  	spaceSeparated: spaceSeparated$3,
  	commaSeparated: commaSeparated$2,
  	commaOrSpaceSeparated: commaOrSpaceSeparated$1
  };

  var definedInfo = DefinedInfo;

  DefinedInfo.prototype = new info();
  DefinedInfo.prototype.defined = true;

  var checks = [
    'boolean',
    'booleanish',
    'overloadedBoolean',
    'number',
    'commaSeparated',
    'spaceSeparated',
    'commaOrSpaceSeparated'
  ];
  var checksLength = checks.length;

  function DefinedInfo(property, attribute, mask, space) {
    var index = -1;
    var check;

    mark$1(this, 'space', space);

    info.call(this, property, attribute);

    while (++index < checksLength) {
      check = checks[index];
      mark$1(this, check, (mask & types[check]) === types[check]);
    }
  }

  function mark$1(values, key, value) {
    if (value) {
      values[key] = value;
    }
  }

  var create_1 = create;

  function create(definition) {
    var space = definition.space;
    var mustUseProperty = definition.mustUseProperty || [];
    var attributes = definition.attributes || {};
    var props = definition.properties;
    var transform = definition.transform;
    var property = {};
    var normal = {};
    var prop;
    var info;

    for (prop in props) {
      info = new definedInfo(
        prop,
        transform(attributes, prop),
        props[prop],
        space
      );

      if (mustUseProperty.indexOf(prop) !== -1) {
        info.mustUseProperty = true;
      }

      property[prop] = info;

      normal[normalize_1(prop)] = prop;
      normal[normalize_1(info.attribute)] = prop;
    }

    return new schema$1(property, normal, space)
  }

  var xlink = create_1({
    space: 'xlink',
    transform: xlinkTransform,
    properties: {
      xLinkActuate: null,
      xLinkArcRole: null,
      xLinkHref: null,
      xLinkRole: null,
      xLinkShow: null,
      xLinkTitle: null,
      xLinkType: null
    }
  });

  function xlinkTransform(_, prop) {
    return 'xlink:' + prop.slice(5).toLowerCase()
  }

  var xml = create_1({
    space: 'xml',
    transform: xmlTransform,
    properties: {
      xmlLang: null,
      xmlBase: null,
      xmlSpace: null
    }
  });

  function xmlTransform(_, prop) {
    return 'xml:' + prop.slice(3).toLowerCase()
  }

  var caseSensitiveTransform_1 = caseSensitiveTransform;

  function caseSensitiveTransform(attributes, attribute) {
    return attribute in attributes ? attributes[attribute] : attribute
  }

  var caseInsensitiveTransform_1 = caseInsensitiveTransform;

  function caseInsensitiveTransform(attributes, property) {
    return caseSensitiveTransform_1(attributes, property.toLowerCase())
  }

  var xmlns = create_1({
    space: 'xmlns',
    attributes: {
      xmlnsxlink: 'xmlns:xlink'
    },
    transform: caseInsensitiveTransform_1,
    properties: {
      xmlns: null,
      xmlnsXLink: null
    }
  });

  var booleanish$1 = types.booleanish;
  var number$2 = types.number;
  var spaceSeparated$2 = types.spaceSeparated;

  var aria = create_1({
    transform: ariaTransform,
    properties: {
      ariaActiveDescendant: null,
      ariaAtomic: booleanish$1,
      ariaAutoComplete: null,
      ariaBusy: booleanish$1,
      ariaChecked: booleanish$1,
      ariaColCount: number$2,
      ariaColIndex: number$2,
      ariaColSpan: number$2,
      ariaControls: spaceSeparated$2,
      ariaCurrent: null,
      ariaDescribedBy: spaceSeparated$2,
      ariaDetails: null,
      ariaDisabled: booleanish$1,
      ariaDropEffect: spaceSeparated$2,
      ariaErrorMessage: null,
      ariaExpanded: booleanish$1,
      ariaFlowTo: spaceSeparated$2,
      ariaGrabbed: booleanish$1,
      ariaHasPopup: null,
      ariaHidden: booleanish$1,
      ariaInvalid: null,
      ariaKeyShortcuts: null,
      ariaLabel: null,
      ariaLabelledBy: spaceSeparated$2,
      ariaLevel: number$2,
      ariaLive: null,
      ariaModal: booleanish$1,
      ariaMultiLine: booleanish$1,
      ariaMultiSelectable: booleanish$1,
      ariaOrientation: null,
      ariaOwns: spaceSeparated$2,
      ariaPlaceholder: null,
      ariaPosInSet: number$2,
      ariaPressed: booleanish$1,
      ariaReadOnly: booleanish$1,
      ariaRelevant: null,
      ariaRequired: booleanish$1,
      ariaRoleDescription: spaceSeparated$2,
      ariaRowCount: number$2,
      ariaRowIndex: number$2,
      ariaRowSpan: number$2,
      ariaSelected: booleanish$1,
      ariaSetSize: number$2,
      ariaSort: null,
      ariaValueMax: number$2,
      ariaValueMin: number$2,
      ariaValueNow: number$2,
      ariaValueText: null,
      role: null
    }
  });

  function ariaTransform(_, prop) {
    return prop === 'role' ? prop : 'aria-' + prop.slice(4).toLowerCase()
  }

  var boolean$1 = types.boolean;
  var overloadedBoolean = types.overloadedBoolean;
  var booleanish = types.booleanish;
  var number$1 = types.number;
  var spaceSeparated$1 = types.spaceSeparated;
  var commaSeparated$1 = types.commaSeparated;

  var html$2 = create_1({
    space: 'html',
    attributes: {
      acceptcharset: 'accept-charset',
      classname: 'class',
      htmlfor: 'for',
      httpequiv: 'http-equiv'
    },
    transform: caseInsensitiveTransform_1,
    mustUseProperty: ['checked', 'multiple', 'muted', 'selected'],
    properties: {
      // Standard Properties.
      abbr: null,
      accept: commaSeparated$1,
      acceptCharset: spaceSeparated$1,
      accessKey: spaceSeparated$1,
      action: null,
      allow: null,
      allowFullScreen: boolean$1,
      allowPaymentRequest: boolean$1,
      allowUserMedia: boolean$1,
      alt: null,
      as: null,
      async: boolean$1,
      autoCapitalize: null,
      autoComplete: spaceSeparated$1,
      autoFocus: boolean$1,
      autoPlay: boolean$1,
      capture: boolean$1,
      charSet: null,
      checked: boolean$1,
      cite: null,
      className: spaceSeparated$1,
      cols: number$1,
      colSpan: null,
      content: null,
      contentEditable: booleanish,
      controls: boolean$1,
      controlsList: spaceSeparated$1,
      coords: number$1 | commaSeparated$1,
      crossOrigin: null,
      data: null,
      dateTime: null,
      decoding: null,
      default: boolean$1,
      defer: boolean$1,
      dir: null,
      dirName: null,
      disabled: boolean$1,
      download: overloadedBoolean,
      draggable: booleanish,
      encType: null,
      enterKeyHint: null,
      form: null,
      formAction: null,
      formEncType: null,
      formMethod: null,
      formNoValidate: boolean$1,
      formTarget: null,
      headers: spaceSeparated$1,
      height: number$1,
      hidden: boolean$1,
      high: number$1,
      href: null,
      hrefLang: null,
      htmlFor: spaceSeparated$1,
      httpEquiv: spaceSeparated$1,
      id: null,
      imageSizes: null,
      imageSrcSet: commaSeparated$1,
      inputMode: null,
      integrity: null,
      is: null,
      isMap: boolean$1,
      itemId: null,
      itemProp: spaceSeparated$1,
      itemRef: spaceSeparated$1,
      itemScope: boolean$1,
      itemType: spaceSeparated$1,
      kind: null,
      label: null,
      lang: null,
      language: null,
      list: null,
      loop: boolean$1,
      low: number$1,
      manifest: null,
      max: null,
      maxLength: number$1,
      media: null,
      method: null,
      min: null,
      minLength: number$1,
      multiple: boolean$1,
      muted: boolean$1,
      name: null,
      nonce: null,
      noModule: boolean$1,
      noValidate: boolean$1,
      onAbort: null,
      onAfterPrint: null,
      onAuxClick: null,
      onBeforePrint: null,
      onBeforeUnload: null,
      onBlur: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onContextMenu: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFormData: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLanguageChange: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadEnd: null,
      onLoadStart: null,
      onMessage: null,
      onMessageError: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRejectionHandled: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onSecurityPolicyViolation: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onSlotChange: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnhandledRejection: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onWheel: null,
      open: boolean$1,
      optimum: number$1,
      pattern: null,
      ping: spaceSeparated$1,
      placeholder: null,
      playsInline: boolean$1,
      poster: null,
      preload: null,
      readOnly: boolean$1,
      referrerPolicy: null,
      rel: spaceSeparated$1,
      required: boolean$1,
      reversed: boolean$1,
      rows: number$1,
      rowSpan: number$1,
      sandbox: spaceSeparated$1,
      scope: null,
      scoped: boolean$1,
      seamless: boolean$1,
      selected: boolean$1,
      shape: null,
      size: number$1,
      sizes: null,
      slot: null,
      span: number$1,
      spellCheck: booleanish,
      src: null,
      srcDoc: null,
      srcLang: null,
      srcSet: commaSeparated$1,
      start: number$1,
      step: null,
      style: null,
      tabIndex: number$1,
      target: null,
      title: null,
      translate: null,
      type: null,
      typeMustMatch: boolean$1,
      useMap: null,
      value: booleanish,
      width: number$1,
      wrap: null,

      // Legacy.
      // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
      align: null, // Several. Use CSS `text-align` instead,
      aLink: null, // `<body>`. Use CSS `a:active {color}` instead
      archive: spaceSeparated$1, // `<object>`. List of URIs to archives
      axis: null, // `<td>` and `<th>`. Use `scope` on `<th>`
      background: null, // `<body>`. Use CSS `background-image` instead
      bgColor: null, // `<body>` and table elements. Use CSS `background-color` instead
      border: number$1, // `<table>`. Use CSS `border-width` instead,
      borderColor: null, // `<table>`. Use CSS `border-color` instead,
      bottomMargin: number$1, // `<body>`
      cellPadding: null, // `<table>`
      cellSpacing: null, // `<table>`
      char: null, // Several table elements. When `align=char`, sets the character to align on
      charOff: null, // Several table elements. When `char`, offsets the alignment
      classId: null, // `<object>`
      clear: null, // `<br>`. Use CSS `clear` instead
      code: null, // `<object>`
      codeBase: null, // `<object>`
      codeType: null, // `<object>`
      color: null, // `<font>` and `<hr>`. Use CSS instead
      compact: boolean$1, // Lists. Use CSS to reduce space between items instead
      declare: boolean$1, // `<object>`
      event: null, // `<script>`
      face: null, // `<font>`. Use CSS instead
      frame: null, // `<table>`
      frameBorder: null, // `<iframe>`. Use CSS `border` instead
      hSpace: number$1, // `<img>` and `<object>`
      leftMargin: number$1, // `<body>`
      link: null, // `<body>`. Use CSS `a:link {color: *}` instead
      longDesc: null, // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
      lowSrc: null, // `<img>`. Use a `<picture>`
      marginHeight: number$1, // `<body>`
      marginWidth: number$1, // `<body>`
      noResize: boolean$1, // `<frame>`
      noHref: boolean$1, // `<area>`. Use no href instead of an explicit `nohref`
      noShade: boolean$1, // `<hr>`. Use background-color and height instead of borders
      noWrap: boolean$1, // `<td>` and `<th>`
      object: null, // `<applet>`
      profile: null, // `<head>`
      prompt: null, // `<isindex>`
      rev: null, // `<link>`
      rightMargin: number$1, // `<body>`
      rules: null, // `<table>`
      scheme: null, // `<meta>`
      scrolling: booleanish, // `<frame>`. Use overflow in the child context
      standby: null, // `<object>`
      summary: null, // `<table>`
      text: null, // `<body>`. Use CSS `color` instead
      topMargin: number$1, // `<body>`
      valueType: null, // `<param>`
      version: null, // `<html>`. Use a doctype.
      vAlign: null, // Several. Use CSS `vertical-align` instead
      vLink: null, // `<body>`. Use CSS `a:visited {color}` instead
      vSpace: number$1, // `<img>` and `<object>`

      // Non-standard Properties.
      allowTransparency: null,
      autoCorrect: null,
      autoSave: null,
      disablePictureInPicture: boolean$1,
      disableRemotePlayback: boolean$1,
      prefix: null,
      property: null,
      results: number$1,
      security: null,
      unselectable: null
    }
  });

  var html_1 = merge_1([xml, xlink, xmlns, aria, html$2]);

  var boolean = types.boolean;
  var number = types.number;
  var spaceSeparated = types.spaceSeparated;
  var commaSeparated = types.commaSeparated;
  var commaOrSpaceSeparated = types.commaOrSpaceSeparated;

  var svg = create_1({
    space: 'svg',
    attributes: {
      accentHeight: 'accent-height',
      alignmentBaseline: 'alignment-baseline',
      arabicForm: 'arabic-form',
      baselineShift: 'baseline-shift',
      capHeight: 'cap-height',
      className: 'class',
      clipPath: 'clip-path',
      clipRule: 'clip-rule',
      colorInterpolation: 'color-interpolation',
      colorInterpolationFilters: 'color-interpolation-filters',
      colorProfile: 'color-profile',
      colorRendering: 'color-rendering',
      crossOrigin: 'crossorigin',
      dataType: 'datatype',
      dominantBaseline: 'dominant-baseline',
      enableBackground: 'enable-background',
      fillOpacity: 'fill-opacity',
      fillRule: 'fill-rule',
      floodColor: 'flood-color',
      floodOpacity: 'flood-opacity',
      fontFamily: 'font-family',
      fontSize: 'font-size',
      fontSizeAdjust: 'font-size-adjust',
      fontStretch: 'font-stretch',
      fontStyle: 'font-style',
      fontVariant: 'font-variant',
      fontWeight: 'font-weight',
      glyphName: 'glyph-name',
      glyphOrientationHorizontal: 'glyph-orientation-horizontal',
      glyphOrientationVertical: 'glyph-orientation-vertical',
      hrefLang: 'hreflang',
      horizAdvX: 'horiz-adv-x',
      horizOriginX: 'horiz-origin-x',
      horizOriginY: 'horiz-origin-y',
      imageRendering: 'image-rendering',
      letterSpacing: 'letter-spacing',
      lightingColor: 'lighting-color',
      markerEnd: 'marker-end',
      markerMid: 'marker-mid',
      markerStart: 'marker-start',
      navDown: 'nav-down',
      navDownLeft: 'nav-down-left',
      navDownRight: 'nav-down-right',
      navLeft: 'nav-left',
      navNext: 'nav-next',
      navPrev: 'nav-prev',
      navRight: 'nav-right',
      navUp: 'nav-up',
      navUpLeft: 'nav-up-left',
      navUpRight: 'nav-up-right',
      onAbort: 'onabort',
      onActivate: 'onactivate',
      onAfterPrint: 'onafterprint',
      onBeforePrint: 'onbeforeprint',
      onBegin: 'onbegin',
      onCancel: 'oncancel',
      onCanPlay: 'oncanplay',
      onCanPlayThrough: 'oncanplaythrough',
      onChange: 'onchange',
      onClick: 'onclick',
      onClose: 'onclose',
      onCopy: 'oncopy',
      onCueChange: 'oncuechange',
      onCut: 'oncut',
      onDblClick: 'ondblclick',
      onDrag: 'ondrag',
      onDragEnd: 'ondragend',
      onDragEnter: 'ondragenter',
      onDragExit: 'ondragexit',
      onDragLeave: 'ondragleave',
      onDragOver: 'ondragover',
      onDragStart: 'ondragstart',
      onDrop: 'ondrop',
      onDurationChange: 'ondurationchange',
      onEmptied: 'onemptied',
      onEnd: 'onend',
      onEnded: 'onended',
      onError: 'onerror',
      onFocus: 'onfocus',
      onFocusIn: 'onfocusin',
      onFocusOut: 'onfocusout',
      onHashChange: 'onhashchange',
      onInput: 'oninput',
      onInvalid: 'oninvalid',
      onKeyDown: 'onkeydown',
      onKeyPress: 'onkeypress',
      onKeyUp: 'onkeyup',
      onLoad: 'onload',
      onLoadedData: 'onloadeddata',
      onLoadedMetadata: 'onloadedmetadata',
      onLoadStart: 'onloadstart',
      onMessage: 'onmessage',
      onMouseDown: 'onmousedown',
      onMouseEnter: 'onmouseenter',
      onMouseLeave: 'onmouseleave',
      onMouseMove: 'onmousemove',
      onMouseOut: 'onmouseout',
      onMouseOver: 'onmouseover',
      onMouseUp: 'onmouseup',
      onMouseWheel: 'onmousewheel',
      onOffline: 'onoffline',
      onOnline: 'ononline',
      onPageHide: 'onpagehide',
      onPageShow: 'onpageshow',
      onPaste: 'onpaste',
      onPause: 'onpause',
      onPlay: 'onplay',
      onPlaying: 'onplaying',
      onPopState: 'onpopstate',
      onProgress: 'onprogress',
      onRateChange: 'onratechange',
      onRepeat: 'onrepeat',
      onReset: 'onreset',
      onResize: 'onresize',
      onScroll: 'onscroll',
      onSeeked: 'onseeked',
      onSeeking: 'onseeking',
      onSelect: 'onselect',
      onShow: 'onshow',
      onStalled: 'onstalled',
      onStorage: 'onstorage',
      onSubmit: 'onsubmit',
      onSuspend: 'onsuspend',
      onTimeUpdate: 'ontimeupdate',
      onToggle: 'ontoggle',
      onUnload: 'onunload',
      onVolumeChange: 'onvolumechange',
      onWaiting: 'onwaiting',
      onZoom: 'onzoom',
      overlinePosition: 'overline-position',
      overlineThickness: 'overline-thickness',
      paintOrder: 'paint-order',
      panose1: 'panose-1',
      pointerEvents: 'pointer-events',
      referrerPolicy: 'referrerpolicy',
      renderingIntent: 'rendering-intent',
      shapeRendering: 'shape-rendering',
      stopColor: 'stop-color',
      stopOpacity: 'stop-opacity',
      strikethroughPosition: 'strikethrough-position',
      strikethroughThickness: 'strikethrough-thickness',
      strokeDashArray: 'stroke-dasharray',
      strokeDashOffset: 'stroke-dashoffset',
      strokeLineCap: 'stroke-linecap',
      strokeLineJoin: 'stroke-linejoin',
      strokeMiterLimit: 'stroke-miterlimit',
      strokeOpacity: 'stroke-opacity',
      strokeWidth: 'stroke-width',
      tabIndex: 'tabindex',
      textAnchor: 'text-anchor',
      textDecoration: 'text-decoration',
      textRendering: 'text-rendering',
      typeOf: 'typeof',
      underlinePosition: 'underline-position',
      underlineThickness: 'underline-thickness',
      unicodeBidi: 'unicode-bidi',
      unicodeRange: 'unicode-range',
      unitsPerEm: 'units-per-em',
      vAlphabetic: 'v-alphabetic',
      vHanging: 'v-hanging',
      vIdeographic: 'v-ideographic',
      vMathematical: 'v-mathematical',
      vectorEffect: 'vector-effect',
      vertAdvY: 'vert-adv-y',
      vertOriginX: 'vert-origin-x',
      vertOriginY: 'vert-origin-y',
      wordSpacing: 'word-spacing',
      writingMode: 'writing-mode',
      xHeight: 'x-height',
      // These were camelcased in Tiny. Now lowercased in SVG 2
      playbackOrder: 'playbackorder',
      timelineBegin: 'timelinebegin'
    },
    transform: caseSensitiveTransform_1,
    properties: {
      about: commaOrSpaceSeparated,
      accentHeight: number,
      accumulate: null,
      additive: null,
      alignmentBaseline: null,
      alphabetic: number,
      amplitude: number,
      arabicForm: null,
      ascent: number,
      attributeName: null,
      attributeType: null,
      azimuth: number,
      bandwidth: null,
      baselineShift: null,
      baseFrequency: null,
      baseProfile: null,
      bbox: null,
      begin: null,
      bias: number,
      by: null,
      calcMode: null,
      capHeight: number,
      className: spaceSeparated,
      clip: null,
      clipPath: null,
      clipPathUnits: null,
      clipRule: null,
      color: null,
      colorInterpolation: null,
      colorInterpolationFilters: null,
      colorProfile: null,
      colorRendering: null,
      content: null,
      contentScriptType: null,
      contentStyleType: null,
      crossOrigin: null,
      cursor: null,
      cx: null,
      cy: null,
      d: null,
      dataType: null,
      defaultAction: null,
      descent: number,
      diffuseConstant: number,
      direction: null,
      display: null,
      dur: null,
      divisor: number,
      dominantBaseline: null,
      download: boolean,
      dx: null,
      dy: null,
      edgeMode: null,
      editable: null,
      elevation: number,
      enableBackground: null,
      end: null,
      event: null,
      exponent: number,
      externalResourcesRequired: null,
      fill: null,
      fillOpacity: number,
      fillRule: null,
      filter: null,
      filterRes: null,
      filterUnits: null,
      floodColor: null,
      floodOpacity: null,
      focusable: null,
      focusHighlight: null,
      fontFamily: null,
      fontSize: null,
      fontSizeAdjust: null,
      fontStretch: null,
      fontStyle: null,
      fontVariant: null,
      fontWeight: null,
      format: null,
      fr: null,
      from: null,
      fx: null,
      fy: null,
      g1: commaSeparated,
      g2: commaSeparated,
      glyphName: commaSeparated,
      glyphOrientationHorizontal: null,
      glyphOrientationVertical: null,
      glyphRef: null,
      gradientTransform: null,
      gradientUnits: null,
      handler: null,
      hanging: number,
      hatchContentUnits: null,
      hatchUnits: null,
      height: null,
      href: null,
      hrefLang: null,
      horizAdvX: number,
      horizOriginX: number,
      horizOriginY: number,
      id: null,
      ideographic: number,
      imageRendering: null,
      initialVisibility: null,
      in: null,
      in2: null,
      intercept: number,
      k: number,
      k1: number,
      k2: number,
      k3: number,
      k4: number,
      kernelMatrix: commaOrSpaceSeparated,
      kernelUnitLength: null,
      keyPoints: null, // SEMI_COLON_SEPARATED
      keySplines: null, // SEMI_COLON_SEPARATED
      keyTimes: null, // SEMI_COLON_SEPARATED
      kerning: null,
      lang: null,
      lengthAdjust: null,
      letterSpacing: null,
      lightingColor: null,
      limitingConeAngle: number,
      local: null,
      markerEnd: null,
      markerMid: null,
      markerStart: null,
      markerHeight: null,
      markerUnits: null,
      markerWidth: null,
      mask: null,
      maskContentUnits: null,
      maskUnits: null,
      mathematical: null,
      max: null,
      media: null,
      mediaCharacterEncoding: null,
      mediaContentEncodings: null,
      mediaSize: number,
      mediaTime: null,
      method: null,
      min: null,
      mode: null,
      name: null,
      navDown: null,
      navDownLeft: null,
      navDownRight: null,
      navLeft: null,
      navNext: null,
      navPrev: null,
      navRight: null,
      navUp: null,
      navUpLeft: null,
      navUpRight: null,
      numOctaves: null,
      observer: null,
      offset: null,
      onAbort: null,
      onActivate: null,
      onAfterPrint: null,
      onBeforePrint: null,
      onBegin: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnd: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFocusIn: null,
      onFocusOut: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadStart: null,
      onMessage: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onMouseWheel: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRepeat: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onShow: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onZoom: null,
      opacity: null,
      operator: null,
      order: null,
      orient: null,
      orientation: null,
      origin: null,
      overflow: null,
      overlay: null,
      overlinePosition: number,
      overlineThickness: number,
      paintOrder: null,
      panose1: null,
      path: null,
      pathLength: number,
      patternContentUnits: null,
      patternTransform: null,
      patternUnits: null,
      phase: null,
      ping: spaceSeparated,
      pitch: null,
      playbackOrder: null,
      pointerEvents: null,
      points: null,
      pointsAtX: number,
      pointsAtY: number,
      pointsAtZ: number,
      preserveAlpha: null,
      preserveAspectRatio: null,
      primitiveUnits: null,
      propagate: null,
      property: commaOrSpaceSeparated,
      r: null,
      radius: null,
      referrerPolicy: null,
      refX: null,
      refY: null,
      rel: commaOrSpaceSeparated,
      rev: commaOrSpaceSeparated,
      renderingIntent: null,
      repeatCount: null,
      repeatDur: null,
      requiredExtensions: commaOrSpaceSeparated,
      requiredFeatures: commaOrSpaceSeparated,
      requiredFonts: commaOrSpaceSeparated,
      requiredFormats: commaOrSpaceSeparated,
      resource: null,
      restart: null,
      result: null,
      rotate: null,
      rx: null,
      ry: null,
      scale: null,
      seed: null,
      shapeRendering: null,
      side: null,
      slope: null,
      snapshotTime: null,
      specularConstant: number,
      specularExponent: number,
      spreadMethod: null,
      spacing: null,
      startOffset: null,
      stdDeviation: null,
      stemh: null,
      stemv: null,
      stitchTiles: null,
      stopColor: null,
      stopOpacity: null,
      strikethroughPosition: number,
      strikethroughThickness: number,
      string: null,
      stroke: null,
      strokeDashArray: commaOrSpaceSeparated,
      strokeDashOffset: null,
      strokeLineCap: null,
      strokeLineJoin: null,
      strokeMiterLimit: number,
      strokeOpacity: number,
      strokeWidth: null,
      style: null,
      surfaceScale: number,
      syncBehavior: null,
      syncBehaviorDefault: null,
      syncMaster: null,
      syncTolerance: null,
      syncToleranceDefault: null,
      systemLanguage: commaOrSpaceSeparated,
      tabIndex: number,
      tableValues: null,
      target: null,
      targetX: number,
      targetY: number,
      textAnchor: null,
      textDecoration: null,
      textRendering: null,
      textLength: null,
      timelineBegin: null,
      title: null,
      transformBehavior: null,
      type: null,
      typeOf: commaOrSpaceSeparated,
      to: null,
      transform: null,
      u1: null,
      u2: null,
      underlinePosition: number,
      underlineThickness: number,
      unicode: null,
      unicodeBidi: null,
      unicodeRange: null,
      unitsPerEm: number,
      values: null,
      vAlphabetic: number,
      vMathematical: number,
      vectorEffect: null,
      vHanging: number,
      vIdeographic: number,
      version: null,
      vertAdvY: number,
      vertOriginX: number,
      vertOriginY: number,
      viewBox: null,
      viewTarget: null,
      visibility: null,
      width: null,
      widths: null,
      wordSpacing: null,
      writingMode: null,
      x: null,
      x1: null,
      x2: null,
      xChannelSelector: null,
      xHeight: number,
      y: null,
      y1: null,
      y2: null,
      yChannelSelector: null,
      z: null,
      zoomAndPan: null
    }
  });

  var svg_1 = merge_1([xml, xlink, xmlns, aria, svg]);

  var index$2 = [
  	"area",
  	"base",
  	"basefont",
  	"bgsound",
  	"br",
  	"col",
  	"command",
  	"embed",
  	"frame",
  	"hr",
  	"image",
  	"img",
  	"input",
  	"isindex",
  	"keygen",
  	"link",
  	"menuitem",
  	"meta",
  	"nextid",
  	"param",
  	"source",
  	"track",
  	"wbr"
  ];

  var htmlVoidElements = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': index$2
  });

  var unistUtilIs = is;

  // Assert if `test` passes for `node`.   When a `parent` node is known the
  // `index` of node.
  // eslint-disable-next-line max-params
  function is(test, node, index, parent, context) {
    var hasParent = parent !== null && parent !== undefined;
    var hasIndex = index !== null && index !== undefined;
    var check = convert(test);

    if (
      hasIndex &&
      (typeof index !== 'number' || index < 0 || index === Infinity)
    ) {
      throw new Error('Expected positive finite index or child node')
    }

    if (hasParent && (!is(null, parent) || !parent.children)) {
      throw new Error('Expected parent node')
    }

    if (!node || !node.type || typeof node.type !== 'string') {
      return false
    }

    if (hasParent !== hasIndex) {
      throw new Error('Expected both parent and index')
    }

    return Boolean(check.call(context, node, index, parent))
  }

  function convert(test) {
    if (typeof test === 'string') {
      return typeFactory(test)
    }

    if (test === null || test === undefined) {
      return ok
    }

    if (typeof test === 'object') {
      return ('length' in test ? anyFactory : matchesFactory)(test)
    }

    if (typeof test === 'function') {
      return test
    }

    throw new Error('Expected function, string, or object as test')
  }

  function convertAll(tests) {
    var results = [];
    var length = tests.length;
    var index = -1;

    while (++index < length) {
      results[index] = convert(tests[index]);
    }

    return results
  }

  // Utility assert each property in `test` is represented in `node`, and each
  // values are strictly equal.
  function matchesFactory(test) {
    return matches

    function matches(node) {
      var key;

      for (key in test) {
        if (node[key] !== test[key]) {
          return false
        }
      }

      return true
    }
  }

  function anyFactory(tests) {
    var checks = convertAll(tests);
    var length = checks.length;

    return matches

    function matches() {
      var index = -1;

      while (++index < length) {
        if (checks[index].apply(this, arguments)) {
          return true
        }
      }

      return false
    }
  }

  // Utility to convert a string into a function which checks a given node’s type
  // for said string.
  function typeFactory(test) {
    return type

    function type(node) {
      return Boolean(node && node.type === test)
    }
  }

  // Utility to return true.
  function ok() {
    return true
  }

  var hastUtilIsElement = isElement;

  // Check if if `node` is an `element` and, if `tagNames` is given, `node`
  // matches them `tagNames`.
  function isElement(node, tagNames) {
    var name;

    if (
      !(
        tagNames === null ||
        tagNames === undefined ||
        typeof tagNames === 'string' ||
        (typeof tagNames === 'object' && tagNames.length !== 0)
      )
    ) {
      throw new Error(
        'Expected `string` or `Array.<string>` for `tagNames`, not `' +
          tagNames +
          '`'
      )
    }

    if (
      !node ||
      typeof node !== 'object' ||
      node.type !== 'element' ||
      typeof node.tagName !== 'string'
    ) {
      return false
    }

    if (tagNames === null || tagNames === undefined) {
      return true
    }

    name = node.tagName;

    if (typeof tagNames === 'string') {
      return name === tagNames
    }

    return tagNames.indexOf(name) !== -1
  }

  var hastUtilWhitespace = interElementWhiteSpace;

  // HTML white-space expression.
  // See <https://html.spec.whatwg.org/#space-character>.
  var re = /[ \t\n\f\r]/g;

  function interElementWhiteSpace(node) {
    var value;

    if (node && typeof node === 'object' && node.type === 'text') {
      value = node.value || '';
    } else if (typeof node === 'string') {
      value = node;
    } else {
      return false
    }

    return value.replace(re, '') === ''
  }

  var before$1 = siblings(-1);
  var after$2 = siblings(1);

  /* Factory to check siblings in a direction. */
  function siblings(increment) {
    return sibling

    /* Find applicable siblings in a direction.   */
    function sibling(parent, index, includeWhiteSpace) {
      var siblings = parent && parent.children;
      var next;

      index += increment;
      next = siblings && siblings[index];

      if (!includeWhiteSpace) {
        while (next && hastUtilWhitespace(next)) {
          index += increment;
          next = siblings[index];
        }
      }

      return next
    }
  }

  var siblings_1 = {
  	before: before$1,
  	after: after$2
  };

  var after$1 = siblings_1.after;

  var first_1 = first;

  /* Get the first child in `parent`. */
  function first(parent, includeWhiteSpace) {
    return after$1(parent, -1, includeWhiteSpace)
  }

  var place_1 = place;

  /* Get the position of `node` in `parent`. */
  function place(parent, child) {
    return parent && parent.children && parent.children.indexOf(child)
  }

  var whiteSpaceLeft_1 = whiteSpaceLeft;

  /* Check if `node` starts with white-space. */
  function whiteSpaceLeft(node) {
    return unistUtilIs('text', node) && hastUtilWhitespace(node.value.charAt(0))
  }

  var omission_1 = omission$1;

  var own$5 = {}.hasOwnProperty;

  /* Factory to check if a given node can have a tag omitted. */
  function omission$1(handlers) {
    return omit

    /* Check if a given node can have a tag omitted.   */
    function omit(node, index, parent) {
      var name = node.tagName;
      var fn = own$5.call(handlers, name) ? handlers[name] : false;

      return fn ? fn(node, index, parent) : false
    }
  }

  var after = siblings_1.after;


  var optionGroup = 'optgroup';
  var options = ['option'].concat(optionGroup);
  var dataListItem = ['dt', 'dd'];
  var listItem = 'li';
  var menuContent = ['menuitem', 'hr', 'menu'];
  var ruby = ['rp', 'rt'];
  var tableContainer = ['tbody', 'tfoot'];
  var tableRow$1 = 'tr';
  var tableCell = ['td', 'th'];

  var confusingParagraphParent = ['a', 'audio', 'del', 'ins', 'map', 'noscript', 'video'];

  var clearParagraphSibling = [
    'address',
    'article',
    'aside',
    'blockquote',
    'details',
    'div',
    'dl',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'main',
    'menu',
    'nav',
    'ol',
    'p',
    'pre',
    'section',
    'table',
    'ul'
  ];

  var closing$1 = omission_1({
    html: html$1,
    head: headOrColgroupOrCaption,
    body: body$1,
    p: p,
    li: li,
    dt: dt,
    dd: dd,
    rt: rubyElement,
    rp: rubyElement,
    optgroup: optgroup,
    option: option,
    menuitem: menuitem,
    colgroup: headOrColgroupOrCaption,
    caption: headOrColgroupOrCaption,
    thead: thead,
    tbody: tbody$1,
    tfoot: tfoot,
    tr: tr,
    td: cells,
    th: cells
  });

  /* Macro for `</head>`, `</colgroup>`, and `</caption>`. */
  function headOrColgroupOrCaption(node, index, parent) {
    var next = after(parent, index, true);
    return !next || (!unistUtilIs('comment', next) && !whiteSpaceLeft_1(next))
  }

  /* Whether to omit `</html>`. */
  function html$1(node, index, parent) {
    var next = after(parent, index);
    return !next || !unistUtilIs('comment', next)
  }

  /* Whether to omit `</body>`. */
  function body$1(node, index, parent) {
    var next = after(parent, index);
    return !next || !unistUtilIs('comment', next)
  }

  /* Whether to omit `</p>`. */
  function p(node, index, parent) {
    var next = after(parent, index);
    return next ? hastUtilIsElement(next, clearParagraphSibling) : !parent || !hastUtilIsElement(parent, confusingParagraphParent)
  }

  /* Whether to omit `</li>`. */
  function li(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, listItem)
  }

  /* Whether to omit `</dt>`. */
  function dt(node, index, parent) {
    var next = after(parent, index);
    return next && hastUtilIsElement(next, dataListItem)
  }

  /* Whether to omit `</dd>`. */
  function dd(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, dataListItem)
  }

  /* Whether to omit `</rt>` or `</rp>`. */
  function rubyElement(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, ruby)
  }

  /* Whether to omit `</optgroup>`. */
  function optgroup(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, optionGroup)
  }

  /* Whether to omit `</option>`. */
  function option(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, options)
  }

  /* Whether to omit `</menuitem>`. */
  function menuitem(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, menuContent)
  }

  /* Whether to omit `</thead>`. */
  function thead(node, index, parent) {
    var next = after(parent, index);
    return next && hastUtilIsElement(next, tableContainer)
  }

  /* Whether to omit `</tbody>`. */
  function tbody$1(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, tableContainer)
  }

  /* Whether to omit `</tfoot>`. */
  function tfoot(node, index, parent) {
    return !after(parent, index)
  }

  /* Whether to omit `</tr>`. */
  function tr(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, tableRow$1)
  }

  /* Whether to omit `</td>` or `</th>`. */
  function cells(node, index, parent) {
    var next = after(parent, index);
    return !next || hastUtilIsElement(next, tableCell)
  }

  var before = siblings_1.before;






  var own$4 = {}.hasOwnProperty;

  var uniqueHeadMetadata = ['title', 'base'];
  var meta = ['meta', 'link', 'script', 'style', 'template'];
  var tableContainers = ['thead', 'tbody'];
  var tableRow = 'tr';

  var opening$1 = omission_1({
    html: html,
    head: head,
    body: body,
    colgroup: colgroup,
    tbody: tbody
  });

  /* Whether to omit `<html>`. */
  function html(node) {
    var head = first_1(node);
    return !head || !unistUtilIs('comment', head)
  }

  /* Whether to omit `<head>`. */
  function head(node) {
    var children = node.children;
    var length = children.length;
    var map = {};
    var index = -1;
    var child;
    var name;

    while (++index < length) {
      child = children[index];
      name = child.tagName;

      if (hastUtilIsElement(child, uniqueHeadMetadata)) {
        if (own$4.call(map, name)) {
          return false
        }

        map[name] = true;
      }
    }

    return Boolean(length)
  }

  /* Whether to omit `<body>`. */
  function body(node) {
    var head = first_1(node, true);

    return !head || (!unistUtilIs('comment', head) && !whiteSpaceLeft_1(head) && !hastUtilIsElement(head, meta))
  }

  /* Whether to omit `<colgroup>`.
   * The spec describes some logic for the opening tag,
   * but it’s easier to implement in the closing tag, to
   * the same effect, so we handle it there instead. */
  function colgroup(node, index, parent) {
    var prev = before(parent, index);
    var head = first_1(node, true);

    /* Previous colgroup was already omitted. */
    if (hastUtilIsElement(prev, 'colgroup') && closing$1(prev, place_1(parent, prev), parent)) {
      return false
    }

    return head && hastUtilIsElement(head, 'col')
  }

  /* Whether to omit `<tbody>`. */
  function tbody(node, index, parent) {
    var prev = before(parent, index);
    var head = first_1(node);

    /* Previous table section was already omitted. */
    if (hastUtilIsElement(prev, tableContainers) && closing$1(prev, place_1(parent, prev), parent)) {
      return false
    }

    return head && hastUtilIsElement(head, tableRow)
  }

  var opening = opening$1;
  var closing = closing$1;

  var omission = {
  	opening: opening,
  	closing: closing
  };

  var index$1 = [
  	"script",
  	"style",
  	"pre",
  	"textarea"
  ];

  var htmlWhitespaceSensitiveTagNames = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': index$1
  });

  var sensitive = getCjsExportFromNamespace(htmlWhitespaceSensitiveTagNames);

  var all_1 = all$1;

  /* Stringify all children of `parent`. */
  function all$1(ctx, parent) {
    var children = parent && parent.children;
    var length = children && children.length;
    var index = -1;
    var results = [];

    let printWidthOffset = 0;
    let innerTextLength = 0;
    while (++index < length) {
      innerTextLength = getInnerTextLength(children[index]);
      results[index] = one_1(ctx, children[index], index, parent, printWidthOffset, innerTextLength);
      printWidthOffset = results[index].replace(/\n+/g, '').length;
    }

    return results.join('')
  }

  /**
   * Returns the text lenght of the first line of the first child.
   * Whitespace sensitive elements are ignored.
   * @param {*} node
   */
  function getInnerTextLength(node) {
    // ignore style, script, pre, textarea elements
    if (sensitive.indexOf(node.tagName) !== -1) {
      return 0
    }

    if (!node.children || !node.children.length) {
      return 0
    }

    var child = node.children[0];

    if (child.type === 'text' || child.type === 'comment') {
      return child.value.split('\n')[0].length
    }

    return 0
  }

  var text_1 = text;

  /* Stringify `text`. */
  function text(ctx, node, index, parent) {
    var value = node.value;

    return value
  }

  var data = 'data';

  var find_1 = find;

  var valid = /^data[-\w.:]+$/i;
  var dash = /-[a-z]/g;
  var cap$1 = /[A-Z]/g;

  function find(schema, value) {
    var normal = normalize_1(value);
    var prop = value;
    var Type = info;

    if (normal in schema.normal) {
      return schema.property[schema.normal[normal]]
    }

    if (normal.length > 4 && normal.slice(0, 4) === data && valid.test(value)) {
      // Attribute or property.
      if (value.charAt(4) === '-') {
        prop = datasetToProperty(value);
      } else {
        value = datasetToAttribute(value);
      }

      Type = definedInfo;
    }

    return new Type(prop, value)
  }

  function datasetToProperty(attribute) {
    var value = attribute.slice(5).replace(dash, camelcase);
    return data + value.charAt(0).toUpperCase() + value.slice(1)
  }

  function datasetToAttribute(property) {
    var value = property.slice(4);

    if (dash.test(value)) {
      return property
    }

    value = value.replace(cap$1, kebab);

    if (value.charAt(0) !== '-') {
      value = '-' + value;
    }

    return data + value
  }

  function kebab($0) {
    return '-' + $0.toLowerCase()
  }

  function camelcase($0) {
    return $0.charAt(1).toUpperCase()
  }

  var parse_1 = parse$2;
  var stringify_1 = stringify$2;

  var comma = ',';
  var space$2 = ' ';
  var empty$1 = '';

  // Parse comma-separated tokens to an array.
  function parse$2(value) {
    var values = [];
    var input = String(value || empty$1);
    var index = input.indexOf(comma);
    var lastIndex = 0;
    var end = false;
    var val;

    while (!end) {
      if (index === -1) {
        index = input.length;
        end = true;
      }

      val = input.slice(lastIndex, index).trim();

      if (val || !end) {
        values.push(val);
      }

      lastIndex = index + 1;
      index = input.indexOf(comma, lastIndex);
    }

    return values
  }

  // Compile an array to comma-separated tokens.
  // `options.padLeft` (default: `true`) pads a space left of each token, and
  // `options.padRight` (default: `false`) pads a space to the right of each token.
  function stringify$2(values, options) {
    var settings = options || {};
    var left = settings.padLeft === false ? empty$1 : space$2;
    var right = settings.padRight ? space$2 : empty$1;

    // Ensure the last empty entry is seen.
    if (values[values.length - 1] === empty$1) {
      values = values.concat(empty$1);
    }

    return values.join(right + comma + left).trim()
  }

  var commaSeparatedTokens = {
  	parse: parse_1,
  	stringify: stringify_1
  };

  var nbsp = " ";
  var iexcl = "¡";
  var cent = "¢";
  var pound = "£";
  var curren = "¤";
  var yen = "¥";
  var brvbar = "¦";
  var sect = "§";
  var uml = "¨";
  var copy = "©";
  var ordf = "ª";
  var laquo = "«";
  var not = "¬";
  var shy = "­";
  var reg = "®";
  var macr = "¯";
  var deg = "°";
  var plusmn = "±";
  var sup2 = "²";
  var sup3 = "³";
  var acute = "´";
  var micro = "µ";
  var para = "¶";
  var middot = "·";
  var cedil = "¸";
  var sup1 = "¹";
  var ordm = "º";
  var raquo = "»";
  var frac14 = "¼";
  var frac12 = "½";
  var frac34 = "¾";
  var iquest = "¿";
  var Agrave = "À";
  var Aacute = "Á";
  var Acirc = "Â";
  var Atilde = "Ã";
  var Auml = "Ä";
  var Aring = "Å";
  var AElig = "Æ";
  var Ccedil = "Ç";
  var Egrave = "È";
  var Eacute = "É";
  var Ecirc = "Ê";
  var Euml = "Ë";
  var Igrave = "Ì";
  var Iacute = "Í";
  var Icirc = "Î";
  var Iuml = "Ï";
  var ETH = "Ð";
  var Ntilde = "Ñ";
  var Ograve = "Ò";
  var Oacute = "Ó";
  var Ocirc = "Ô";
  var Otilde = "Õ";
  var Ouml = "Ö";
  var times = "×";
  var Oslash = "Ø";
  var Ugrave = "Ù";
  var Uacute = "Ú";
  var Ucirc = "Û";
  var Uuml = "Ü";
  var Yacute = "Ý";
  var THORN = "Þ";
  var szlig = "ß";
  var agrave = "à";
  var aacute = "á";
  var acirc = "â";
  var atilde = "ã";
  var auml = "ä";
  var aring = "å";
  var aelig = "æ";
  var ccedil = "ç";
  var egrave = "è";
  var eacute = "é";
  var ecirc = "ê";
  var euml = "ë";
  var igrave = "ì";
  var iacute = "í";
  var icirc = "î";
  var iuml = "ï";
  var eth = "ð";
  var ntilde = "ñ";
  var ograve = "ò";
  var oacute = "ó";
  var ocirc = "ô";
  var otilde = "õ";
  var ouml = "ö";
  var divide = "÷";
  var oslash = "ø";
  var ugrave = "ù";
  var uacute = "ú";
  var ucirc = "û";
  var uuml = "ü";
  var yacute = "ý";
  var thorn = "þ";
  var yuml = "ÿ";
  var fnof = "ƒ";
  var Alpha = "Α";
  var Beta = "Β";
  var Gamma = "Γ";
  var Delta = "Δ";
  var Epsilon = "Ε";
  var Zeta = "Ζ";
  var Eta = "Η";
  var Theta = "Θ";
  var Iota = "Ι";
  var Kappa = "Κ";
  var Lambda = "Λ";
  var Mu = "Μ";
  var Nu = "Ν";
  var Xi = "Ξ";
  var Omicron = "Ο";
  var Pi = "Π";
  var Rho = "Ρ";
  var Sigma = "Σ";
  var Tau = "Τ";
  var Upsilon = "Υ";
  var Phi = "Φ";
  var Chi = "Χ";
  var Psi = "Ψ";
  var Omega = "Ω";
  var alpha = "α";
  var beta = "β";
  var gamma = "γ";
  var delta = "δ";
  var epsilon = "ε";
  var zeta = "ζ";
  var eta = "η";
  var theta = "θ";
  var iota = "ι";
  var kappa = "κ";
  var lambda = "λ";
  var mu = "μ";
  var nu = "ν";
  var xi = "ξ";
  var omicron = "ο";
  var pi = "π";
  var rho = "ρ";
  var sigmaf = "ς";
  var sigma = "σ";
  var tau = "τ";
  var upsilon = "υ";
  var phi = "φ";
  var chi = "χ";
  var psi = "ψ";
  var omega = "ω";
  var thetasym = "ϑ";
  var upsih = "ϒ";
  var piv = "ϖ";
  var bull = "•";
  var hellip = "…";
  var prime = "′";
  var Prime = "″";
  var oline = "‾";
  var frasl = "⁄";
  var weierp = "℘";
  var image = "ℑ";
  var real = "ℜ";
  var trade = "™";
  var alefsym = "ℵ";
  var larr = "←";
  var uarr = "↑";
  var rarr = "→";
  var darr = "↓";
  var harr = "↔";
  var crarr = "↵";
  var lArr = "⇐";
  var uArr = "⇑";
  var rArr = "⇒";
  var dArr = "⇓";
  var hArr = "⇔";
  var forall = "∀";
  var part = "∂";
  var exist = "∃";
  var empty = "∅";
  var nabla = "∇";
  var isin = "∈";
  var notin = "∉";
  var ni = "∋";
  var prod = "∏";
  var sum = "∑";
  var minus = "−";
  var lowast = "∗";
  var radic = "√";
  var prop = "∝";
  var infin = "∞";
  var ang = "∠";
  var and = "∧";
  var or = "∨";
  var cap = "∩";
  var cup = "∪";
  var int = "∫";
  var there4 = "∴";
  var sim = "∼";
  var cong = "≅";
  var asymp = "≈";
  var ne = "≠";
  var equiv = "≡";
  var le = "≤";
  var ge = "≥";
  var sub = "⊂";
  var sup = "⊃";
  var nsub = "⊄";
  var sube = "⊆";
  var supe = "⊇";
  var oplus = "⊕";
  var otimes = "⊗";
  var perp = "⊥";
  var sdot = "⋅";
  var lceil = "⌈";
  var rceil = "⌉";
  var lfloor = "⌊";
  var rfloor = "⌋";
  var lang = "〈";
  var rang = "〉";
  var loz = "◊";
  var spades = "♠";
  var clubs = "♣";
  var hearts = "♥";
  var diams = "♦";
  var quot = "\"";
  var amp = "&";
  var lt = "<";
  var gt = ">";
  var OElig = "Œ";
  var oelig = "œ";
  var Scaron = "Š";
  var scaron = "š";
  var Yuml = "Ÿ";
  var circ = "ˆ";
  var tilde = "˜";
  var ensp = " ";
  var emsp = " ";
  var thinsp = " ";
  var zwnj = "‌";
  var zwj = "‍";
  var lrm = "‎";
  var rlm = "‏";
  var ndash = "–";
  var mdash = "—";
  var lsquo = "‘";
  var rsquo = "’";
  var sbquo = "‚";
  var ldquo = "“";
  var rdquo = "”";
  var bdquo = "„";
  var dagger = "†";
  var Dagger = "‡";
  var permil = "‰";
  var lsaquo = "‹";
  var rsaquo = "›";
  var euro = "€";
  var index = {
  	nbsp: nbsp,
  	iexcl: iexcl,
  	cent: cent,
  	pound: pound,
  	curren: curren,
  	yen: yen,
  	brvbar: brvbar,
  	sect: sect,
  	uml: uml,
  	copy: copy,
  	ordf: ordf,
  	laquo: laquo,
  	not: not,
  	shy: shy,
  	reg: reg,
  	macr: macr,
  	deg: deg,
  	plusmn: plusmn,
  	sup2: sup2,
  	sup3: sup3,
  	acute: acute,
  	micro: micro,
  	para: para,
  	middot: middot,
  	cedil: cedil,
  	sup1: sup1,
  	ordm: ordm,
  	raquo: raquo,
  	frac14: frac14,
  	frac12: frac12,
  	frac34: frac34,
  	iquest: iquest,
  	Agrave: Agrave,
  	Aacute: Aacute,
  	Acirc: Acirc,
  	Atilde: Atilde,
  	Auml: Auml,
  	Aring: Aring,
  	AElig: AElig,
  	Ccedil: Ccedil,
  	Egrave: Egrave,
  	Eacute: Eacute,
  	Ecirc: Ecirc,
  	Euml: Euml,
  	Igrave: Igrave,
  	Iacute: Iacute,
  	Icirc: Icirc,
  	Iuml: Iuml,
  	ETH: ETH,
  	Ntilde: Ntilde,
  	Ograve: Ograve,
  	Oacute: Oacute,
  	Ocirc: Ocirc,
  	Otilde: Otilde,
  	Ouml: Ouml,
  	times: times,
  	Oslash: Oslash,
  	Ugrave: Ugrave,
  	Uacute: Uacute,
  	Ucirc: Ucirc,
  	Uuml: Uuml,
  	Yacute: Yacute,
  	THORN: THORN,
  	szlig: szlig,
  	agrave: agrave,
  	aacute: aacute,
  	acirc: acirc,
  	atilde: atilde,
  	auml: auml,
  	aring: aring,
  	aelig: aelig,
  	ccedil: ccedil,
  	egrave: egrave,
  	eacute: eacute,
  	ecirc: ecirc,
  	euml: euml,
  	igrave: igrave,
  	iacute: iacute,
  	icirc: icirc,
  	iuml: iuml,
  	eth: eth,
  	ntilde: ntilde,
  	ograve: ograve,
  	oacute: oacute,
  	ocirc: ocirc,
  	otilde: otilde,
  	ouml: ouml,
  	divide: divide,
  	oslash: oslash,
  	ugrave: ugrave,
  	uacute: uacute,
  	ucirc: ucirc,
  	uuml: uuml,
  	yacute: yacute,
  	thorn: thorn,
  	yuml: yuml,
  	fnof: fnof,
  	Alpha: Alpha,
  	Beta: Beta,
  	Gamma: Gamma,
  	Delta: Delta,
  	Epsilon: Epsilon,
  	Zeta: Zeta,
  	Eta: Eta,
  	Theta: Theta,
  	Iota: Iota,
  	Kappa: Kappa,
  	Lambda: Lambda,
  	Mu: Mu,
  	Nu: Nu,
  	Xi: Xi,
  	Omicron: Omicron,
  	Pi: Pi,
  	Rho: Rho,
  	Sigma: Sigma,
  	Tau: Tau,
  	Upsilon: Upsilon,
  	Phi: Phi,
  	Chi: Chi,
  	Psi: Psi,
  	Omega: Omega,
  	alpha: alpha,
  	beta: beta,
  	gamma: gamma,
  	delta: delta,
  	epsilon: epsilon,
  	zeta: zeta,
  	eta: eta,
  	theta: theta,
  	iota: iota,
  	kappa: kappa,
  	lambda: lambda,
  	mu: mu,
  	nu: nu,
  	xi: xi,
  	omicron: omicron,
  	pi: pi,
  	rho: rho,
  	sigmaf: sigmaf,
  	sigma: sigma,
  	tau: tau,
  	upsilon: upsilon,
  	phi: phi,
  	chi: chi,
  	psi: psi,
  	omega: omega,
  	thetasym: thetasym,
  	upsih: upsih,
  	piv: piv,
  	bull: bull,
  	hellip: hellip,
  	prime: prime,
  	Prime: Prime,
  	oline: oline,
  	frasl: frasl,
  	weierp: weierp,
  	image: image,
  	real: real,
  	trade: trade,
  	alefsym: alefsym,
  	larr: larr,
  	uarr: uarr,
  	rarr: rarr,
  	darr: darr,
  	harr: harr,
  	crarr: crarr,
  	lArr: lArr,
  	uArr: uArr,
  	rArr: rArr,
  	dArr: dArr,
  	hArr: hArr,
  	forall: forall,
  	part: part,
  	exist: exist,
  	empty: empty,
  	nabla: nabla,
  	isin: isin,
  	notin: notin,
  	ni: ni,
  	prod: prod,
  	sum: sum,
  	minus: minus,
  	lowast: lowast,
  	radic: radic,
  	prop: prop,
  	infin: infin,
  	ang: ang,
  	and: and,
  	or: or,
  	cap: cap,
  	cup: cup,
  	int: int,
  	there4: there4,
  	sim: sim,
  	cong: cong,
  	asymp: asymp,
  	ne: ne,
  	equiv: equiv,
  	le: le,
  	ge: ge,
  	sub: sub,
  	sup: sup,
  	nsub: nsub,
  	sube: sube,
  	supe: supe,
  	oplus: oplus,
  	otimes: otimes,
  	perp: perp,
  	sdot: sdot,
  	lceil: lceil,
  	rceil: rceil,
  	lfloor: lfloor,
  	rfloor: rfloor,
  	lang: lang,
  	rang: rang,
  	loz: loz,
  	spades: spades,
  	clubs: clubs,
  	hearts: hearts,
  	diams: diams,
  	quot: quot,
  	amp: amp,
  	lt: lt,
  	gt: gt,
  	OElig: OElig,
  	oelig: oelig,
  	Scaron: Scaron,
  	scaron: scaron,
  	Yuml: Yuml,
  	circ: circ,
  	tilde: tilde,
  	ensp: ensp,
  	emsp: emsp,
  	thinsp: thinsp,
  	zwnj: zwnj,
  	zwj: zwj,
  	lrm: lrm,
  	rlm: rlm,
  	ndash: ndash,
  	mdash: mdash,
  	lsquo: lsquo,
  	rsquo: rsquo,
  	sbquo: sbquo,
  	ldquo: ldquo,
  	rdquo: rdquo,
  	bdquo: bdquo,
  	dagger: dagger,
  	Dagger: Dagger,
  	permil: permil,
  	lsaquo: lsaquo,
  	rsaquo: rsaquo,
  	euro: euro
  };

  var characterEntitiesHtml4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    nbsp: nbsp,
    iexcl: iexcl,
    cent: cent,
    pound: pound,
    curren: curren,
    yen: yen,
    brvbar: brvbar,
    sect: sect,
    uml: uml,
    copy: copy,
    ordf: ordf,
    laquo: laquo,
    not: not,
    shy: shy,
    reg: reg,
    macr: macr,
    deg: deg,
    plusmn: plusmn,
    sup2: sup2,
    sup3: sup3,
    acute: acute,
    micro: micro,
    para: para,
    middot: middot,
    cedil: cedil,
    sup1: sup1,
    ordm: ordm,
    raquo: raquo,
    frac14: frac14,
    frac12: frac12,
    frac34: frac34,
    iquest: iquest,
    Agrave: Agrave,
    Aacute: Aacute,
    Acirc: Acirc,
    Atilde: Atilde,
    Auml: Auml,
    Aring: Aring,
    AElig: AElig,
    Ccedil: Ccedil,
    Egrave: Egrave,
    Eacute: Eacute,
    Ecirc: Ecirc,
    Euml: Euml,
    Igrave: Igrave,
    Iacute: Iacute,
    Icirc: Icirc,
    Iuml: Iuml,
    ETH: ETH,
    Ntilde: Ntilde,
    Ograve: Ograve,
    Oacute: Oacute,
    Ocirc: Ocirc,
    Otilde: Otilde,
    Ouml: Ouml,
    times: times,
    Oslash: Oslash,
    Ugrave: Ugrave,
    Uacute: Uacute,
    Ucirc: Ucirc,
    Uuml: Uuml,
    Yacute: Yacute,
    THORN: THORN,
    szlig: szlig,
    agrave: agrave,
    aacute: aacute,
    acirc: acirc,
    atilde: atilde,
    auml: auml,
    aring: aring,
    aelig: aelig,
    ccedil: ccedil,
    egrave: egrave,
    eacute: eacute,
    ecirc: ecirc,
    euml: euml,
    igrave: igrave,
    iacute: iacute,
    icirc: icirc,
    iuml: iuml,
    eth: eth,
    ntilde: ntilde,
    ograve: ograve,
    oacute: oacute,
    ocirc: ocirc,
    otilde: otilde,
    ouml: ouml,
    divide: divide,
    oslash: oslash,
    ugrave: ugrave,
    uacute: uacute,
    ucirc: ucirc,
    uuml: uuml,
    yacute: yacute,
    thorn: thorn,
    yuml: yuml,
    fnof: fnof,
    Alpha: Alpha,
    Beta: Beta,
    Gamma: Gamma,
    Delta: Delta,
    Epsilon: Epsilon,
    Zeta: Zeta,
    Eta: Eta,
    Theta: Theta,
    Iota: Iota,
    Kappa: Kappa,
    Lambda: Lambda,
    Mu: Mu,
    Nu: Nu,
    Xi: Xi,
    Omicron: Omicron,
    Pi: Pi,
    Rho: Rho,
    Sigma: Sigma,
    Tau: Tau,
    Upsilon: Upsilon,
    Phi: Phi,
    Chi: Chi,
    Psi: Psi,
    Omega: Omega,
    alpha: alpha,
    beta: beta,
    gamma: gamma,
    delta: delta,
    epsilon: epsilon,
    zeta: zeta,
    eta: eta,
    theta: theta,
    iota: iota,
    kappa: kappa,
    lambda: lambda,
    mu: mu,
    nu: nu,
    xi: xi,
    omicron: omicron,
    pi: pi,
    rho: rho,
    sigmaf: sigmaf,
    sigma: sigma,
    tau: tau,
    upsilon: upsilon,
    phi: phi,
    chi: chi,
    psi: psi,
    omega: omega,
    thetasym: thetasym,
    upsih: upsih,
    piv: piv,
    bull: bull,
    hellip: hellip,
    prime: prime,
    Prime: Prime,
    oline: oline,
    frasl: frasl,
    weierp: weierp,
    image: image,
    real: real,
    trade: trade,
    alefsym: alefsym,
    larr: larr,
    uarr: uarr,
    rarr: rarr,
    darr: darr,
    harr: harr,
    crarr: crarr,
    lArr: lArr,
    uArr: uArr,
    rArr: rArr,
    dArr: dArr,
    hArr: hArr,
    forall: forall,
    part: part,
    exist: exist,
    empty: empty,
    nabla: nabla,
    isin: isin,
    notin: notin,
    ni: ni,
    prod: prod,
    sum: sum,
    minus: minus,
    lowast: lowast,
    radic: radic,
    prop: prop,
    infin: infin,
    ang: ang,
    and: and,
    or: or,
    cap: cap,
    cup: cup,
    int: int,
    there4: there4,
    sim: sim,
    cong: cong,
    asymp: asymp,
    ne: ne,
    equiv: equiv,
    le: le,
    ge: ge,
    sub: sub,
    sup: sup,
    nsub: nsub,
    sube: sube,
    supe: supe,
    oplus: oplus,
    otimes: otimes,
    perp: perp,
    sdot: sdot,
    lceil: lceil,
    rceil: rceil,
    lfloor: lfloor,
    rfloor: rfloor,
    lang: lang,
    rang: rang,
    loz: loz,
    spades: spades,
    clubs: clubs,
    hearts: hearts,
    diams: diams,
    quot: quot,
    amp: amp,
    lt: lt,
    gt: gt,
    OElig: OElig,
    oelig: oelig,
    Scaron: Scaron,
    scaron: scaron,
    Yuml: Yuml,
    circ: circ,
    tilde: tilde,
    ensp: ensp,
    emsp: emsp,
    thinsp: thinsp,
    zwnj: zwnj,
    zwj: zwj,
    lrm: lrm,
    rlm: rlm,
    ndash: ndash,
    mdash: mdash,
    lsquo: lsquo,
    rsquo: rsquo,
    sbquo: sbquo,
    ldquo: ldquo,
    rdquo: rdquo,
    bdquo: bdquo,
    dagger: dagger,
    Dagger: Dagger,
    permil: permil,
    lsaquo: lsaquo,
    rsaquo: rsaquo,
    euro: euro,
    'default': index
  });

  var dangerous$1 = [
  	"cent",
  	"copy",
  	"divide",
  	"gt",
  	"lt",
  	"not",
  	"para",
  	"times"
  ];

  var dangerous$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': dangerous$1
  });

  var entities = getCjsExportFromNamespace(characterEntitiesHtml4);

  var dangerous = getCjsExportFromNamespace(dangerous$2);

  var decimal = isDecimal;



  var stringifyEntities = encode;
  encode.escape = escape;

  var own$3 = {}.hasOwnProperty;

  // List of enforced escapes.
  var escapes = ['"', "'", '<', '>', '&', '`'];

  // Map of characters to names.
  var characters = construct();

  // Default escapes.
  var defaultEscapes = toExpression(escapes);

  // Surrogate pairs.
  var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  // Non-ASCII characters.
  // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
  var bmp = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

  // Encode special characters in `value`.
  function encode(value, options) {
    var settings = options || {};
    var subset = settings.subset;
    var set = subset ? toExpression(subset) : defaultEscapes;
    var escapeOnly = settings.escapeOnly;
    var omit = settings.omitOptionalSemicolons;

    value = value.replace(set, replace);

    if (subset || escapeOnly) {
      return value
    }

    return value
      .replace(surrogatePair, replaceSurrogatePair)
      .replace(bmp, replace)

    function replaceSurrogatePair(pair, pos, val) {
      return toHexReference(
        (pair.charCodeAt(0) - 0xd800) * 0x400 +
          pair.charCodeAt(1) -
          0xdc00 +
          0x10000,
        val.charAt(pos + 2),
        omit
      )
    }

    function replace(char, pos, val) {
      return one$1(char, val.charAt(pos + 1), settings)
    }
  }

  // Shortcut to escape special characters in HTML.
  function escape(value) {
    return encode(value, {escapeOnly: true, useNamedReferences: true})
  }

  // Encode `char` according to `options`.
  function one$1(char, next, options) {
    var shortest = options.useShortestReferences;
    var omit = options.omitOptionalSemicolons;
    var named;
    var code;
    var numeric;
    var decimal;

    if ((shortest || options.useNamedReferences) && own$3.call(characters, char)) {
      named = toNamed(characters[char], next, omit, options.attribute);
    }

    if (shortest || !named) {
      code = char.charCodeAt(0);
      numeric = toHexReference(code, next, omit);

      // Use the shortest numeric reference when requested.
      // A simple algorithm would use decimal for all code points under 100, as
      // those are shorter than hexadecimal:
      //
      // * `&#99;` vs `&#x63;` (decimal shorter)
      // * `&#100;` vs `&#x64;` (equal)
      //
      // However, because we take `next` into consideration when `omit` is used,
      // And it would be possible that decimals are shorter on bigger values as
      // well if `next` is hexadecimal but not decimal, we instead compare both.
      if (shortest) {
        decimal = toDecimalReference(code, next, omit);

        if (decimal.length < numeric.length) {
          numeric = decimal;
        }
      }
    }

    if (named && (!shortest || named.length < numeric.length)) {
      return named
    }

    return numeric
  }

  // Transform `code` into an entity.
  function toNamed(name, next, omit, attribute) {
    var value = '&' + name;

    if (
      omit &&
      own$3.call(legacy, name) &&
      dangerous.indexOf(name) === -1 &&
      (!attribute || (next && next !== '=' && !isAlphanumerical(next)))
    ) {
      return value
    }

    return value + ';'
  }

  // Transform `code` into a hexadecimal character reference.
  function toHexReference(code, next, omit) {
    var value = '&#x' + code.toString(16).toUpperCase();
    return omit && next && !isHexadecimal(next) ? value : value + ';'
  }

  // Transform `code` into a decimal character reference.
  function toDecimalReference(code, next, omit) {
    var value = '&#' + String(code);
    return omit && next && !decimal(next) ? value : value + ';'
  }

  // Create an expression for `characters`.
  function toExpression(characters) {
    return new RegExp('[' + characters.join('') + ']', 'g')
  }

  // Construct the map.
  function construct() {
    var chars = {};
    var name;

    for (name in entities) {
      chars[entities[name]] = name;
    }

    return chars
  }

  // Characters.
  var NULL = '\0';
  var AMP = '&';
  var SP = ' ';
  var TB = '\t';
  var GR = '`';
  var DQ$1 = '"';
  var SQ$1 = "'";
  var EQ = '=';
  var LT = '<';
  var GT = '>';
  var SO = '/';
  var LF = '\n';
  var CR = '\r';
  var FF = '\f';

  var whitespace = [SP, TB, LF, CR, FF];
  // https://html.spec.whatwg.org/#attribute-name-state
  var name = whitespace.concat(AMP, SO, GT, EQ);
  // https://html.spec.whatwg.org/#attribute-value-(unquoted)-state
  var unquoted$1 = whitespace.concat(AMP, GT);
  var unquotedSafe = unquoted$1.concat(NULL, DQ$1, SQ$1, LT, EQ, GR);
  // https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state
  var singleQuoted$1 = [AMP, SQ$1];
  // https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state
  var doubleQuoted$1 = [AMP, DQ$1];

  // Maps of subsets. Each value is a matrix of tuples.
  // The first value causes parse errors, the second is valid.
  // Of both values, the first value is unsafe, and the second is safe.
  var constants = {
    name: [[name, name.concat(DQ$1, SQ$1, GR)], [name.concat(NULL, DQ$1, SQ$1, LT), name.concat(NULL, DQ$1, SQ$1, LT, GR)]],
    unquoted: [[unquoted$1, unquotedSafe], [unquotedSafe, unquotedSafe]],
    single: [
      [singleQuoted$1, singleQuoted$1.concat(DQ$1, GR)],
      [singleQuoted$1.concat(NULL), singleQuoted$1.concat(NULL, DQ$1, GR)]
    ],
    double: [
      [doubleQuoted$1, doubleQuoted$1.concat(SQ$1, GR)],
      [doubleQuoted$1.concat(NULL), doubleQuoted$1.concat(NULL, SQ$1, GR)]
    ]
  };

  var spaces = spaceSeparatedTokens.stringify;
  var commas = commaSeparatedTokens.stringify;





  var element_1 = element;

  /* Constants. */
  var emptyString = '';

  /* Characters. */
  var space$1 = ' ';
  var quotationMark = '"';
  var apostrophe$1 = "'";
  var equalsTo = '=';
  var lessThan$1 = '<';
  var greaterThan = '>';
  var slash$1 = '/';
  var newLine = '\n';

  /* Stringify an element `node`. */
  function element(ctx, node, index, parent, printWidthOffset, innerTextLength) {
    var parentSchema = ctx.schema;
    var name = node.tagName;
    var value = '';
    var selfClosing;
    var close;
    var omit;
    var root = node;
    var content;
    var attrs;
    var indentLevel = getNodeData(node, 'indentLevel', 0);
    var printContext = {
      offset: printWidthOffset,
      wrapAttributes: false,
      indentLevel
    };
    var isVoid = ctx.voids.indexOf(name) !== -1;
    var ignoreAttrCollapsing =
      getNodeData(node, 'ignore', false) || getNodeData(node, 'preserveAttrWrapping', false);

    if (parentSchema.space === 'html' && name === 'svg') {
      ctx.schema = svg_1;
    }

    if (ctx.schema.space === 'svg') {
      omit = false;
      close = true;
      selfClosing = ctx.closeEmpty;
    } else {
      omit = ctx.omit;
      close = ctx.close;
      selfClosing = isVoid;
    }

    // check for 'selfClosing' property set by hast-util-from-webparser package
    // in order to support custom self-closing elements
    if (selfClosing === false) {
      selfClosing = getNodeData(node, 'selfClosing', false);
    }

    // <
    printContext.offset += lessThan$1.length;

    // tagName length
    printContext.offset += node.tagName.length;

    // / closing tag
    if (selfClosing && !isVoid) {
      printContext.offset += slash$1.length;
    }

    // >
    printContext.offset += greaterThan.length;

    const propertyCount = Object.keys(node.properties).length;

    // force to wrap attributes on multiple lines when the node contains
    // more than one attribute
    if (propertyCount > 1 && ctx.wrapAttributes) {
      printContext.wrapAttributes = true;
    }

    // one space before each attribute
    if (propertyCount) {
      printContext.offset += propertyCount * space$1.length;
    }

    // represent the length of the inner text of the node
    printContext.offset += innerTextLength;

    attrs = attributes(ctx, node.properties, printContext, ignoreAttrCollapsing);

    const shouldCollapse = ignoreAttrCollapsing === false && printContext.wrapAttributes;

    content = all_1(ctx, root);

    /* If the node is categorised as void, but it has
     * children, remove the categorisation.  This
     * enables for example `menuitem`s, which are
     * void in W3C HTML but not void in WHATWG HTML, to
     * be stringified properly. */
    selfClosing = content ? false : selfClosing;

    if (attrs || !omit || !omit.opening(node, index, parent)) {
      value = lessThan$1 + name;

      if (attrs) {
        // add no space after tagName when element is collapsed
        if (shouldCollapse) {
          value += attrs;
        } else {
          value += space$1 + attrs;
        }
      }

      let selfClosed = false;

      // check if the should close self-closing elements
      if (selfClosing && close) {
        if ((!ctx.tightClose || attrs.charAt(attrs.length - 1) === slash$1) && !shouldCollapse) {
          value += space$1;
        }

        if (shouldCollapse) {
          value += newLine + repeatString(ctx.tabWidth, printContext.indentLevel);
        }

        selfClosed = true;
        value += slash$1;
      }

      // allow any element to self close itself except known HTML void elements
      else if (selfClosing && !isVoid) {
        if (shouldCollapse) {
          value += newLine + repeatString(ctx.tabWidth, printContext.indentLevel);
        }

        selfClosed = true;
        value += slash$1;
      }

      // add newline when element should be wrappend on multiple lines and when
      // it's no self-closing element because in that case the newline was already added before the slash (/)
      if (shouldCollapse && !selfClosed) {
        value += newLine + repeatString(ctx.tabWidth, printContext.indentLevel);
      }

      value += greaterThan;
    }

    value += content;

    if (!selfClosing && (!omit || !omit.closing(node, index, parent))) {
      value += lessThan$1 + slash$1 + name + greaterThan;
    }

    ctx.schema = parentSchema;

    return value
  }

  /* Stringify all attributes. */
  function attributes(ctx, props, printContext, ignoreIndent) {
    var values = [];
    var key;
    var value;
    var result;
    var length;
    var index;
    var last;

    for (key in props) {
      value = props[key];

      if (value == null) {
        continue
      }

      result = attribute$1(ctx, key, value);

      printContext.offset += result.length;

      if (ignoreIndent === false && printContext.offset > ctx.printWidth) {
        printContext.wrapAttributes = true;
      }

      if (result) {
        values.push(result);
      }
    }

    length = values.length;
    index = -1;

    while (++index < length) {
      result = values[index];
      last = null;

      /* In tight mode, don’t add a space after quoted attributes. */
      if (last !== quotationMark && last !== apostrophe$1) {
        if (printContext.wrapAttributes) {
          values[index] = newLine + repeatString(ctx.tabWidth, printContext.indentLevel + 1) + result;
        } else if (index !== length - 1) {
          values[index] = result + space$1;
        } else {
          values[index] = result;
        }
      }
    }

    return values.join(emptyString)
  }

  /* Stringify one attribute. */
  function attribute$1(ctx, key, value) {
    var schema = ctx.schema;
    var info = find_1(schema, key);
    var name = info.attribute;

    if (value == null || (typeof value === 'number' && isNaN(value)) || (value === false && info.boolean)) {
      return emptyString
    }

    name = attributeName$1(ctx, name);

    if ((value === true && info.boolean) || (value === true && info.overloadedBoolean)) {
      return name
    }

    return name + attributeValue$1(ctx, key, value, info)
  }

  /* Stringify the attribute name. */
  function attributeName$1(ctx, name) {
    // Always encode without parse errors in non-HTML.
    var valid = ctx.schema.space === 'html' ? ctx.valid : 1;
    var subset = constants.name[valid][ctx.safe];

    return stringifyEntities(name, immutable(ctx.entities, { subset: subset }))
  }

  /* Stringify the attribute value. */
  function attributeValue$1(ctx, key, value, info) {
    var quote = ctx.quote;

    if (typeof value === 'object' && 'length' in value) {
      /* `spaces` doesn’t accept a second argument, but it’s
       * given here just to keep the code cleaner. */
      value = (info.commaSeparated ? commas : spaces)(value, {
        padLeft: !ctx.tightLists
      });
    }

    value = String(value);

    // When attr has no value we avoid quoting
    if (value === '') {
      return value
    } else {
      value = equalsTo + quote + value + quote;
    }

    return value
  }

  function getNodeData(node, key, defaultValue) {
    let data = node.data || {};
    return data[key] || defaultValue
  }

  var doctype_1 = doctype;

  /* Stringify a doctype `node`. */
  function doctype(ctx, node) {
    var sep = ctx.tightDoctype ? '' : ' ';
    var name = node.name;
    var pub = node.public;
    var sys = node.system;
    var val = ['<!doctype'];

    if (name) {
      val.push(sep, name);

      if (pub != null) {
        val.push(' public', sep, smart(pub));
      } else if (sys != null) {
        val.push(' system');
      }

      if (sys != null) {
        val.push(sep, smart(sys));
      }
    }

    return val.join('') + '>'
  }

  function smart(value) {
    var quote = value.indexOf('"') === -1 ? '"' : "'";
    return quote + value + quote
  }

  var comment_1 = comment;

  /* Stringify a comment `node`. */
  function comment(ctx, node) {
    return '<!--' + node.value + '-->'
  }

  var raw_1 = raw;

  /* Stringify `raw`. */
  function raw(ctx, node) {
    return node.value
  }

  var one_1 = one;

  var own$2 = {}.hasOwnProperty;

  var handlers = {};

  handlers.root = all_1;
  handlers.text = text_1;
  handlers.element = element_1;
  handlers.doctype = doctype_1;
  handlers.comment = comment_1;
  handlers.raw = raw_1;

  /* Stringify `node`. */
  function one(ctx, node, index, parent, printWidthOffset, innerTextLength) {
    var type = node && node.type;

    if (!type) {
      throw new Error('Expected node, not `' + node + '`')
    }

    if (!own$2.call(handlers, type)) {
      throw new Error('Cannot compile unknown node `' + type + '`')
    }

    return handlers[type](ctx, node, index, parent, printWidthOffset, innerTextLength)
  }

  var voids = getCjsExportFromNamespace(htmlVoidElements);

  var lib$1 = toHTML;

  /* Characters. */
  var DQ = '"';
  var SQ = "'";

  /* Stringify the given HAST node. */
  function toHTML(node, options) {
    var settings = options || {};
    var quote = settings.singleQuote ? SQ : DQ;
    var printWidth = settings.printWidth === undefined ? 80 : settings.printWidth;
    var useTabs = settings.useTabs;
    var tabWidth = settings.tabWidth || 2;
    var wrapAttributes = settings.wrapAttributes;

    if (useTabs) {
      tabWidth = '\t';
    } else if (typeof tabWidth === 'number') {
      tabWidth = repeatString(' ', tabWidth);
    }

    return one_1(
      {
        valid: settings.allowParseErrors ? 0 : 1,
        safe: settings.allowDangerousCharacters ? 0 : 1,
        schema: settings.space === 'svg' ? svg_1 : html_1,
        omit: settings.omitOptionalTags && omission,
        quote: quote,
        printWidth: printWidth,
        tabWidth: tabWidth,
        wrapAttributes: wrapAttributes,
        tightDoctype: Boolean(settings.tightDoctype),
        tightLists: settings.tightCommaSeparatedLists,
        voids: settings.voids || voids.concat(),
        entities: settings.entities || {},
        close: settings.closeSelfClosing,
        tightClose: settings.tightSelfClosing,
        closeEmpty: settings.closeEmptyElements
      },
      node
    )
  }

  var prettyhtmlHastToHtml = lib$1;

  const void_els = [
  	'area',
  	'base',
  	'br',
  	'col',
  	'embed',
  	'hr',
  	'img',
  	'input',
  	'link',
  	'meta',
  	'param',
  	'source',
  	'track',
  	'wbr',
  ];

  // these regex don't check if it is a valid svelte tag name
  // i want to defer to svelte's compiler errors so i don't end up reimplementing the svelte parser

  const RE_SVELTE_TAG = /^<svelte:([a-z]*)[\s\S]*(?:(?:svelte:[a-z]*)|(?:\/))>$/;
  const RE_SVELTE_TAG_START = /(^\s*)<([\\/\s])*svelte:/;

  function parse_svelte_tag(
  	eat,
  	value,
  	silent
  ) {
  	const is_svelte_tag = RE_SVELTE_TAG_START.exec(value);

  	if (is_svelte_tag) {
  		if (silent) return true;

  		const trimmed_value = value.trim();
  		let cbPos = 0;
  		let pos = 1;
  		let current_tag = '';
  		let in_tag_name = false;

  		while (cbPos > -1) {
  			if (!trimmed_value[pos]) {
  				break;
  			}

  			if (trimmed_value[pos].match(/</)) {
  				cbPos++;
  				current_tag = '';
  				in_tag_name = true;
  			}

  			if (in_tag_name && trimmed_value[pos].match(/\s/)) {
  				in_tag_name = false;
  			}

  			if (in_tag_name && !trimmed_value[pos].match(/</)) {
  				current_tag += trimmed_value[pos];
  			}

  			const is_void = void_els.includes(current_tag);

  			if (
  				(is_void && trimmed_value[pos].match(/>/)) ||
  				(trimmed_value[pos - 1] + trimmed_value[pos]).match(/\/>/)
  			) {
  				cbPos--;
  			}

  			if ((trimmed_value[pos - 1] + trimmed_value[pos]).match(/<\//)) {
  				let inner_indent = 0;

  				while (inner_indent > -1) {
  					if (trimmed_value[pos].match(/>/)) {
  						pos++;
  						inner_indent -= 1;
  						cbPos -= 2;
  					} else {
  						pos++;
  					}
  				}
  			}

  			pos++;
  		}

  		const match = RE_SVELTE_TAG.exec(trimmed_value.substring(0, pos).trim());

  		if (!match) return;

  		return eat(is_svelte_tag[1] + match[0])({
  			type: 'svelteTag',
  			value: match[0],
  			name: match[1],
  		});
  	}
  }

  // these regex don't check if it is a valid block name
  // i want to defer to svelte's compiler errors so i don't end up reimplementing the svelte parser
  // 'else if' is a special case due to the annoying whitespace

  const RE_SVELTE_BLOCK_START = /(^\s*){[#:/@]/;
  const RE_SVELTE_BLOCK = /^{[#:/@](else if|[a-z]+).*}$/;

  function parse_svelte_block(
  	eat,
  	value,
  	silent
  ) {
  	const is_svelte_block = RE_SVELTE_BLOCK_START.exec(value);

  	if (is_svelte_block) {
  		if (silent) return true;

  		const trimmed_value = value.trim();
  		let cbPos = 0;
  		let pos = 1;

  		while (cbPos > -1) {
  			if (trimmed_value[pos].match(/{/)) cbPos++;
  			if (trimmed_value[pos].match(/}/)) cbPos--;
  			pos++;
  		}

  		const match = RE_SVELTE_BLOCK.exec(trimmed_value.substring(0, pos));

  		if (!match) return;

  		return eat(is_svelte_block[1] + match[0])({
  			type: 'svelteBlock',
  			value: `${is_svelte_block[1]}${match[0]}`,
  			name: match[1],
  		});
  	}
  }

  const dotAllPolyfill = '[\0-\uFFFF]';

  const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  const unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
  const singleQuoted = "'[^']*'";
  const doubleQuoted = '"[^"]*"';
  const jsProps = '{.*}'.replace('.', dotAllPolyfill);
  const attributeValue =
  	'(?:' +
  	unquoted +
  	'|' +
  	singleQuoted +
  	'|' +
  	doubleQuoted +
  	'|' +
  	jsProps +
  	')';
  const attribute =
  	'(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';
  const openTag = '<[A-Za-z]*[A-Za-z0-9\\.\\-]*' + attribute + '*\\s*\\/?>';
  const closeTag = '<\\/[A-Za-z][A-Za-z0-9\\.\\-]*\\s*>';
  '<[?].*?[?]>'.replace('.', dotAllPolyfill);

  const openCloseTag = new RegExp('^(?:' + openTag + '|' + closeTag + ')');

  const tab = '\t';
  const space = ' ';
  const lineFeed = '\n';
  const lessThan = '<';

  const rawOpenExpression = /^<(script|pre|style)(?=(\s|>|$))/i;
  const rawCloseExpression = /<\/(script|pre|style)>/i;
  const commentOpenExpression = /^<!--/;
  const commentCloseExpression = /-->/;
  const instructionOpenExpression = /^<\?/;
  const instructionCloseExpression = /\?>/;
  const directiveOpenExpression = /^<![A-Za-z]/;
  const directiveCloseExpression = />/;
  const cdataOpenExpression = /^<!\[CDATA\[/;
  const cdataCloseExpression = /\]\]>/;
  const elementCloseExpression = /^$/;
  const otherElementOpenExpression = new RegExp(openCloseTag.source + '\\s*$');
  const fragmentOpenExpression = /^<>/;

  //@ts-ignore
  function blockHtml(
  	eat,
  	value,
  	silent
  ) {
  	const blocks = '[a-z\\.]*(\\.){0,1}[a-z][a-z0-9\\.]*';
  	const elementOpenExpression = new RegExp(
  		'^</?(' + blocks + ')(?=(\\s|/?>|$))',
  		'i'
  	);

  	const length = value.length;
  	let index = 0;
  	let next;
  	let line;
  	let offset;
  	let character;
  	let sequence;

  	const sequences = [
  		[rawOpenExpression, rawCloseExpression, true],
  		[commentOpenExpression, commentCloseExpression, true],
  		[instructionOpenExpression, instructionCloseExpression, true],
  		[directiveOpenExpression, directiveCloseExpression, true],
  		[cdataOpenExpression, cdataCloseExpression, true],
  		[elementOpenExpression, elementCloseExpression, true],
  		[fragmentOpenExpression, elementCloseExpression, true],
  		[otherElementOpenExpression, elementCloseExpression, false],
  	];

  	// Eat initial spacing.
  	while (index < length) {
  		character = value.charAt(index);

  		if (character !== tab && character !== space) {
  			break;
  		}

  		index++;
  	}

  	if (value.charAt(index) !== lessThan) {
  		return;
  	}

  	next = value.indexOf(lineFeed, index + 1);
  	next = next === -1 ? length : next;
  	line = value.slice(index, next);
  	offset = -1;
  	const count = sequences.length;

  	while (++offset < count) {
  		if (sequences[offset][0].test(line)) {
  			sequence = sequences[offset];
  			break;
  		}
  	}

  	if (!sequence) {
  		return;
  	}

  	if (silent) {
  		return sequence[2];
  	}

  	index = next;

  	if (!sequence[1].test(line)) {
  		while (index < length) {
  			next = value.indexOf(lineFeed, index + 1);
  			next = next === -1 ? length : next;
  			line = value.slice(index + 1, next);

  			if (sequence[1].test(line)) {
  				if (line) {
  					index = next;
  				}

  				break;
  			}

  			index = next;
  		}
  	}

  	const subvalue = value.slice(0, index);

  	return eat(subvalue)({ type: 'html', value: subvalue });
  }

  function mdsvex_parser() {
  	const Parser = this.Parser;
  	const block_tokenizers = Parser.prototype.blockTokenizers;
  	const methods = Parser.prototype.blockMethods;

  	block_tokenizers.svelteBlock = parse_svelte_block;
  	block_tokenizers.svelteTag = parse_svelte_tag;
  	block_tokenizers.html = blockHtml;
  	block_tokenizers.indentedCode = indentedCode;

  	methods.splice(methods.indexOf('html'), 0, 'svelteBlock');
  	methods.splice(methods.indexOf('html'), 0, 'svelteTag');
  }

  function indentedCode() {
  	return true;
  }

  // Expose a frozen processor.
  var unified_1 = unified().freeze();

  var slice = [].slice;
  var own$1 = {}.hasOwnProperty;

  // Process pipeline.
  var pipeline = trough_1()
    .use(pipelineParse)
    .use(pipelineRun)
    .use(pipelineStringify);

  function pipelineParse(p, ctx) {
    ctx.tree = p.parse(ctx.file);
  }

  function pipelineRun(p, ctx, next) {
    p.run(ctx.tree, ctx.file, done);

    function done(err, tree, file) {
      if (err) {
        next(err);
      } else {
        ctx.tree = tree;
        ctx.file = file;
        next();
      }
    }
  }

  function pipelineStringify(p, ctx) {
    ctx.file.contents = p.stringify(ctx.tree, ctx.file);
  }

  // Function to create the first processor.
  function unified() {
    var attachers = [];
    var transformers = trough_1();
    var namespace = {};
    var frozen = false;
    var freezeIndex = -1;

    // Data management.
    processor.data = data;

    // Lock.
    processor.freeze = freeze;

    // Plugins.
    processor.attachers = attachers;
    processor.use = use;

    // API.
    processor.parse = parse;
    processor.stringify = stringify;
    processor.run = run;
    processor.runSync = runSync;
    processor.process = process;
    processor.processSync = processSync;

    // Expose.
    return processor

    // Create a new processor based on the processor in the current scope.
    function processor() {
      var destination = unified();
      var length = attachers.length;
      var index = -1;

      while (++index < length) {
        destination.use.apply(null, attachers[index]);
      }

      destination.data(extend$2(true, {}, namespace));

      return destination
    }

    // Freeze: used to signal a processor that has finished configuration.
    //
    // For example, take unified itself: it’s frozen.
    // Plugins should not be added to it.
    // Rather, it should be extended, by invoking it, before modifying it.
    //
    // In essence, always invoke this when exporting a processor.
    function freeze() {
      var values;
      var plugin;
      var options;
      var transformer;

      if (frozen) {
        return processor
      }

      while (++freezeIndex < attachers.length) {
        values = attachers[freezeIndex];
        plugin = values[0];
        options = values[1];
        transformer = null;

        if (options === false) {
          continue
        }

        if (options === true) {
          values[1] = undefined;
        }

        transformer = plugin.apply(processor, values.slice(1));

        if (typeof transformer === 'function') {
          transformers.use(transformer);
        }
      }

      frozen = true;
      freezeIndex = Infinity;

      return processor
    }

    // Data management.
    // Getter / setter for processor-specific informtion.
    function data(key, value) {
      if (typeof key === 'string') {
        // Set `key`.
        if (arguments.length === 2) {
          assertUnfrozen('data', frozen);

          namespace[key] = value;

          return processor
        }

        // Get `key`.
        return (own$1.call(namespace, key) && namespace[key]) || null
      }

      // Set space.
      if (key) {
        assertUnfrozen('data', frozen);
        namespace = key;
        return processor
      }

      // Get space.
      return namespace
    }

    // Plugin management.
    //
    // Pass it:
    // *   an attacher and options,
    // *   a preset,
    // *   a list of presets, attachers, and arguments (list of attachers and
    //     options).
    function use(value) {
      var settings;

      assertUnfrozen('use', frozen);

      if (value === null || value === undefined) ; else if (typeof value === 'function') {
        addPlugin.apply(null, arguments);
      } else if (typeof value === 'object') {
        if ('length' in value) {
          addList(value);
        } else {
          addPreset(value);
        }
      } else {
        throw new Error('Expected usable value, not `' + value + '`')
      }

      if (settings) {
        namespace.settings = extend$2(namespace.settings || {}, settings);
      }

      return processor

      function addPreset(result) {
        addList(result.plugins);

        if (result.settings) {
          settings = extend$2(settings || {}, result.settings);
        }
      }

      function add(value) {
        if (typeof value === 'function') {
          addPlugin(value);
        } else if (typeof value === 'object') {
          if ('length' in value) {
            addPlugin.apply(null, value);
          } else {
            addPreset(value);
          }
        } else {
          throw new Error('Expected usable value, not `' + value + '`')
        }
      }

      function addList(plugins) {
        var length;
        var index;

        if (plugins === null || plugins === undefined) ; else if (typeof plugins === 'object' && 'length' in plugins) {
          length = plugins.length;
          index = -1;

          while (++index < length) {
            add(plugins[index]);
          }
        } else {
          throw new Error('Expected a list of plugins, not `' + plugins + '`')
        }
      }

      function addPlugin(plugin, value) {
        var entry = find(plugin);

        if (entry) {
          if (isPlainObj(entry[1]) && isPlainObj(value)) {
            value = extend$2(entry[1], value);
          }

          entry[1] = value;
        } else {
          attachers.push(slice.call(arguments));
        }
      }
    }

    function find(plugin) {
      var length = attachers.length;
      var index = -1;
      var entry;

      while (++index < length) {
        entry = attachers[index];

        if (entry[0] === plugin) {
          return entry
        }
      }
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor.
    function parse(doc) {
      var file = vfile(doc);
      var Parser;

      freeze();
      Parser = processor.Parser;
      assertParser('parse', Parser);

      if (newable(Parser, 'parse')) {
        return new Parser(String(file), file).parse()
      }

      return Parser(String(file), file) // eslint-disable-line new-cap
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), async.
    function run(node, file, cb) {
      assertNode(node);
      freeze();

      if (!cb && typeof file === 'function') {
        cb = file;
        file = null;
      }

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        transformers.run(node, vfile(file), done);

        function done(err, tree, file) {
          tree = tree || node;
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(tree);
          } else {
            cb(null, tree, file);
          }
        }
      }
    }

    // Run transforms on a unist node representation of a file (in string or
    // vfile representation), sync.
    function runSync(node, file) {
      var complete = false;
      var result;

      run(node, file, done);

      assertDone('runSync', 'run', complete);

      return result

      function done(err, tree) {
        complete = true;
        bail_1(err);
        result = tree;
      }
    }

    // Stringify a unist node representation of a file (in string or vfile
    // representation) into a string using the `Compiler` on the processor.
    function stringify(node, doc) {
      var file = vfile(doc);
      var Compiler;

      freeze();
      Compiler = processor.Compiler;
      assertCompiler('stringify', Compiler);
      assertNode(node);

      if (newable(Compiler, 'compile')) {
        return new Compiler(node, file).compile()
      }

      return Compiler(node, file) // eslint-disable-line new-cap
    }

    // Parse a file (in string or vfile representation) into a unist node using
    // the `Parser` on the processor, then run transforms on that node, and
    // compile the resulting node using the `Compiler` on the processor, and
    // store that result on the vfile.
    function process(doc, cb) {
      freeze();
      assertParser('process', processor.Parser);
      assertCompiler('process', processor.Compiler);

      if (!cb) {
        return new Promise(executor)
      }

      executor(null, cb);

      function executor(resolve, reject) {
        var file = vfile(doc);

        pipeline.run(processor, {file: file}, done);

        function done(err) {
          if (err) {
            reject(err);
          } else if (resolve) {
            resolve(file);
          } else {
            cb(null, file);
          }
        }
      }
    }

    // Process the given document (in string or vfile representation), sync.
    function processSync(doc) {
      var complete = false;
      var file;

      freeze();
      assertParser('processSync', processor.Parser);
      assertCompiler('processSync', processor.Compiler);
      file = vfile(doc);

      process(file, done);

      assertDone('processSync', 'process', complete);

      return file

      function done(err) {
        complete = true;
        bail_1(err);
      }
    }
  }

  // Check if `value` is a constructor.
  function newable(value, name) {
    return (
      typeof value === 'function' &&
      value.prototype &&
      // A function with keys in its prototype is probably a constructor.
      // Classes’ prototype methods are not enumerable, so we check if some value
      // exists in the prototype.
      (keys(value.prototype) || name in value.prototype)
    )
  }

  // Check if `value` is an object with keys.
  function keys(value) {
    var key;
    for (key in value) {
      return true
    }

    return false
  }

  // Assert a parser is available.
  function assertParser(name, Parser) {
    if (typeof Parser !== 'function') {
      throw new Error('Cannot `' + name + '` without `Parser`')
    }
  }

  // Assert a compiler is available.
  function assertCompiler(name, Compiler) {
    if (typeof Compiler !== 'function') {
      throw new Error('Cannot `' + name + '` without `Compiler`')
    }
  }

  // Assert the processor is not frozen.
  function assertUnfrozen(name, frozen) {
    if (frozen) {
      throw new Error(
        'Cannot invoke `' +
          name +
          '` on a frozen processor.\nCreate a new processor first, by invoking it: use `processor()` instead of `processor`.'
      )
    }
  }

  // Assert `node` is a unist node.
  function assertNode(node) {
    if (!node || typeof node.type !== 'string') {
      throw new Error('Expected node, got `' + node + '`')
    }
  }

  // Assert that `complete` is `true`.
  function assertDone(name, asyncName, complete) {
    if (!complete) {
      throw new Error(
        '`' + name + '` finished async. Use `' + asyncName + '` instead'
      )
    }
  }

  var nlcstToString_1 = nlcstToString;

  // Stringify one nlcst node or list of nodes.
  function nlcstToString(node, separator) {
    var sep = separator || '';
    var values;
    var length;
    var children;

    if (!node || (!('length' in node) && !node.type)) {
      throw new Error('Expected node, not `' + node + '`')
    }

    if (typeof node.value === 'string') {
      return node.value
    }

    children = 'length' in node ? node : node.children;
    length = children.length;

    // Shortcut: This is pretty common, and a small performance win.
    if (length === 1 && 'value' in children[0]) {
      return children[0].value
    }

    values = [];

    while (length--) {
      values[length] = nlcstToString(children[length], sep);
    }

    return values.join(sep)
  }

  var tokenizer = tokenizerFactory;

  // Factory to create a tokenizer based on a given `expression`.
  function tokenizerFactory(childType, expression) {
    return tokenizer

    // A function that splits.
    function tokenizer(node) {
      var children = [];
      var tokens = node.children;
      var type = node.type;
      var length = tokens.length;
      var index = -1;
      var lastIndex = length - 1;
      var start = 0;
      var first;
      var last;
      var parent;

      while (++index < length) {
        if (
          index === lastIndex ||
          (tokens[index].type === childType &&
            expression.test(nlcstToString_1(tokens[index])))
        ) {
          first = tokens[start];
          last = tokens[index];

          parent = {
            type: type,
            children: tokens.slice(start, index + 1)
          };

          if (first.position && last.position) {
            parent.position = {
              start: first.position.start,
              end: last.position.end
            };
          }

          children.push(parent);

          start = index + 1;
        }
      }

      return children
    }
  }

  var parser = parserFactory;

  // Construct a parser based on `options`.
  function parserFactory(options) {
    var type = options.type;
    var tokenizerProperty = options.tokenizer;
    var delimiter = options.delimiter;
    var tokenize = delimiter && tokenizer(options.delimiterType, delimiter);

    return parser

    function parser(value) {
      var children = this[tokenizerProperty](value);

      return {
        type: type,
        children: tokenize ? tokenize(children) : children
      }
    }
  }

  // This module is generated by `script/build-expressions.js`.

  var expressions = {
    affixSymbol: /^([\)\]\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63]|["'\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21]|[!\.\?\u2026\u203D])\1*$/,
    newLine: /^[ \t]*((\r?\n|\r)[\t ]*)+$/,
    newLineMulti: /^[ \t]*((\r?\n|\r)[\t ]*){2,}$/,
    terminalMarker: /^((?:[!\.\?\u2026\u203D])+)$/,
    wordSymbolInner: /^((?:[&'\x2D\.:=\?@\xAD\xB7\u2010\u2011\u2019\u2027])|(?:_)+)$/,
    numerical: /^(?:[0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D78\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]|\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDD30-\uDD39\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2]|\uD807[\uDC50-\uDC6C\uDD50-\uDD59\uDDA0-\uDDA9\uDFC0-\uDFD4]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD83A[\uDCC7-\uDCCF\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C])+$/,
    digitStart: /^\d/,
    lowerInitial: /^(?:[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C3\uA7FA\uAB30-\uAB5A\uAB60-\uAB67\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43])/,
    surrogates: /[\uD800-\uDFFF]/,
    punctuation: /[!"'-\),-\/:;\?\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u201F\u2022-\u2027\u2032-\u203A\u203C-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDFFF]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/,
    word: /[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09F4-\u09F9\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71-\u0B77\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BF2\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C7E\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D63\u0D66-\u0D78\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F33\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u17F0-\u17F9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABE\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u20D0-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BA\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA672\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA827\uA830-\uA835\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE6\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD27\uDD30-\uDD39\uDE60-\uDE7E\uDF00-\uDF27\uDF30-\uDF54\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC52-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD46\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E\uDC5F\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF3B]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCF2\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/,
    whiteSpace: /[\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
  };

  var arrayIterate = iterate;

  var own = {}.hasOwnProperty;

  function iterate(values, callback, context) {
    var index = -1;
    var result;

    if (!values) {
      throw new Error('Iterate requires that |this| not be ' + values)
    }

    if (!own.call(values, 'length')) {
      throw new Error('Iterate requires that |this| has a `length`')
    }

    if (typeof callback !== 'function') {
      throw new Error('`callback` must be a function')
    }

    // The length might change, so we do not cache it.
    while (++index < values.length) {
      // Skip missing values.
      if (!(index in values)) {
        continue
      }

      result = callback.call(context, values[index], index, values);

      // If `callback` returns a `number`, move `index` over to `number`.
      if (typeof result === 'number') {
        // Make sure that negative numbers do not break the loop.
        if (result < 0) {
          index = 0;
        }

        index = result - 1;
      }
    }
  }

  var unistUtilModifyChildren = modifierFactory;

  // Turn `callback` into a child-modifier accepting a parent.  See
  // `array-iterate` for more info.
  function modifierFactory(callback) {
    return iteratorFactory(wrapperFactory(callback))
  }

  // Turn `callback` into a `iterator' accepting a parent.
  function iteratorFactory(callback) {
    return iterator

    function iterator(parent) {
      var children = parent && parent.children;

      if (!children) {
        throw new Error('Missing children in `parent` for `modifier`')
      }

      return arrayIterate(children, callback, parent)
    }
  }

  // Pass the context as the third argument to `callback`.
  function wrapperFactory(callback) {
    return wrapper

    function wrapper(value, index) {
      return callback(value, index, this)
    }
  }

  var mergeInitialWordSymbol_1 = unistUtilModifyChildren(mergeInitialWordSymbol);

  // Merge certain punctuation marks into their following words.
  function mergeInitialWordSymbol(child, index, parent) {
    var children;
    var next;

    if (
      (child.type !== 'SymbolNode' && child.type !== 'PunctuationNode') ||
      nlcstToString_1(child) !== '&'
    ) {
      return
    }

    children = parent.children;

    next = children[index + 1];

    // If either a previous word, or no following word, exists, exit early.
    if (
      (index !== 0 && children[index - 1].type === 'WordNode') ||
      !(next && next.type === 'WordNode')
    ) {
      return
    }

    // Remove `child` from parent.
    children.splice(index, 1);

    // Add the punctuation mark at the start of the next node.
    next.children.unshift(child);

    // Update position.
    if (next.position && child.position) {
      next.position.start = child.position.start;
    }

    // Next, iterate over the node at the previous position, as it's now adjacent
    // to a following word.
    return index - 1
  }

  var mergeFinalWordSymbol_1 = unistUtilModifyChildren(mergeFinalWordSymbol$1);

  // Merge certain punctuation marks into their preceding words.
  function mergeFinalWordSymbol$1(child, index, parent) {
    var children;
    var prev;
    var next;

    if (
      index !== 0 &&
      (child.type === 'SymbolNode' || child.type === 'PunctuationNode') &&
      nlcstToString_1(child) === '-'
    ) {
      children = parent.children;

      prev = children[index - 1];
      next = children[index + 1];

      if (
        (!next || next.type !== 'WordNode') &&
        prev &&
        prev.type === 'WordNode'
      ) {
        // Remove `child` from parent.
        children.splice(index, 1);

        // Add the punctuation mark at the end of the previous node.
        prev.children.push(child);

        // Update position.
        if (prev.position && child.position) {
          prev.position.end = child.position.end;
        }

        // Next, iterate over the node *now* at the current position (which was
        // the next node).
        return index
      }
    }
  }

  var mergeInnerWordSymbol_1 = unistUtilModifyChildren(mergeInnerWordSymbol);

  // Symbols part of surrounding words.
  var wordSymbolInner = expressions.wordSymbolInner;

  // Merge words joined by certain punctuation marks.
  function mergeInnerWordSymbol(child, index, parent) {
    var siblings;
    var sibling;
    var prev;
    var last;
    var position;
    var tokens;
    var queue;

    if (
      index !== 0 &&
      (child.type === 'SymbolNode' || child.type === 'PunctuationNode')
    ) {
      siblings = parent.children;
      prev = siblings[index - 1];

      if (prev && prev.type === 'WordNode') {
        position = index - 1;

        tokens = [];
        queue = [];

        // -   If a token which is neither word nor inner word symbol is found,
        //     the loop is broken
        // -   If an inner word symbol is found,  it’s queued
        // -   If a word is found, it’s queued (and the queue stored and emptied)
        while (siblings[++position]) {
          sibling = siblings[position];

          if (sibling.type === 'WordNode') {
            tokens = tokens.concat(queue, sibling.children);

            queue = [];
          } else if (
            (sibling.type === 'SymbolNode' ||
              sibling.type === 'PunctuationNode') &&
            wordSymbolInner.test(nlcstToString_1(sibling))
          ) {
            queue.push(sibling);
          } else {
            break
          }
        }

        if (tokens.length !== 0) {
          // If there is a queue, remove its length from `position`.
          if (queue.length !== 0) {
            position -= queue.length;
          }

          // Remove every (one or more) inner-word punctuation marks and children
          // of words.
          siblings.splice(index, position - index);

          // Add all found tokens to `prev`s children.
          prev.children = prev.children.concat(tokens);

          last = tokens[tokens.length - 1];

          // Update position.
          if (prev.position && last.position) {
            prev.position.end = last.position.end;
          }

          // Next, iterate over the node *now* at the current position.
          return index
        }
      }
    }
  }

  var mergeInnerWordSlash_1 = unistUtilModifyChildren(mergeInnerWordSlash);

  var slash = '/';

  // Merge words joined by certain punctuation marks.
  function mergeInnerWordSlash(child, index, parent) {
    var siblings = parent.children;
    var prev;
    var next;
    var prevValue;
    var nextValue;
    var queue;
    var tail;
    var count;

    prev = siblings[index - 1];
    next = siblings[index + 1];

    if (
      prev &&
      prev.type === 'WordNode' &&
      (child.type === 'SymbolNode' || child.type === 'PunctuationNode') &&
      nlcstToString_1(child) === slash
    ) {
      prevValue = nlcstToString_1(prev);
      tail = child;
      queue = [child];
      count = 1;

      if (next && next.type === 'WordNode') {
        nextValue = nlcstToString_1(next);
        tail = next;
        queue = queue.concat(next.children);
        count++;
      }

      if (prevValue.length < 3 && (!nextValue || nextValue.length < 3)) {
        // Add all found tokens to `prev`s children.
        prev.children = prev.children.concat(queue);

        siblings.splice(index, count);

        // Update position.
        if (prev.position && tail.position) {
          prev.position.end = tail.position.end;
        }

        // Next, iterate over the node *now* at the current position.
        return index
      }
    }
  }

  var mergeInitialisms_1 = unistUtilModifyChildren(mergeInitialisms);

  var numerical = expressions.numerical;

  // Merge initialisms.
  function mergeInitialisms(child, index, parent) {
    var siblings;
    var prev;
    var children;
    var length;
    var position;
    var otherChild;
    var isAllDigits;
    var value;

    if (index !== 0 && nlcstToString_1(child) === '.') {
      siblings = parent.children;

      prev = siblings[index - 1];
      children = prev.children;

      length = children && children.length;

      if (prev.type === 'WordNode' && length !== 1 && length % 2 !== 0) {
        position = length;

        isAllDigits = true;

        while (children[--position]) {
          otherChild = children[position];

          value = nlcstToString_1(otherChild);

          if (position % 2 === 0) {
            // Initialisms consist of one character values.
            if (value.length > 1) {
              return
            }

            if (!numerical.test(value)) {
              isAllDigits = false;
            }
          } else if (value !== '.') {
            if (position < length - 2) {
              break
            } else {
              return
            }
          }
        }

        if (!isAllDigits) {
          // Remove `child` from parent.
          siblings.splice(index, 1);

          // Add child to the previous children.
          children.push(child);

          // Update position.
          if (prev.position && child.position) {
            prev.position.end = child.position.end;
          }

          // Next, iterate over the node *now* at the current position.
          return index
        }
      }
    }
  }

  var mergeWords = unistUtilModifyChildren(mergeFinalWordSymbol);

  // Merge multiple words. This merges the children of adjacent words, something
  // which should not occur naturally by parse-latin, but might happen when custom
  // tokens were passed in.
  function mergeFinalWordSymbol(child, index, parent) {
    var siblings = parent.children;
    var next;

    if (child.type === 'WordNode') {
      next = siblings[index + 1];

      if (next && next.type === 'WordNode') {
        // Remove `next` from parent.
        siblings.splice(index + 1, 1);

        // Add the punctuation mark at the end of the previous node.
        child.children = child.children.concat(next.children);

        // Update position.
        if (next.position && child.position) {
          child.position.end = next.position.end;
        }

        // Next, re-iterate the current node.
        return index
      }
    }
  }

  var unistUtilVisitChildren = visitChildren;

  function visitChildren(callback) {
    return visitor

    // Visit `parent`, invoking `callback` for each child.
    function visitor(parent) {
      var index = -1;
      var children = parent && parent.children;

      if (!children) {
        throw new Error('Missing children in `parent` for `visitor`')
      }

      while (++index in children) {
        callback(children[index], index, parent);
      }
    }
  }

  var patchPosition_1 = unistUtilVisitChildren(patchPosition);

  // Patch the position on a parent node based on its first and last child.
  function patchPosition(child, index, node) {
    var siblings = node.children;

    if (!child.position) {
      return
    }

    if (
      index === 0 &&
      (!node.position || /* istanbul ignore next */ !node.position.start)
    ) {
      patch(node);
      node.position.start = child.position.start;
    }

    if (index === siblings.length - 1 && (!node.position || !node.position.end)) {
      patch(node);
      node.position.end = child.position.end;
    }
  }

  // Add a `position` object when it does not yet exist on `node`.
  function patch(node) {
    if (!node.position) {
      node.position = {};
    }
  }

  var mergeNonWordSentences_1 = unistUtilModifyChildren(mergeNonWordSentences);

  // Merge a sentence into the following sentence, when the sentence does not
  // contain word tokens.
  function mergeNonWordSentences(child, index, parent) {
    var children = child.children;
    var position = -1;
    var prev;
    var next;

    while (children[++position]) {
      if (children[position].type === 'WordNode') {
        return
      }
    }

    prev = parent.children[index - 1];

    if (prev) {
      prev.children = prev.children.concat(children);

      // Remove the child.
      parent.children.splice(index, 1);

      // Patch position.
      if (prev.position && child.position) {
        prev.position.end = child.position.end;
      }

      // Next, iterate over the node *now* at the current position (which was the
      // next node).
      return index
    }

    next = parent.children[index + 1];

    if (next) {
      next.children = children.concat(next.children);

      // Patch position.
      if (next.position && child.position) {
        next.position.start = child.position.start;
      }

      // Remove the child.
      parent.children.splice(index, 1);
    }
  }

  var mergeAffixSymbol_1 = unistUtilModifyChildren(mergeAffixSymbol);

  // Closing or final punctuation, or terminal markers that should still be
  // included in the previous sentence, even though they follow the sentence’s
  // terminal marker.
  var affixSymbol = expressions.affixSymbol;

  // Move certain punctuation following a terminal marker (thus in the next
  // sentence) to the previous sentence.
  function mergeAffixSymbol(child, index, parent) {
    var children = child.children;
    var first;
    var second;
    var prev;

    if (children && children.length !== 0 && index !== 0) {
      first = children[0];
      second = children[1];
      prev = parent.children[index - 1];

      if (
        (first.type === 'SymbolNode' || first.type === 'PunctuationNode') &&
        affixSymbol.test(nlcstToString_1(first))
      ) {
        prev.children.push(children.shift());

        // Update position.
        if (first.position && prev.position) {
          prev.position.end = first.position.end;
        }

        if (second && second.position && child.position) {
          child.position.start = second.position.start;
        }

        // Next, iterate over the previous node again.
        return index - 1
      }
    }
  }

  var mergeInitialLowerCaseLetterSentences_1 = unistUtilModifyChildren(mergeInitialLowerCaseLetterSentences);

  // Initial lowercase letter.
  var lowerInitial = expressions.lowerInitial;

  // Merge a sentence into its previous sentence, when the sentence starts with a
  // lower case letter.
  function mergeInitialLowerCaseLetterSentences(child, index, parent) {
    var children = child.children;
    var position;
    var node;
    var siblings;
    var prev;

    if (children && children.length !== 0 && index !== 0) {
      position = -1;

      while (children[++position]) {
        node = children[position];

        if (node.type === 'WordNode') {
          if (!lowerInitial.test(nlcstToString_1(node))) {
            return
          }

          siblings = parent.children;

          prev = siblings[index - 1];

          prev.children = prev.children.concat(children);

          siblings.splice(index, 1);

          // Update position.
          if (prev.position && child.position) {
            prev.position.end = child.position.end;
          }

          // Next, iterate over the node *now* at the current position.
          return index
        }

        if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
          return
        }
      }
    }
  }

  var mergeInitialDigitSentences_1 = unistUtilModifyChildren(mergeInitialDigitSentences);

  // Initial lowercase letter.
  var digit = expressions.digitStart;

  // Merge a sentence into its previous sentence, when the sentence starts with a
  // lower case letter.
  function mergeInitialDigitSentences(child, index, parent) {
    var children = child.children;
    var siblings = parent.children;
    var prev = siblings[index - 1];
    var head = children[0];

    if (prev && head && head.type === 'WordNode' && digit.test(nlcstToString_1(head))) {
      prev.children = prev.children.concat(children);
      siblings.splice(index, 1);

      // Update position.
      if (prev.position && child.position) {
        prev.position.end = child.position.end;
      }

      // Next, iterate over the node *now* at the current position.
      return index
    }
  }

  var mergePrefixExceptions_1 = unistUtilModifyChildren(mergePrefixExceptions);

  // Blacklist of full stop characters that should not be treated as terminal
  // sentence markers: A case-insensitive abbreviation.
  var abbreviationPrefix = new RegExp(
    '^(' +
      '[0-9]{1,3}|' +
      '[a-z]|' +
      // Common Latin Abbreviations:
      // Based on: <https://en.wikipedia.org/wiki/List_of_Latin_abbreviations>.
      // Where only the abbreviations written without joining full stops,
      // but with a final full stop, were extracted.
      //
      // circa, capitulus, confer, compare, centum weight, eadem, (et) alii,
      // et cetera, floruit, foliis, ibidem, idem, nemine && contradicente,
      // opere && citato, (per) cent, (per) procurationem, (pro) tempore,
      // sic erat scriptum, (et) sequentia, statim, videlicet. */
      'al|ca|cap|cca|cent|cf|cit|con|cp|cwt|ead|etc|ff|' +
      'fl|ibid|id|nem|op|pro|seq|sic|stat|tem|viz' +
      ')$'
  );

  // Merge a sentence into its next sentence, when the sentence ends with a
  // certain word.
  function mergePrefixExceptions(child, index, parent) {
    var children = child.children;
    var period;
    var node;
    var next;

    if (children && children.length > 1) {
      period = children[children.length - 1];

      if (period && nlcstToString_1(period) === '.') {
        node = children[children.length - 2];

        if (
          node &&
          node.type === 'WordNode' &&
          abbreviationPrefix.test(nlcstToString_1(node).toLowerCase())
        ) {
          // Merge period into abbreviation.
          node.children.push(period);
          children.pop();

          // Update position.
          if (period.position && node.position) {
            node.position.end = period.position.end;
          }

          // Merge sentences.
          next = parent.children[index + 1];

          if (next) {
            child.children = children.concat(next.children);

            parent.children.splice(index + 1, 1);

            // Update position.
            if (next.position && child.position) {
              child.position.end = next.position.end;
            }

            // Next, iterate over the current node again.
            return index - 1
          }
        }
      }
    }
  }

  var mergeAffixExceptions_1 = unistUtilModifyChildren(mergeAffixExceptions);

  // Merge a sentence into its previous sentence, when the sentence starts with a
  // comma.
  function mergeAffixExceptions(child, index, parent) {
    var children = child.children;
    var node;
    var position;
    var value;
    var previousChild;

    if (!children || children.length === 0 || index === 0) {
      return
    }

    position = -1;

    while (children[++position]) {
      node = children[position];

      if (node.type === 'WordNode') {
        return
      }

      if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
        value = nlcstToString_1(node);

        if (value !== ',' && value !== ';') {
          return
        }

        previousChild = parent.children[index - 1];

        previousChild.children = previousChild.children.concat(children);

        // Update position.
        if (previousChild.position && child.position) {
          previousChild.position.end = child.position.end;
        }

        parent.children.splice(index, 1);

        // Next, iterate over the node *now* at the current position.
        return index
      }
    }
  }

  var mergeRemainingFullStops_1 = unistUtilVisitChildren(mergeRemainingFullStops);

  // Blacklist of full stop characters that should not be treated as terminal
  // sentence markers: A case-insensitive abbreviation.
  var terminalMarker = expressions.terminalMarker;

  // Merge non-terminal-marker full stops into the previous word (if available),
  // or the next word (if available).
  function mergeRemainingFullStops(child) {
    var children = child.children;
    var position = children.length;
    var hasFoundDelimiter = false;
    var grandchild;
    var prev;
    var next;
    var nextNext;

    while (children[--position]) {
      grandchild = children[position];

      if (
        grandchild.type !== 'SymbolNode' &&
        grandchild.type !== 'PunctuationNode'
      ) {
        // This is a sentence without terminal marker, so we 'fool' the code to
        // make it think we have found one.
        if (grandchild.type === 'WordNode') {
          hasFoundDelimiter = true;
        }

        continue
      }

      // Exit when this token is not a terminal marker.
      if (!terminalMarker.test(nlcstToString_1(grandchild))) {
        continue
      }

      // Ignore the first terminal marker found (starting at the end), as it
      // should not be merged.
      if (!hasFoundDelimiter) {
        hasFoundDelimiter = true;

        continue
      }

      // Only merge a single full stop.
      if (nlcstToString_1(grandchild) !== '.') {
        continue
      }

      prev = children[position - 1];
      next = children[position + 1];

      if (prev && prev.type === 'WordNode') {
        nextNext = children[position + 2];

        // Continue when the full stop is followed by a space and another full
        // stop, such as: `{.} .`
        if (
          next &&
          nextNext &&
          next.type === 'WhiteSpaceNode' &&
          nlcstToString_1(nextNext) === '.'
        ) {
          continue
        }

        // Remove `child` from parent.
        children.splice(position, 1);

        // Add the punctuation mark at the end of the previous node.
        prev.children.push(grandchild);

        // Update position.
        if (grandchild.position && prev.position) {
          prev.position.end = grandchild.position.end;
        }

        position--;
      } else if (next && next.type === 'WordNode') {
        // Remove `child` from parent.
        children.splice(position, 1);

        // Add the punctuation mark at the start of the next node.
        next.children.unshift(grandchild);

        if (grandchild.position && next.position) {
          next.position.start = grandchild.position.start;
        }
      }
    }
  }

  var makeInitialWhiteSpaceSiblings_1 = unistUtilVisitChildren(makeInitialWhiteSpaceSiblings);

  // Move white space starting a sentence up, so they are the siblings of
  // sentences.
  function makeInitialWhiteSpaceSiblings(child, index, parent) {
    var children = child.children;
    var next;

    if (
      children &&
      children.length !== 0 &&
      children[0].type === 'WhiteSpaceNode'
    ) {
      parent.children.splice(index, 0, children.shift());
      next = children[0];

      if (next && next.position && child.position) {
        child.position.start = next.position.start;
      }
    }
  }

  var makeFinalWhiteSpaceSiblings_1 = unistUtilModifyChildren(makeFinalWhiteSpaceSiblings);

  // Move white space ending a paragraph up, so they are the siblings of
  // paragraphs.
  function makeFinalWhiteSpaceSiblings(child, index, parent) {
    var children = child.children;
    var prev;

    if (
      children &&
      children.length !== 0 &&
      children[children.length - 1].type === 'WhiteSpaceNode'
    ) {
      parent.children.splice(index + 1, 0, child.children.pop());
      prev = children[children.length - 1];

      if (prev && prev.position && child.position) {
        child.position.end = prev.position.end;
      }

      // Next, iterate over the current node again.
      return index
    }
  }

  var breakImplicitSentences_1 = unistUtilModifyChildren(breakImplicitSentences);

  // Two or more new line characters.
  var multiNewLine = expressions.newLineMulti;

  // Break a sentence if a white space with more than one new-line is found.
  function breakImplicitSentences(child, index, parent) {
    var children;
    var position;
    var length;
    var tail;
    var head;
    var end;
    var insertion;
    var node;

    if (child.type !== 'SentenceNode') {
      return
    }

    children = child.children;

    // Ignore first and last child.
    length = children.length - 1;
    position = 0;

    while (++position < length) {
      node = children[position];

      if (node.type !== 'WhiteSpaceNode' || !multiNewLine.test(nlcstToString_1(node))) {
        continue
      }

      child.children = children.slice(0, position);

      insertion = {
        type: 'SentenceNode',
        children: children.slice(position + 1)
      };

      tail = children[position - 1];
      head = children[position + 1];

      parent.children.splice(index + 1, 0, node, insertion);

      if (child.position && tail.position && head.position) {
        end = child.position.end;

        child.position.end = tail.position.end;

        insertion.position = {
          start: head.position.start,
          end: end
        };
      }

      return index + 1
    }
  }

  var removeEmptyNodes_1 = unistUtilModifyChildren(removeEmptyNodes);

  // Remove empty children.
  function removeEmptyNodes(child, index, parent) {
    if ('children' in child && child.children.length === 0) {
      parent.children.splice(index, 1);

      // Next, iterate over the node *now* at the current position (which was the
      // next node).
      return index
    }
  }

  var lib = ParseLatin;

  // PARSE LATIN

  // Transform Latin-script natural language into an NLCST-tree.
  function ParseLatin(doc, file) {
    var value = file || doc;

    if (!(this instanceof ParseLatin)) {
      return new ParseLatin(doc, file)
    }

    this.doc = value ? String(value) : null;
  }

  // Quick access to the prototype.
  var proto = ParseLatin.prototype;

  // Default position.
  proto.position = true;

  // Create text nodes.
  proto.tokenizeSymbol = createTextFactory('Symbol');
  proto.tokenizeWhiteSpace = createTextFactory('WhiteSpace');
  proto.tokenizePunctuation = createTextFactory('Punctuation');
  proto.tokenizeSource = createTextFactory('Source');
  proto.tokenizeText = createTextFactory('Text');

  // Expose `run`.
  proto.run = run;

  // Inject `plugins` to modifiy the result of the method at `key` on the operated
  // on context.
  proto.use = useFactory(function(context, key, plugins) {
    context[key] = context[key].concat(plugins);
  });

  // Inject `plugins` to modifiy the result of the method at `key` on the operated
  // on context, before any other.
  proto.useFirst = useFactory(function(context, key, plugins) {
    context[key] = plugins.concat(context[key]);
  });

  // Easy access to the document parser. This additionally supports retext-style
  // invocation: where an instance is created for each file, and the file is given
  // on construction.
  proto.parse = function(value) {
    return this.tokenizeRoot(value || this.doc)
  };

  // Transform a `value` into a list of `NLCSTNode`s.
  proto.tokenize = function(value) {
    return tokenize(this, value)
  };

  // PARENT NODES
  //
  // All these nodes are `pluggable`: they come with a `use` method which accepts
  // a plugin (`function(NLCSTNode)`).
  // Every time one of these methods are called, the plugin is invoked with the
  // node, allowing for easy modification.
  //
  // In fact, the internal transformation from `tokenize` (a list of words, white
  // space, punctuation, and symbols) to `tokenizeRoot` (an NLCST tree), is also
  // implemented through this mechanism.

  // Create a `WordNode` with its children set to a single `TextNode`, its value
  // set to the given `value`.
  pluggable(ParseLatin, 'tokenizeWord', function(value, eat) {
    var add = (eat || noopEat)('');
    var parent = {type: 'WordNode', children: []};

    this.tokenizeText(value, eat, parent);

    return add(parent)
  });

  // Create a `SentenceNode` with its children set to `Node`s, their values set
  // to the tokenized given `value`.
  //
  // Unless plugins add new nodes, the sentence is populated by `WordNode`s,
  // `SymbolNode`s, `PunctuationNode`s, and `WhiteSpaceNode`s.
  pluggable(
    ParseLatin,
    'tokenizeSentence',
    parser({
      type: 'SentenceNode',
      tokenizer: 'tokenize'
    })
  );

  // Create a `ParagraphNode` with its children set to `Node`s, their values set
  // to the tokenized given `value`.
  //
  // Unless plugins add new nodes, the paragraph is populated by `SentenceNode`s
  // and `WhiteSpaceNode`s.
  pluggable(
    ParseLatin,
    'tokenizeParagraph',
    parser({
      type: 'ParagraphNode',
      delimiter: expressions.terminalMarker,
      delimiterType: 'PunctuationNode',
      tokenizer: 'tokenizeSentence'
    })
  );

  // Create a `RootNode` with its children set to `Node`s, their values set to the
  // tokenized given `value`.
  pluggable(
    ParseLatin,
    'tokenizeRoot',
    parser({
      type: 'RootNode',
      delimiter: expressions.newLine,
      delimiterType: 'WhiteSpaceNode',
      tokenizer: 'tokenizeParagraph'
    })
  );

  // PLUGINS

  proto.use('tokenizeSentence', [
    mergeInitialWordSymbol_1,
    mergeFinalWordSymbol_1,
    mergeInnerWordSymbol_1,
    mergeInnerWordSlash_1,
    mergeInitialisms_1,
    mergeWords,
    patchPosition_1
  ]);

  proto.use('tokenizeParagraph', [
    mergeNonWordSentences_1,
    mergeAffixSymbol_1,
    mergeInitialLowerCaseLetterSentences_1,
    mergeInitialDigitSentences_1,
    mergePrefixExceptions_1,
    mergeAffixExceptions_1,
    mergeRemainingFullStops_1,
    makeInitialWhiteSpaceSiblings_1,
    makeFinalWhiteSpaceSiblings_1,
    breakImplicitSentences_1,
    removeEmptyNodes_1,
    patchPosition_1
  ]);

  proto.use('tokenizeRoot', [
    makeInitialWhiteSpaceSiblings_1,
    makeFinalWhiteSpaceSiblings_1,
    removeEmptyNodes_1,
    patchPosition_1
  ]);

  // TEXT NODES

  // Factory to create a `Text`.
  function createTextFactory(type) {
    type += 'Node';

    return createText

    // Construct a `Text` from a bound `type`
    function createText(value, eat, parent) {
      if (value === null || value === undefined) {
        value = '';
      }

      return (eat || noopEat)(value)(
        {
          type: type,
          value: String(value)
        },
        parent
      )
    }
  }

  // Run transform plug-ins for `key` on `nodes`.
  function run(key, nodes) {
    var wareKey = key + 'Plugins';
    var plugins = this[wareKey];
    var index = -1;

    if (plugins) {
      while (plugins[++index]) {
        plugins[index](nodes);
      }
    }

    return nodes
  }

  // Make a method “pluggable”.
  function pluggable(Constructor, key, callback) {
    // Set a pluggable version of `callback` on `Constructor`.
    Constructor.prototype[key] = function() {
      return this.run(key, callback.apply(this, arguments))
    };
  }

  // Factory to inject `plugins`. Takes `callback` for the actual inserting.
  function useFactory(callback) {
    return use

    // Validate if `plugins` can be inserted.
    // Invokes the bound `callback` to do the actual inserting.
    function use(key, plugins) {
      var self = this;
      var wareKey;

      // Throw if the method is not pluggable.
      if (!(key in self)) {
        throw new Error(
          'Illegal Invocation: Unsupported `key` for ' +
            '`use(key, plugins)`. Make sure `key` is a ' +
            'supported function'
        )
      }

      // Fail silently when no plugins are given.
      if (!plugins) {
        return
      }

      wareKey = key + 'Plugins';

      // Make sure `plugins` is a list.
      if (typeof plugins === 'function') {
        plugins = [plugins];
      } else {
        plugins = plugins.concat();
      }

      // Make sure `wareKey` exists.
      if (!self[wareKey]) {
        self[wareKey] = [];
      }

      // Invoke callback with the ware key and plugins.
      callback(self, wareKey, plugins);
    }
  }

  // CLASSIFY

  // Match a word character.
  var wordRe = expressions.word;

  // Match a surrogate character.
  var surrogatesRe = expressions.surrogates;

  // Match a punctuation character.
  var punctuationRe = expressions.punctuation;

  // Match a white space character.
  var whiteSpaceRe = expressions.whiteSpace;

  // Transform a `value` into a list of `NLCSTNode`s.
  function tokenize(parser, value) {
    var tokens;
    var offset;
    var line;
    var column;
    var index;
    var length;
    var character;
    var queue;
    var prev;
    var left;
    var right;
    var eater;

    if (value === null || value === undefined) {
      value = '';
    } else if (value instanceof String) {
      value = value.toString();
    }

    if (typeof value !== 'string') {
      // Return the given nodes if this is either an empty array, or an array with
      // a node as a first child.
      if ('length' in value && (!value[0] || value[0].type)) {
        return value
      }

      throw new Error(
        "Illegal invocation: '" +
          value +
          "' is not a valid argument for 'ParseLatin'"
      )
    }

    tokens = [];

    if (!value) {
      return tokens
    }

    index = 0;
    offset = 0;
    line = 1;
    column = 1;

    // Eat mechanism to use.
    eater = parser.position ? eat : noPositionEat;

    length = value.length;
    prev = '';
    queue = '';

    while (index < length) {
      character = value.charAt(index);

      if (whiteSpaceRe.test(character)) {
        right = 'WhiteSpace';
      } else if (punctuationRe.test(character)) {
        right = 'Punctuation';
      } else if (wordRe.test(character)) {
        right = 'Word';
      } else {
        right = 'Symbol';
      }

      tick();

      prev = character;
      character = '';
      left = right;
      right = null;

      index++;
    }

    tick();

    return tokens

    // Check one character.
    function tick() {
      if (
        left === right &&
        (left === 'Word' ||
          left === 'WhiteSpace' ||
          character === prev ||
          surrogatesRe.test(character))
      ) {
        queue += character;
      } else {
        // Flush the previous queue.
        if (queue) {
          parser['tokenize' + left](queue, eater);
        }

        queue = character;
      }
    }

    // Remove `subvalue` from `value`.
    // Expects `subvalue` to be at the start from `value`, and applies no
    // validation.
    function eat(subvalue) {
      var pos = position();

      update(subvalue);

      return apply

      // Add the given arguments, add `position` to the returned node, and return
      // the node.
      function apply() {
        return pos(add.apply(null, arguments))
      }
    }

    // Remove `subvalue` from `value`.
    // Does not patch positional information.
    function noPositionEat() {
      return apply

      // Add the given arguments and return the node.
      function apply() {
        return add.apply(null, arguments)
      }
    }

    // Add mechanism.
    function add(node, parent) {
      if (parent) {
        parent.children.push(node);
      } else {
        tokens.push(node);
      }

      return node
    }

    // Mark position and patch `node.position`.
    function position() {
      var before = now();

      // Add the position to a node.
      function patch(node) {
        node.position = new Position(before);

        return node
      }

      return patch
    }

    // Update line and column based on `value`.
    function update(subvalue) {
      var subvalueLength = subvalue.length;
      var character = -1;
      var lastIndex = -1;

      offset += subvalueLength;

      while (++character < subvalueLength) {
        if (subvalue.charAt(character) === '\n') {
          lastIndex = character;
          line++;
        }
      }

      if (lastIndex === -1) {
        column += subvalueLength;
      } else {
        column = subvalueLength - lastIndex;
      }
    }

    // Store position information for a node.
    function Position(start) {
      this.start = start;
      this.end = now();
    }

    // Get the current position.
    function now() {
      return {
        line: line,
        column: column,
        offset: offset
      }
    }
  }

  // Add mechanism used when text-tokenisers are called directly outside of the
  // `tokenize` function.
  function noopAdd(node, parent) {
    if (parent) {
      parent.children.push(node);
    }

    return node
  }

  // Eat and add mechanism without adding positional information, used when
  // text-tokenisers are called directly outside of the `tokenize` function.
  function noopEat() {
    return noopAdd
  }

  var parseLatin = lib;

  var retextLatin = parse$1;
  parse$1.Parser = parseLatin;

  function parse$1() {
    this.Parser = unherit_1(parseLatin);
  }

  var retextStringify = stringify$1;

  function stringify$1() {
    this.Compiler = compiler;
  }

  function compiler(tree) {
    return nlcstToString_1(tree)
  }

  var retext = unified_1()
    .use(retextLatin)
    .use(retextStringify)
    .freeze();

  var retextSmartypants = smartypants;

  var punctuation = 'PunctuationNode';
  var symbol = 'SymbolNode';
  var word = 'WordNode';
  var whiteSpace = 'WhiteSpaceNode';

  var decadeExpression = /^\d\ds$/;
  var threeFullStopsExpression = /^\.{3,}$/;
  var fullStopsExpression = /^\.+$/;
  var threeDashes = '---';
  var twoDashes = '--';
  var emDash = '—';
  var enDash = '–';
  var ellipsis = '…';
  var twoBackticks = '``';
  var backtick = '`';
  var twoSingleQuotes = "''";
  var singleQuote = "'";
  var apostrophe = '’';
  var doubleQuote = '"';
  var openingDoubleQuote = '“';
  var closingDoubleQuote = '”';
  var openingSingleQuote = '‘';
  var closingSingleQuote = '’';
  var closingQuotes = {};
  var openingQuotes = {};

  openingQuotes[doubleQuote] = openingDoubleQuote;
  closingQuotes[doubleQuote] = closingDoubleQuote;
  openingQuotes[singleQuote] = openingSingleQuote;
  closingQuotes[singleQuote] = closingSingleQuote;

  var educators = {};

  // Expose educators.
  educators.dashes = {
    true: dashes,
    oldschool: oldschool,
    inverted: inverted
  };

  educators.backticks = {
    true: backticks,
    all: all
  };

  educators.ellipses = {
    true: ellipses
  };

  educators.quotes = {
    true: quotes
  };

  // Attacher.
  function smartypants(options) {
    var methods = [];
    var quotes;
    var ellipses;
    var backticks;
    var dashes;

    if (!options) {
      options = {};
    }

    if ('quotes' in options) {
      quotes = options.quotes;

      if (quotes !== Boolean(quotes)) {
        throw new TypeError(
          'Illegal invocation: `' +
            quotes +
            '` ' +
            'is not a valid value for `quotes` in ' +
            '`smartypants`'
        )
      }
    } else {
      quotes = true;
    }

    if ('ellipses' in options) {
      ellipses = options.ellipses;

      if (ellipses !== Boolean(ellipses)) {
        throw new TypeError(
          'Illegal invocation: `' +
            ellipses +
            '` ' +
            'is not a valid value for `ellipses` in ' +
            '`smartypants`'
        )
      }
    } else {
      ellipses = true;
    }

    if ('backticks' in options) {
      backticks = options.backticks;

      if (backticks !== Boolean(backticks) && backticks !== 'all') {
        throw new TypeError(
          'Illegal invocation: `' +
            backticks +
            '` ' +
            'is not a valid value for `backticks` in ' +
            '`smartypants`'
        )
      }

      if (backticks === 'all' && quotes === true) {
        throw new TypeError(
          'Illegal invocation: `backticks: ' +
            backticks +
            '` is not a valid value ' +
            'when `quotes: ' +
            quotes +
            '` in ' +
            '`smartypants`'
        )
      }
    } else {
      backticks = true;
    }

    if ('dashes' in options) {
      dashes = options.dashes;

      if (
        dashes !== Boolean(dashes) &&
        dashes !== 'oldschool' &&
        dashes !== 'inverted'
      ) {
        throw new TypeError(
          'Illegal invocation: `' +
            dashes +
            '` ' +
            'is not a valid value for `dahes` in ' +
            '`smartypants`'
        )
      }
    } else {
      dashes = true;
    }

    if (quotes !== false) {
      methods.push(educators.quotes[quotes]);
    }

    if (ellipses !== false) {
      methods.push(educators.ellipses[ellipses]);
    }

    if (backticks !== false) {
      methods.push(educators.backticks[backticks]);
    }

    if (dashes !== false) {
      methods.push(educators.dashes[dashes]);
    }

    return transformFactory(methods)
  }

  // Create a transformer for the bound methods.
  function transformFactory(methods) {
    var length = methods.length;

    return transformer

    // Transformer.
    function transformer(tree) {
      unistUtilVisit(tree, visitor);
    }

    function visitor(node, position, parent) {
      var index = -1;

      if (node.type === punctuation || node.type === symbol) {
        while (++index < length) {
          methods[index](node, position, parent);
        }
      }
    }
  }

  // Transform three dahes into an em-dash, and two into an en-dash.
  function oldschool(node) {
    if (node.value === threeDashes) {
      node.value = emDash;
    } else if (node.value === twoDashes) {
      node.value = enDash;
    }
  }

  // Transform two dahes into an em-dash.
  function dashes(node) {
    if (node.value === twoDashes) {
      node.value = emDash;
    }
  }

  // Transform three dahes into an en-dash, and two into an em-dash.
  function inverted(node) {
    if (node.value === threeDashes) {
      node.value = enDash;
    } else if (node.value === twoDashes) {
      node.value = emDash;
    }
  }

  // Transform double backticks and single quotes into smart quotes.
  function backticks(node) {
    if (node.value === twoBackticks) {
      node.value = openingDoubleQuote;
    } else if (node.value === twoSingleQuotes) {
      node.value = closingDoubleQuote;
    }
  }

  // Transform single and double backticks and single quotes into smart quotes.
  function all(node) {
    backticks(node);

    if (node.value === backtick) {
      node.value = openingSingleQuote;
    } else if (node.value === singleQuote) {
      node.value = closingSingleQuote;
    }
  }

  // Transform multiple dots into unicode ellipses.
  function ellipses(node, index, parent) {
    var value = node.value;
    var siblings = parent.children;
    var position;
    var nodes;
    var sibling;
    var type;
    var count;
    var queue;

    // Simple node with three dots and without white-space.
    if (threeFullStopsExpression.test(node.value)) {
      node.value = ellipsis;
      return
    }

    if (!fullStopsExpression.test(value)) {
      return
    }

    // Search for dot-nodes with white-space between.
    nodes = [];
    position = index;
    count = 1;

    // It’s possible that the node is merged with an adjacent word-node.  In that
    // code, we cannot transform it because there’s no reference to the
    // grandparent.
    while (--position > 0) {
      sibling = siblings[position];

      if (sibling.type !== whiteSpace) {
        break
      }

      queue = sibling;
      sibling = siblings[--position];
      type = sibling && sibling.type;

      if (
        sibling &&
        (type === punctuation || type === symbol) &&
        fullStopsExpression.test(sibling.value)
      ) {
        nodes.push(queue, sibling);

        count++;

        continue
      }

      break
    }

    if (count < 3) {
      return
    }

    siblings.splice(index - nodes.length, nodes.length);

    node.value = ellipsis;
  }

  // Transform straight single- and double quotes into smart quotes.
  // eslint-disable-next-line complexity
  function quotes(node, index, parent) {
    var siblings = parent.children;
    var value = node.value;
    var next;
    var nextNext;
    var prev;
    var nextValue;

    if (value !== doubleQuote && value !== singleQuote) {
      return
    }

    prev = siblings[index - 1];
    next = siblings[index + 1];
    nextNext = siblings[index + 2];
    nextValue = next && nlcstToString_1(next);

    if (
      next &&
      nextNext &&
      (next.type === punctuation || next.type === symbol) &&
      nextNext.type !== word
    ) {
      // Special case if the very first character is a quote followed by
      // punctuation at a non-word-break. Close the quotes by brute force.
      node.value = closingQuotes[value];
    } else if (
      nextNext &&
      (nextValue === doubleQuote || nextValue === singleQuote) &&
      nextNext.type === word
    ) {
      // Special case for double sets of quotes:
      // `He said, "'Quoted' words in a larger quote."`
      node.value = openingQuotes[value];
      next.value = openingQuotes[nextValue];
    } else if (next && decadeExpression.test(nextValue)) {
      // Special case for decade abbreviations: `the '80s`
      node.value = closingQuotes[value];
    } else if (
      prev &&
      next &&
      (prev.type === whiteSpace ||
        prev.type === punctuation ||
        prev.type === symbol) &&
      next.type === word
    ) {
      // Get most opening single quotes.
      node.value = openingQuotes[value];
    } else if (
      prev &&
      prev.type !== whiteSpace &&
      prev.type !== symbol &&
      prev.type !== punctuation
    ) {
      // Closing quotes.
      node.value = closingQuotes[value];
    } else if (
      !next ||
      next.type === whiteSpace ||
      ((value === singleQuote || value === apostrophe) && nextValue === 's')
    ) {
      node.value = closingQuotes[value];
    } else {
      node.value = openingQuotes[value];
    }
  }

  function isNothing(subject) {
    return (typeof subject === 'undefined') || (subject === null);
  }


  function isObject(subject) {
    return (typeof subject === 'object') && (subject !== null);
  }


  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];

    return [ sequence ];
  }


  function extend(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }


  function repeat(string, count) {
    var result = '', cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }


  function isNegativeZero(number) {
    return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
  }


  var isNothing_1      = isNothing;
  var isObject_1       = isObject;
  var toArray_1        = toArray;
  var repeat_1         = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1         = extend;

  var common = {
  	isNothing: isNothing_1,
  	isObject: isObject_1,
  	toArray: toArray_1,
  	repeat: repeat_1,
  	isNegativeZero: isNegativeZero_1,
  	extend: extend_1
  };

  // YAML error class. http://stackoverflow.com/questions/8458984

  function YAMLException$1(reason, mark) {
    // Super constructor
    Error.call(this);

    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');

    // Include stack trace in error object
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = (new Error()).stack || '';
    }
  }


  // Inherit from Error
  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;


  YAMLException$1.prototype.toString = function toString(compact) {
    var result = this.name + ': ';

    result += this.reason || '(unknown reason)';

    if (!compact && this.mark) {
      result += ' ' + this.mark.toString();
    }

    return result;
  };


  var exception = YAMLException$1;

  function Mark(name, buffer, position, line, column) {
    this.name     = name;
    this.buffer   = buffer;
    this.position = position;
    this.line     = line;
    this.column   = column;
  }


  Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
    var head, start, tail, end, snippet;

    if (!this.buffer) return null;

    indent = indent || 4;
    maxLength = maxLength || 75;

    head = '';
    start = this.position;

    while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
      start -= 1;
      if (this.position - start > (maxLength / 2 - 1)) {
        head = ' ... ';
        start += 5;
        break;
      }
    }

    tail = '';
    end = this.position;

    while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
      end += 1;
      if (end - this.position > (maxLength / 2 - 1)) {
        tail = ' ... ';
        end -= 5;
        break;
      }
    }

    snippet = this.buffer.slice(start, end);

    return common.repeat(' ', indent) + head + snippet + tail + '\n' +
           common.repeat(' ', indent + this.position - start + head.length) + '^';
  };


  Mark.prototype.toString = function toString(compact) {
    var snippet, where = '';

    if (this.name) {
      where += 'in "' + this.name + '" ';
    }

    where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

    if (!compact) {
      snippet = this.getSnippet();

      if (snippet) {
        where += ':\n' + snippet;
      }
    }

    return where;
  };


  var mark = Mark;

  var TYPE_CONSTRUCTOR_OPTIONS = [
    'kind',
    'resolve',
    'construct',
    'instanceOf',
    'predicate',
    'represent',
    'defaultStyle',
    'styleAliases'
  ];

  var YAML_NODE_KINDS = [
    'scalar',
    'sequence',
    'mapping'
  ];

  function compileStyleAliases(map) {
    var result = {};

    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }

    return result;
  }

  function Type$1(tag, options) {
    options = options || {};

    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });

    // TODO: Add tag format check.
    this.tag          = tag;
    this.kind         = options['kind']         || null;
    this.resolve      = options['resolve']      || function () { return true; };
    this.construct    = options['construct']    || function (data) { return data; };
    this.instanceOf   = options['instanceOf']   || null;
    this.predicate    = options['predicate']    || null;
    this.represent    = options['represent']    || null;
    this.defaultStyle = options['defaultStyle'] || null;
    this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }

  var type = Type$1;

  /*eslint-disable max-len*/






  function compileList(schema, name, result) {
    var exclude = [];

    schema.include.forEach(function (includedSchema) {
      result = compileList(includedSchema, name, result);
    });

    schema[name].forEach(function (currentType) {
      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
          exclude.push(previousIndex);
        }
      });

      result.push(currentType);
    });

    return result.filter(function (type, index) {
      return exclude.indexOf(index) === -1;
    });
  }


  function compileMap(/* lists... */) {
    var result = {
          scalar: {},
          sequence: {},
          mapping: {},
          fallback: {}
        }, index, length;

    function collectType(type) {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }

    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }


  function Schema$1(definition) {
    this.include  = definition.include  || [];
    this.implicit = definition.implicit || [];
    this.explicit = definition.explicit || [];

    this.implicit.forEach(function (type) {
      if (type.loadKind && type.loadKind !== 'scalar') {
        throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }
    });

    this.compiledImplicit = compileList(this, 'implicit', []);
    this.compiledExplicit = compileList(this, 'explicit', []);
    this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
  }


  Schema$1.DEFAULT = null;


  Schema$1.create = function createSchema() {
    var schemas, types;

    switch (arguments.length) {
      case 1:
        schemas = Schema$1.DEFAULT;
        types = arguments[0];
        break;

      case 2:
        schemas = arguments[0];
        types = arguments[1];
        break;

      default:
        throw new exception('Wrong number of arguments for Schema.create function');
    }

    schemas = common.toArray(schemas);
    types = common.toArray(types);

    if (!schemas.every(function (schema) { return schema instanceof Schema$1; })) {
      throw new exception('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
    }

    if (!types.every(function (type$1) { return type$1 instanceof type; })) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    return new Schema$1({
      include: schemas,
      explicit: types
    });
  };


  var schema = Schema$1;

  var str = new type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) { return data !== null ? data : ''; }
  });

  var seq = new type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) { return data !== null ? data : []; }
  });

  var map = new type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) { return data !== null ? data : {}; }
  });

  var failsafe = new schema({
    explicit: [
      str,
      seq,
      map
    ]
  });

  function resolveYamlNull(data) {
    if (data === null) return true;

    var max = data.length;

    return (max === 1 && data === '~') ||
           (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
  }

  function constructYamlNull() {
    return null;
  }

  function isNull(object) {
    return object === null;
  }

  var _null = new type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () { return '~';    },
      lowercase: function () { return 'null'; },
      uppercase: function () { return 'NULL'; },
      camelcase: function () { return 'Null'; }
    },
    defaultStyle: 'lowercase'
  });

  function resolveYamlBoolean(data) {
    if (data === null) return false;

    var max = data.length;

    return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
           (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
  }

  function constructYamlBoolean(data) {
    return data === 'true' ||
           data === 'True' ||
           data === 'TRUE';
  }

  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }

  var bool = new type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) { return object ? 'true' : 'false'; },
      uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
      camelcase: function (object) { return object ? 'True' : 'False'; }
    },
    defaultStyle: 'lowercase'
  });

  function isHexCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
           ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
           ((0x61/* a */ <= c) && (c <= 0x66/* f */));
  }

  function isOctCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
  }

  function isDecCode(c) {
    return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
  }

  function resolveYamlInteger(data) {
    if (data === null) return false;

    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;

    if (!max) return false;

    ch = data[index];

    // sign
    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }

    if (ch === '0') {
      // 0
      if (index + 1 === max) return true;
      ch = data[++index];

      // base 2, base 8, base 16

      if (ch === 'b') {
        // base 2
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }


      if (ch === 'x') {
        // base 16
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }

      // base 8
      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }

    // base 10 (except 0) or base 60

    // value should not start with `_`;
    if (ch === '_') return false;

    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (ch === ':') break;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }

    // Should have digits and should not end with `_`
    if (!hasDigits || ch === '_') return false;

    // if !base60 - done;
    if (ch !== ':') return true;

    // base60 almost not used, no needs to optimize
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
  }

  function constructYamlInteger(data) {
    var value = data, sign = 1, ch, base, digits = [];

    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }

    ch = value[0];

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }

    if (value === '0') return 0;

    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value, 16);
      return sign * parseInt(value, 8);
    }

    if (value.indexOf(':') !== -1) {
      value.split(':').forEach(function (v) {
        digits.unshift(parseInt(v, 10));
      });

      value = 0;
      base = 1;

      digits.forEach(function (d) {
        value += (d * base);
        base *= 60;
      });

      return sign * value;

    }

    return sign * parseInt(value, 10);
  }

  function isInteger(object) {
    return (Object.prototype.toString.call(object)) === '[object Number]' &&
           (object % 1 === 0 && !common.isNegativeZero(object));
  }

  var int_1 = new type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
      octal:       function (obj) { return obj >= 0 ? '0'  + obj.toString(8) : '-0'  + obj.toString(8).slice(1); },
      decimal:     function (obj) { return obj.toString(10); },
      /* eslint-disable max-len */
      hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary:      [ 2,  'bin' ],
      octal:       [ 8,  'oct' ],
      decimal:     [ 10, 'dec' ],
      hexadecimal: [ 16, 'hex' ]
    }
  });

  var YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    '^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
    // .2e4, .2
    // special case, seems not from spec
    '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
    // 20:59
    '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
    // .inf
    '|[-+]?\\.(?:inf|Inf|INF)' +
    // .nan
    '|\\.(?:nan|NaN|NAN))$');

  function resolveYamlFloat(data) {
    if (data === null) return false;

    if (!YAML_FLOAT_PATTERN.test(data) ||
        // Quick hack to not allow integers end with `_`
        // Probably should update regexp & check speed
        data[data.length - 1] === '_') {
      return false;
    }

    return true;
  }

  function constructYamlFloat(data) {
    var value, sign, base, digits;

    value  = data.replace(/_/g, '').toLowerCase();
    sign   = value[0] === '-' ? -1 : 1;
    digits = [];

    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }

    if (value === '.inf') {
      return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    } else if (value === '.nan') {
      return NaN;

    } else if (value.indexOf(':') >= 0) {
      value.split(':').forEach(function (v) {
        digits.unshift(parseFloat(v, 10));
      });

      value = 0.0;
      base = 1;

      digits.forEach(function (d) {
        value += d * base;
        base *= 60;
      });

      return sign * value;

    }
    return sign * parseFloat(value, 10);
  }


  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

  function representYamlFloat(object, style) {
    var res;

    if (isNaN(object)) {
      switch (style) {
        case 'lowercase': return '.nan';
        case 'uppercase': return '.NAN';
        case 'camelcase': return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '.inf';
        case 'uppercase': return '.INF';
        case 'camelcase': return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase': return '-.inf';
        case 'uppercase': return '-.INF';
        case 'camelcase': return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }

    res = object.toString(10);

    // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack

    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }

  function isFloat(object) {
    return (Object.prototype.toString.call(object) === '[object Number]') &&
           (object % 1 !== 0 || common.isNegativeZero(object));
  }

  var float_1 = new type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });

  var json = new schema({
    include: [
      failsafe
    ],
    implicit: [
      _null,
      bool,
      int_1,
      float_1
    ]
  });

  var core = new schema({
    include: [
      json
    ]
  });

  var YAML_DATE_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9])'                    + // [2] month
    '-([0-9][0-9])$');                   // [3] day

  var YAML_TIMESTAMP_REGEXP = new RegExp(
    '^([0-9][0-9][0-9][0-9])'          + // [1] year
    '-([0-9][0-9]?)'                   + // [2] month
    '-([0-9][0-9]?)'                   + // [3] day
    '(?:[Tt]|[ \\t]+)'                 + // ...
    '([0-9][0-9]?)'                    + // [4] hour
    ':([0-9][0-9])'                    + // [5] minute
    ':([0-9][0-9])'                    + // [6] second
    '(?:\\.([0-9]*))?'                 + // [7] fraction
    '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
    '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }

  function constructYamlTimestamp(data) {
    var match, year, month, day, hour, minute, second, fraction = 0,
        delta = null, tz_hour, tz_minute, date;

    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

    if (match === null) throw new Error('Date resolve error');

    // match: [1] year [2] month [3] day

    year = +(match[1]);
    month = +(match[2]) - 1; // JS month starts with 0
    day = +(match[3]);

    if (!match[4]) { // no hour
      return new Date(Date.UTC(year, month, day));
    }

    // match: [4] hour [5] minute [6] second [7] fraction

    hour = +(match[4]);
    minute = +(match[5]);
    second = +(match[6]);

    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) { // milli-seconds
        fraction += '0';
      }
      fraction = +fraction;
    }

    // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

    if (match[9]) {
      tz_hour = +(match[10]);
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
      if (match[9] === '-') delta = -delta;
    }

    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

    if (delta) date.setTime(date.getTime() - delta);

    return date;
  }

  function representYamlTimestamp(object /*, style*/) {
    return object.toISOString();
  }

  var timestamp = new type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });

  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }

  var merge = new type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });

  /*eslint-disable no-bitwise*/

  var NodeBuffer;

  try {
    // A trick for browserified version, to not include `Buffer` shim
    var _require$1 = commonjsRequire;
    NodeBuffer = _require$1('buffer').Buffer;
  } catch (__) {}




  // [ 64, 65, 66 ] -> [ padding, CR, LF ]
  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


  function resolveYamlBinary(data) {
    if (data === null) return false;

    var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

    // Convert one by one.
    for (idx = 0; idx < max; idx++) {
      code = map.indexOf(data.charAt(idx));

      // Skip CR/LF
      if (code > 64) continue;

      // Fail on illegal characters
      if (code < 0) return false;

      bitlen += 6;
    }

    // If there are any bits left, source was corrupted
    return (bitlen % 8) === 0;
  }

  function constructYamlBinary(data) {
    var idx, tailbits,
        input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
        max = input.length,
        map = BASE64_MAP,
        bits = 0,
        result = [];

    // Collect by 6*4 bits (3 bytes)

    for (idx = 0; idx < max; idx++) {
      if ((idx % 4 === 0) && idx) {
        result.push((bits >> 16) & 0xFF);
        result.push((bits >> 8) & 0xFF);
        result.push(bits & 0xFF);
      }

      bits = (bits << 6) | map.indexOf(input.charAt(idx));
    }

    // Dump tail

    tailbits = (max % 4) * 6;

    if (tailbits === 0) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    } else if (tailbits === 18) {
      result.push((bits >> 10) & 0xFF);
      result.push((bits >> 2) & 0xFF);
    } else if (tailbits === 12) {
      result.push((bits >> 4) & 0xFF);
    }

    // Wrap into Buffer for NodeJS and leave Array for browser
    if (NodeBuffer) {
      // Support node 6.+ Buffer API when available
      return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
    }

    return result;
  }

  function representYamlBinary(object /*, style*/) {
    var result = '', bits = 0, idx, tail,
        max = object.length,
        map = BASE64_MAP;

    // Convert every three bytes to 4 ASCII characters.

    for (idx = 0; idx < max; idx++) {
      if ((idx % 3 === 0) && idx) {
        result += map[(bits >> 18) & 0x3F];
        result += map[(bits >> 12) & 0x3F];
        result += map[(bits >> 6) & 0x3F];
        result += map[bits & 0x3F];
      }

      bits = (bits << 8) + object[idx];
    }

    // Dump tail

    tail = max % 3;

    if (tail === 0) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    } else if (tail === 2) {
      result += map[(bits >> 10) & 0x3F];
      result += map[(bits >> 4) & 0x3F];
      result += map[(bits << 2) & 0x3F];
      result += map[64];
    } else if (tail === 1) {
      result += map[(bits >> 2) & 0x3F];
      result += map[(bits << 4) & 0x3F];
      result += map[64];
      result += map[64];
    }

    return result;
  }

  function isBinary(object) {
    return NodeBuffer && NodeBuffer.isBuffer(object);
  }

  var binary = new type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });

  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2       = Object.prototype.toString;

  function resolveYamlOmap(data) {
    if (data === null) return true;

    var objectKeys = [], index, length, pair, pairKey, pairHasKey,
        object = data;

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;

      if (_toString$2.call(pair) !== '[object Object]') return false;

      for (pairKey in pair) {
        if (_hasOwnProperty$3.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }

      if (!pairHasKey) return false;

      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
      else return false;
    }

    return true;
  }

  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }

  var omap = new type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });

  var _toString$1 = Object.prototype.toString;

  function resolveYamlPairs(data) {
    if (data === null) return true;

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      if (_toString$1.call(pair) !== '[object Object]') return false;

      keys = Object.keys(pair);

      if (keys.length !== 1) return false;

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return true;
  }

  function constructYamlPairs(data) {
    if (data === null) return [];

    var index, length, pair, keys, result,
        object = data;

    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];

      keys = Object.keys(pair);

      result[index] = [ keys[0], pair[keys[0]] ];
    }

    return result;
  }

  var pairs = new type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });

  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function resolveYamlSet(data) {
    if (data === null) return true;

    var key, object = data;

    for (key in object) {
      if (_hasOwnProperty$2.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }

    return true;
  }

  function constructYamlSet(data) {
    return data !== null ? data : {};
  }

  var set = new type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });

  var default_safe = new schema({
    include: [
      core
    ],
    implicit: [
      timestamp,
      merge
    ],
    explicit: [
      binary,
      omap,
      pairs,
      set
    ]
  });

  function resolveJavascriptUndefined() {
    return true;
  }

  function constructJavascriptUndefined() {
    /*eslint-disable no-undefined*/
    return undefined;
  }

  function representJavascriptUndefined() {
    return '';
  }

  function isUndefined(object) {
    return typeof object === 'undefined';
  }

  var _undefined = new type('tag:yaml.org,2002:js/undefined', {
    kind: 'scalar',
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined
  });

  function resolveJavascriptRegExp(data) {
    if (data === null) return false;
    if (data.length === 0) return false;

    var regexp = data,
        tail   = /\/([gim]*)$/.exec(data),
        modifiers = '';

    // if regexp starts with '/' it can have modifiers and must be properly closed
    // `/foo/gim` - modifiers tail can be maximum 3 chars
    if (regexp[0] === '/') {
      if (tail) modifiers = tail[1];

      if (modifiers.length > 3) return false;
      // if expression starts with /, is should be properly terminated
      if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
    }

    return true;
  }

  function constructJavascriptRegExp(data) {
    var regexp = data,
        tail   = /\/([gim]*)$/.exec(data),
        modifiers = '';

    // `/foo/gim` - tail can be maximum 4 chars
    if (regexp[0] === '/') {
      if (tail) modifiers = tail[1];
      regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
    }

    return new RegExp(regexp, modifiers);
  }

  function representJavascriptRegExp(object /*, style*/) {
    var result = '/' + object.source + '/';

    if (object.global) result += 'g';
    if (object.multiline) result += 'm';
    if (object.ignoreCase) result += 'i';

    return result;
  }

  function isRegExp(object) {
    return Object.prototype.toString.call(object) === '[object RegExp]';
  }

  var regexp = new type('tag:yaml.org,2002:js/regexp', {
    kind: 'scalar',
    resolve: resolveJavascriptRegExp,
    construct: constructJavascriptRegExp,
    predicate: isRegExp,
    represent: representJavascriptRegExp
  });

  var esprima;

  // Browserified version does not have esprima
  //
  // 1. For node.js just require module as deps
  // 2. For browser try to require mudule via external AMD system.
  //    If not found - try to fallback to window.esprima. If not
  //    found too - then fail to parse.
  //
  try {
    // workaround to exclude package from browserify list.
    var _require = commonjsRequire;
    esprima = _require('esprima');
  } catch (_) {
    /* eslint-disable no-redeclare */
    /* global window */
    if (typeof window !== 'undefined') esprima = window.esprima;
  }



  function resolveJavascriptFunction(data) {
    if (data === null) return false;

    try {
      var source = '(' + data + ')',
          ast    = esprima.parse(source, { range: true });

      if (ast.type                    !== 'Program'             ||
          ast.body.length             !== 1                     ||
          ast.body[0].type            !== 'ExpressionStatement' ||
          (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
            ast.body[0].expression.type !== 'FunctionExpression')) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  function constructJavascriptFunction(data) {
    /*jslint evil:true*/

    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true }),
        params = [],
        body;

    if (ast.type                    !== 'Program'             ||
        ast.body.length             !== 1                     ||
        ast.body[0].type            !== 'ExpressionStatement' ||
        (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
          ast.body[0].expression.type !== 'FunctionExpression')) {
      throw new Error('Failed to resolve function');
    }

    ast.body[0].expression.params.forEach(function (param) {
      params.push(param.name);
    });

    body = ast.body[0].expression.body.range;

    // Esprima's ranges include the first '{' and the last '}' characters on
    // function expressions. So cut them out.
    if (ast.body[0].expression.body.type === 'BlockStatement') {
      /*eslint-disable no-new-func*/
      return new Function(params, source.slice(body[0] + 1, body[1] - 1));
    }
    // ES6 arrow functions can omit the BlockStatement. In that case, just return
    // the body.
    /*eslint-disable no-new-func*/
    return new Function(params, 'return ' + source.slice(body[0], body[1]));
  }

  function representJavascriptFunction(object /*, style*/) {
    return object.toString();
  }

  function isFunction(object) {
    return Object.prototype.toString.call(object) === '[object Function]';
  }

  var _function = new type('tag:yaml.org,2002:js/function', {
    kind: 'scalar',
    resolve: resolveJavascriptFunction,
    construct: constructJavascriptFunction,
    predicate: isFunction,
    represent: representJavascriptFunction
  });

  var default_full = schema.DEFAULT = new schema({
    include: [
      default_safe
    ],
    explicit: [
      _undefined,
      regexp,
      _function
    ]
  });

  /*eslint-disable max-len,no-use-before-define*/








  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


  var CONTEXT_FLOW_IN   = 1;
  var CONTEXT_FLOW_OUT  = 2;
  var CONTEXT_BLOCK_IN  = 3;
  var CONTEXT_BLOCK_OUT = 4;


  var CHOMPING_CLIP  = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP  = 3;


  var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


  function _class(obj) { return Object.prototype.toString.call(obj); }

  function is_EOL(c) {
    return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
  }

  function is_WHITE_SPACE(c) {
    return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
  }

  function is_WS_OR_EOL(c) {
    return (c === 0x09/* Tab */) ||
           (c === 0x20/* Space */) ||
           (c === 0x0A/* LF */) ||
           (c === 0x0D/* CR */);
  }

  function is_FLOW_INDICATOR(c) {
    return c === 0x2C/* , */ ||
           c === 0x5B/* [ */ ||
           c === 0x5D/* ] */ ||
           c === 0x7B/* { */ ||
           c === 0x7D/* } */;
  }

  function fromHexCode(c) {
    var lc;

    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    /*eslint-disable no-bitwise*/
    lc = c | 0x20;

    if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
      return lc - 0x61 + 10;
    }

    return -1;
  }

  function escapedHexLen(c) {
    if (c === 0x78/* x */) { return 2; }
    if (c === 0x75/* u */) { return 4; }
    if (c === 0x55/* U */) { return 8; }
    return 0;
  }

  function fromDecimalCode(c) {
    if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
      return c - 0x30;
    }

    return -1;
  }

  function simpleEscapeSequence(c) {
    /* eslint-disable indent */
    return (c === 0x30/* 0 */) ? '\x00' :
          (c === 0x61/* a */) ? '\x07' :
          (c === 0x62/* b */) ? '\x08' :
          (c === 0x74/* t */) ? '\x09' :
          (c === 0x09/* Tab */) ? '\x09' :
          (c === 0x6E/* n */) ? '\x0A' :
          (c === 0x76/* v */) ? '\x0B' :
          (c === 0x66/* f */) ? '\x0C' :
          (c === 0x72/* r */) ? '\x0D' :
          (c === 0x65/* e */) ? '\x1B' :
          (c === 0x20/* Space */) ? ' ' :
          (c === 0x22/* " */) ? '\x22' :
          (c === 0x2F/* / */) ? '/' :
          (c === 0x5C/* \ */) ? '\x5C' :
          (c === 0x4E/* N */) ? '\x85' :
          (c === 0x5F/* _ */) ? '\xA0' :
          (c === 0x4C/* L */) ? '\u2028' :
          (c === 0x50/* P */) ? '\u2029' : '';
  }

  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    }
    // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
    return String.fromCharCode(
      ((c - 0x010000) >> 10) + 0xD800,
      ((c - 0x010000) & 0x03FF) + 0xDC00
    );
  }

  var simpleEscapeCheck = new Array(256); // integer, for fast access
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }


  function State$1(input, options) {
    this.input = input;

    this.filename  = options['filename']  || null;
    this.schema    = options['schema']    || default_full;
    this.onWarning = options['onWarning'] || null;
    this.legacy    = options['legacy']    || false;
    this.json      = options['json']      || false;
    this.listener  = options['listener']  || null;

    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap       = this.schema.compiledTypeMap;

    this.length     = input.length;
    this.position   = 0;
    this.line       = 0;
    this.lineStart  = 0;
    this.lineIndent = 0;

    this.documents = [];

    /*
    this.version;
    this.checkLineBreaks;
    this.tagMap;
    this.anchorMap;
    this.tag;
    this.anchor;
    this.kind;
    this.result;*/

  }


  function generateError(state, message) {
    return new exception(
      message,
      new mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
  }

  function throwError(state, message) {
    throw generateError(state, message);
  }

  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }


  var directiveHandlers = {

    YAML: function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

    TAG: function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty$1.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      state.tagMap[handle] = prefix;
    }
  };


  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;

    if (start < end) {
      _result = state.input.slice(start, end);

      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 0x09 ||
                (0x20 <= _character && _character <= 0x10FFFF))) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }

      state.result += _result;
    }
  }

  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;

    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }

    sourceKeys = Object.keys(source);

    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];

      if (!_hasOwnProperty$1.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }

  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    var index, quantity;

    // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);

      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, 'nested arrays are not supported inside keys');
        }

        if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
          keyNode[index] = '[object Object]';
        }
      }
    }

    // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)
    if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
      keyNode = '[object Object]';
    }


    keyNode = String(keyNode);

    if (_result === null) {
      _result = {};
    }

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json &&
          !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
          _hasOwnProperty$1.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      }
      _result[keyNode] = valueNode;
      delete overridableKeys[keyNode];
    }

    return _result;
  }

  function readLineBreak(state) {
    var ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x0A/* LF */) {
      state.position++;
    } else if (ch === 0x0D/* CR */) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
        state.position++;
      }
    } else {
      throwError(state, 'a line break is expected');
    }

    state.line += 1;
    state.lineStart = state.position;
  }

  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (allowComments && ch === 0x23/* # */) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
      }

      if (is_EOL(ch)) {
        readLineBreak(state);

        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;

        while (ch === 0x20/* Space */) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }

    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }

    return lineBreaks;
  }

  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;

    ch = state.input.charCodeAt(_position);

    // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.
    if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
        ch === state.input.charCodeAt(_position + 1) &&
        ch === state.input.charCodeAt(_position + 2)) {

      _position += 3;

      ch = state.input.charCodeAt(_position);

      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }

    return false;
  }

  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }


  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (is_WS_OR_EOL(ch)      ||
        is_FLOW_INDICATOR(ch) ||
        ch === 0x23/* # */    ||
        ch === 0x26/* & */    ||
        ch === 0x2A/* * */    ||
        ch === 0x21/* ! */    ||
        ch === 0x7C/* | */    ||
        ch === 0x3E/* > */    ||
        ch === 0x27/* ' */    ||
        ch === 0x22/* " */    ||
        ch === 0x25/* % */    ||
        ch === 0x40/* @ */    ||
        ch === 0x60/* ` */) {
      return false;
    }

    if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }

    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;

    while (ch !== 0) {
      if (ch === 0x3A/* : */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) ||
            withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }

      } else if (ch === 0x23/* # */) {
        preceding = state.input.charCodeAt(state.position - 1);

        if (is_WS_OR_EOL(preceding)) {
          break;
        }

      } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
                 withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;

      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);

        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }

      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }

      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, captureEnd, false);

    if (state.result) {
      return true;
    }

    state.kind = _kind;
    state.result = _result;
    return false;
  }

  function readSingleQuotedScalar(state, nodeIndent) {
    var ch,
        captureStart, captureEnd;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x27/* ' */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27/* ' */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x27/* ' */) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }

  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart,
        captureEnd,
        hexLength,
        hexResult,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x22/* " */) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22/* " */) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;

      } else if (ch === 0x5C/* \ */) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);

          // TODO: rework to inline fn with no type cast?
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;

        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;

          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);

            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;

            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }

          state.result += charFromCodepoint(hexResult);

          state.position++;

        } else {
          throwError(state, 'unknown escape sequence');
        }

        captureStart = captureEnd = state.position;

      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;

      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');

      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }

  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _tag     = state.tag,
        _result,
        _anchor  = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = {},
        keyNode,
        keyTag,
        valueNode,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x5B/* [ */) {
      terminator = 0x5D;/* ] */
      isMapping = false;
      _result = [];
    } else if (ch === 0x7B/* { */) {
      terminator = 0x7D;/* } */
      isMapping = true;
      _result = {};
    } else {
      return false;
    }

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(++state.position);

    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      }

      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;

      if (ch === 0x3F/* ? */) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }

      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
      } else {
        _result.push(keyNode);
      }

      skipSeparationSpace(state, true, nodeIndent);

      ch = state.input.charCodeAt(state.position);

      if (ch === 0x2C/* , */) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }

    throwError(state, 'unexpected end of the stream within a flow collection');
  }

  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping       = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent     = nodeIndent,
        emptyLines     = 0,
        atMoreIndented = false,
        tmp,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x7C/* | */) {
      folding = false;
    } else if (ch === 0x3E/* > */) {
      folding = true;
    } else {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';

    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
        if (CHOMPING_CLIP === chomping) {
          chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }

      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }

      } else {
        break;
      }
    }

    if (is_WHITE_SPACE(ch)) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (is_WHITE_SPACE(ch));

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (!is_EOL(ch) && (ch !== 0));
      }
    }

    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;

      ch = state.input.charCodeAt(state.position);

      while ((!detectedIndent || state.lineIndent < textIndent) &&
             (ch === 0x20/* Space */)) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }

      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }

      // End of the scalar.
      if (state.lineIndent < textIndent) {

        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) { // i.e. only if the scalar is not empty.
            state.result += '\n';
          }
        }

        // Break this `while` cycle and go to the funciton's epilogue.
        break;
      }

      // Folded style: use fancy rules to handle line breaks.
      if (folding) {

        // Lines starting with white space characters (more-indented lines) are not folded.
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          // except for the first content line (cf. Example 8.1)
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

        // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1);

        // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) { // i.e. only if we have already read some scalar content.
            state.result += ' ';
          }

        // Several line breaks - perceive as different lines.
        } else {
          state.result += common.repeat('\n', emptyLines);
        }

      // Literal style: just add exact number of line breaks between content lines.
      } else {
        // Keep all line breaks except the header line break.
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }

      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;

      while (!is_EOL(ch) && (ch !== 0)) {
        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, state.position, false);
    }

    return true;
  }

  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag      = state.tag,
        _anchor   = state.anchor,
        _result   = [],
        following,
        detected  = false,
        ch;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {

      if (ch !== 0x2D/* - */) {
        break;
      }

      following = state.input.charCodeAt(state.position + 1);

      if (!is_WS_OR_EOL(following)) {
        break;
      }

      detected = true;
      state.position++;

      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }
    return false;
  }

  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _pos,
        _tag          = state.tag,
        _anchor       = state.anchor,
        _result       = {},
        overridableKeys = {},
        keyTag        = null,
        keyNode       = null,
        valueNode     = null,
        atExplicitKey = false,
        detected      = false,
        ch;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      following = state.input.charCodeAt(state.position + 1);
      _line = state.line; // Save the current line.
      _pos = state.position;

      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //
      if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

        if (ch === 0x3F/* ? */) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = true;
          allowCompact = true;

        } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;

        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
        }

        state.position += 1;
        ch = following;

      //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
      } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);

          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x3A/* : */) {
            ch = state.input.charCodeAt(++state.position);

            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }

            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;

          } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');

          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }

        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else {
        break; // Reading is done. Go to the epilogue.
      }

      //
      // Common reading code for both explicit and implicit notations.
      //
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }

        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
          keyTag = keyNode = valueNode = null;
        }

        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }

      if (state.lineIndent > nodeIndent && (ch !== 0)) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    //
    // Epilogue.
    //

    // Special case: last mapping's node contains only the key in explicit notation.
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
    }

    // Expose the resulting mapping.
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }

    return detected;
  }

  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed    = false,
        tagHandle,
        tagName,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x21/* ! */) return false;

    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }

    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x3C/* < */) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);

    } else if (ch === 0x21/* ! */) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);

    } else {
      tagHandle = '!';
    }

    _position = state.position;

    if (isVerbatim) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (ch !== 0 && ch !== 0x3E/* > */);

      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {

        if (ch === 0x21/* ! */) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);

            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }

            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }

        ch = state.input.charCodeAt(++state.position);
      }

      tagName = state.input.slice(_position, state.position);

      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }

    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }

    if (isVerbatim) {
      state.tag = tagName;

    } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;

    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;

    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;

    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }

    return true;
  }

  function readAnchorProperty(state) {
    var _position,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x26/* & */) return false;

    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }

    state.anchor = state.input.slice(_position, state.position);
    return true;
  }

  function readAlias(state) {
    var _position, alias,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x2A/* * */) return false;

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }

    alias = state.input.slice(_position, state.position);

    if (!state.anchorMap.hasOwnProperty(alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }

    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }

  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
        atNewLine  = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        type,
        flowIndent,
        blockIndent;

    if (state.listener !== null) {
      state.listener('open', state);
    }

    state.tag    = null;
    state.anchor = null;
    state.kind   = null;
    state.result = null;

    allowBlockStyles = allowBlockScalars = allowBlockCollections =
      CONTEXT_BLOCK_OUT === nodeContext ||
      CONTEXT_BLOCK_IN  === nodeContext;

    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }

    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }

    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }

    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }

      blockIndent = state.position - state.lineStart;

      if (indentStatus === 1) {
        if (allowBlockCollections &&
            (readBlockSequence(state, blockIndent) ||
             readBlockMapping(state, blockIndent, flowIndent)) ||
            readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
              readSingleQuotedScalar(state, flowIndent) ||
              readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;

          } else if (readAlias(state)) {
            hasContent = true;

            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }

          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;

            if (state.tag === null) {
              state.tag = '?';
            }
          }

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }

    if (state.tag !== null && state.tag !== '!') {
      if (state.tag === '?') {
        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only automatically assigned to plain scalars.
        //
        // We only need to check kind conformity in case user explicitly assigns '?'
        // tag, for example like this: "!<?> [0]"
        //
        if (state.result !== null && state.kind !== 'scalar') {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }

        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state.implicitTypes[typeIndex];

          if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
            state.result = type.construct(state.result);
            state.tag = type.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];

        if (state.result !== null && type.kind !== state.kind) {
          throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
        }

        if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
          throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
        } else {
          state.result = type.construct(state.result);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }
    }

    if (state.listener !== null) {
      state.listener('close', state);
    }
    return state.tag !== null ||  state.anchor !== null || hasContent;
  }

  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;

    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);

      ch = state.input.charCodeAt(state.position);

      if (state.lineIndent > 0 || ch !== 0x25/* % */) {
        break;
      }

      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];

      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x23/* # */) {
          do { ch = state.input.charCodeAt(++state.position); }
          while (ch !== 0 && !is_EOL(ch));
          break;
        }

        if (is_EOL(ch)) break;

        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveArgs.push(state.input.slice(_position, state.position));
      }

      if (ch !== 0) readLineBreak(state);

      if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }

    skipSeparationSpace(state, true, -1);

    if (state.lineIndent === 0 &&
        state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
        state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);

    } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }

    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);

    if (state.checkLineBreaks &&
        PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }

    state.documents.push(state.result);

    if (state.position === state.lineStart && testDocumentSeparator(state)) {

      if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }

    if (state.position < (state.length - 1)) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }


  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};

    if (input.length !== 0) {

      // Add tailing `\n` if not exists
      if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
          input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
        input += '\n';
      }

      // Strip BOM
      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }

    var state = new State$1(input, options);

    var nullpos = input.indexOf('\0');

    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, 'null byte is not allowed in input');
    }

    // Use 0 as string terminator. That significantly simplifies bounds check.
    state.input += '\0';

    while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
      state.lineIndent += 1;
      state.position += 1;
    }

    while (state.position < (state.length - 1)) {
      readDocument(state);
    }

    return state.documents;
  }


  function loadAll$1(input, iterator, options) {
    if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    var documents = loadDocuments(input, options);

    if (typeof iterator !== 'function') {
      return documents;
    }

    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }


  function load$1(input, options) {
    var documents = loadDocuments(input, options);

    if (documents.length === 0) {
      /*eslint-disable no-undefined*/
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new exception('expected a single document in the stream, but found more');
  }


  function safeLoadAll$1(input, iterator, options) {
    if (typeof iterator === 'object' && iterator !== null && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    return loadAll$1(input, iterator, common.extend({ schema: default_safe }, options));
  }


  function safeLoad$1(input, options) {
    return load$1(input, common.extend({ schema: default_safe }, options));
  }


  var loadAll_1     = loadAll$1;
  var load_1        = load$1;
  var safeLoadAll_1 = safeLoadAll$1;
  var safeLoad_1    = safeLoad$1;

  var loader = {
  	loadAll: loadAll_1,
  	load: load_1,
  	safeLoadAll: safeLoadAll_1,
  	safeLoad: safeLoad_1
  };

  /*eslint-disable no-use-before-define*/






  var _toString       = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  var CHAR_TAB                  = 0x09; /* Tab */
  var CHAR_LINE_FEED            = 0x0A; /* LF */
  var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
  var CHAR_SPACE                = 0x20; /* Space */
  var CHAR_EXCLAMATION          = 0x21; /* ! */
  var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
  var CHAR_SHARP                = 0x23; /* # */
  var CHAR_PERCENT              = 0x25; /* % */
  var CHAR_AMPERSAND            = 0x26; /* & */
  var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
  var CHAR_ASTERISK             = 0x2A; /* * */
  var CHAR_COMMA                = 0x2C; /* , */
  var CHAR_MINUS                = 0x2D; /* - */
  var CHAR_COLON                = 0x3A; /* : */
  var CHAR_EQUALS               = 0x3D; /* = */
  var CHAR_GREATER_THAN         = 0x3E; /* > */
  var CHAR_QUESTION             = 0x3F; /* ? */
  var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
  var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
  var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
  var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
  var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
  var CHAR_VERTICAL_LINE        = 0x7C; /* | */
  var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

  var ESCAPE_SEQUENCES = {};

  ESCAPE_SEQUENCES[0x00]   = '\\0';
  ESCAPE_SEQUENCES[0x07]   = '\\a';
  ESCAPE_SEQUENCES[0x08]   = '\\b';
  ESCAPE_SEQUENCES[0x09]   = '\\t';
  ESCAPE_SEQUENCES[0x0A]   = '\\n';
  ESCAPE_SEQUENCES[0x0B]   = '\\v';
  ESCAPE_SEQUENCES[0x0C]   = '\\f';
  ESCAPE_SEQUENCES[0x0D]   = '\\r';
  ESCAPE_SEQUENCES[0x1B]   = '\\e';
  ESCAPE_SEQUENCES[0x22]   = '\\"';
  ESCAPE_SEQUENCES[0x5C]   = '\\\\';
  ESCAPE_SEQUENCES[0x85]   = '\\N';
  ESCAPE_SEQUENCES[0xA0]   = '\\_';
  ESCAPE_SEQUENCES[0x2028] = '\\L';
  ESCAPE_SEQUENCES[0x2029] = '\\P';

  var DEPRECATED_BOOLEANS_SYNTAX = [
    'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
    'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
  ];

  function compileStyleMap(schema, map) {
    var result, keys, index, length, tag, style, type;

    if (map === null) return {};

    result = {};
    keys = Object.keys(map);

    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map[tag]);

      if (tag.slice(0, 2) === '!!') {
        tag = 'tag:yaml.org,2002:' + tag.slice(2);
      }
      type = schema.compiledTypeMap['fallback'][tag];

      if (type && _hasOwnProperty.call(type.styleAliases, style)) {
        style = type.styleAliases[style];
      }

      result[tag] = style;
    }

    return result;
  }

  function encodeHex(character) {
    var string, handle, length;

    string = character.toString(16).toUpperCase();

    if (character <= 0xFF) {
      handle = 'x';
      length = 2;
    } else if (character <= 0xFFFF) {
      handle = 'u';
      length = 4;
    } else if (character <= 0xFFFFFFFF) {
      handle = 'U';
      length = 8;
    } else {
      throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
    }

    return '\\' + handle + common.repeat('0', length - string.length) + string;
  }

  function State(options) {
    this.schema        = options['schema'] || default_full;
    this.indent        = Math.max(1, (options['indent'] || 2));
    this.noArrayIndent = options['noArrayIndent'] || false;
    this.skipInvalid   = options['skipInvalid'] || false;
    this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
    this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
    this.sortKeys      = options['sortKeys'] || false;
    this.lineWidth     = options['lineWidth'] || 80;
    this.noRefs        = options['noRefs'] || false;
    this.noCompatMode  = options['noCompatMode'] || false;
    this.condenseFlow  = options['condenseFlow'] || false;

    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;

    this.tag = null;
    this.result = '';

    this.duplicates = [];
    this.usedDuplicates = null;
  }

  // Indents every line in a string. Empty lines (\n only) are not indented.
  function indentString(string, spaces) {
    var ind = common.repeat(' ', spaces),
        position = 0,
        next = -1,
        result = '',
        line,
        length = string.length;

    while (position < length) {
      next = string.indexOf('\n', position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }

      if (line.length && line !== '\n') result += ind;

      result += line;
    }

    return result;
  }

  function generateNextLine(state, level) {
    return '\n' + common.repeat(' ', state.indent * level);
  }

  function testImplicitResolving(state, str) {
    var index, length, type;

    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type = state.implicitTypes[index];

      if (type.resolve(str)) {
        return true;
      }
    }

    return false;
  }

  // [33] s-white ::= s-space | s-tab
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }

  // Returns true if the character can be printed without escaping.
  // From YAML 1.2: "any allowed characters known to be non-printable
  // should also be escaped. [However,] This isn’t mandatory"
  // Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
  function isPrintable(c) {
    return  (0x00020 <= c && c <= 0x00007E)
        || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
        || ((0x0E000 <= c && c <= 0x00FFFD) && c !== 0xFEFF /* BOM */)
        ||  (0x10000 <= c && c <= 0x10FFFF);
  }

  // [34] ns-char ::= nb-char - s-white
  // [27] nb-char ::= c-printable - b-char - c-byte-order-mark
  // [26] b-char  ::= b-line-feed | b-carriage-return
  // [24] b-line-feed       ::=     #xA    /* LF */
  // [25] b-carriage-return ::=     #xD    /* CR */
  // [3]  c-byte-order-mark ::=     #xFEFF
  function isNsChar(c) {
    return isPrintable(c) && !isWhitespace(c)
      // byte-order-mark
      && c !== 0xFEFF
      // b-char
      && c !== CHAR_CARRIAGE_RETURN
      && c !== CHAR_LINE_FEED;
  }

  // Simplified test for values allowed after the first character in plain style.
  function isPlainSafe(c, prev) {
    // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
    // where nb-char ::= c-printable - b-char - c-byte-order-mark.
    return isPrintable(c) && c !== 0xFEFF
      // - c-flow-indicator
      && c !== CHAR_COMMA
      && c !== CHAR_LEFT_SQUARE_BRACKET
      && c !== CHAR_RIGHT_SQUARE_BRACKET
      && c !== CHAR_LEFT_CURLY_BRACKET
      && c !== CHAR_RIGHT_CURLY_BRACKET
      // - ":" - "#"
      // /* An ns-char preceding */ "#"
      && c !== CHAR_COLON
      && ((c !== CHAR_SHARP) || (prev && isNsChar(prev)));
  }

  // Simplified test for values allowed as the first character in plain style.
  function isPlainSafeFirst(c) {
    // Uses a subset of ns-char - c-indicator
    // where ns-char = nb-char - s-white.
    return isPrintable(c) && c !== 0xFEFF
      && !isWhitespace(c) // - s-white
      // - (c-indicator ::=
      // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
      && c !== CHAR_MINUS
      && c !== CHAR_QUESTION
      && c !== CHAR_COLON
      && c !== CHAR_COMMA
      && c !== CHAR_LEFT_SQUARE_BRACKET
      && c !== CHAR_RIGHT_SQUARE_BRACKET
      && c !== CHAR_LEFT_CURLY_BRACKET
      && c !== CHAR_RIGHT_CURLY_BRACKET
      // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
      && c !== CHAR_SHARP
      && c !== CHAR_AMPERSAND
      && c !== CHAR_ASTERISK
      && c !== CHAR_EXCLAMATION
      && c !== CHAR_VERTICAL_LINE
      && c !== CHAR_EQUALS
      && c !== CHAR_GREATER_THAN
      && c !== CHAR_SINGLE_QUOTE
      && c !== CHAR_DOUBLE_QUOTE
      // | “%” | “@” | “`”)
      && c !== CHAR_PERCENT
      && c !== CHAR_COMMERCIAL_AT
      && c !== CHAR_GRAVE_ACCENT;
  }

  // Determines whether block indentation indicator is required.
  function needIndentIndicator(string) {
    var leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }

  var STYLE_PLAIN   = 1,
      STYLE_SINGLE  = 2,
      STYLE_LITERAL = 3,
      STYLE_FOLDED  = 4,
      STYLE_DOUBLE  = 5;

  // Determines which scalar styles are possible and returns the preferred style.
  // lineWidth = -1 => no limit.
  // Pre-conditions: str.length > 0.
  // Post-conditions:
  //    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
  //    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
  //    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    var i;
    var char, prev_char;
    var hasLineBreak = false;
    var hasFoldableLine = false; // only checked if shouldTrackWidth
    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1; // count the first line correctly
    var plain = isPlainSafeFirst(string.charCodeAt(0))
            && !isWhitespace(string.charCodeAt(string.length - 1));

    if (singleLineOnly) {
      // Case: no block styles.
      // Check for disallowed characters to rule out plain and single.
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
    } else {
      // Case: block styles permitted.
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          // Check if any line can be folded.
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine ||
              // Foldable line = too long, and not more-indented.
              (i - previousLineBreak - 1 > lineWidth &&
               string[previousLineBreak + 1] !== ' ');
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
        plain = plain && isPlainSafe(char, prev_char);
      }
      // in case the end is missing a \n
      hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
        (i - previousLineBreak - 1 > lineWidth &&
         string[previousLineBreak + 1] !== ' '));
    }
    // Although every style can represent \n without escaping, prefer block styles
    // for multiline, since they're more readable and they don't add empty lines.
    // Also prefer folding a super-long line.
    if (!hasLineBreak && !hasFoldableLine) {
      // Strings interpretable as another type have to be quoted;
      // e.g. the string 'true' vs. the boolean true.
      return plain && !testAmbiguousType(string)
        ? STYLE_PLAIN : STYLE_SINGLE;
    }
    // Edge case: block indentation indicator can only have one digit.
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    // At this point we know block styles are valid.
    // Prefer literal style unless we want to fold.
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }

  // Note: line breaking/folding is implemented for only the folded style.
  // NB. We drop the last trailing newline (if any) of a returned block scalar
  //  since the dumper adds its own newline. This always works:
  //    • No ending newline => unaffected; already using strip "-" chomping.
  //    • Ending newline    => removed then restored.
  //  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
  function writeScalar(state, string, level, iskey) {
    state.dump = (function () {
      if (string.length === 0) {
        return "''";
      }
      if (!state.noCompatMode &&
          DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
        return "'" + string + "'";
      }

      var indent = state.indent * Math.max(1, level); // no 0-indent scalars
      // As indentation gets deeper, let the width decrease monotonically
      // to the lower bound min(state.lineWidth, 40).
      // Note that this implies
      //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
      //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
      // This behaves better than a constant minimum width which disallows narrower options,
      // or an indent threshold which causes the width to suddenly increase.
      var lineWidth = state.lineWidth === -1
        ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

      // Without knowing if keys are implicit/explicit, assume implicit for safety.
      var singleLineOnly = iskey
        // No block styles in flow mode.
        || (state.flowLevel > -1 && level >= state.flowLevel);
      function testAmbiguity(string) {
        return testImplicitResolving(state, string);
      }

      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return '|' + blockHeader(string, state.indent)
            + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return '>' + blockHeader(string, state.indent)
            + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new exception('impossible error: invalid scalar style');
      }
    }());
  }

  // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
  function blockHeader(string, indentPerLevel) {
    var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

    // note the special case: the string '\n' counts as a "trailing" empty line.
    var clip =          string[string.length - 1] === '\n';
    var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
    var chomp = keep ? '+' : (clip ? '' : '-');

    return indentIndicator + chomp + '\n';
  }

  // (See the note for writeScalar.)
  function dropEndingNewline(string) {
    return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
  }

  // Note: a long line without a suitable break point will exceed the width limit.
  // Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
  function foldString(string, width) {
    // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
    // unless they're before or after a more-indented line, or at the very
    // beginning or end, in which case $k$ maps to $k$.
    // Therefore, parse each chunk as newline(s) followed by a content line.
    var lineRe = /(\n+)([^\n]*)/g;

    // first line (possibly an empty line)
    var result = (function () {
      var nextLF = string.indexOf('\n');
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    }());
    // If we haven't reached the first content line yet, don't add an extra \n.
    var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
    var moreIndented;

    // rest of the lines
    var match;
    while ((match = lineRe.exec(string))) {
      var prefix = match[1], line = match[2];
      moreIndented = (line[0] === ' ');
      result += prefix
        + (!prevMoreIndented && !moreIndented && line !== ''
          ? '\n' : '')
        + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }

    return result;
  }

  // Greedy line breaking.
  // Picks the longest line under the limit each time,
  // otherwise settles for the shortest line over the limit.
  // NB. More-indented lines *cannot* be folded, as that would add an extra \n.
  function foldLine(line, width) {
    if (line === '' || line[0] === ' ') return line;

    // Since a more-indented line adds a \n, breaks can't be followed by a space.
    var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
    var match;
    // start is an inclusive index. end, curr, and next are exclusive.
    var start = 0, end, curr = 0, next = 0;
    var result = '';

    // Invariants: 0 <= start <= length-1.
    //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
    // Inside the loop:
    //   A match implies length >= 2, so curr and next are <= length-2.
    while ((match = breakRe.exec(line))) {
      next = match.index;
      // maintain invariant: curr - start <= width
      if (next - start > width) {
        end = (curr > start) ? curr : next; // derive end <= length-2
        result += '\n' + line.slice(start, end);
        // skip the space that was output as \n
        start = end + 1;                    // derive start <= length-1
      }
      curr = next;
    }

    // By the invariants, start <= length-1, so there is something left over.
    // It is either the whole string or a part starting from non-whitespace.
    result += '\n';
    // Insert a break if the remainder is too long and there is a break available.
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }

    return result.slice(1); // drop extra \n joiner
  }

  // Escapes a double-quoted string.
  function escapeString(string) {
    var result = '';
    var char, nextChar;
    var escapeSeq;

    for (var i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
      if (char >= 0xD800 && char <= 0xDBFF/* high surrogate */) {
        nextChar = string.charCodeAt(i + 1);
        if (nextChar >= 0xDC00 && nextChar <= 0xDFFF/* low surrogate */) {
          // Combine the surrogate pair and store it escaped.
          result += encodeHex((char - 0xD800) * 0x400 + nextChar - 0xDC00 + 0x10000);
          // Advance index one extra since we already used that char here.
          i++; continue;
        }
      }
      escapeSeq = ESCAPE_SEQUENCES[char];
      result += !escapeSeq && isPrintable(char)
        ? string[i]
        : escapeSeq || encodeHex(char);
    }

    return result;
  }

  function writeFlowSequence(state, level, object) {
    var _result = '',
        _tag    = state.tag,
        index,
        length;

    for (index = 0, length = object.length; index < length; index += 1) {
      // Write only valid elements.
      if (writeNode(state, level, object[index], false, false)) {
        if (index !== 0) _result += ',' + (!state.condenseFlow ? ' ' : '');
        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = '[' + _result + ']';
  }

  function writeBlockSequence(state, level, object, compact) {
    var _result = '',
        _tag    = state.tag,
        index,
        length;

    for (index = 0, length = object.length; index < length; index += 1) {
      // Write only valid elements.
      if (writeNode(state, level + 1, object[index], true, true)) {
        if (!compact || index !== 0) {
          _result += generateNextLine(state, level);
        }

        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += '-';
        } else {
          _result += '- ';
        }

        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = _result || '[]'; // Empty sequence if no valid values.
  }

  function writeFlowMapping(state, level, object) {
    var _result       = '',
        _tag          = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        pairBuffer;

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {

      pairBuffer = '';
      if (index !== 0) pairBuffer += ', ';

      if (state.condenseFlow) pairBuffer += '"';

      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (!writeNode(state, level, objectKey, false, false)) {
        continue; // Skip this pair because of invalid key;
      }

      if (state.dump.length > 1024) pairBuffer += '? ';

      pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

      if (!writeNode(state, level, objectValue, false, false)) {
        continue; // Skip this pair because of invalid value.
      }

      pairBuffer += state.dump;

      // Both key and value are valid.
      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = '{' + _result + '}';
  }

  function writeBlockMapping(state, level, object, compact) {
    var _result       = '',
        _tag          = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        explicitPair,
        pairBuffer;

    // Allow sorting keys so that the output file is deterministic
    if (state.sortKeys === true) {
      // Default sorting
      objectKeyList.sort();
    } else if (typeof state.sortKeys === 'function') {
      // Custom sort function
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      // Something is wrong
      throw new exception('sortKeys must be a boolean or a function');
    }

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';

      if (!compact || index !== 0) {
        pairBuffer += generateNextLine(state, level);
      }

      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue; // Skip this pair because of invalid key.
      }

      explicitPair = (state.tag !== null && state.tag !== '?') ||
                     (state.dump && state.dump.length > 1024);

      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += '?';
        } else {
          pairBuffer += '? ';
        }
      }

      pairBuffer += state.dump;

      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }

      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue; // Skip this pair because of invalid value.
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ':';
      } else {
        pairBuffer += ': ';
      }

      pairBuffer += state.dump;

      // Both key and value are valid.
      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = _result || '{}'; // Empty mapping if no valid pairs.
  }

  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type, style;

    typeList = explicit ? state.explicitTypes : state.implicitTypes;

    for (index = 0, length = typeList.length; index < length; index += 1) {
      type = typeList[index];

      if ((type.instanceOf  || type.predicate) &&
          (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
          (!type.predicate  || type.predicate(object))) {

        state.tag = explicit ? type.tag : '?';

        if (type.represent) {
          style = state.styleMap[type.tag] || type.defaultStyle;

          if (_toString.call(type.represent) === '[object Function]') {
            _result = type.represent(object, style);
          } else if (_hasOwnProperty.call(type.represent, style)) {
            _result = type.represent[style](object, style);
          } else {
            throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
          }

          state.dump = _result;
        }

        return true;
      }
    }

    return false;
  }

  // Serializes `object` and writes it to global `result`.
  // Returns true on success, or false on invalid object.
  //
  function writeNode(state, level, object, block, compact, iskey) {
    state.tag = null;
    state.dump = object;

    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }

    var type = _toString.call(state.dump);

    if (block) {
      block = (state.flowLevel < 0 || state.flowLevel > level);
    }

    var objectOrArray = type === '[object Object]' || type === '[object Array]',
        duplicateIndex,
        duplicate;

    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }

    if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
      compact = false;
    }

    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = '*ref_' + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type === '[object Object]') {
        if (block && (Object.keys(state.dump).length !== 0)) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object Array]') {
        var arrayLevel = (state.noArrayIndent && (level > 0)) ? level - 1 : level;
        if (block && (state.dump.length !== 0)) {
          writeBlockSequence(state, arrayLevel, state.dump, compact);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, arrayLevel, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object String]') {
        if (state.tag !== '?') {
          writeScalar(state, state.dump, level, iskey);
        }
      } else {
        if (state.skipInvalid) return false;
        throw new exception('unacceptable kind of an object to dump ' + type);
      }

      if (state.tag !== null && state.tag !== '?') {
        state.dump = '!<' + state.tag + '> ' + state.dump;
      }
    }

    return true;
  }

  function getDuplicateReferences(object, state) {
    var objects = [],
        duplicatesIndexes = [],
        index,
        length;

    inspectNode(object, objects, duplicatesIndexes);

    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }

  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList,
        index,
        length;

    if (object !== null && typeof object === 'object') {
      index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);

        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);

          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }

  function dump$1(input, options) {
    options = options || {};

    var state = new State(options);

    if (!state.noRefs) getDuplicateReferences(input, state);

    if (writeNode(state, 0, input, true, true)) return state.dump + '\n';

    return '';
  }

  function safeDump$1(input, options) {
    return dump$1(input, common.extend({ schema: default_safe }, options));
  }

  var dump_1     = dump$1;
  var safeDump_1 = safeDump$1;

  var dumper = {
  	dump: dump_1,
  	safeDump: safeDump_1
  };

  function deprecated(name) {
    return function () {
      throw new Error('Function ' + name + ' is deprecated and cannot be used.');
    };
  }


  var Type                = type;
  var Schema              = schema;
  var FAILSAFE_SCHEMA     = failsafe;
  var JSON_SCHEMA         = json;
  var CORE_SCHEMA         = core;
  var DEFAULT_SAFE_SCHEMA = default_safe;
  var DEFAULT_FULL_SCHEMA = default_full;
  var load                = loader.load;
  var loadAll             = loader.loadAll;
  var safeLoad            = loader.safeLoad;
  var safeLoadAll         = loader.safeLoadAll;
  var dump                = dumper.dump;
  var safeDump            = dumper.safeDump;
  var YAMLException       = exception;

  // Deprecated schema names from JS-YAML 2.0.x
  var MINIMAL_SCHEMA = failsafe;
  var SAFE_SCHEMA    = default_safe;
  var DEFAULT_SCHEMA = default_full;

  // Deprecated functions from JS-YAML 1.x.x
  var scan           = deprecated('scan');
  var parse          = deprecated('parse');
  var compose        = deprecated('compose');
  var addConstructor = deprecated('addConstructor');

  var jsYaml$1 = {
  	Type: Type,
  	Schema: Schema,
  	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
  	JSON_SCHEMA: JSON_SCHEMA,
  	CORE_SCHEMA: CORE_SCHEMA,
  	DEFAULT_SAFE_SCHEMA: DEFAULT_SAFE_SCHEMA,
  	DEFAULT_FULL_SCHEMA: DEFAULT_FULL_SCHEMA,
  	load: load,
  	loadAll: loadAll,
  	safeLoad: safeLoad,
  	safeLoadAll: safeLoadAll,
  	dump: dump,
  	safeDump: safeDump,
  	YAMLException: YAMLException,
  	MINIMAL_SCHEMA: MINIMAL_SCHEMA,
  	SAFE_SCHEMA: SAFE_SCHEMA,
  	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
  	scan: scan,
  	parse: parse,
  	compose: compose,
  	addConstructor: addConstructor
  };

  var jsYaml = jsYaml$1;

  /*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   */

  /**
   * Module variables.
   * @private
   */

  var matchHtmlRegExp = /["'&<>]/;

  /**
   * Module exports.
   * @public
   */

  var escapeHtml_1 = escapeHtml;

  /**
   * Escape special characters in the given string of html.
   *
   * @param  {string} string The string to escape for inserting into HTML
   * @return {string}
   * @public
   */

  function escapeHtml(string) {
    var str = '' + string;
    var match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&#39;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
  }

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }















  // this needs a big old cleanup

  const newline = '\n';
  // extract the yaml from 'yaml' nodes and put them in the vfil for later use

  function default_frontmatter(
  	value,
  	messages
  ) {
  	try {
  		return jsYaml.safeLoad(value) ;
  	} catch (e) {
  		messages.push(new vfileMessage('YAML failed to parse'));
  	}
  }

  function parse_frontmatter({
  	parse,
  	type,
  }) {
  	const transformer = (tree, vFile) => {
  		unistUtilVisit(tree, type, (node) => {
  			const data = parse(node.value, vFile.messages);
  			if (data) {
  				// @ts-ignore
  				vFile.data.fm = data;
  			}
  		});
  	};

  	return transformer;
  }

  function escape_code({ blocks }) {
  	return function (tree) {
  	};
  }

  // special case - process nodes with retext and smartypants
  // retext plugins can't work generally due to the difficulties in converting between the two trees

  function smartypants_transformer(options = {}) {
  	const processor = retext().use(retextSmartypants, options);

  	return function (tree) {
  		unistUtilVisit(tree, 'text', (node) => {
  			node.value = String(processor.processSync(node.value));
  		});
  	};
  }

  // regex for scripts and attributes

  const attrs = `(?:\\s{0,1}[a-zA-z]+=(?:"){0,1}[a-zA-Z0-9]+(?:"){0,1})*`;
  const context = `(?:\\s{0,1}context)=(?:"){0,1}module(?:"){0,1}`;

  const RE_BLANK = /^\n+$|^\s+$/;

  const RE_SCRIPT = new RegExp(`^(<script` + attrs + `>)`);

  const RE_MODULE_SCRIPT = new RegExp(
  	`^(<script` + attrs + context + attrs + `>)`
  );

  function extract_parts(nodes) {
  	// since we are wrapping and replacing we need to keep track of the different component 'parts'
  	// many special tags cannot be wrapped nor can style or script tags
  	const parts = {
  		special: [],
  		html: [],
  		instance: [],
  		module: [],
  		css: [],
  	};

  	// iterate through all top level child nodes and assign them to the correct 'part'
  	// anything that is a normal HAST node gets stored as HTML untouched
  	// everything else gets parsed by the svelte parser

  	children: for (let i = 0; i < nodes.length; i += 1) {
  		const empty_node =
  			nodes[i].type === 'text' && RE_BLANK.exec(nodes[i].value );

  		// i no longer knwo why i did this

  		if (empty_node || !nodes[i].value) {
  			if (
  				!parts.html.length ||
  				!(
  					RE_BLANK.exec(nodes[i].value ) &&
  					RE_BLANK.exec(parts.html[parts.html.length - 1].value )
  				)
  			) {
  				parts.html.push(nodes[i]);
  			}

  			continue children;
  		}

  		let result










  ;
  		try {
  			result = compiler$1.parse(nodes[i].value );
  		} catch (e) {
  			parts.html.push(nodes[i]);
  			continue children;
  		}

  		// svelte special tags that have to be top level
  		if (!result.html || !result.html.children) return parts;

  		const _parts

   = result.html.children.map((v) => {
  			if (
  				v.type === 'Options' ||
  				v.type === 'Head' ||
  				v.type === 'Window' ||
  				v.type === 'Body'
  			) {
  				return ['special', v.start, v.end];
  			} else {
  				return ['html', v.start, v.end];
  			}
  		});

  		results: for (const key in result) {
  			if (key === 'html' || !result[key ])
  				continue results;
  			_parts.push([
  				key ,
  				result[key ].start,
  				result[key ].end,
  			]);
  		}

  		// sort them to ensure the array is in the order they appear in the source, no gaps
  		// this might not be necessary any more, i forget
  		const sorted = _parts.sort((a, b) => a[1] - b[1]);

  		// push the nodes into the correct 'part' since they are sorted everything should be in the correct order
  		sorted.forEach((next) => {
  			parts[next[0]].push({
  				type: 'raw',
  				value: (nodes[i].value ).substring(next[1], next[2]),
  			});
  		});
  	}

  	return parts;
  }

  function map_layout_to_path(
  	filename,
  	layout_map
  ) {
  	const match = Object.keys(layout_map).find((l) =>
  		new RegExp(`\\` + `${sep}${l}` + `\\` + `${sep}`).test(
  			normalize$2(filename).replace(process.cwd(), '')
  		)
  	);

  	if (match) {
  		return layout_map[match];
  	} else {
  		return layout_map['_'] ? layout_map['_'] : undefined;
  	}
  }

  function generate_layout_import(
  	layout
  ) {
  	if (!layout) return false;

  	return `import Layout_MDSVEX_DEFAULT${
		layout.components.length ? `, * as Components` : ''
	} from '${layout.path}';`;
  }

  function generate_layout({
  	frontmatter_layout,
  	layout_options,
  	layout_mode,
  	filename,
  }




  ) {
  	let selected_layout;
  	const error = { reason: '' };

  	if (!layout_options || frontmatter_layout === false) {
  		return [false, false, false];
  	} else if (layout_mode === 'single') {
  		selected_layout = layout_options.__mdsvex_default;
  		if (frontmatter_layout)
  			error.reason = `You attempted to apply a named layout in the front-matter of "${filename}", but did not provide any named layouts as options to the preprocessor. `;
  	} else if (frontmatter_layout) {
  		selected_layout = layout_options[frontmatter_layout];
  		if (!selected_layout)
  			error.reason = `Could not find a layout with the name "${frontmatter_layout}" and no fall back layout ("_") was provided.`;
  	} else {
  		selected_layout = map_layout_to_path(filename, layout_options);
  	}

  	return [
  		generate_layout_import(selected_layout),
  		selected_layout !== undefined &&
  			selected_layout.components.length > 0 &&
  			selected_layout.components,
  		error.reason ? error : false,
  	];
  }

  function transform_hast({
  	layout,
  	layout_mode,
  }


  ) {
  	return function transformer(tree, vFile) {
  		// we need to keep { and } intact for svelte, so reverse the escaping in links and images
  		// if anyone actually uses these characters for any other reason i'll probably just cry
  		unistUtilVisit(tree, 'element', (node) => {
  			if (
  				node.tagName === 'a' &&
  				node.properties &&
  				typeof node.properties.href === 'string'
  			) {
  				node.properties.href = node.properties.href
  					.replace(/%7B/g, '{')
  					.replace(/%7D/g, '}');
  			}

  			if (
  				node.tagName === 'img' &&
  				node.properties &&
  				typeof node.properties.src === 'string'
  			) {
  				node.properties.src = node.properties.src
  					.replace(/%7B/g, '{')
  					.replace(/%7D/g, '}');
  			}
  		});

  		// the rest only applies to layouts and front matter
  		// this  breaks position data
  		// svelte preprocessors don't currently support sourcemaps
  		// i'll fix this when they do

  		//@ts-ignore
  		if (!layout && !vFile.data.fm) return tree;

  		unistUtilVisit(tree, 'root', (node) => {
  			const { special, html, instance, module: _module, css } = extract_parts(
  				node.children 
  			);

  			const { fm: metadata } = vFile.data ;

  			// Workaround for script and style tags in strings
  			// https://github.com/sveltejs/svelte/issues/5292
  			const stringified =
  				metadata &&
  				JSON.stringify(metadata).replace(/<(\/?script|\/?style)/g, '<"+"$1');

  			const fm =
  				metadata &&
  				`export const metadata = ${stringified};${newline}` +
  					`\tconst { ${Object.keys(metadata).join(', ')} } = metadata;`;

  			const frontmatter_layout =
  				metadata && (metadata.layout );

  			const [import_script, components, error] = generate_layout({
  				frontmatter_layout,
  				layout_options: layout,
  				layout_mode,
  				//@ts-ignore
  				filename: vFile.filename,
  			});

  			if (error) vFile.messages.push(new vfileMessage(error.reason));

  			if (components) {
  				for (let i = 0; i < components.length; i++) {
  					unistUtilVisit(tree, 'element', (node) => {
  						if (node.tagName === components[i]) {
  							node.tagName = `Components.${components[i]}`;
  						}
  					});
  				}
  			}

  			// add the layout if we are using one, reusing the existing script if one exists
  			if (import_script && !instance[0]) {
  				instance.push({
  					type: 'raw',
  					value: `${newline}<script>${newline}\t${import_script}${newline}</script>${newline}`,
  				});
  			} else if (import_script) {
  				instance[0].value = (instance[0].value ).replace(
  					RE_SCRIPT,
  					`$1${newline}\t${import_script}`
  				);
  			}

  			// inject the frontmatter into the module script if there is any, reusing the existing module script if one exists
  			if (!_module[0] && fm) {
  				_module.push({
  					type: 'raw',
  					value: `<script context="module">${newline}\t${fm}${newline}</script>`,
  				});
  			} else if (fm) {
  				// @ts-ignore
  				_module[0].value = _module[0].value.replace(
  					RE_MODULE_SCRIPT,
  					`$1${newline}\t${fm}`
  				);
  			}

  			// smoosh it all together in an order that makes sense,
  			// if using a layout we only wrap the html and nothing else
  			//@ts-ignore
  			node.children = [
  				//@ts-ignore
  				..._module,
  				//@ts-ignore
  				{ type: 'raw', value: _module[0] ? newline : '' },
  				//@ts-ignore
  				...instance,
  				//@ts-ignore
  				{ type: 'raw', value: instance[0] ? newline : '' },
  				//@ts-ignore
  				...css,
  				//@ts-ignore
  				{ type: 'raw', value: css[0] ? newline : '' },
  				//@ts-ignore
  				...special,
  				//@ts-ignore
  				{ type: 'raw', value: special[0] ? newline : '' },

  				{
  					//@ts-ignore
  					type: 'raw',
  					value: import_script
  						? `<Layout_MDSVEX_DEFAULT {...$$props}${
								fm ? ' {...metadata}' : ''
						  }>`
  						: '',
  				},
  				//@ts-ignore
  				{ type: 'raw', value: newline },
  				//@ts-ignore
  				...html,
  				//@ts-ignore
  				{ type: 'raw', value: newline },
  				//@ts-ignore
  				{ type: 'raw', value: import_script ? '</Layout_MDSVEX_DEFAULT>' : '' },
  			];
  		});
  	};
  }

  // escape curlies, backtick, \t, \r, \n to avoid breaking output of {@html `here`} in .svelte
  const escape_svelty = (str) =>
  	str
  		.replace(
  			/[{}`]/g,
  			//@ts-ignore
  			(c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c])
  		)
  		.replace(/\\([trn])/g, '&#92;$1');

  const code_highlight = (code, lang) => {
  	const normalised_lang = _optionalChain$1([lang, 'optionalAccess', _ => _.toLowerCase, 'call', _2 => _2()]);
  	{
  		const highlighted = escape_svelty(escapeHtml_1(code));
  		return `<pre class="language-${normalised_lang}">{@html \`<code class="language-${normalised_lang}">${highlighted}</code>\`}</pre>`;
  	}
  };

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  function stringify( options = {}) {
  	this.Compiler = compiler;

  	function compiler(tree) {
  		return prettyhtmlHastToHtml(tree, options);
  	}
  }

  const apply_plugins = (plugins, parser) => {
  	(plugins ).forEach((plugin) => {
  		if (Array.isArray(plugin)) {
  			if (plugin[1] && plugin[1]) parser.use(plugin[0], plugin[1]);
  			else parser.use(plugin[0]);
  		} else {
  			parser.use(plugin);
  		}
  	});

  	return parser;
  };

  function transform(
  	{
  		remarkPlugins = [],
  		rehypePlugins = [],
  		frontmatter,
  		smartypants,
  		layout,
  		layout_mode,
  		highlight,
  	} = { layout_mode: 'single' }
  ) {
  	const fm_opts = frontmatter
  		? frontmatter
  		: { parse: default_frontmatter, type: 'yaml', marker: '-' };
  	const toMDAST = unified_1$1()
  		.use(remarkParse)
  		.use(mdsvex_parser)
  		.use(remarkExternalLinks, { target: false, rel: ['nofollow'] })
  		.use(escape_code, { blocks: !!highlight })
  		.use(remarkFrontmatter, [{ type: fm_opts.type, marker: fm_opts.marker }])
  		.use(parse_frontmatter, { parse: fm_opts.parse, type: fm_opts.type });

  	if (smartypants) {
  		toMDAST.use(
  			smartypants_transformer,
  			typeof smartypants === 'boolean' ? {} : smartypants
  		);
  	}

  	apply_plugins(remarkPlugins, toMDAST);

  	const toHAST = toMDAST
  		.use(remarkRehype, {
  			// @ts-ignore
  			allowDangerousHtml: true,
  			allowDangerousCharacters: true,
  		})
  		.use(transform_hast, { layout, layout_mode });

  	apply_plugins(rehypePlugins, toHAST);

  	const processor = toHAST.use(stringify, {
  		allowDangerousHtml: true,
  		allowDangerousCharacters: true,
  	});

  	return processor;
  }

  const defaults = {
  	remarkPlugins: [],
  	rehypePlugins: [],
  	smartypants: true,
  	extension: '.svx',
  	highlight: { highlighter: code_highlight },
  };

  function to_posix(_path) {
  	const isExtendedLengthPath = /^\\\\\?\\/.test(_path);
  	const hasNonAscii = /[^\u0000-\u0080]+/.test(_path);

  	if (isExtendedLengthPath || hasNonAscii) {
  		return _path;
  	}

  	return _path.replace(/\\/g, '/');
  }

  function resolve_layout(layout_path) {
  	try {
  		return to_posix(require.resolve(layout_path));
  	} catch (e) {
  		try {
  			const _path = join(process.cwd(), layout_path);
  			return to_posix(require.resolve(_path));
  		} catch (e) {
  			throw new Error(
  				`The layout path you provided couldn't be found at either ${layout_path} or ${join(
					process.cwd(),
					layout_path
				)}. Please double-check it and try again.`
  			);
  		}
  	}
  }

  // handle custom components

  function process_layouts(layouts) {
  	const _layouts = layouts;

  	for (const key in _layouts) {
  		const layout = fs.readFileSync(_layouts[key].path, { encoding: 'utf8' });
  		let ast;
  		try {
  			ast = compiler$1.parse(layout);
  		} catch (e) {
  			if (e instanceof Error) {
  				throw new Error(e.toString() + `\n	at ${_layouts[key].path}`);
  			}
  		}

  		if (_optionalChain([ast, 'optionalAccess', _ => _.module])) {
  			const component_exports = ast.module.content.body.filter(
  				(node) => node.type === 'ExportNamedDeclaration'
  			) ;

  			if (component_exports.length) {
  				_layouts[key].components = [];

  				for (let i = 0; i < component_exports.length; i++) {
  					if (
  						component_exports[i].specifiers &&
  						component_exports[i].specifiers.length
  					) {
  						for (let j = 0; j < component_exports[i].specifiers.length; j++) {
  							_layouts[key].components.push(
  								component_exports[i].specifiers[j].exported.name
  							);
  						}
  						//@ts-ignore
  					} else if (component_exports[i].declaration.declarations) {
  						//@ts-ignore
  						const declarations = component_exports[i].declaration.declarations;

  						for (let j = 0; j < declarations.length; j++) {
  							_layouts[key].components.push(declarations[j].id.name);
  						}
  					} else if (component_exports[i].declaration) {
  						_layouts[key].components.push(
  							//@ts-ignore
  							component_exports[i].declaration.id.name
  						);
  					}
  				}
  			}
  		}
  	}
  	return _layouts;
  }

  /**
   * The svelte preprocessor for use with svelte.preprocess
   *
   * **options** - An options object with the following properties, all are optional.
   *
   * - `extension` - The extension to use for mdsvex files
   * - `extensions` - The extensions to use for mdsvex files
   * - `layout` - Layouts to apply to mdsvex documents
   * - `frontmatter` - frontmatter options for documents
   * - `highlight` - syntax highlighting options
   * - `smartypants` - smart typography options
   * - `remarkPlugins` - remark plugins to apply to the markdown
   * - `rehypePlugins` - rehype plugins to apply to the rendered html
   *
   */

  const mdsvex = (options = defaults) => {
  	const {
  		remarkPlugins = [],
  		rehypePlugins = [],
  		smartypants = true,
  		extension = '.svx',
  		extensions,
  		layout = false,
  		highlight = { highlighter: code_highlight },
  		frontmatter,
  	} = options;

  	//@ts-ignore
  	if (options.layouts) {
  		throw new Error(
  			`mdsvex: "layouts" is not a valid option. Did you mean "layout"?`
  		);
  	}

  	const unknown_opts = [];
  	const known_opts = [
  		'filename',
  		'remarkPlugins',
  		'rehypePlugins',
  		'smartypants',
  		'extension',
  		'extensions',
  		'layout',
  		'highlight',
  		'frontmatter',
  	];

  	for (const opt in options) {
  		if (!known_opts.includes(opt)) unknown_opts.push(opt);
  	}

  	if (unknown_opts.length) {
  		console.warn(
  			`mdsvex: Received unknown options: ${unknown_opts.join(
				', '
			)}. Valid options are: ${known_opts.join(', ')}.`
  		);
  	}

  	let _layout = {};
  	let layout_mode = 'single';

  	if (typeof layout === 'string') {
  		_layout.__mdsvex_default = { path: resolve_layout(layout), components: [] };
  	} else if (typeof layout === 'object') {
  		layout_mode = 'named';
  		for (const name in layout) {
  			_layout[name] = { path: resolve_layout(layout[name]), components: [] };
  		}
  	}
  	if (highlight && highlight.highlighter === undefined) {
  		highlight.highlighter = code_highlight;
  	}

  	_layout = process_layouts(_layout);
  	const parser = transform({
  		remarkPlugins,
  		rehypePlugins,
  		smartypants,
  		layout: _layout,
  		layout_mode,
  		highlight,
  		frontmatter,
  	});

  	return {
  		name: 'mdsvex',
  		markup: async ({ content, filename }) => {
  			const extensionsParts = (extensions || [extension]).map((ext) =>
  				ext.split('.').pop()
  			);
  			if (!extensionsParts.includes(filename.split('.').pop())) return;

  			const parsed = await parser.process({ contents: content, filename });
  			return {
  				code: parsed.contents ,
  				data: parsed.data ,
  				map: '',
  			};
  		},
  	};
  };

  /**
   * The standalone compile function.
   *
   * - **source** - the source code to convert.
   * - **options** - An options object with the following properties, all are optional.
   *
   * - `filename` - The filename of the generated file
   * - `extension` - The extension to use for mdsvex files
   * - `extensions` - The extensions to use for mdsvex files
   * - `layout` - Layouts to apply to mdsvex documents
   * - `frontmatter` - frontmatter options for documents
   * - `highlight` - syntax highlighting options
   * - `smartypants` - smart typography options
   * - `remarkPlugins` - remark plugins to apply to the markdown
   * - `rehypePlugins` - rehype plugins to apply to the rendered html
   */

  const _compile = (
  	source,
  	opts
  ) =>
  	mdsvex(opts).markup({
  		content: source,
  		filename:
  			(opts && opts.filename) ||
  			`file${
				(opts && ((opts.extensions && opts.extensions[0]) || opts.extension)) ||
				'.svx'
			}`,
  	});

  exports.compile = _compile;
  exports.defineMDSveXConfig = defineConfig;
  exports.escapeSvelte = escape_svelty;
  exports.mdsvex = mdsvex;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
