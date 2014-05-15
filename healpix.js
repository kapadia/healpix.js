(function () {// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(1275);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([72,101,97,108,112,105,120,95,51,46,49,49,47,115,114,99,47,67,47,115,117,98,115,47,99,104,101,97,108,112,105,120,46,99,0,0,0,0,0,0,97,110,103,50,112,105,120,95,114,105,110,103,0,0,0,0,116,104,101,116,97,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,97,110,103,50,112,105,120,95,110,101,115,116,0,0,0,0,97,110,103,50,112,105,120,95,114,105,110,103,54,52,0,0,97,110,103,50,112,105,120,95,110,101,115,116,54,52,0,0,0,0,1,0,4,0,5,0,16,0,17,0,20,0,21,0,64,0,65,0,68,0,69,0,80,0,81,0,84,0,85,0,0,1,1,1,4,1,5,1,16,1,17,1,20,1,21,1,64,1,65,1,68,1,69,1,80,1,81,1,84,1,85,1,0,4,1,4,4,4,5,4,16,4,17,4,20,4,21,4,64,4,65,4,68,4,69,4,80,4,81,4,84,4,85,4,0,5,1,5,4,5,5,5,16,5,17,5,20,5,21,5,64,5,65,5,68,5,69,5,80,5,81,5,84,5,85,5,0,16,1,16,4,16,5,16,16,16,17,16,20,16,21,16,64,16,65,16,68,16,69,16,80,16,81,16,84,16,85,16,0,17,1,17,4,17,5,17,16,17,17,17,20,17,21,17,64,17,65,17,68,17,69,17,80,17,81,17,84,17,85,17,0,20,1,20,4,20,5,20,16,20,17,20,20,20,21,20,64,20,65,20,68,20,69,20,80,20,81,20,84,20,85,20,0,21,1,21,4,21,5,21,16,21,17,21,20,21,21,21,64,21,65,21,68,21,69,21,80,21,81,21,84,21,85,21,0,64,1,64,4,64,5,64,16,64,17,64,20,64,21,64,64,64,65,64,68,64,69,64,80,64,81,64,84,64,85,64,0,65,1,65,4,65,5,65,16,65,17,65,20,65,21,65,64,65,65,65,68,65,69,65,80,65,81,65,84,65,85,65,0,68,1,68,4,68,5,68,16,68,17,68,20,68,21,68,64,68,65,68,68,68,69,68,80,68,81,68,84,68,85,68,0,69,1,69,4,69,5,69,16,69,17,69,20,69,21,69,64,69,65,69,68,69,69,69,80,69,81,69,84,69,85,69,0,80,1,80,4,80,5,80,16,80,17,80,20,80,21,80,64,80,65,80,68,80,69,80,80,80,81,80,84,80,85,80,0,81,1,81,4,81,5,81,16,81,17,81,20,81,21,81,64,81,65,81,68,81,69,81,80,81,81,81,84,81,85,81,0,84,1,84,4,84,5,84,16,84,17,84,20,84,21,84,64,84,65,84,68,84,69,84,80,84,81,84,84,84,85,84,0,85,1,85,4,85,5,85,16,85,17,85,20,85,21,85,64,85,65,85,68,85,69,85,80,85,81,85,84,85,85,85,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,5,0,0,0,7,0,0,0,0,0,0,0,2,0,0,0,4,0,0,0,6,0,0,0,1,0,0,0,3,0,0,0,5,0,0,0,7,0,0,0,0,0,1,0,0,1,1,1,2,0,3,0,2,1,3,1,0,2,1,2,0,3,1,3,2,2,3,2,2,3,3,3,4,0,5,0,4,1,5,1,6,0,7,0,6,1,7,1,4,2,5,2,4,3,5,3,6,2,7,2,6,3,7,3,0,4,1,4,0,5,1,5,2,4,3,4,2,5,3,5,0,6,1,6,0,7,1,7,2,6,3,6,2,7,3,7,4,4,5,4,4,5,5,5,6,4,7,4,6,5,7,5,4,6,5,6,4,7,5,7,6,6,7,6,6,7,7,7,8,0,9,0,8,1,9,1,10,0,11,0,10,1,11,1,8,2,9,2,8,3,9,3,10,2,11,2,10,3,11,3,12,0,13,0,12,1,13,1,14,0,15,0,14,1,15,1,12,2,13,2,12,3,13,3,14,2,15,2,14,3,15,3,8,4,9,4,8,5,9,5,10,4,11,4,10,5,11,5,8,6,9,6,8,7,9,7,10,6,11,6,10,7,11,7,12,4,13,4,12,5,13,5,14,4,15,4,14,5,15,5,12,6,13,6,12,7,13,7,14,6,15,6,14,7,15,7,0,8,1,8,0,9,1,9,2,8,3,8,2,9,3,9,0,10,1,10,0,11,1,11,2,10,3,10,2,11,3,11,4,8,5,8,4,9,5,9,6,8,7,8,6,9,7,9,4,10,5,10,4,11,5,11,6,10,7,10,6,11,7,11,0,12,1,12,0,13,1,13,2,12,3,12,2,13,3,13,0,14,1,14,0,15,1,15,2,14,3,14,2,15,3,15,4,12,5,12,4,13,5,13,6,12,7,12,6,13,7,13,4,14,5,14,4,15,5,15,6,14,7,14,6,15,7,15,8,8,9,8,8,9,9,9,10,8,11,8,10,9,11,9,8,10,9,10,8,11,9,11,10,10,11,10,10,11,11,11,12,8,13,8,12,9,13,9,14,8,15,8,14,9,15,9,12,10,13,10,12,11,13,11,14,10,15,10,14,11,15,11,8,12,9,12,8,13,9,13,10,12,11,12,10,13,11,13,8,14,9,14,8,15,9,15,10,14,11,14,10,15,11,15,12,12,13,12,12,13,13,13,14,12,15,12,14,13,15,13,12,14,13,14,12,15,13,15,14,14,15,14,14,15,15,15,37,115,44,32,37,105,32,40,37,115,41,58,10,37,115,10,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


   
  Module["_bitshift64Ashr"] = _bitshift64Ashr;

  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;

   
  Module["_i64Subtract"] = _i64Subtract;

  var _DtoILow=true;

   
  Module["_i64Add"] = _i64Add;

  var _SItoD=true;

   
  Module["_memset"] = _memset;

  function _free() {
  }
  Module["_free"] = _free;

  var _DtoIHigh=true;

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
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
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
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
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
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
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
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
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  var _cos=Math_cos;

  var _fabs=Math_abs;

  var _sqrt=Math_sqrt;

  var _atan2=Math_atan2;

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  function _fmod(x, y) {
      return x % y;
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  var _acos=Math_acos;

  var _sin=Math_sin;

FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;
  var _stderr=env._stderr|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = +env.NaN, inf = +env.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var _fabs=env._fabs;
  var _sin=env._sin;
  var _acos=env._acos;
  var _fmod=env._fmod;
  var _atan2=env._atan2;
  var ___setErrNo=env.___setErrNo;
  var _fflush=env._fflush;
  var _pwrite=env._pwrite;
  var __reallyNegative=env.__reallyNegative;
  var _send=env._send;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var __exit=env.__exit;
  var _cos=env._cos;
  var _mkport=env._mkport;
  var _write=env._write;
  var _free=env._free;
  var _fwrite=env._fwrite;
  var _malloc=env._malloc;
  var _fprintf=env._fprintf;
  var __formatString=env.__formatString;
  var _sqrt=env._sqrt;
  var _exit=env._exit;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
  HEAP8[tempDoublePtr+4|0] = HEAP8[ptr+4|0];
  HEAP8[tempDoublePtr+5|0] = HEAP8[ptr+5|0];
  HEAP8[tempDoublePtr+6|0] = HEAP8[ptr+6|0];
  HEAP8[tempDoublePtr+7|0] = HEAP8[ptr+7|0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}

function setTempRet1(value) {
  value = value|0;
  tempRet1 = value;
}

function setTempRet2(value) {
  value = value|0;
  tempRet2 = value;
}

function setTempRet3(value) {
  value = value|0;
  tempRet3 = value;
}

function setTempRet4(value) {
  value = value|0;
  tempRet4 = value;
}

function setTempRet5(value) {
  value = value|0;
  tempRet5 = value;
}

function setTempRet6(value) {
  value = value|0;
  tempRet6 = value;
}

function setTempRet7(value) {
  value = value|0;
  tempRet7 = value;
}

function setTempRet8(value) {
  value = value|0;
  tempRet8 = value;
}

function setTempRet9(value) {
  value = value|0;
  tempRet9 = value;
}

function _ang2vec($theta,$phi,$vec) {
 $theta = +$theta;
 $phi = +$phi;
 $vec = $vec|0;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0, $2 = 0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0;
 var $sz = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $theta;
 $1 = $phi;
 $2 = $vec;
 $3 = $0;
 $4 = (+Math_sin((+$3)));
 $sz = $4;
 $5 = $sz;
 $6 = $1;
 $7 = (+Math_cos((+$6)));
 $8 = $5 * $7;
 $9 = $2;
 HEAPF64[$9>>3] = $8;
 $10 = $sz;
 $11 = $1;
 $12 = (+Math_sin((+$11)));
 $13 = $10 * $12;
 $14 = $2;
 $15 = (($14) + 8|0);
 HEAPF64[$15>>3] = $13;
 $16 = $0;
 $17 = (+Math_cos((+$16)));
 $18 = $2;
 $19 = (($18) + 16|0);
 HEAPF64[$19>>3] = $17;
 STACKTOP = sp;return;
}
function _vec2ang($vec,$theta,$phi) {
 $vec = $vec|0;
 $theta = $theta|0;
 $phi = $phi|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0, $23 = 0, $24 = 0.0, $25 = 0, $26 = 0.0;
 var $27 = 0.0, $28 = 0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0.0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $vec;
 $1 = $theta;
 $2 = $phi;
 $3 = $0;
 $4 = +HEAPF64[$3>>3];
 $5 = $0;
 $6 = +HEAPF64[$5>>3];
 $7 = $4 * $6;
 $8 = $0;
 $9 = (($8) + 8|0);
 $10 = +HEAPF64[$9>>3];
 $11 = $0;
 $12 = (($11) + 8|0);
 $13 = +HEAPF64[$12>>3];
 $14 = $10 * $13;
 $15 = $7 + $14;
 $16 = (+Math_sqrt((+$15)));
 $17 = $0;
 $18 = (($17) + 16|0);
 $19 = +HEAPF64[$18>>3];
 $20 = (+Math_atan2((+$16),(+$19)));
 $21 = $1;
 HEAPF64[$21>>3] = $20;
 $22 = $0;
 $23 = (($22) + 8|0);
 $24 = +HEAPF64[$23>>3];
 $25 = $0;
 $26 = +HEAPF64[$25>>3];
 $27 = (+Math_atan2((+$24),(+$26)));
 $28 = $2;
 HEAPF64[$28>>3] = $27;
 $29 = $2;
 $30 = +HEAPF64[$29>>3];
 $31 = $30 < 0.0;
 if (!($31)) {
  STACKTOP = sp;return;
 }
 $32 = $2;
 $33 = +HEAPF64[$32>>3];
 $34 = $33 + 6.283185307179586232;
 HEAPF64[$32>>3] = $34;
 STACKTOP = sp;return;
}
function _ang2pix_ring($nside,$theta,$phi,$ipix) {
 $nside = $nside|0;
 $theta = +$theta;
 $phi = +$phi;
 $ipix = $ipix|0;
 var $0 = 0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0, $13 = 0, $2 = 0.0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $nside;
 $1 = $theta;
 $2 = $phi;
 $3 = $ipix;
 $4 = $1;
 $5 = $4 >= 0.0;
 if ($5) {
  $6 = $1;
  $7 = $6 <= 3.141592653589793116;
  if (!($7)) {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  _util_fail_(8,453,48,64);
 }
 $8 = $0;
 $9 = $1;
 $10 = (+Math_cos((+$9)));
 $11 = $2;
 $12 = (_ang2pix_ring_z_phi($8,$10,$11)|0);
 $13 = $3;
 HEAP32[$13>>2] = $12;
 STACKTOP = sp;return;
}
function _util_fail_($file,$line,$func,$msg) {
 $file = $file|0;
 $line = $line|0;
 $func = $func|0;
 $msg = $msg|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer = sp;
 $0 = $file;
 $1 = $line;
 $2 = $func;
 $3 = $msg;
 $4 = HEAP32[_stderr>>2]|0;
 $5 = $0;
 $6 = $1;
 $7 = $2;
 $8 = $3;
 HEAP32[$vararg_buffer>>2] = $5;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $6;
 $vararg_ptr2 = (($vararg_buffer) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $7;
 $vararg_ptr3 = (($vararg_buffer) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $8;
 (_fprintf(($4|0),(1256|0),($vararg_buffer|0))|0);
 _exit(1);
 // unreachable;
}
function _ang2pix_ring_z_phi($nside_,$z,$phi) {
 $nside_ = $nside_|0;
 $z = +$z;
 $phi = +$phi;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0.0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0.0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0.0, $65 = 0.0, $66 = 0, $67 = 0.0, $68 = 0.0, $69 = 0, $7 = 0.0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0.0, $80 = 0.0;
 var $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0.0, $9 = 0.0, $90 = 0, $91 = 0.0, $92 = 0.0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0.0, $99 = 0;
 var $ip = 0, $ip4 = 0, $ir = 0, $ir3 = 0, $jm = 0, $jm2 = 0, $jp = 0, $jp1 = 0, $kshift = 0, $temp1 = 0.0, $temp2 = 0.0, $tmp = 0.0, $tp = 0.0, $tt = 0.0, $za = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $1 = $nside_;
 $2 = $z;
 $3 = $phi;
 $4 = $2;
 $5 = (+Math_abs((+$4)));
 $za = $5;
 $6 = $3;
 $7 = (+_fmodulo($6,6.283185307179586232));
 $8 = $7 * 0.636619772367581382433;
 $tt = $8;
 $9 = $za;
 $10 = $9 <= 0.666666666666666629659;
 if ($10) {
  $11 = $1;
  $12 = (+($11|0));
  $13 = $tt;
  $14 = 0.5 + $13;
  $15 = $12 * $14;
  $temp1 = $15;
  $16 = $1;
  $17 = (+($16|0));
  $18 = $2;
  $19 = $17 * $18;
  $20 = $19 * 0.75;
  $temp2 = $20;
  $21 = $temp1;
  $22 = $temp2;
  $23 = $21 - $22;
  $24 = (~~(($23)));
  $jp = $24;
  $25 = $temp1;
  $26 = $temp2;
  $27 = $25 + $26;
  $28 = (~~(($27)));
  $jm = $28;
  $29 = $1;
  $30 = (($29) + 1)|0;
  $31 = $jp;
  $32 = (($30) + ($31))|0;
  $33 = $jm;
  $34 = (($32) - ($33))|0;
  $ir = $34;
  $35 = $ir;
  $36 = $35 & 1;
  $37 = (1 - ($36))|0;
  $kshift = $37;
  $38 = $jp;
  $39 = $jm;
  $40 = (($38) + ($39))|0;
  $41 = $1;
  $42 = (($40) - ($41))|0;
  $43 = $kshift;
  $44 = (($42) + ($43))|0;
  $45 = (($44) + 1)|0;
  $46 = (($45|0) / 2)&-1;
  $ip = $46;
  $47 = $ip;
  $48 = $1;
  $49 = $48<<2;
  $50 = (_imodulo($47,$49)|0);
  $ip = $50;
  $51 = $1;
  $52 = $1;
  $53 = (($52) - 1)|0;
  $54 = Math_imul($51, $53)|0;
  $55 = $54<<1;
  $56 = $ir;
  $57 = (($56) - 1)|0;
  $58 = $57<<2;
  $59 = $1;
  $60 = Math_imul($58, $59)|0;
  $61 = (($55) + ($60))|0;
  $62 = $ip;
  $63 = (($61) + ($62))|0;
  $0 = $63;
  $119 = $0;
  STACKTOP = sp;return ($119|0);
 }
 $64 = $tt;
 $65 = $tt;
 $66 = (~~(($65)));
 $67 = (+($66|0));
 $68 = $64 - $67;
 $tp = $68;
 $69 = $1;
 $70 = (+($69|0));
 $71 = $za;
 $72 = 1.0 - $71;
 $73 = 3.0 * $72;
 $74 = (+Math_sqrt((+$73)));
 $75 = $70 * $74;
 $tmp = $75;
 $76 = $tp;
 $77 = $tmp;
 $78 = $76 * $77;
 $79 = (~~(($78)));
 $jp1 = $79;
 $80 = $tp;
 $81 = 1.0 - $80;
 $82 = $tmp;
 $83 = $81 * $82;
 $84 = (~~(($83)));
 $jm2 = $84;
 $85 = $jp1;
 $86 = $jm2;
 $87 = (($85) + ($86))|0;
 $88 = (($87) + 1)|0;
 $ir3 = $88;
 $89 = $tt;
 $90 = $ir3;
 $91 = (+($90|0));
 $92 = $89 * $91;
 $93 = (~~(($92)));
 $ip4 = $93;
 $94 = $ip4;
 $95 = $ir3;
 $96 = $95<<2;
 $97 = (_imodulo($94,$96)|0);
 $ip4 = $97;
 $98 = $2;
 $99 = $98 > 0.0;
 if ($99) {
  $100 = $ir3;
  $101 = $100<<1;
  $102 = $ir3;
  $103 = (($102) - 1)|0;
  $104 = Math_imul($101, $103)|0;
  $105 = $ip4;
  $106 = (($104) + ($105))|0;
  $0 = $106;
  $119 = $0;
  STACKTOP = sp;return ($119|0);
 } else {
  $107 = $1;
  $108 = ($107*12)|0;
  $109 = $1;
  $110 = Math_imul($108, $109)|0;
  $111 = $ir3;
  $112 = $111<<1;
  $113 = $ir3;
  $114 = (($113) + 1)|0;
  $115 = Math_imul($112, $114)|0;
  $116 = (($110) - ($115))|0;
  $117 = $ip4;
  $118 = (($116) + ($117))|0;
  $0 = $118;
  $119 = $0;
  STACKTOP = sp;return ($119|0);
 }
 return 0|0;
}
function _ang2pix_nest($nside,$theta,$phi,$ipix) {
 $nside = $nside|0;
 $theta = +$theta;
 $phi = +$phi;
 $ipix = $ipix|0;
 var $0 = 0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0, $13 = 0, $2 = 0.0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $nside;
 $1 = $theta;
 $2 = $phi;
 $3 = $ipix;
 $4 = $1;
 $5 = $4 >= 0.0;
 if ($5) {
  $6 = $1;
  $7 = $6 <= 3.141592653589793116;
  if (!($7)) {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  _util_fail_(8,458,88,64);
 }
 $8 = $0;
 $9 = $1;
 $10 = (+Math_cos((+$9)));
 $11 = $2;
 $12 = (_ang2pix_nest_z_phi($8,$10,$11)|0);
 $13 = $3;
 HEAP32[$13>>2] = $12;
 STACKTOP = sp;return;
}
function _ang2pix_nest_z_phi($nside_,$z,$phi) {
 $nside_ = $nside_|0;
 $z = +$z;
 $phi = +$phi;
 var $0 = 0, $1 = 0.0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0.0, $110 = 0, $111 = 0, $112 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0;
 var $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0, $24 = 0.0, $25 = 0.0, $26 = 0.0, $27 = 0, $28 = 0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0.0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0.0, $6 = 0.0, $60 = 0, $61 = 0, $62 = 0, $63 = 0.0, $64 = 0, $65 = 0.0, $66 = 0.0, $67 = 0, $68 = 0.0, $69 = 0.0;
 var $7 = 0.0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0.0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $face_num = 0, $ifm = 0, $ifp = 0, $ix = 0, $iy = 0, $jm = 0, $jm2 = 0;
 var $jp = 0, $jp1 = 0, $ntt = 0, $temp1 = 0.0, $temp2 = 0.0, $tmp = 0.0, $tp = 0.0, $tt = 0.0, $za = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $0 = $nside_;
 $1 = $z;
 $2 = $phi;
 $3 = $1;
 $4 = (+Math_abs((+$3)));
 $za = $4;
 $5 = $2;
 $6 = (+_fmodulo($5,6.283185307179586232));
 $7 = $6 * 0.636619772367581382433;
 $tt = $7;
 $8 = $za;
 $9 = $8 <= 0.666666666666666629659;
 if ($9) {
  $10 = $0;
  $11 = (+($10|0));
  $12 = $tt;
  $13 = 0.5 + $12;
  $14 = $11 * $13;
  $temp1 = $14;
  $15 = $0;
  $16 = (+($15|0));
  $17 = $1;
  $18 = $17 * 0.75;
  $19 = $16 * $18;
  $temp2 = $19;
  $20 = $temp1;
  $21 = $temp2;
  $22 = $20 - $21;
  $23 = (~~(($22)));
  $jp = $23;
  $24 = $temp1;
  $25 = $temp2;
  $26 = $24 + $25;
  $27 = (~~(($26)));
  $jm = $27;
  $28 = $jp;
  $29 = $0;
  $30 = (($28|0) / ($29|0))&-1;
  $ifp = $30;
  $31 = $jm;
  $32 = $0;
  $33 = (($31|0) / ($32|0))&-1;
  $ifm = $33;
  $34 = $ifp;
  $35 = $ifm;
  $36 = ($34|0)==($35|0);
  if ($36) {
   $37 = $ifp;
   $38 = ($37|0)==(4);
   if ($38) {
    $41 = 4;
   } else {
    $39 = $ifp;
    $40 = (($39) + 4)|0;
    $41 = $40;
   }
   $face_num = $41;
  } else {
   $42 = $ifp;
   $43 = $ifm;
   $44 = ($42|0)<($43|0);
   if ($44) {
    $45 = $ifp;
    $face_num = $45;
   } else {
    $46 = $ifm;
    $47 = (($46) + 8)|0;
    $face_num = $47;
   }
  }
  $48 = $jm;
  $49 = $0;
  $50 = (($49) - 1)|0;
  $51 = $48 & $50;
  $ix = $51;
  $52 = $0;
  $53 = $jp;
  $54 = $0;
  $55 = (($54) - 1)|0;
  $56 = $53 & $55;
  $57 = (($52) - ($56))|0;
  $58 = (($57) - 1)|0;
  $iy = $58;
  $108 = $0;
  $109 = $ix;
  $110 = $iy;
  $111 = $face_num;
  $112 = (_xyf2nest($108,$109,$110,$111)|0);
  STACKTOP = sp;return ($112|0);
 } else {
  $59 = $tt;
  $60 = (~~(($59)));
  $ntt = $60;
  $61 = $ntt;
  $62 = ($61|0)>=(4);
  if ($62) {
   $ntt = 3;
  }
  $63 = $tt;
  $64 = $ntt;
  $65 = (+($64|0));
  $66 = $63 - $65;
  $tp = $66;
  $67 = $0;
  $68 = (+($67|0));
  $69 = $za;
  $70 = 1.0 - $69;
  $71 = 3.0 * $70;
  $72 = (+Math_sqrt((+$71)));
  $73 = $68 * $72;
  $tmp = $73;
  $74 = $tp;
  $75 = $tmp;
  $76 = $74 * $75;
  $77 = (~~(($76)));
  $jp1 = $77;
  $78 = $tp;
  $79 = 1.0 - $78;
  $80 = $tmp;
  $81 = $79 * $80;
  $82 = (~~(($81)));
  $jm2 = $82;
  $83 = $jp1;
  $84 = $0;
  $85 = ($83|0)>=($84|0);
  if ($85) {
   $86 = $0;
   $87 = (($86) - 1)|0;
   $jp1 = $87;
  }
  $88 = $jm2;
  $89 = $0;
  $90 = ($88|0)>=($89|0);
  if ($90) {
   $91 = $0;
   $92 = (($91) - 1)|0;
   $jm2 = $92;
  }
  $93 = $1;
  $94 = $93 >= 0.0;
  if ($94) {
   $95 = $ntt;
   $face_num = $95;
   $96 = $0;
   $97 = $jm2;
   $98 = (($96) - ($97))|0;
   $99 = (($98) - 1)|0;
   $ix = $99;
   $100 = $0;
   $101 = $jp1;
   $102 = (($100) - ($101))|0;
   $103 = (($102) - 1)|0;
   $iy = $103;
  } else {
   $104 = $ntt;
   $105 = (($104) + 8)|0;
   $face_num = $105;
   $106 = $jp1;
   $ix = $106;
   $107 = $jm2;
   $iy = $107;
  }
  $108 = $0;
  $109 = $ix;
  $110 = $iy;
  $111 = $face_num;
  $112 = (_xyf2nest($108,$109,$110,$111)|0);
  STACKTOP = sp;return ($112|0);
 }
 return 0|0;
}
function _vec2pix_ring($nside,$vec,$ipix) {
 $nside = $nside|0;
 $vec = $vec|0;
 $ipix = $ipix|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0, $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0.0, $37 = 0, $38 = 0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0, $vlen = 0.0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $nside;
 $1 = $vec;
 $2 = $ipix;
 $3 = $1;
 $4 = +HEAPF64[$3>>3];
 $5 = $1;
 $6 = +HEAPF64[$5>>3];
 $7 = $4 * $6;
 $8 = $1;
 $9 = (($8) + 8|0);
 $10 = +HEAPF64[$9>>3];
 $11 = $1;
 $12 = (($11) + 8|0);
 $13 = +HEAPF64[$12>>3];
 $14 = $10 * $13;
 $15 = $7 + $14;
 $16 = $1;
 $17 = (($16) + 16|0);
 $18 = +HEAPF64[$17>>3];
 $19 = $1;
 $20 = (($19) + 16|0);
 $21 = +HEAPF64[$20>>3];
 $22 = $18 * $21;
 $23 = $15 + $22;
 $24 = (+Math_sqrt((+$23)));
 $vlen = $24;
 $25 = $0;
 $26 = $1;
 $27 = (($26) + 16|0);
 $28 = +HEAPF64[$27>>3];
 $29 = $vlen;
 $30 = $28 / $29;
 $31 = $1;
 $32 = (($31) + 8|0);
 $33 = +HEAPF64[$32>>3];
 $34 = $1;
 $35 = +HEAPF64[$34>>3];
 $36 = (+Math_atan2((+$33),(+$35)));
 $37 = (_ang2pix_ring_z_phi($25,$30,$36)|0);
 $38 = $2;
 HEAP32[$38>>2] = $37;
 STACKTOP = sp;return;
}
function _vec2pix_nest($nside,$vec,$ipix) {
 $nside = $nside|0;
 $vec = $vec|0;
 $ipix = $ipix|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0, $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0.0, $37 = 0, $38 = 0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0, $vlen = 0.0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $nside;
 $1 = $vec;
 $2 = $ipix;
 $3 = $1;
 $4 = +HEAPF64[$3>>3];
 $5 = $1;
 $6 = +HEAPF64[$5>>3];
 $7 = $4 * $6;
 $8 = $1;
 $9 = (($8) + 8|0);
 $10 = +HEAPF64[$9>>3];
 $11 = $1;
 $12 = (($11) + 8|0);
 $13 = +HEAPF64[$12>>3];
 $14 = $10 * $13;
 $15 = $7 + $14;
 $16 = $1;
 $17 = (($16) + 16|0);
 $18 = +HEAPF64[$17>>3];
 $19 = $1;
 $20 = (($19) + 16|0);
 $21 = +HEAPF64[$20>>3];
 $22 = $18 * $21;
 $23 = $15 + $22;
 $24 = (+Math_sqrt((+$23)));
 $vlen = $24;
 $25 = $0;
 $26 = $1;
 $27 = (($26) + 16|0);
 $28 = +HEAPF64[$27>>3];
 $29 = $vlen;
 $30 = $28 / $29;
 $31 = $1;
 $32 = (($31) + 8|0);
 $33 = +HEAPF64[$32>>3];
 $34 = $1;
 $35 = +HEAPF64[$34>>3];
 $36 = (+Math_atan2((+$33),(+$35)));
 $37 = (_ang2pix_nest_z_phi($25,$30,$36)|0);
 $38 = $2;
 HEAP32[$38>>2] = $37;
 STACKTOP = sp;return;
}
function _pix2ang_ring($nside,$ipix,$theta,$phi) {
 $nside = $nside|0;
 $ipix = $ipix|0;
 $theta = $theta|0;
 $phi = $phi|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0.0, $9 = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $z = sp;
 $0 = $nside;
 $1 = $ipix;
 $2 = $theta;
 $3 = $phi;
 $4 = $0;
 $5 = $1;
 $6 = $3;
 _pix2ang_ring_z_phi($4,$5,$z,$6);
 $7 = +HEAPF64[$z>>3];
 $8 = (+Math_acos((+$7)));
 $9 = $2;
 HEAPF64[$9>>3] = $8;
 STACKTOP = sp;return;
}
function _pix2ang_ring_z_phi($nside_,$pix,$z,$phi) {
 $nside_ = $nside_|0;
 $pix = $pix|0;
 $z = $z|0;
 $phi = $phi|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0.0, $108 = 0.0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0, $129 = 0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0;
 var $134 = 0.0, $135 = 0.0, $136 = 0, $14 = 0.0, $15 = 0.0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0.0, $25 = 0.0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0.0, $39 = 0.0, $4 = 0, $40 = 0.0, $41 = 0.0, $42 = 0, $43 = 0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0;
 var $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0.0, $59 = 0.0, $6 = 0, $60 = 0.0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
 var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0.0, $81 = 0, $82 = 0, $83 = 0;
 var $84 = 0, $85 = 0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0, $9 = 0, $90 = 0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0, $96 = 0.0, $97 = 0.0, $98 = 0, $99 = 0, $fact1_ = 0.0, $fact2_ = 0.0, $fodd = 0.0;
 var $ip = 0, $ip3 = 0, $iphi = 0, $iphi2 = 0, $iphi5 = 0, $iring = 0, $iring1 = 0, $iring4 = 0, $ncap_ = 0, $nl2 = 0, $npix_ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $0 = $nside_;
 $1 = $pix;
 $2 = $z;
 $3 = $phi;
 $4 = $0;
 $5 = $0;
 $6 = (($5) - 1)|0;
 $7 = Math_imul($4, $6)|0;
 $8 = $7<<1;
 $ncap_ = $8;
 $9 = $0;
 $10 = ($9*12)|0;
 $11 = $0;
 $12 = Math_imul($10, $11)|0;
 $npix_ = $12;
 $13 = $npix_;
 $14 = (+($13|0));
 $15 = 4.0 / $14;
 $fact2_ = $15;
 $16 = $1;
 $17 = $ncap_;
 $18 = ($16|0)<($17|0);
 if ($18) {
  $19 = $1;
  $20 = $19<<1;
  $21 = (1 + ($20))|0;
  $22 = (_isqrt($21)|0);
  $23 = (1 + ($22))|0;
  $24 = (+($23|0));
  $25 = 0.5 * $24;
  $26 = (~~(($25)));
  $iring = $26;
  $27 = $1;
  $28 = (($27) + 1)|0;
  $29 = $iring;
  $30 = $29<<1;
  $31 = $iring;
  $32 = (($31) - 1)|0;
  $33 = Math_imul($30, $32)|0;
  $34 = (($28) - ($33))|0;
  $iphi = $34;
  $35 = $iring;
  $36 = $iring;
  $37 = Math_imul($35, $36)|0;
  $38 = (+($37|0));
  $39 = $fact2_;
  $40 = $38 * $39;
  $41 = 1.0 - $40;
  $42 = $2;
  HEAPF64[$42>>3] = $41;
  $43 = $iphi;
  $44 = (+($43|0));
  $45 = $44 - 0.5;
  $46 = $45 * 1.570796326794896558;
  $47 = $iring;
  $48 = (+($47|0));
  $49 = $46 / $48;
  $50 = $3;
  HEAPF64[$50>>3] = $49;
  STACKTOP = sp;return;
 }
 $51 = $1;
 $52 = $npix_;
 $53 = $ncap_;
 $54 = (($52) - ($53))|0;
 $55 = ($51|0)<($54|0);
 if ($55) {
  $56 = $0;
  $57 = $56 << 1;
  $58 = (+($57|0));
  $59 = $fact2_;
  $60 = $58 * $59;
  $fact1_ = $60;
  $61 = $1;
  $62 = $ncap_;
  $63 = (($61) - ($62))|0;
  $ip = $63;
  $64 = $ip;
  $65 = $0;
  $66 = $65<<2;
  $67 = (($64|0) / ($66|0))&-1;
  $68 = $0;
  $69 = (($67) + ($68))|0;
  $iring1 = $69;
  $70 = $ip;
  $71 = $0;
  $72 = $71<<2;
  $73 = (($70|0) % ($72|0))&-1;
  $74 = (($73) + 1)|0;
  $iphi2 = $74;
  $75 = $iring1;
  $76 = $0;
  $77 = (($75) + ($76))|0;
  $78 = $77 & 1;
  $79 = ($78|0)!=(0);
  $80 = $79 ? 1.0 : 0.5;
  $fodd = $80;
  $81 = $0;
  $82 = $81<<1;
  $nl2 = $82;
  $83 = $nl2;
  $84 = $iring1;
  $85 = (($83) - ($84))|0;
  $86 = (+($85|0));
  $87 = $fact1_;
  $88 = $86 * $87;
  $89 = $2;
  HEAPF64[$89>>3] = $88;
  $90 = $iphi2;
  $91 = (+($90|0));
  $92 = $fodd;
  $93 = $91 - $92;
  $94 = $93 * 3.141592653589793116;
  $95 = $nl2;
  $96 = (+($95|0));
  $97 = $94 / $96;
  $98 = $3;
  HEAPF64[$98>>3] = $97;
 } else {
  $99 = $npix_;
  $100 = $1;
  $101 = (($99) - ($100))|0;
  $ip3 = $101;
  $102 = $ip3;
  $103 = $102<<1;
  $104 = (($103) - 1)|0;
  $105 = (_isqrt($104)|0);
  $106 = (1 + ($105))|0;
  $107 = (+($106|0));
  $108 = 0.5 * $107;
  $109 = (~~(($108)));
  $iring4 = $109;
  $110 = $iring4;
  $111 = $110<<2;
  $112 = (($111) + 1)|0;
  $113 = $ip3;
  $114 = $iring4;
  $115 = $114<<1;
  $116 = $iring4;
  $117 = (($116) - 1)|0;
  $118 = Math_imul($115, $117)|0;
  $119 = (($113) - ($118))|0;
  $120 = (($112) - ($119))|0;
  $iphi5 = $120;
  $121 = $iring4;
  $122 = $iring4;
  $123 = Math_imul($121, $122)|0;
  $124 = (+($123|0));
  $125 = $fact2_;
  $126 = $124 * $125;
  $127 = -1.0 + $126;
  $128 = $2;
  HEAPF64[$128>>3] = $127;
  $129 = $iphi5;
  $130 = (+($129|0));
  $131 = $130 - 0.5;
  $132 = $131 * 1.570796326794896558;
  $133 = $iring4;
  $134 = (+($133|0));
  $135 = $132 / $134;
  $136 = $3;
  HEAPF64[$136>>3] = $135;
 }
 STACKTOP = sp;return;
}
function _pix2ang_nest($nside,$ipix,$theta,$phi) {
 $nside = $nside|0;
 $ipix = $ipix|0;
 $theta = $theta|0;
 $phi = $phi|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0.0, $9 = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $z = sp;
 $0 = $nside;
 $1 = $ipix;
 $2 = $theta;
 $3 = $phi;
 $4 = $0;
 $5 = $1;
 $6 = $3;
 _pix2ang_nest_z_phi($4,$5,$z,$6);
 $7 = +HEAPF64[$z>>3];
 $8 = (+Math_acos((+$7)));
 $9 = $2;
 HEAPF64[$9>>3] = $8;
 STACKTOP = sp;return;
}
function _pix2ang_nest_z_phi($nside_,$pix,$z,$phi) {
 $nside_ = $nside_|0;
 $pix = $pix|0;
 $z = $z|0;
 $phi = $phi|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0.0, $101 = 0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0, $11 = 0.0, $12 = 0.0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0, $52 = 0, $53 = 0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0;
 var $94 = 0, $95 = 0.0, $96 = 0, $97 = 0, $98 = 0.0, $99 = 0.0, $face_num = 0, $fact1_ = 0.0, $fact2_ = 0.0, $ix = 0, $iy = 0, $jp = 0, $jr = 0, $kshift = 0, $nl4 = 0, $npix_ = 0, $nr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $face_num = sp + 64|0;
 $ix = sp + 36|0;
 $iy = sp + 40|0;
 $0 = $nside_;
 $1 = $pix;
 $2 = $z;
 $3 = $phi;
 $4 = $0;
 $5 = $4<<2;
 $nl4 = $5;
 $6 = $0;
 $7 = ($6*12)|0;
 $8 = $0;
 $9 = Math_imul($7, $8)|0;
 $npix_ = $9;
 $10 = $npix_;
 $11 = (+($10|0));
 $12 = 4.0 / $11;
 $fact2_ = $12;
 $13 = $0;
 $14 = $1;
 _nest2xyf($13,$14,$ix,$iy,$face_num);
 $15 = HEAP32[$face_num>>2]|0;
 $16 = (648 + ($15<<2)|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $0;
 $19 = Math_imul($17, $18)|0;
 $20 = HEAP32[$ix>>2]|0;
 $21 = (($19) - ($20))|0;
 $22 = HEAP32[$iy>>2]|0;
 $23 = (($21) - ($22))|0;
 $24 = (($23) - 1)|0;
 $jr = $24;
 $25 = $jr;
 $26 = $0;
 $27 = ($25|0)<($26|0);
 if ($27) {
  $28 = $jr;
  $nr = $28;
  $29 = $nr;
  $30 = $nr;
  $31 = Math_imul($29, $30)|0;
  $32 = (+($31|0));
  $33 = $fact2_;
  $34 = $32 * $33;
  $35 = 1.0 - $34;
  $36 = $2;
  HEAPF64[$36>>3] = $35;
  $kshift = 0;
 } else {
  $37 = $jr;
  $38 = $0;
  $39 = ($38*3)|0;
  $40 = ($37|0)>($39|0);
  if ($40) {
   $41 = $nl4;
   $42 = $jr;
   $43 = (($41) - ($42))|0;
   $nr = $43;
   $44 = $nr;
   $45 = $nr;
   $46 = Math_imul($44, $45)|0;
   $47 = (+($46|0));
   $48 = $fact2_;
   $49 = $47 * $48;
   $50 = $49 - 1.0;
   $51 = $2;
   HEAPF64[$51>>3] = $50;
   $kshift = 0;
  } else {
   $52 = $0;
   $53 = $52 << 1;
   $54 = (+($53|0));
   $55 = $fact2_;
   $56 = $54 * $55;
   $fact1_ = $56;
   $57 = $0;
   $nr = $57;
   $58 = $0;
   $59 = $58<<1;
   $60 = $jr;
   $61 = (($59) - ($60))|0;
   $62 = (+($61|0));
   $63 = $fact1_;
   $64 = $62 * $63;
   $65 = $2;
   HEAPF64[$65>>3] = $64;
   $66 = $jr;
   $67 = $0;
   $68 = (($66) - ($67))|0;
   $69 = $68 & 1;
   $kshift = $69;
  }
 }
 $70 = HEAP32[$face_num>>2]|0;
 $71 = (696 + ($70<<2)|0);
 $72 = HEAP32[$71>>2]|0;
 $73 = $nr;
 $74 = Math_imul($72, $73)|0;
 $75 = HEAP32[$ix>>2]|0;
 $76 = (($74) + ($75))|0;
 $77 = HEAP32[$iy>>2]|0;
 $78 = (($76) - ($77))|0;
 $79 = (($78) + 1)|0;
 $80 = $kshift;
 $81 = (($79) + ($80))|0;
 $82 = (($81|0) / 2)&-1;
 $jp = $82;
 $83 = $jp;
 $84 = $nl4;
 $85 = ($83|0)>($84|0);
 if ($85) {
  $86 = $nl4;
  $87 = $jp;
  $88 = (($87) - ($86))|0;
  $jp = $88;
 }
 $89 = $jp;
 $90 = ($89|0)<(1);
 if (!($90)) {
  $94 = $jp;
  $95 = (+($94|0));
  $96 = $kshift;
  $97 = (($96) + 1)|0;
  $98 = (+($97|0));
  $99 = $98 * 0.5;
  $100 = $95 - $99;
  $101 = $nr;
  $102 = (+($101|0));
  $103 = 1.570796326794896558 / $102;
  $104 = $100 * $103;
  $105 = $3;
  HEAPF64[$105>>3] = $104;
  STACKTOP = sp;return;
 }
 $91 = $nl4;
 $92 = $jp;
 $93 = (($92) + ($91))|0;
 $jp = $93;
 $94 = $jp;
 $95 = (+($94|0));
 $96 = $kshift;
 $97 = (($96) + 1)|0;
 $98 = (+($97|0));
 $99 = $98 * 0.5;
 $100 = $95 - $99;
 $101 = $nr;
 $102 = (+($101|0));
 $103 = 1.570796326794896558 / $102;
 $104 = $100 * $103;
 $105 = $3;
 HEAPF64[$105>>3] = $104;
 STACKTOP = sp;return;
}
function _pix2vec_ring($nside,$ipix,$vec) {
 $nside = $nside|0;
 $ipix = $ipix|0;
 $vec = $vec|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $phi = 0, $stheta = 0.0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $z = sp + 16|0;
 $phi = sp + 8|0;
 $0 = $nside;
 $1 = $ipix;
 $2 = $vec;
 $3 = $0;
 $4 = $1;
 _pix2ang_ring_z_phi($3,$4,$z,$phi);
 $5 = +HEAPF64[$z>>3];
 $6 = 1.0 - $5;
 $7 = +HEAPF64[$z>>3];
 $8 = 1.0 + $7;
 $9 = $6 * $8;
 $10 = (+Math_sqrt((+$9)));
 $stheta = $10;
 $11 = $stheta;
 $12 = +HEAPF64[$phi>>3];
 $13 = (+Math_cos((+$12)));
 $14 = $11 * $13;
 $15 = $2;
 HEAPF64[$15>>3] = $14;
 $16 = $stheta;
 $17 = +HEAPF64[$phi>>3];
 $18 = (+Math_sin((+$17)));
 $19 = $16 * $18;
 $20 = $2;
 $21 = (($20) + 8|0);
 HEAPF64[$21>>3] = $19;
 $22 = +HEAPF64[$z>>3];
 $23 = $2;
 $24 = (($23) + 16|0);
 HEAPF64[$24>>3] = $22;
 STACKTOP = sp;return;
}
function _pix2vec_nest($nside,$ipix,$vec) {
 $nside = $nside|0;
 $ipix = $ipix|0;
 $vec = $vec|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $phi = 0, $stheta = 0.0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $z = sp + 16|0;
 $phi = sp + 8|0;
 $0 = $nside;
 $1 = $ipix;
 $2 = $vec;
 $3 = $0;
 $4 = $1;
 _pix2ang_nest_z_phi($3,$4,$z,$phi);
 $5 = +HEAPF64[$z>>3];
 $6 = 1.0 - $5;
 $7 = +HEAPF64[$z>>3];
 $8 = 1.0 + $7;
 $9 = $6 * $8;
 $10 = (+Math_sqrt((+$9)));
 $stheta = $10;
 $11 = $stheta;
 $12 = +HEAPF64[$phi>>3];
 $13 = (+Math_cos((+$12)));
 $14 = $11 * $13;
 $15 = $2;
 HEAPF64[$15>>3] = $14;
 $16 = $stheta;
 $17 = +HEAPF64[$phi>>3];
 $18 = (+Math_sin((+$17)));
 $19 = $16 * $18;
 $20 = $2;
 $21 = (($20) + 8|0);
 HEAPF64[$21>>3] = $19;
 $22 = +HEAPF64[$z>>3];
 $23 = $2;
 $24 = (($23) + 16|0);
 HEAPF64[$24>>3] = $22;
 STACKTOP = sp;return;
}
function _nest2ring($nside,$ipnest,$ipring) {
 $nside = $nside|0;
 $ipnest = $ipnest|0;
 $ipring = $ipring|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $face_num = 0, $ix = 0, $iy = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $ix = sp + 8|0;
 $iy = sp + 4|0;
 $face_num = sp;
 $0 = $nside;
 $1 = $ipnest;
 $2 = $ipring;
 $3 = $0;
 $4 = $0;
 $5 = (($4) - 1)|0;
 $6 = $3 & $5;
 $7 = ($6|0)!=(0);
 if ($7) {
  $8 = $2;
  HEAP32[$8>>2] = -1;
  STACKTOP = sp;return;
 } else {
  $9 = $0;
  $10 = $1;
  _nest2xyf($9,$10,$ix,$iy,$face_num);
  $11 = $0;
  $12 = HEAP32[$ix>>2]|0;
  $13 = HEAP32[$iy>>2]|0;
  $14 = HEAP32[$face_num>>2]|0;
  $15 = (_xyf2ring($11,$12,$13,$14)|0);
  $16 = $2;
  HEAP32[$16>>2] = $15;
  STACKTOP = sp;return;
 }
}
function _nest2xyf($nside,$pix,$ix,$iy,$face_num) {
 $nside = $nside|0;
 $pix = $pix|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $npface_ = 0, $raw = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $nside;
 $1 = $pix;
 $2 = $ix;
 $3 = $iy;
 $4 = $face_num;
 $5 = $0;
 $6 = $0;
 $7 = Math_imul($5, $6)|0;
 $npface_ = $7;
 $8 = $1;
 $9 = $npface_;
 $10 = (($8|0) / ($9|0))&-1;
 $11 = $4;
 HEAP32[$11>>2] = $10;
 $12 = $npface_;
 $13 = (($12) - 1)|0;
 $14 = $1;
 $15 = $14 & $13;
 $1 = $15;
 $16 = $1;
 $17 = $16 & 21845;
 $18 = $1;
 $19 = $18 & 1431633920;
 $20 = $19 >> 15;
 $21 = $17 | $20;
 $raw = $21;
 $22 = $raw;
 $23 = $22 & 255;
 $24 = (744 + ($23<<1)|0);
 $25 = HEAP16[$24>>1]|0;
 $26 = $25 << 16 >> 16;
 $27 = $raw;
 $28 = $27 >> 8;
 $29 = (744 + ($28<<1)|0);
 $30 = HEAP16[$29>>1]|0;
 $31 = $30 << 16 >> 16;
 $32 = $31 << 4;
 $33 = $26 | $32;
 $34 = $2;
 HEAP32[$34>>2] = $33;
 $35 = $1;
 $36 = $35 >> 1;
 $1 = $36;
 $37 = $1;
 $38 = $37 & 21845;
 $39 = $1;
 $40 = $39 & 1431633920;
 $41 = $40 >> 15;
 $42 = $38 | $41;
 $raw = $42;
 $43 = $raw;
 $44 = $43 & 255;
 $45 = (744 + ($44<<1)|0);
 $46 = HEAP16[$45>>1]|0;
 $47 = $46 << 16 >> 16;
 $48 = $raw;
 $49 = $48 >> 8;
 $50 = (744 + ($49<<1)|0);
 $51 = HEAP16[$50>>1]|0;
 $52 = $51 << 16 >> 16;
 $53 = $52 << 4;
 $54 = $47 | $53;
 $55 = $3;
 HEAP32[$55>>2] = $54;
 STACKTOP = sp;return;
}
function _xyf2ring($nside_,$ix,$iy,$face_num) {
 $nside_ = $nside_|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $9 = 0, $jp = 0, $jr = 0, $kshift = 0, $n_before = 0, $ncap_ = 0, $nl4 = 0, $nr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $0 = $nside_;
 $1 = $ix;
 $2 = $iy;
 $3 = $face_num;
 $4 = $0;
 $5 = $4<<2;
 $nl4 = $5;
 $6 = $3;
 $7 = (648 + ($6<<2)|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = $0;
 $10 = Math_imul($8, $9)|0;
 $11 = $1;
 $12 = (($10) - ($11))|0;
 $13 = $2;
 $14 = (($12) - ($13))|0;
 $15 = (($14) - 1)|0;
 $jr = $15;
 $16 = $jr;
 $17 = $0;
 $18 = ($16|0)<($17|0);
 if ($18) {
  $19 = $jr;
  $nr = $19;
  $20 = $nr;
  $21 = $20<<1;
  $22 = $nr;
  $23 = (($22) - 1)|0;
  $24 = Math_imul($21, $23)|0;
  $n_before = $24;
  $kshift = 0;
 } else {
  $25 = $jr;
  $26 = $0;
  $27 = ($26*3)|0;
  $28 = ($25|0)>($27|0);
  if ($28) {
   $29 = $nl4;
   $30 = $jr;
   $31 = (($29) - ($30))|0;
   $nr = $31;
   $32 = $0;
   $33 = ($32*12)|0;
   $34 = $0;
   $35 = Math_imul($33, $34)|0;
   $36 = $nr;
   $37 = (($36) + 1)|0;
   $38 = $37<<1;
   $39 = $nr;
   $40 = Math_imul($38, $39)|0;
   $41 = (($35) - ($40))|0;
   $n_before = $41;
   $kshift = 0;
  } else {
   $42 = $0;
   $43 = $42<<1;
   $44 = $0;
   $45 = (($44) - 1)|0;
   $46 = Math_imul($43, $45)|0;
   $ncap_ = $46;
   $47 = $0;
   $nr = $47;
   $48 = $ncap_;
   $49 = $jr;
   $50 = $0;
   $51 = (($49) - ($50))|0;
   $52 = $nl4;
   $53 = Math_imul($51, $52)|0;
   $54 = (($48) + ($53))|0;
   $n_before = $54;
   $55 = $jr;
   $56 = $0;
   $57 = (($55) - ($56))|0;
   $58 = $57 & 1;
   $kshift = $58;
  }
 }
 $59 = $3;
 $60 = (696 + ($59<<2)|0);
 $61 = HEAP32[$60>>2]|0;
 $62 = $nr;
 $63 = Math_imul($61, $62)|0;
 $64 = $1;
 $65 = (($63) + ($64))|0;
 $66 = $2;
 $67 = (($65) - ($66))|0;
 $68 = (($67) + 1)|0;
 $69 = $kshift;
 $70 = (($68) + ($69))|0;
 $71 = (($70|0) / 2)&-1;
 $jp = $71;
 $72 = $jp;
 $73 = $nl4;
 $74 = ($72|0)>($73|0);
 if ($74) {
  $75 = $nl4;
  $76 = $jp;
  $77 = (($76) - ($75))|0;
  $jp = $77;
  $83 = $n_before;
  $84 = $jp;
  $85 = (($83) + ($84))|0;
  $86 = (($85) - 1)|0;
  STACKTOP = sp;return ($86|0);
 }
 $78 = $jp;
 $79 = ($78|0)<(1);
 if ($79) {
  $80 = $nl4;
  $81 = $jp;
  $82 = (($81) + ($80))|0;
  $jp = $82;
 }
 $83 = $n_before;
 $84 = $jp;
 $85 = (($83) + ($84))|0;
 $86 = (($85) - 1)|0;
 STACKTOP = sp;return ($86|0);
}
function _ring2nest($nside,$ipring,$ipnest) {
 $nside = $nside|0;
 $ipring = $ipring|0;
 $ipnest = $ipnest|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $face_num = 0, $ix = 0, $iy = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $ix = sp + 8|0;
 $iy = sp + 4|0;
 $face_num = sp;
 $0 = $nside;
 $1 = $ipring;
 $2 = $ipnest;
 $3 = $0;
 $4 = $0;
 $5 = (($4) - 1)|0;
 $6 = $3 & $5;
 $7 = ($6|0)!=(0);
 if ($7) {
  $8 = $2;
  HEAP32[$8>>2] = -1;
  STACKTOP = sp;return;
 } else {
  $9 = $0;
  $10 = $1;
  _ring2xyf($9,$10,$ix,$iy,$face_num);
  $11 = $0;
  $12 = HEAP32[$ix>>2]|0;
  $13 = HEAP32[$iy>>2]|0;
  $14 = HEAP32[$face_num>>2]|0;
  $15 = (_xyf2nest($11,$12,$13,$14)|0);
  $16 = $2;
  HEAP32[$16>>2] = $15;
  STACKTOP = sp;return;
 }
}
function _ring2xyf($nside_,$pix,$ix,$iy,$face_num) {
 $nside_ = $nside_|0;
 $pix = $pix|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0.0, $13 = 0, $130 = 0.0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0.0, $25 = 0.0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $ifm = 0, $ifp = 0, $ip = 0, $ip1 = 0, $iphi = 0, $ipt = 0, $ire = 0, $iring = 0, $irm = 0, $irt = 0, $kshift = 0, $ncap_ = 0, $nl2 = 0, $npix_ = 0, $nr = 0;
 var $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $0 = $nside_;
 $1 = $pix;
 $2 = $ix;
 $3 = $iy;
 $4 = $face_num;
 $5 = $0;
 $6 = $5<<1;
 $7 = $0;
 $8 = (($7) - 1)|0;
 $9 = Math_imul($6, $8)|0;
 $ncap_ = $9;
 $10 = $0;
 $11 = ($10*12)|0;
 $12 = $0;
 $13 = Math_imul($11, $12)|0;
 $npix_ = $13;
 $14 = $0;
 $15 = $14<<1;
 $nl2 = $15;
 $16 = $1;
 $17 = $ncap_;
 $18 = ($16|0)<($17|0);
 if ($18) {
  $19 = $1;
  $20 = $19<<1;
  $21 = (1 + ($20))|0;
  $22 = (_isqrt($21)|0);
  $23 = (1 + ($22))|0;
  $24 = (+($23|0));
  $25 = 0.5 * $24;
  $26 = (~~(($25)));
  $iring = $26;
  $27 = $1;
  $28 = (($27) + 1)|0;
  $29 = $iring;
  $30 = $29<<1;
  $31 = $iring;
  $32 = (($31) - 1)|0;
  $33 = Math_imul($30, $32)|0;
  $34 = (($28) - ($33))|0;
  $iphi = $34;
  $kshift = 0;
  $35 = $iring;
  $nr = $35;
  $36 = $4;
  HEAP32[$36>>2] = 0;
  $37 = $iphi;
  $38 = (($37) - 1)|0;
  $tmp = $38;
  $39 = $tmp;
  $40 = $iring;
  $41 = $40<<1;
  $42 = ($39|0)>=($41|0);
  if ($42) {
   $43 = $4;
   HEAP32[$43>>2] = 2;
   $44 = $iring;
   $45 = $44<<1;
   $46 = $tmp;
   $47 = (($46) - ($45))|0;
   $tmp = $47;
  }
  $48 = $tmp;
  $49 = $iring;
  $50 = ($48|0)>=($49|0);
  if ($50) {
   $51 = $4;
   $52 = HEAP32[$51>>2]|0;
   $53 = (($52) + 1)|0;
   HEAP32[$51>>2] = $53;
  }
 } else {
  $54 = $1;
  $55 = $npix_;
  $56 = $ncap_;
  $57 = (($55) - ($56))|0;
  $58 = ($54|0)<($57|0);
  if ($58) {
   $59 = $1;
   $60 = $ncap_;
   $61 = (($59) - ($60))|0;
   $ip = $61;
   $62 = $ip;
   $63 = $0;
   $64 = $63<<2;
   $65 = (($62|0) / ($64|0))&-1;
   $66 = $0;
   $67 = (($65) + ($66))|0;
   $iring = $67;
   $68 = $ip;
   $69 = $0;
   $70 = $69<<2;
   $71 = (($68|0) % ($70|0))&-1;
   $72 = (($71) + 1)|0;
   $iphi = $72;
   $73 = $iring;
   $74 = $0;
   $75 = (($73) + ($74))|0;
   $76 = $75 & 1;
   $kshift = $76;
   $77 = $0;
   $nr = $77;
   $78 = $iring;
   $79 = $0;
   $80 = (($78) - ($79))|0;
   $81 = (($80) + 1)|0;
   $ire = $81;
   $82 = $nl2;
   $83 = (($82) + 2)|0;
   $84 = $ire;
   $85 = (($83) - ($84))|0;
   $irm = $85;
   $86 = $iphi;
   $87 = $ire;
   $88 = (($87>>>0) / 2)&-1;
   $89 = (($86) - ($88))|0;
   $90 = $0;
   $91 = (($89) + ($90))|0;
   $92 = (($91) - 1)|0;
   $93 = $0;
   $94 = (($92>>>0) / ($93>>>0))&-1;
   $ifm = $94;
   $95 = $iphi;
   $96 = $irm;
   $97 = (($96>>>0) / 2)&-1;
   $98 = (($95) - ($97))|0;
   $99 = $0;
   $100 = (($98) + ($99))|0;
   $101 = (($100) - 1)|0;
   $102 = $0;
   $103 = (($101>>>0) / ($102>>>0))&-1;
   $ifp = $103;
   $104 = $ifp;
   $105 = $ifm;
   $106 = ($104|0)==($105|0);
   if ($106) {
    $107 = $ifp;
    $108 = ($107|0)==(4);
    if ($108) {
     $112 = 4;
    } else {
     $109 = $ifp;
     $110 = (($109) + 4)|0;
     $112 = $110;
    }
    $111 = $4;
    HEAP32[$111>>2] = $112;
   } else {
    $113 = $ifp;
    $114 = $ifm;
    $115 = ($113|0)<($114|0);
    if ($115) {
     $116 = $ifp;
     $117 = $4;
     HEAP32[$117>>2] = $116;
    } else {
     $118 = $ifm;
     $119 = (($118) + 8)|0;
     $120 = $4;
     HEAP32[$120>>2] = $119;
    }
   }
  } else {
   $121 = $npix_;
   $122 = $1;
   $123 = (($121) - ($122))|0;
   $ip1 = $123;
   $124 = $ip1;
   $125 = $124<<1;
   $126 = (($125) - 1)|0;
   $127 = (_isqrt($126)|0);
   $128 = (1 + ($127))|0;
   $129 = (+($128|0));
   $130 = 0.5 * $129;
   $131 = (~~(($130)));
   $iring = $131;
   $132 = $iring;
   $133 = $132<<2;
   $134 = (($133) + 1)|0;
   $135 = $ip1;
   $136 = $iring;
   $137 = $136<<1;
   $138 = $iring;
   $139 = (($138) - 1)|0;
   $140 = Math_imul($137, $139)|0;
   $141 = (($135) - ($140))|0;
   $142 = (($134) - ($141))|0;
   $iphi = $142;
   $kshift = 0;
   $143 = $iring;
   $nr = $143;
   $144 = $nl2;
   $145 = $144<<1;
   $146 = $iring;
   $147 = (($145) - ($146))|0;
   $iring = $147;
   $148 = $4;
   HEAP32[$148>>2] = 8;
   $149 = $iphi;
   $150 = (($149) - 1)|0;
   $tmp = $150;
   $151 = $tmp;
   $152 = $nr;
   $153 = $152<<1;
   $154 = ($151|0)>=($153|0);
   if ($154) {
    $155 = $4;
    HEAP32[$155>>2] = 10;
    $156 = $nr;
    $157 = $156<<1;
    $158 = $tmp;
    $159 = (($158) - ($157))|0;
    $tmp = $159;
   }
   $160 = $tmp;
   $161 = $nr;
   $162 = ($160|0)>=($161|0);
   if ($162) {
    $163 = $4;
    $164 = HEAP32[$163>>2]|0;
    $165 = (($164) + 1)|0;
    HEAP32[$163>>2] = $165;
   }
  }
 }
 $166 = $iring;
 $167 = $4;
 $168 = HEAP32[$167>>2]|0;
 $169 = (648 + ($168<<2)|0);
 $170 = HEAP32[$169>>2]|0;
 $171 = $0;
 $172 = Math_imul($170, $171)|0;
 $173 = (($166) - ($172))|0;
 $174 = (($173) + 1)|0;
 $irt = $174;
 $175 = $iphi;
 $176 = $175<<1;
 $177 = $4;
 $178 = HEAP32[$177>>2]|0;
 $179 = (696 + ($178<<2)|0);
 $180 = HEAP32[$179>>2]|0;
 $181 = $nr;
 $182 = Math_imul($180, $181)|0;
 $183 = (($176) - ($182))|0;
 $184 = $kshift;
 $185 = (($183) - ($184))|0;
 $186 = (($185) - 1)|0;
 $ipt = $186;
 $187 = $ipt;
 $188 = $nl2;
 $189 = ($187|0)>=($188|0);
 if (!($189)) {
  $194 = $ipt;
  $195 = $irt;
  $196 = (($194) - ($195))|0;
  $197 = $196 >> 1;
  $198 = $2;
  HEAP32[$198>>2] = $197;
  $199 = $ipt;
  $200 = $irt;
  $201 = (($199) + ($200))|0;
  $202 = (0 - ($201))|0;
  $203 = $202 >> 1;
  $204 = $3;
  HEAP32[$204>>2] = $203;
  STACKTOP = sp;return;
 }
 $190 = $0;
 $191 = $190<<3;
 $192 = $ipt;
 $193 = (($192) - ($191))|0;
 $ipt = $193;
 $194 = $ipt;
 $195 = $irt;
 $196 = (($194) - ($195))|0;
 $197 = $196 >> 1;
 $198 = $2;
 HEAP32[$198>>2] = $197;
 $199 = $ipt;
 $200 = $irt;
 $201 = (($199) + ($200))|0;
 $202 = (0 - ($201))|0;
 $203 = $202 >> 1;
 $204 = $3;
 HEAP32[$204>>2] = $203;
 STACKTOP = sp;return;
}
function _xyf2nest($nside,$ix,$iy,$face_num) {
 $nside = $nside|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $nside;
 $1 = $ix;
 $2 = $iy;
 $3 = $face_num;
 $4 = $3;
 $5 = $0;
 $6 = Math_imul($4, $5)|0;
 $7 = $0;
 $8 = Math_imul($6, $7)|0;
 $9 = $1;
 $10 = $9 & 255;
 $11 = (136 + ($10<<1)|0);
 $12 = HEAP16[$11>>1]|0;
 $13 = $12 << 16 >> 16;
 $14 = $1;
 $15 = $14 >> 8;
 $16 = (136 + ($15<<1)|0);
 $17 = HEAP16[$16>>1]|0;
 $18 = $17 << 16 >> 16;
 $19 = $18 << 16;
 $20 = $13 | $19;
 $21 = $2;
 $22 = $21 & 255;
 $23 = (136 + ($22<<1)|0);
 $24 = HEAP16[$23>>1]|0;
 $25 = $24 << 16 >> 16;
 $26 = $25 << 1;
 $27 = $20 | $26;
 $28 = $2;
 $29 = $28 >> 8;
 $30 = (136 + ($29<<1)|0);
 $31 = HEAP16[$30>>1]|0;
 $32 = $31 << 16 >> 16;
 $33 = $32 << 17;
 $34 = $27 | $33;
 $35 = (($8) + ($34))|0;
 STACKTOP = sp;return ($35|0);
}
function _isqrt64($0,$1) {
 $0 = $0|0;
 $1 = $1|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
 var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
 var $97 = 0, $98 = 0, $99 = 0, $res = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $3 = sp + 8|0;
 $res = sp;
 $4 = $3;
 $5 = $4;
 HEAP32[$5>>2] = $0;
 $6 = (($4) + 4)|0;
 $7 = $6;
 HEAP32[$7>>2] = $1;
 $8 = $3;
 $9 = $8;
 $10 = HEAP32[$9>>2]|0;
 $11 = (($8) + 4)|0;
 $12 = $11;
 $13 = HEAP32[$12>>2]|0;
 $14 = (+($10>>>0)) + (4294967296.0*(+($13|0)));
 $15 = $14 + 0.5;
 $16 = (+Math_sqrt((+$15)));
 $17 = (~~$16)>>>0;
 $18 = +Math_abs($16) >= 1.0 ? $16 > 0.0 ? (Math_min(+Math_floor($16 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($16 - +(~~$16 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $19 = $res;
 $20 = $19;
 HEAP32[$20>>2] = $17;
 $21 = (($19) + 4)|0;
 $22 = $21;
 HEAP32[$22>>2] = $18;
 $23 = $3;
 $24 = $23;
 $25 = HEAP32[$24>>2]|0;
 $26 = (($23) + 4)|0;
 $27 = $26;
 $28 = HEAP32[$27>>2]|0;
 $29 = ($28|0)<(262144);
 $30 = ($28|0)==(262144);
 $31 = ($25>>>0)<(0);
 $32 = $30 & $31;
 $33 = $29 | $32;
 if ($33) {
  $34 = $res;
  $35 = $34;
  $36 = HEAP32[$35>>2]|0;
  $37 = (($34) + 4)|0;
  $38 = $37;
  $39 = HEAP32[$38>>2]|0;
  $2 = $36;
  $124 = $2;
  STACKTOP = sp;return ($124|0);
 }
 $40 = $res;
 $41 = $40;
 $42 = HEAP32[$41>>2]|0;
 $43 = (($40) + 4)|0;
 $44 = $43;
 $45 = HEAP32[$44>>2]|0;
 $46 = $res;
 $47 = $46;
 $48 = HEAP32[$47>>2]|0;
 $49 = (($46) + 4)|0;
 $50 = $49;
 $51 = HEAP32[$50>>2]|0;
 $52 = (___muldi3(($42|0),($45|0),($48|0),($51|0))|0);
 $53 = tempRet0;
 $54 = $3;
 $55 = $54;
 $56 = HEAP32[$55>>2]|0;
 $57 = (($54) + 4)|0;
 $58 = $57;
 $59 = HEAP32[$58>>2]|0;
 $60 = ($53|0)>($59|0);
 $61 = ($53|0)==($59|0);
 $62 = ($52>>>0)>($56>>>0);
 $63 = $61 & $62;
 $64 = $60 | $63;
 if ($64) {
  $65 = $res;
  $66 = $65;
  $67 = HEAP32[$66>>2]|0;
  $68 = (($65) + 4)|0;
  $69 = $68;
  $70 = HEAP32[$69>>2]|0;
  $71 = (_i64Add(($67|0),($70|0),-1,-1)|0);
  $72 = tempRet0;
  $73 = $res;
  $74 = $73;
  HEAP32[$74>>2] = $71;
  $75 = (($73) + 4)|0;
  $76 = $75;
  HEAP32[$76>>2] = $72;
 } else {
  $77 = $res;
  $78 = $77;
  $79 = HEAP32[$78>>2]|0;
  $80 = (($77) + 4)|0;
  $81 = $80;
  $82 = HEAP32[$81>>2]|0;
  $83 = (_i64Add(($79|0),($82|0),1,0)|0);
  $84 = tempRet0;
  $85 = $res;
  $86 = $85;
  $87 = HEAP32[$86>>2]|0;
  $88 = (($85) + 4)|0;
  $89 = $88;
  $90 = HEAP32[$89>>2]|0;
  $91 = (_i64Add(($87|0),($90|0),1,0)|0);
  $92 = tempRet0;
  $93 = (___muldi3(($83|0),($84|0),($91|0),($92|0))|0);
  $94 = tempRet0;
  $95 = $3;
  $96 = $95;
  $97 = HEAP32[$96>>2]|0;
  $98 = (($95) + 4)|0;
  $99 = $98;
  $100 = HEAP32[$99>>2]|0;
  $101 = ($94|0)<($100|0);
  $102 = ($94|0)==($100|0);
  $103 = ($93>>>0)<=($97>>>0);
  $104 = $102 & $103;
  $105 = $101 | $104;
  if ($105) {
   $106 = $res;
   $107 = $106;
   $108 = HEAP32[$107>>2]|0;
   $109 = (($106) + 4)|0;
   $110 = $109;
   $111 = HEAP32[$110>>2]|0;
   $112 = (_i64Add(($108|0),($111|0),1,0)|0);
   $113 = tempRet0;
   $114 = $res;
   $115 = $114;
   HEAP32[$115>>2] = $112;
   $116 = (($114) + 4)|0;
   $117 = $116;
   HEAP32[$117>>2] = $113;
  }
 }
 $118 = $res;
 $119 = $118;
 $120 = HEAP32[$119>>2]|0;
 $121 = (($118) + 4)|0;
 $122 = $121;
 $123 = HEAP32[$122>>2]|0;
 $2 = $120;
 $124 = $2;
 STACKTOP = sp;return ($124|0);
}
function _ang2pix_ring64($0,$1,$theta,$phi,$ipix) {
 $0 = $0|0;
 $1 = $1|0;
 $theta = +$theta;
 $phi = +$phi;
 $ipix = $ipix|0;
 var $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0.0;
 var $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $cth = 0.0, $sth = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $2 = sp + 32|0;
 $6 = $2;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $3 = $theta;
 $4 = $phi;
 $5 = $ipix;
 $10 = $3;
 $11 = $10 >= 0.0;
 if ($11) {
  $12 = $3;
  $13 = $12 <= 3.141592653589793116;
  if (!($13)) {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  _util_fail_(8,863,104,64);
 }
 $14 = $3;
 $15 = (+Math_cos((+$14)));
 $cth = $15;
 $16 = $cth;
 $17 = (+Math_abs((+$16)));
 $18 = $17 > 0.989999999999999991118;
 if ($18) {
  $19 = $3;
  $20 = (+Math_sin((+$19)));
  $21 = $20;
 } else {
  $21 = -5.0;
 }
 $sth = $21;
 $22 = $2;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (($22) + 4)|0;
 $26 = $25;
 $27 = HEAP32[$26>>2]|0;
 $28 = $cth;
 $29 = $sth;
 $30 = $4;
 $31 = (_ang2pix_ring_z_phi64($24,$27,$28,$29,$30)|0);
 $32 = tempRet0;
 $33 = $5;
 $34 = $33;
 $35 = $34;
 HEAP32[$35>>2] = $31;
 $36 = (($34) + 4)|0;
 $37 = $36;
 HEAP32[$37>>2] = $32;
 STACKTOP = sp;return;
}
function _ang2pix_ring_z_phi64($0,$1,$z,$s,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $z = +$z;
 $s = +$s;
 $phi = +$phi;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0.0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0.0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0.0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0.0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
 var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0.0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0.0, $199 = 0.0, $2 = 0, $20 = 0, $200 = 0, $201 = 0.0, $202 = 0.0, $203 = 0.0, $204 = 0, $205 = 0, $206 = 0, $207 = 0;
 var $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0.0, $212 = 0.0, $213 = 0.0, $214 = 0.0, $215 = 0.0, $216 = 0.0, $217 = 0.0, $218 = 0.0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0.0;
 var $226 = 0.0, $227 = 0.0, $228 = 0.0, $229 = 0.0, $23 = 0, $230 = 0.0, $231 = 0.0, $232 = 0.0, $233 = 0.0, $234 = 0.0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0.0, $240 = 0, $241 = 0.0, $242 = 0.0, $243 = 0.0;
 var $244 = 0.0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0.0, $260 = 0, $261 = 0;
 var $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0.0, $270 = 0, $271 = 0.0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0.0, $279 = 0.0, $28 = 0;
 var $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0;
 var $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0.0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0;
 var $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0;
 var $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0.0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0.0, $350 = 0, $351 = 0;
 var $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0.0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0.0;
 var $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0.0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0;
 var $389 = 0, $39 = 0.0, $390 = 0, $391 = 0, $4 = 0.0, $40 = 0.0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0.0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0.0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $ip = 0, $ip4 = 0, $ir = 0, $ir3 = 0, $jm = 0, $jm2 = 0, $jp = 0, $jp1 = 0, $kshift = 0, $temp1 = 0.0;
 var $temp2 = 0.0, $tmp = 0.0, $tp = 0.0, $tt = 0.0, $za = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $2 = sp + 72|0;
 $3 = sp + 48|0;
 $jp = sp + 136|0;
 $jm = sp + 144|0;
 $ir = sp + 16|0;
 $ip = sp + 8|0;
 $jp1 = sp + 104|0;
 $jm2 = sp + 56|0;
 $ir3 = sp + 64|0;
 $ip4 = sp;
 $7 = $3;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $4 = $z;
 $5 = $s;
 $6 = $phi;
 $11 = $4;
 $12 = (+Math_abs((+$11)));
 $za = $12;
 $13 = $6;
 $14 = (+_fmodulo($13,6.283185307179586232));
 $15 = $14 * 0.636619772367581382433;
 $tt = $15;
 $16 = $za;
 $17 = $16 <= 0.666666666666666629659;
 if ($17) {
  $18 = $3;
  $19 = $18;
  $20 = HEAP32[$19>>2]|0;
  $21 = (($18) + 4)|0;
  $22 = $21;
  $23 = HEAP32[$22>>2]|0;
  $24 = (+($20>>>0)) + (4294967296.0*(+($23|0)));
  $25 = $tt;
  $26 = 0.5 + $25;
  $27 = $24 * $26;
  $temp1 = $27;
  $28 = $3;
  $29 = $28;
  $30 = HEAP32[$29>>2]|0;
  $31 = (($28) + 4)|0;
  $32 = $31;
  $33 = HEAP32[$32>>2]|0;
  $34 = (+($30>>>0)) + (4294967296.0*(+($33|0)));
  $35 = $4;
  $36 = $34 * $35;
  $37 = $36 * 0.75;
  $temp2 = $37;
  $38 = $temp1;
  $39 = $temp2;
  $40 = $38 - $39;
  $41 = (~~$40)>>>0;
  $42 = +Math_abs($40) >= 1.0 ? $40 > 0.0 ? (Math_min(+Math_floor($40 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($40 - +(~~$40 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $43 = $jp;
  $44 = $43;
  HEAP32[$44>>2] = $41;
  $45 = (($43) + 4)|0;
  $46 = $45;
  HEAP32[$46>>2] = $42;
  $47 = $temp1;
  $48 = $temp2;
  $49 = $47 + $48;
  $50 = (~~$49)>>>0;
  $51 = +Math_abs($49) >= 1.0 ? $49 > 0.0 ? (Math_min(+Math_floor($49 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($49 - +(~~$49 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $52 = $jm;
  $53 = $52;
  HEAP32[$53>>2] = $50;
  $54 = (($52) + 4)|0;
  $55 = $54;
  HEAP32[$55>>2] = $51;
  $56 = $3;
  $57 = $56;
  $58 = HEAP32[$57>>2]|0;
  $59 = (($56) + 4)|0;
  $60 = $59;
  $61 = HEAP32[$60>>2]|0;
  $62 = (_i64Add(($58|0),($61|0),1,0)|0);
  $63 = tempRet0;
  $64 = $jp;
  $65 = $64;
  $66 = HEAP32[$65>>2]|0;
  $67 = (($64) + 4)|0;
  $68 = $67;
  $69 = HEAP32[$68>>2]|0;
  $70 = (_i64Add(($62|0),($63|0),($66|0),($69|0))|0);
  $71 = tempRet0;
  $72 = $jm;
  $73 = $72;
  $74 = HEAP32[$73>>2]|0;
  $75 = (($72) + 4)|0;
  $76 = $75;
  $77 = HEAP32[$76>>2]|0;
  $78 = (_i64Subtract(($70|0),($71|0),($74|0),($77|0))|0);
  $79 = tempRet0;
  $80 = $ir;
  $81 = $80;
  HEAP32[$81>>2] = $78;
  $82 = (($80) + 4)|0;
  $83 = $82;
  HEAP32[$83>>2] = $79;
  $84 = $ir;
  $85 = $84;
  $86 = HEAP32[$85>>2]|0;
  $87 = (($84) + 4)|0;
  $88 = $87;
  $89 = HEAP32[$88>>2]|0;
  $90 = $86 & 1;
  $91 = (_i64Subtract(1,0,($90|0),0)|0);
  $92 = tempRet0;
  $kshift = $91;
  $93 = $jp;
  $94 = $93;
  $95 = HEAP32[$94>>2]|0;
  $96 = (($93) + 4)|0;
  $97 = $96;
  $98 = HEAP32[$97>>2]|0;
  $99 = $jm;
  $100 = $99;
  $101 = HEAP32[$100>>2]|0;
  $102 = (($99) + 4)|0;
  $103 = $102;
  $104 = HEAP32[$103>>2]|0;
  $105 = (_i64Add(($95|0),($98|0),($101|0),($104|0))|0);
  $106 = tempRet0;
  $107 = $3;
  $108 = $107;
  $109 = HEAP32[$108>>2]|0;
  $110 = (($107) + 4)|0;
  $111 = $110;
  $112 = HEAP32[$111>>2]|0;
  $113 = (_i64Subtract(($105|0),($106|0),($109|0),($112|0))|0);
  $114 = tempRet0;
  $115 = $kshift;
  $116 = ($115|0)<(0);
  $117 = $116 << 31 >> 31;
  $118 = (_i64Add(($113|0),($114|0),($115|0),($117|0))|0);
  $119 = tempRet0;
  $120 = (_i64Add(($118|0),($119|0),1,0)|0);
  $121 = tempRet0;
  $122 = (___divdi3(($120|0),($121|0),2,0)|0);
  $123 = tempRet0;
  $124 = $ip;
  $125 = $124;
  HEAP32[$125>>2] = $122;
  $126 = (($124) + 4)|0;
  $127 = $126;
  HEAP32[$127>>2] = $123;
  $128 = $ip;
  $129 = $128;
  $130 = HEAP32[$129>>2]|0;
  $131 = (($128) + 4)|0;
  $132 = $131;
  $133 = HEAP32[$132>>2]|0;
  $134 = $3;
  $135 = $134;
  $136 = HEAP32[$135>>2]|0;
  $137 = (($134) + 4)|0;
  $138 = $137;
  $139 = HEAP32[$138>>2]|0;
  $140 = (___muldi3(4,0,($136|0),($139|0))|0);
  $141 = tempRet0;
  $142 = (_imodulo64($130,$133,$140,$141)|0);
  $143 = tempRet0;
  $144 = $ip;
  $145 = $144;
  HEAP32[$145>>2] = $142;
  $146 = (($144) + 4)|0;
  $147 = $146;
  HEAP32[$147>>2] = $143;
  $148 = $3;
  $149 = $148;
  $150 = HEAP32[$149>>2]|0;
  $151 = (($148) + 4)|0;
  $152 = $151;
  $153 = HEAP32[$152>>2]|0;
  $154 = $3;
  $155 = $154;
  $156 = HEAP32[$155>>2]|0;
  $157 = (($154) + 4)|0;
  $158 = $157;
  $159 = HEAP32[$158>>2]|0;
  $160 = (_i64Subtract(($156|0),($159|0),1,0)|0);
  $161 = tempRet0;
  $162 = (___muldi3(($150|0),($153|0),($160|0),($161|0))|0);
  $163 = tempRet0;
  $164 = (___muldi3(($162|0),($163|0),2,0)|0);
  $165 = tempRet0;
  $166 = $ir;
  $167 = $166;
  $168 = HEAP32[$167>>2]|0;
  $169 = (($166) + 4)|0;
  $170 = $169;
  $171 = HEAP32[$170>>2]|0;
  $172 = (_i64Subtract(($168|0),($171|0),1,0)|0);
  $173 = tempRet0;
  $174 = (___muldi3(($172|0),($173|0),4,0)|0);
  $175 = tempRet0;
  $176 = $3;
  $177 = $176;
  $178 = HEAP32[$177>>2]|0;
  $179 = (($176) + 4)|0;
  $180 = $179;
  $181 = HEAP32[$180>>2]|0;
  $182 = (___muldi3(($174|0),($175|0),($178|0),($181|0))|0);
  $183 = tempRet0;
  $184 = (_i64Add(($164|0),($165|0),($182|0),($183|0))|0);
  $185 = tempRet0;
  $186 = $ip;
  $187 = $186;
  $188 = HEAP32[$187>>2]|0;
  $189 = (($186) + 4)|0;
  $190 = $189;
  $191 = HEAP32[$190>>2]|0;
  $192 = (_i64Add(($184|0),($185|0),($188|0),($191|0))|0);
  $193 = tempRet0;
  $194 = $2;
  $195 = $194;
  HEAP32[$195>>2] = $192;
  $196 = (($194) + 4)|0;
  $197 = $196;
  HEAP32[$197>>2] = $193;
  $386 = $2;
  $387 = $386;
  $388 = HEAP32[$387>>2]|0;
  $389 = (($386) + 4)|0;
  $390 = $389;
  $391 = HEAP32[$390>>2]|0;
  tempRet0 = $391;
  STACKTOP = sp;return ($388|0);
 }
 $198 = $tt;
 $199 = $tt;
 $200 = (~~(($199)));
 $201 = (+($200|0));
 $202 = $198 - $201;
 $tp = $202;
 $203 = $5;
 $204 = $203 > -2.0;
 if ($204) {
  $205 = $3;
  $206 = $205;
  $207 = HEAP32[$206>>2]|0;
  $208 = (($205) + 4)|0;
  $209 = $208;
  $210 = HEAP32[$209>>2]|0;
  $211 = (+($207>>>0)) + (4294967296.0*(+($210|0)));
  $212 = $5;
  $213 = $211 * $212;
  $214 = $za;
  $215 = 1.0 + $214;
  $216 = $215 / 3.0;
  $217 = (+Math_sqrt((+$216)));
  $218 = $213 / $217;
  $231 = $218;
 } else {
  $219 = $3;
  $220 = $219;
  $221 = HEAP32[$220>>2]|0;
  $222 = (($219) + 4)|0;
  $223 = $222;
  $224 = HEAP32[$223>>2]|0;
  $225 = (+($221>>>0)) + (4294967296.0*(+($224|0)));
  $226 = $za;
  $227 = 1.0 - $226;
  $228 = 3.0 * $227;
  $229 = (+Math_sqrt((+$228)));
  $230 = $225 * $229;
  $231 = $230;
 }
 $tmp = $231;
 $232 = $tp;
 $233 = $tmp;
 $234 = $232 * $233;
 $235 = (~~$234)>>>0;
 $236 = +Math_abs($234) >= 1.0 ? $234 > 0.0 ? (Math_min(+Math_floor($234 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($234 - +(~~$234 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $237 = $jp1;
 $238 = $237;
 HEAP32[$238>>2] = $235;
 $239 = (($237) + 4)|0;
 $240 = $239;
 HEAP32[$240>>2] = $236;
 $241 = $tp;
 $242 = 1.0 - $241;
 $243 = $tmp;
 $244 = $242 * $243;
 $245 = (~~$244)>>>0;
 $246 = +Math_abs($244) >= 1.0 ? $244 > 0.0 ? (Math_min(+Math_floor($244 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($244 - +(~~$244 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $247 = $jm2;
 $248 = $247;
 HEAP32[$248>>2] = $245;
 $249 = (($247) + 4)|0;
 $250 = $249;
 HEAP32[$250>>2] = $246;
 $251 = $jp1;
 $252 = $251;
 $253 = HEAP32[$252>>2]|0;
 $254 = (($251) + 4)|0;
 $255 = $254;
 $256 = HEAP32[$255>>2]|0;
 $257 = $jm2;
 $258 = $257;
 $259 = HEAP32[$258>>2]|0;
 $260 = (($257) + 4)|0;
 $261 = $260;
 $262 = HEAP32[$261>>2]|0;
 $263 = (_i64Add(($253|0),($256|0),($259|0),($262|0))|0);
 $264 = tempRet0;
 $265 = (_i64Add(($263|0),($264|0),1,0)|0);
 $266 = tempRet0;
 $267 = $ir3;
 $268 = $267;
 HEAP32[$268>>2] = $265;
 $269 = (($267) + 4)|0;
 $270 = $269;
 HEAP32[$270>>2] = $266;
 $271 = $tt;
 $272 = $ir3;
 $273 = $272;
 $274 = HEAP32[$273>>2]|0;
 $275 = (($272) + 4)|0;
 $276 = $275;
 $277 = HEAP32[$276>>2]|0;
 $278 = (+($274>>>0)) + (4294967296.0*(+($277|0)));
 $279 = $271 * $278;
 $280 = (~~$279)>>>0;
 $281 = +Math_abs($279) >= 1.0 ? $279 > 0.0 ? (Math_min(+Math_floor($279 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($279 - +(~~$279 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $282 = $ip4;
 $283 = $282;
 HEAP32[$283>>2] = $280;
 $284 = (($282) + 4)|0;
 $285 = $284;
 HEAP32[$285>>2] = $281;
 $286 = $ip4;
 $287 = $286;
 $288 = HEAP32[$287>>2]|0;
 $289 = (($286) + 4)|0;
 $290 = $289;
 $291 = HEAP32[$290>>2]|0;
 $292 = $ir3;
 $293 = $292;
 $294 = HEAP32[$293>>2]|0;
 $295 = (($292) + 4)|0;
 $296 = $295;
 $297 = HEAP32[$296>>2]|0;
 $298 = (___muldi3(4,0,($294|0),($297|0))|0);
 $299 = tempRet0;
 $300 = (_imodulo64($288,$291,$298,$299)|0);
 $301 = tempRet0;
 $302 = $ip4;
 $303 = $302;
 HEAP32[$303>>2] = $300;
 $304 = (($302) + 4)|0;
 $305 = $304;
 HEAP32[$305>>2] = $301;
 $306 = $4;
 $307 = $306 > 0.0;
 if ($307) {
  $308 = $ir3;
  $309 = $308;
  $310 = HEAP32[$309>>2]|0;
  $311 = (($308) + 4)|0;
  $312 = $311;
  $313 = HEAP32[$312>>2]|0;
  $314 = (___muldi3(2,0,($310|0),($313|0))|0);
  $315 = tempRet0;
  $316 = $ir3;
  $317 = $316;
  $318 = HEAP32[$317>>2]|0;
  $319 = (($316) + 4)|0;
  $320 = $319;
  $321 = HEAP32[$320>>2]|0;
  $322 = (_i64Subtract(($318|0),($321|0),1,0)|0);
  $323 = tempRet0;
  $324 = (___muldi3(($314|0),($315|0),($322|0),($323|0))|0);
  $325 = tempRet0;
  $326 = $ip4;
  $327 = $326;
  $328 = HEAP32[$327>>2]|0;
  $329 = (($326) + 4)|0;
  $330 = $329;
  $331 = HEAP32[$330>>2]|0;
  $332 = (_i64Add(($324|0),($325|0),($328|0),($331|0))|0);
  $333 = tempRet0;
  $334 = $2;
  $335 = $334;
  HEAP32[$335>>2] = $332;
  $336 = (($334) + 4)|0;
  $337 = $336;
  HEAP32[$337>>2] = $333;
  $386 = $2;
  $387 = $386;
  $388 = HEAP32[$387>>2]|0;
  $389 = (($386) + 4)|0;
  $390 = $389;
  $391 = HEAP32[$390>>2]|0;
  tempRet0 = $391;
  STACKTOP = sp;return ($388|0);
 } else {
  $338 = $3;
  $339 = $338;
  $340 = HEAP32[$339>>2]|0;
  $341 = (($338) + 4)|0;
  $342 = $341;
  $343 = HEAP32[$342>>2]|0;
  $344 = (___muldi3(12,0,($340|0),($343|0))|0);
  $345 = tempRet0;
  $346 = $3;
  $347 = $346;
  $348 = HEAP32[$347>>2]|0;
  $349 = (($346) + 4)|0;
  $350 = $349;
  $351 = HEAP32[$350>>2]|0;
  $352 = (___muldi3(($344|0),($345|0),($348|0),($351|0))|0);
  $353 = tempRet0;
  $354 = $ir3;
  $355 = $354;
  $356 = HEAP32[$355>>2]|0;
  $357 = (($354) + 4)|0;
  $358 = $357;
  $359 = HEAP32[$358>>2]|0;
  $360 = (___muldi3(2,0,($356|0),($359|0))|0);
  $361 = tempRet0;
  $362 = $ir3;
  $363 = $362;
  $364 = HEAP32[$363>>2]|0;
  $365 = (($362) + 4)|0;
  $366 = $365;
  $367 = HEAP32[$366>>2]|0;
  $368 = (_i64Add(($364|0),($367|0),1,0)|0);
  $369 = tempRet0;
  $370 = (___muldi3(($360|0),($361|0),($368|0),($369|0))|0);
  $371 = tempRet0;
  $372 = (_i64Subtract(($352|0),($353|0),($370|0),($371|0))|0);
  $373 = tempRet0;
  $374 = $ip4;
  $375 = $374;
  $376 = HEAP32[$375>>2]|0;
  $377 = (($374) + 4)|0;
  $378 = $377;
  $379 = HEAP32[$378>>2]|0;
  $380 = (_i64Add(($372|0),($373|0),($376|0),($379|0))|0);
  $381 = tempRet0;
  $382 = $2;
  $383 = $382;
  HEAP32[$383>>2] = $380;
  $384 = (($382) + 4)|0;
  $385 = $384;
  HEAP32[$385>>2] = $381;
  $386 = $2;
  $387 = $386;
  $388 = HEAP32[$387>>2]|0;
  $389 = (($386) + 4)|0;
  $390 = $389;
  $391 = HEAP32[$390>>2]|0;
  tempRet0 = $391;
  STACKTOP = sp;return ($388|0);
 }
 return 0|0;
}
function _ang2pix_nest64($0,$1,$theta,$phi,$ipix) {
 $0 = $0|0;
 $1 = $1|0;
 $theta = +$theta;
 $phi = +$phi;
 $ipix = $ipix|0;
 var $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0.0;
 var $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $cth = 0.0, $sth = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $2 = sp + 32|0;
 $6 = $2;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $3 = $theta;
 $4 = $phi;
 $5 = $ipix;
 $10 = $3;
 $11 = $10 >= 0.0;
 if ($11) {
  $12 = $3;
  $13 = $12 <= 3.141592653589793116;
  if (!($13)) {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  _util_fail_(8,869,120,64);
 }
 $14 = $3;
 $15 = (+Math_cos((+$14)));
 $cth = $15;
 $16 = $cth;
 $17 = (+Math_abs((+$16)));
 $18 = $17 > 0.989999999999999991118;
 if ($18) {
  $19 = $3;
  $20 = (+Math_sin((+$19)));
  $21 = $20;
 } else {
  $21 = -5.0;
 }
 $sth = $21;
 $22 = $2;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (($22) + 4)|0;
 $26 = $25;
 $27 = HEAP32[$26>>2]|0;
 $28 = $cth;
 $29 = $sth;
 $30 = $4;
 $31 = (_ang2pix_nest_z_phi64($24,$27,$28,$29,$30)|0);
 $32 = tempRet0;
 $33 = $5;
 $34 = $33;
 $35 = $34;
 HEAP32[$35>>2] = $31;
 $36 = (($34) + 4)|0;
 $37 = $36;
 HEAP32[$37>>2] = $32;
 STACKTOP = sp;return;
}
function _ang2pix_nest_z_phi64($0,$1,$z,$s,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $z = +$z;
 $s = +$s;
 $phi = +$phi;
 var $10 = 0.0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0.0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0.0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0.0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0.0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
 var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0.0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0.0, $201 = 0, $202 = 0.0, $203 = 0.0, $204 = 0.0, $205 = 0, $206 = 0, $207 = 0;
 var $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0.0, $213 = 0.0, $214 = 0.0, $215 = 0.0, $216 = 0.0, $217 = 0.0, $218 = 0.0, $219 = 0.0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0;
 var $226 = 0.0, $227 = 0.0, $228 = 0.0, $229 = 0.0, $23 = 0.0, $230 = 0.0, $231 = 0.0, $232 = 0.0, $233 = 0.0, $234 = 0.0, $235 = 0, $236 = 0, $237 = 0.0, $238 = 0.0, $239 = 0.0, $24 = 0.0, $240 = 0.0, $241 = 0, $242 = 0, $243 = 0;
 var $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0.0, $260 = 0, $261 = 0;
 var $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0;
 var $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0.0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0;
 var $299 = 0, $3 = 0.0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0;
 var $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0.0, $330 = 0, $331 = 0, $34 = 0.0, $35 = 0.0;
 var $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0, $5 = 0.0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $face_num = 0, $ifm = 0, $ifp = 0, $ix = 0, $iy = 0, $jm = 0, $jm2 = 0, $jp = 0, $jp1 = 0, $ntt = 0;
 var $temp1 = 0.0, $temp2 = 0.0, $tmp = 0.0, $tp = 0.0, $tt = 0.0, $za = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0;
 $2 = sp + 24|0;
 $jp = sp + 56|0;
 $jm = sp;
 $ifp = sp + 88|0;
 $ifm = sp + 40|0;
 $6 = $2;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $3 = $z;
 $4 = $s;
 $5 = $phi;
 $10 = $3;
 $11 = (+Math_abs((+$10)));
 $za = $11;
 $12 = $5;
 $13 = (+_fmodulo($12,6.283185307179586232));
 $14 = $13 * 0.636619772367581382433;
 $tt = $14;
 $15 = $za;
 $16 = $15 <= 0.666666666666666629659;
 if ($16) {
  $17 = $2;
  $18 = $17;
  $19 = HEAP32[$18>>2]|0;
  $20 = (($17) + 4)|0;
  $21 = $20;
  $22 = HEAP32[$21>>2]|0;
  $23 = (+($19>>>0)) + (4294967296.0*(+($22|0)));
  $24 = $tt;
  $25 = 0.5 + $24;
  $26 = $23 * $25;
  $temp1 = $26;
  $27 = $2;
  $28 = $27;
  $29 = HEAP32[$28>>2]|0;
  $30 = (($27) + 4)|0;
  $31 = $30;
  $32 = HEAP32[$31>>2]|0;
  $33 = (+($29>>>0)) + (4294967296.0*(+($32|0)));
  $34 = $3;
  $35 = $34 * 0.75;
  $36 = $33 * $35;
  $temp2 = $36;
  $37 = $temp1;
  $38 = $temp2;
  $39 = $37 - $38;
  $40 = (~~$39)>>>0;
  $41 = +Math_abs($39) >= 1.0 ? $39 > 0.0 ? (Math_min(+Math_floor($39 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($39 - +(~~$39 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $42 = $jp;
  $43 = $42;
  HEAP32[$43>>2] = $40;
  $44 = (($42) + 4)|0;
  $45 = $44;
  HEAP32[$45>>2] = $41;
  $46 = $temp1;
  $47 = $temp2;
  $48 = $46 + $47;
  $49 = (~~$48)>>>0;
  $50 = +Math_abs($48) >= 1.0 ? $48 > 0.0 ? (Math_min(+Math_floor($48 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($48 - +(~~$48 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $51 = $jm;
  $52 = $51;
  HEAP32[$52>>2] = $49;
  $53 = (($51) + 4)|0;
  $54 = $53;
  HEAP32[$54>>2] = $50;
  $55 = $jp;
  $56 = $55;
  $57 = HEAP32[$56>>2]|0;
  $58 = (($55) + 4)|0;
  $59 = $58;
  $60 = HEAP32[$59>>2]|0;
  $61 = $2;
  $62 = $61;
  $63 = HEAP32[$62>>2]|0;
  $64 = (($61) + 4)|0;
  $65 = $64;
  $66 = HEAP32[$65>>2]|0;
  $67 = (___divdi3(($57|0),($60|0),($63|0),($66|0))|0);
  $68 = tempRet0;
  $69 = $ifp;
  $70 = $69;
  HEAP32[$70>>2] = $67;
  $71 = (($69) + 4)|0;
  $72 = $71;
  HEAP32[$72>>2] = $68;
  $73 = $jm;
  $74 = $73;
  $75 = HEAP32[$74>>2]|0;
  $76 = (($73) + 4)|0;
  $77 = $76;
  $78 = HEAP32[$77>>2]|0;
  $79 = $2;
  $80 = $79;
  $81 = HEAP32[$80>>2]|0;
  $82 = (($79) + 4)|0;
  $83 = $82;
  $84 = HEAP32[$83>>2]|0;
  $85 = (___divdi3(($75|0),($78|0),($81|0),($84|0))|0);
  $86 = tempRet0;
  $87 = $ifm;
  $88 = $87;
  HEAP32[$88>>2] = $85;
  $89 = (($87) + 4)|0;
  $90 = $89;
  HEAP32[$90>>2] = $86;
  $91 = $ifp;
  $92 = $91;
  $93 = HEAP32[$92>>2]|0;
  $94 = (($91) + 4)|0;
  $95 = $94;
  $96 = HEAP32[$95>>2]|0;
  $97 = $ifm;
  $98 = $97;
  $99 = HEAP32[$98>>2]|0;
  $100 = (($97) + 4)|0;
  $101 = $100;
  $102 = HEAP32[$101>>2]|0;
  $103 = ($93|0)==($99|0);
  $104 = ($96|0)==($102|0);
  $105 = $103 & $104;
  if ($105) {
   $106 = $ifp;
   $107 = $106;
   $108 = HEAP32[$107>>2]|0;
   $109 = (($106) + 4)|0;
   $110 = $109;
   $111 = HEAP32[$110>>2]|0;
   $112 = ($108|0)==(4);
   $113 = ($111|0)==(0);
   $114 = $112 & $113;
   if ($114) {
    $123 = 4;$331 = 0;
   } else {
    $115 = $ifp;
    $116 = $115;
    $117 = HEAP32[$116>>2]|0;
    $118 = (($115) + 4)|0;
    $119 = $118;
    $120 = HEAP32[$119>>2]|0;
    $121 = (_i64Add(($117|0),($120|0),4,0)|0);
    $122 = tempRet0;
    $123 = $121;$331 = $122;
   }
   $face_num = $123;
  } else {
   $124 = $ifp;
   $125 = $124;
   $126 = HEAP32[$125>>2]|0;
   $127 = (($124) + 4)|0;
   $128 = $127;
   $129 = HEAP32[$128>>2]|0;
   $130 = $ifm;
   $131 = $130;
   $132 = HEAP32[$131>>2]|0;
   $133 = (($130) + 4)|0;
   $134 = $133;
   $135 = HEAP32[$134>>2]|0;
   $136 = ($129|0)<($135|0);
   $137 = ($129|0)==($135|0);
   $138 = ($126>>>0)<($132>>>0);
   $139 = $137 & $138;
   $140 = $136 | $139;
   if ($140) {
    $141 = $ifp;
    $142 = $141;
    $143 = HEAP32[$142>>2]|0;
    $144 = (($141) + 4)|0;
    $145 = $144;
    $146 = HEAP32[$145>>2]|0;
    $face_num = $143;
   } else {
    $147 = $ifm;
    $148 = $147;
    $149 = HEAP32[$148>>2]|0;
    $150 = (($147) + 4)|0;
    $151 = $150;
    $152 = HEAP32[$151>>2]|0;
    $153 = (_i64Add(($149|0),($152|0),8,0)|0);
    $154 = tempRet0;
    $face_num = $153;
   }
  }
  $155 = $jm;
  $156 = $155;
  $157 = HEAP32[$156>>2]|0;
  $158 = (($155) + 4)|0;
  $159 = $158;
  $160 = HEAP32[$159>>2]|0;
  $161 = $2;
  $162 = $161;
  $163 = HEAP32[$162>>2]|0;
  $164 = (($161) + 4)|0;
  $165 = $164;
  $166 = HEAP32[$165>>2]|0;
  $167 = (_i64Subtract(($163|0),($166|0),1,0)|0);
  $168 = tempRet0;
  $169 = $157 & $167;
  $160 & $168;
  $ix = $169;
  $170 = $2;
  $171 = $170;
  $172 = HEAP32[$171>>2]|0;
  $173 = (($170) + 4)|0;
  $174 = $173;
  $175 = HEAP32[$174>>2]|0;
  $176 = $jp;
  $177 = $176;
  $178 = HEAP32[$177>>2]|0;
  $179 = (($176) + 4)|0;
  $180 = $179;
  $181 = HEAP32[$180>>2]|0;
  $182 = $2;
  $183 = $182;
  $184 = HEAP32[$183>>2]|0;
  $185 = (($182) + 4)|0;
  $186 = $185;
  $187 = HEAP32[$186>>2]|0;
  $188 = (_i64Subtract(($184|0),($187|0),1,0)|0);
  $189 = tempRet0;
  $190 = $178 & $188;
  $191 = $181 & $189;
  $192 = (_i64Subtract(($172|0),($175|0),($190|0),($191|0))|0);
  $193 = tempRet0;
  $194 = (_i64Subtract(($192|0),($193|0),1,0)|0);
  $195 = tempRet0;
  $iy = $194;
  $320 = $2;
  $321 = $320;
  $322 = HEAP32[$321>>2]|0;
  $323 = (($320) + 4)|0;
  $324 = $323;
  $325 = HEAP32[$324>>2]|0;
  $326 = $ix;
  $327 = $iy;
  $328 = $face_num;
  $329 = (_xyf2nest64($322,$325,$326,$327,$328)|0);
  $330 = tempRet0;
  tempRet0 = $330;
  STACKTOP = sp;return ($329|0);
 }
 $196 = $tt;
 $197 = (~~(($196)));
 $ntt = $197;
 $198 = $ntt;
 $199 = ($198|0)>=(4);
 if ($199) {
  $ntt = 3;
 }
 $200 = $tt;
 $201 = $ntt;
 $202 = (+($201|0));
 $203 = $200 - $202;
 $tp = $203;
 $204 = $4;
 $205 = $204 > -2.0;
 if ($205) {
  $206 = $2;
  $207 = $206;
  $208 = HEAP32[$207>>2]|0;
  $209 = (($206) + 4)|0;
  $210 = $209;
  $211 = HEAP32[$210>>2]|0;
  $212 = (+($208>>>0)) + (4294967296.0*(+($211|0)));
  $213 = $4;
  $214 = $212 * $213;
  $215 = $za;
  $216 = 1.0 + $215;
  $217 = $216 / 3.0;
  $218 = (+Math_sqrt((+$217)));
  $219 = $214 / $218;
  $tmp = $219;
 } else {
  $220 = $2;
  $221 = $220;
  $222 = HEAP32[$221>>2]|0;
  $223 = (($220) + 4)|0;
  $224 = $223;
  $225 = HEAP32[$224>>2]|0;
  $226 = (+($222>>>0)) + (4294967296.0*(+($225|0)));
  $227 = $za;
  $228 = 1.0 - $227;
  $229 = 3.0 * $228;
  $230 = (+Math_sqrt((+$229)));
  $231 = $226 * $230;
  $tmp = $231;
 }
 $232 = $tp;
 $233 = $tmp;
 $234 = $232 * $233;
 $235 = (~~$234)>>>0;
 $236 = +Math_abs($234) >= 1.0 ? $234 > 0.0 ? (Math_min(+Math_floor($234 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($234 - +(~~$234 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $jp1 = $235;
 $237 = $tp;
 $238 = 1.0 - $237;
 $239 = $tmp;
 $240 = $238 * $239;
 $241 = (~~$240)>>>0;
 $242 = +Math_abs($240) >= 1.0 ? $240 > 0.0 ? (Math_min(+Math_floor($240 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($240 - +(~~$240 >>> 0)) / 4294967296.0) >>> 0 : 0;
 $jm2 = $241;
 $243 = $jp1;
 $244 = ($243|0)<(0);
 $245 = $244 << 31 >> 31;
 $246 = $2;
 $247 = $246;
 $248 = HEAP32[$247>>2]|0;
 $249 = (($246) + 4)|0;
 $250 = $249;
 $251 = HEAP32[$250>>2]|0;
 $252 = ($245|0)>($251|0);
 $253 = ($245|0)==($251|0);
 $254 = ($243>>>0)>=($248>>>0);
 $255 = $253 & $254;
 $256 = $252 | $255;
 if ($256) {
  $257 = $2;
  $258 = $257;
  $259 = HEAP32[$258>>2]|0;
  $260 = (($257) + 4)|0;
  $261 = $260;
  $262 = HEAP32[$261>>2]|0;
  $263 = (_i64Subtract(($259|0),($262|0),1,0)|0);
  $264 = tempRet0;
  $jp1 = $263;
 }
 $265 = $jm2;
 $266 = ($265|0)<(0);
 $267 = $266 << 31 >> 31;
 $268 = $2;
 $269 = $268;
 $270 = HEAP32[$269>>2]|0;
 $271 = (($268) + 4)|0;
 $272 = $271;
 $273 = HEAP32[$272>>2]|0;
 $274 = ($267|0)>($273|0);
 $275 = ($267|0)==($273|0);
 $276 = ($265>>>0)>=($270>>>0);
 $277 = $275 & $276;
 $278 = $274 | $277;
 if ($278) {
  $279 = $2;
  $280 = $279;
  $281 = HEAP32[$280>>2]|0;
  $282 = (($279) + 4)|0;
  $283 = $282;
  $284 = HEAP32[$283>>2]|0;
  $285 = (_i64Subtract(($281|0),($284|0),1,0)|0);
  $286 = tempRet0;
  $jm2 = $285;
 }
 $287 = $3;
 $288 = $287 >= 0.0;
 if ($288) {
  $289 = $ntt;
  $face_num = $289;
  $290 = $2;
  $291 = $290;
  $292 = HEAP32[$291>>2]|0;
  $293 = (($290) + 4)|0;
  $294 = $293;
  $295 = HEAP32[$294>>2]|0;
  $296 = $jm2;
  $297 = ($296|0)<(0);
  $298 = $297 << 31 >> 31;
  $299 = (_i64Subtract(($292|0),($295|0),($296|0),($298|0))|0);
  $300 = tempRet0;
  $301 = (_i64Subtract(($299|0),($300|0),1,0)|0);
  $302 = tempRet0;
  $ix = $301;
  $303 = $2;
  $304 = $303;
  $305 = HEAP32[$304>>2]|0;
  $306 = (($303) + 4)|0;
  $307 = $306;
  $308 = HEAP32[$307>>2]|0;
  $309 = $jp1;
  $310 = ($309|0)<(0);
  $311 = $310 << 31 >> 31;
  $312 = (_i64Subtract(($305|0),($308|0),($309|0),($311|0))|0);
  $313 = tempRet0;
  $314 = (_i64Subtract(($312|0),($313|0),1,0)|0);
  $315 = tempRet0;
  $iy = $314;
 } else {
  $316 = $ntt;
  $317 = (($316) + 8)|0;
  $face_num = $317;
  $318 = $jp1;
  $ix = $318;
  $319 = $jm2;
  $iy = $319;
 }
 $320 = $2;
 $321 = $320;
 $322 = HEAP32[$321>>2]|0;
 $323 = (($320) + 4)|0;
 $324 = $323;
 $325 = HEAP32[$324>>2]|0;
 $326 = $ix;
 $327 = $iy;
 $328 = $face_num;
 $329 = (_xyf2nest64($322,$325,$326,$327,$328)|0);
 $330 = tempRet0;
 tempRet0 = $330;
 STACKTOP = sp;return ($329|0);
}
function _vec2pix_ring64($0,$1,$vec,$ipix) {
 $0 = $0|0;
 $1 = $1|0;
 $vec = $vec|0;
 $ipix = $ipix|0;
 var $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0.0, $17 = 0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0.0, $25 = 0, $26 = 0, $27 = 0.0, $28 = 0.0;
 var $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0, $46 = 0.0;
 var $47 = 0, $48 = 0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0;
 var $65 = 0, $66 = 0.0, $67 = 0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $8 = 0, $9 = 0, $cth = 0.0, $sth = 0.0, $vlen = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $2 = sp + 24|0;
 $5 = $2;
 $6 = $5;
 HEAP32[$6>>2] = $0;
 $7 = (($5) + 4)|0;
 $8 = $7;
 HEAP32[$8>>2] = $1;
 $3 = $vec;
 $4 = $ipix;
 $9 = $3;
 $10 = +HEAPF64[$9>>3];
 $11 = $3;
 $12 = +HEAPF64[$11>>3];
 $13 = $10 * $12;
 $14 = $3;
 $15 = (($14) + 8|0);
 $16 = +HEAPF64[$15>>3];
 $17 = $3;
 $18 = (($17) + 8|0);
 $19 = +HEAPF64[$18>>3];
 $20 = $16 * $19;
 $21 = $13 + $20;
 $22 = $3;
 $23 = (($22) + 16|0);
 $24 = +HEAPF64[$23>>3];
 $25 = $3;
 $26 = (($25) + 16|0);
 $27 = +HEAPF64[$26>>3];
 $28 = $24 * $27;
 $29 = $21 + $28;
 $30 = (+Math_sqrt((+$29)));
 $vlen = $30;
 $31 = $3;
 $32 = (($31) + 16|0);
 $33 = +HEAPF64[$32>>3];
 $34 = $vlen;
 $35 = $33 / $34;
 $cth = $35;
 $36 = $cth;
 $37 = (+Math_abs((+$36)));
 $38 = $37 > 0.989999999999999991118;
 if ($38) {
  $39 = $3;
  $40 = +HEAPF64[$39>>3];
  $41 = $3;
  $42 = +HEAPF64[$41>>3];
  $43 = $40 * $42;
  $44 = $3;
  $45 = (($44) + 8|0);
  $46 = +HEAPF64[$45>>3];
  $47 = $3;
  $48 = (($47) + 8|0);
  $49 = +HEAPF64[$48>>3];
  $50 = $46 * $49;
  $51 = $43 + $50;
  $52 = (+Math_sqrt((+$51)));
  $53 = $vlen;
  $54 = $52 / $53;
  $55 = $54;
 } else {
  $55 = -5.0;
 }
 $sth = $55;
 $56 = $2;
 $57 = $56;
 $58 = HEAP32[$57>>2]|0;
 $59 = (($56) + 4)|0;
 $60 = $59;
 $61 = HEAP32[$60>>2]|0;
 $62 = $cth;
 $63 = $sth;
 $64 = $3;
 $65 = (($64) + 8|0);
 $66 = +HEAPF64[$65>>3];
 $67 = $3;
 $68 = +HEAPF64[$67>>3];
 $69 = (+Math_atan2((+$66),(+$68)));
 $70 = (_ang2pix_ring_z_phi64($58,$61,$62,$63,$69)|0);
 $71 = tempRet0;
 $72 = $4;
 $73 = $72;
 $74 = $73;
 HEAP32[$74>>2] = $70;
 $75 = (($73) + 4)|0;
 $76 = $75;
 HEAP32[$76>>2] = $71;
 STACKTOP = sp;return;
}
function _vec2pix_nest64($0,$1,$vec,$ipix) {
 $0 = $0|0;
 $1 = $1|0;
 $vec = $vec|0;
 $ipix = $ipix|0;
 var $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0.0, $17 = 0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0.0, $25 = 0, $26 = 0, $27 = 0.0, $28 = 0.0;
 var $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0, $46 = 0.0;
 var $47 = 0, $48 = 0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0;
 var $65 = 0, $66 = 0.0, $67 = 0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $8 = 0, $9 = 0, $cth = 0.0, $sth = 0.0, $vlen = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $2 = sp + 24|0;
 $5 = $2;
 $6 = $5;
 HEAP32[$6>>2] = $0;
 $7 = (($5) + 4)|0;
 $8 = $7;
 HEAP32[$8>>2] = $1;
 $3 = $vec;
 $4 = $ipix;
 $9 = $3;
 $10 = +HEAPF64[$9>>3];
 $11 = $3;
 $12 = +HEAPF64[$11>>3];
 $13 = $10 * $12;
 $14 = $3;
 $15 = (($14) + 8|0);
 $16 = +HEAPF64[$15>>3];
 $17 = $3;
 $18 = (($17) + 8|0);
 $19 = +HEAPF64[$18>>3];
 $20 = $16 * $19;
 $21 = $13 + $20;
 $22 = $3;
 $23 = (($22) + 16|0);
 $24 = +HEAPF64[$23>>3];
 $25 = $3;
 $26 = (($25) + 16|0);
 $27 = +HEAPF64[$26>>3];
 $28 = $24 * $27;
 $29 = $21 + $28;
 $30 = (+Math_sqrt((+$29)));
 $vlen = $30;
 $31 = $3;
 $32 = (($31) + 16|0);
 $33 = +HEAPF64[$32>>3];
 $34 = $vlen;
 $35 = $33 / $34;
 $cth = $35;
 $36 = $cth;
 $37 = (+Math_abs((+$36)));
 $38 = $37 > 0.989999999999999991118;
 if ($38) {
  $39 = $3;
  $40 = +HEAPF64[$39>>3];
  $41 = $3;
  $42 = +HEAPF64[$41>>3];
  $43 = $40 * $42;
  $44 = $3;
  $45 = (($44) + 8|0);
  $46 = +HEAPF64[$45>>3];
  $47 = $3;
  $48 = (($47) + 8|0);
  $49 = +HEAPF64[$48>>3];
  $50 = $46 * $49;
  $51 = $43 + $50;
  $52 = (+Math_sqrt((+$51)));
  $53 = $vlen;
  $54 = $52 / $53;
  $55 = $54;
 } else {
  $55 = -5.0;
 }
 $sth = $55;
 $56 = $2;
 $57 = $56;
 $58 = HEAP32[$57>>2]|0;
 $59 = (($56) + 4)|0;
 $60 = $59;
 $61 = HEAP32[$60>>2]|0;
 $62 = $cth;
 $63 = $sth;
 $64 = $3;
 $65 = (($64) + 8|0);
 $66 = +HEAPF64[$65>>3];
 $67 = $3;
 $68 = +HEAPF64[$67>>3];
 $69 = (+Math_atan2((+$66),(+$68)));
 $70 = (_ang2pix_nest_z_phi64($58,$61,$62,$63,$69)|0);
 $71 = tempRet0;
 $72 = $4;
 $73 = $72;
 $74 = $73;
 HEAP32[$74>>2] = $70;
 $75 = (($73) + 4)|0;
 $76 = $75;
 HEAP32[$76>>2] = $71;
 STACKTOP = sp;return;
}
function _pix2ang_ring64($0,$1,$2,$3,$theta,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $theta = $theta|0;
 $phi = $phi|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0.0;
 var $30 = 0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0.0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $s = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $4 = sp + 24|0;
 $5 = sp + 16|0;
 $z = sp + 8|0;
 $s = sp;
 $8 = $4;
 $9 = $8;
 HEAP32[$9>>2] = $0;
 $10 = (($8) + 4)|0;
 $11 = $10;
 HEAP32[$11>>2] = $1;
 $12 = $5;
 $13 = $12;
 HEAP32[$13>>2] = $2;
 $14 = (($12) + 4)|0;
 $15 = $14;
 HEAP32[$15>>2] = $3;
 $6 = $theta;
 $7 = $phi;
 $16 = $4;
 $17 = $16;
 $18 = HEAP32[$17>>2]|0;
 $19 = (($16) + 4)|0;
 $20 = $19;
 $21 = HEAP32[$20>>2]|0;
 $22 = $5;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (($22) + 4)|0;
 $26 = $25;
 $27 = HEAP32[$26>>2]|0;
 $28 = $7;
 _pix2ang_ring_z_phi64($18,$21,$24,$27,$z,$s,$28);
 $29 = +HEAPF64[$s>>3];
 $30 = $29 < -2.0;
 if ($30) {
  $31 = +HEAPF64[$z>>3];
  $32 = (+Math_acos((+$31)));
  $37 = $32;
  $36 = $6;
  HEAPF64[$36>>3] = $37;
  STACKTOP = sp;return;
 } else {
  $33 = +HEAPF64[$s>>3];
  $34 = +HEAPF64[$z>>3];
  $35 = (+Math_atan2((+$33),(+$34)));
  $37 = $35;
  $36 = $6;
  HEAPF64[$36>>3] = $37;
  STACKTOP = sp;return;
 }
}
function _pix2ang_ring_z_phi64($0,$1,$2,$3,$z,$s,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $z = $z|0;
 $s = $s|0;
 $phi = $phi|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0.0, $152 = 0.0, $153 = 0.0;
 var $154 = 0.0, $155 = 0.0, $156 = 0, $157 = 0, $158 = 0.0, $159 = 0, $16 = 0, $160 = 0.0, $161 = 0.0, $162 = 0.0, $163 = 0.0, $164 = 0.0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0.0, $173 = 0.0, $174 = 0.0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0.0, $182 = 0.0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
 var $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0.0, $218 = 0.0, $219 = 0.0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0;
 var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0;
 var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
 var $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0;
 var $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0.0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0.0, $334 = 0.0, $335 = 0.0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0.0, $344 = 0.0, $345 = 0.0, $346 = 0.0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0.0;
 var $354 = 0.0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0.0, $387 = 0.0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0.0, $451 = 0.0, $452 = 0.0, $453 = 0.0, $454 = 0.0, $455 = 0, $456 = 0, $457 = 0.0, $458 = 0, $459 = 0.0, $46 = 0, $460 = 0.0, $461 = 0.0;
 var $462 = 0.0, $463 = 0.0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0.0, $472 = 0.0, $473 = 0.0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0.0, $481 = 0.0, $482 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0.0, $66 = 0.0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0.0, $98 = 0.0, $99 = 0, $fact1_ = 0.0;
 var $fact2_ = 0.0, $fodd = 0.0, $ip = 0, $ip3 = 0, $iphi = 0, $iphi2 = 0, $iphi5 = 0, $iring = 0, $iring1 = 0, $iring4 = 0, $ncap_ = 0, $nl2 = 0, $npix_ = 0, $tmp = 0.0, $tmp6 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $4 = sp + 16|0;
 $5 = sp + 88|0;
 $ncap_ = sp + 80|0;
 $npix_ = sp + 96|0;
 $iring = sp + 128|0;
 $iphi = sp + 64|0;
 $ip = sp;
 $iring1 = sp + 72|0;
 $iphi2 = sp + 32|0;
 $nl2 = sp + 104|0;
 $ip3 = sp + 120|0;
 $iring4 = sp + 24|0;
 $iphi5 = sp + 56|0;
 $9 = $4;
 $10 = $9;
 HEAP32[$10>>2] = $0;
 $11 = (($9) + 4)|0;
 $12 = $11;
 HEAP32[$12>>2] = $1;
 $13 = $5;
 $14 = $13;
 HEAP32[$14>>2] = $2;
 $15 = (($13) + 4)|0;
 $16 = $15;
 HEAP32[$16>>2] = $3;
 $6 = $z;
 $7 = $s;
 $8 = $phi;
 $17 = $4;
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = (($17) + 4)|0;
 $21 = $20;
 $22 = HEAP32[$21>>2]|0;
 $23 = $4;
 $24 = $23;
 $25 = HEAP32[$24>>2]|0;
 $26 = (($23) + 4)|0;
 $27 = $26;
 $28 = HEAP32[$27>>2]|0;
 $29 = (_i64Subtract(($25|0),($28|0),1,0)|0);
 $30 = tempRet0;
 $31 = (___muldi3(($19|0),($22|0),($29|0),($30|0))|0);
 $32 = tempRet0;
 $33 = (___muldi3(($31|0),($32|0),2,0)|0);
 $34 = tempRet0;
 $35 = $ncap_;
 $36 = $35;
 HEAP32[$36>>2] = $33;
 $37 = (($35) + 4)|0;
 $38 = $37;
 HEAP32[$38>>2] = $34;
 $39 = $4;
 $40 = $39;
 $41 = HEAP32[$40>>2]|0;
 $42 = (($39) + 4)|0;
 $43 = $42;
 $44 = HEAP32[$43>>2]|0;
 $45 = (___muldi3(12,0,($41|0),($44|0))|0);
 $46 = tempRet0;
 $47 = $4;
 $48 = $47;
 $49 = HEAP32[$48>>2]|0;
 $50 = (($47) + 4)|0;
 $51 = $50;
 $52 = HEAP32[$51>>2]|0;
 $53 = (___muldi3(($45|0),($46|0),($49|0),($52|0))|0);
 $54 = tempRet0;
 $55 = $npix_;
 $56 = $55;
 HEAP32[$56>>2] = $53;
 $57 = (($55) + 4)|0;
 $58 = $57;
 HEAP32[$58>>2] = $54;
 $59 = $npix_;
 $60 = $59;
 $61 = HEAP32[$60>>2]|0;
 $62 = (($59) + 4)|0;
 $63 = $62;
 $64 = HEAP32[$63>>2]|0;
 $65 = (+($61>>>0)) + (4294967296.0*(+($64|0)));
 $66 = 4.0 / $65;
 $fact2_ = $66;
 $67 = $7;
 HEAPF64[$67>>3] = -5.0;
 $68 = $5;
 $69 = $68;
 $70 = HEAP32[$69>>2]|0;
 $71 = (($68) + 4)|0;
 $72 = $71;
 $73 = HEAP32[$72>>2]|0;
 $74 = $ncap_;
 $75 = $74;
 $76 = HEAP32[$75>>2]|0;
 $77 = (($74) + 4)|0;
 $78 = $77;
 $79 = HEAP32[$78>>2]|0;
 $80 = ($73|0)<($79|0);
 $81 = ($73|0)==($79|0);
 $82 = ($70>>>0)<($76>>>0);
 $83 = $81 & $82;
 $84 = $80 | $83;
 if ($84) {
  $85 = $5;
  $86 = $85;
  $87 = HEAP32[$86>>2]|0;
  $88 = (($85) + 4)|0;
  $89 = $88;
  $90 = HEAP32[$89>>2]|0;
  $91 = (___muldi3(2,0,($87|0),($90|0))|0);
  $92 = tempRet0;
  $93 = (_i64Add(1,0,($91|0),($92|0))|0);
  $94 = tempRet0;
  $95 = (_isqrt64($93,$94)|0);
  $96 = (1 + ($95))|0;
  $97 = (+($96|0));
  $98 = 0.5 * $97;
  $99 = (~~$98)>>>0;
  $100 = +Math_abs($98) >= 1.0 ? $98 > 0.0 ? (Math_min(+Math_floor($98 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($98 - +(~~$98 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $101 = $iring;
  $102 = $101;
  HEAP32[$102>>2] = $99;
  $103 = (($101) + 4)|0;
  $104 = $103;
  HEAP32[$104>>2] = $100;
  $105 = $5;
  $106 = $105;
  $107 = HEAP32[$106>>2]|0;
  $108 = (($105) + 4)|0;
  $109 = $108;
  $110 = HEAP32[$109>>2]|0;
  $111 = (_i64Add(($107|0),($110|0),1,0)|0);
  $112 = tempRet0;
  $113 = $iring;
  $114 = $113;
  $115 = HEAP32[$114>>2]|0;
  $116 = (($113) + 4)|0;
  $117 = $116;
  $118 = HEAP32[$117>>2]|0;
  $119 = (___muldi3(2,0,($115|0),($118|0))|0);
  $120 = tempRet0;
  $121 = $iring;
  $122 = $121;
  $123 = HEAP32[$122>>2]|0;
  $124 = (($121) + 4)|0;
  $125 = $124;
  $126 = HEAP32[$125>>2]|0;
  $127 = (_i64Subtract(($123|0),($126|0),1,0)|0);
  $128 = tempRet0;
  $129 = (___muldi3(($119|0),($120|0),($127|0),($128|0))|0);
  $130 = tempRet0;
  $131 = (_i64Subtract(($111|0),($112|0),($129|0),($130|0))|0);
  $132 = tempRet0;
  $133 = $iphi;
  $134 = $133;
  HEAP32[$134>>2] = $131;
  $135 = (($133) + 4)|0;
  $136 = $135;
  HEAP32[$136>>2] = $132;
  $137 = $iring;
  $138 = $137;
  $139 = HEAP32[$138>>2]|0;
  $140 = (($137) + 4)|0;
  $141 = $140;
  $142 = HEAP32[$141>>2]|0;
  $143 = $iring;
  $144 = $143;
  $145 = HEAP32[$144>>2]|0;
  $146 = (($143) + 4)|0;
  $147 = $146;
  $148 = HEAP32[$147>>2]|0;
  $149 = (___muldi3(($139|0),($142|0),($145|0),($148|0))|0);
  $150 = tempRet0;
  $151 = (+($149>>>0)) + (4294967296.0*(+($150|0)));
  $152 = $fact2_;
  $153 = $151 * $152;
  $tmp = $153;
  $154 = $tmp;
  $155 = 1.0 - $154;
  $156 = $6;
  HEAPF64[$156>>3] = $155;
  $157 = $6;
  $158 = +HEAPF64[$157>>3];
  $159 = $158 > 0.989999999999999991118;
  if ($159) {
   $160 = $tmp;
   $161 = $tmp;
   $162 = 2.0 - $161;
   $163 = $160 * $162;
   $164 = (+Math_sqrt((+$163)));
   $165 = $7;
   HEAPF64[$165>>3] = $164;
  }
  $166 = $iphi;
  $167 = $166;
  $168 = HEAP32[$167>>2]|0;
  $169 = (($166) + 4)|0;
  $170 = $169;
  $171 = HEAP32[$170>>2]|0;
  $172 = (+($168>>>0)) + (4294967296.0*(+($171|0)));
  $173 = $172 - 0.5;
  $174 = $173 * 1.570796326794896558;
  $175 = $iring;
  $176 = $175;
  $177 = HEAP32[$176>>2]|0;
  $178 = (($175) + 4)|0;
  $179 = $178;
  $180 = HEAP32[$179>>2]|0;
  $181 = (+($177>>>0)) + (4294967296.0*(+($180|0)));
  $182 = $174 / $181;
  $183 = $8;
  HEAPF64[$183>>3] = $182;
  STACKTOP = sp;return;
 }
 $184 = $5;
 $185 = $184;
 $186 = HEAP32[$185>>2]|0;
 $187 = (($184) + 4)|0;
 $188 = $187;
 $189 = HEAP32[$188>>2]|0;
 $190 = $npix_;
 $191 = $190;
 $192 = HEAP32[$191>>2]|0;
 $193 = (($190) + 4)|0;
 $194 = $193;
 $195 = HEAP32[$194>>2]|0;
 $196 = $ncap_;
 $197 = $196;
 $198 = HEAP32[$197>>2]|0;
 $199 = (($196) + 4)|0;
 $200 = $199;
 $201 = HEAP32[$200>>2]|0;
 $202 = (_i64Subtract(($192|0),($195|0),($198|0),($201|0))|0);
 $203 = tempRet0;
 $204 = ($189|0)<($203|0);
 $205 = ($189|0)==($203|0);
 $206 = ($186>>>0)<($202>>>0);
 $207 = $205 & $206;
 $208 = $204 | $207;
 if ($208) {
  $209 = $4;
  $210 = $209;
  $211 = HEAP32[$210>>2]|0;
  $212 = (($209) + 4)|0;
  $213 = $212;
  $214 = HEAP32[$213>>2]|0;
  $215 = (_bitshift64Shl(($211|0),($214|0),1)|0);
  $216 = tempRet0;
  $217 = (+($215>>>0)) + (4294967296.0*(+($216|0)));
  $218 = $fact2_;
  $219 = $217 * $218;
  $fact1_ = $219;
  $220 = $5;
  $221 = $220;
  $222 = HEAP32[$221>>2]|0;
  $223 = (($220) + 4)|0;
  $224 = $223;
  $225 = HEAP32[$224>>2]|0;
  $226 = $ncap_;
  $227 = $226;
  $228 = HEAP32[$227>>2]|0;
  $229 = (($226) + 4)|0;
  $230 = $229;
  $231 = HEAP32[$230>>2]|0;
  $232 = (_i64Subtract(($222|0),($225|0),($228|0),($231|0))|0);
  $233 = tempRet0;
  $234 = $ip;
  $235 = $234;
  HEAP32[$235>>2] = $232;
  $236 = (($234) + 4)|0;
  $237 = $236;
  HEAP32[$237>>2] = $233;
  $238 = $ip;
  $239 = $238;
  $240 = HEAP32[$239>>2]|0;
  $241 = (($238) + 4)|0;
  $242 = $241;
  $243 = HEAP32[$242>>2]|0;
  $244 = $4;
  $245 = $244;
  $246 = HEAP32[$245>>2]|0;
  $247 = (($244) + 4)|0;
  $248 = $247;
  $249 = HEAP32[$248>>2]|0;
  $250 = (___muldi3(4,0,($246|0),($249|0))|0);
  $251 = tempRet0;
  $252 = (___divdi3(($240|0),($243|0),($250|0),($251|0))|0);
  $253 = tempRet0;
  $254 = $4;
  $255 = $254;
  $256 = HEAP32[$255>>2]|0;
  $257 = (($254) + 4)|0;
  $258 = $257;
  $259 = HEAP32[$258>>2]|0;
  $260 = (_i64Add(($252|0),($253|0),($256|0),($259|0))|0);
  $261 = tempRet0;
  $262 = $iring1;
  $263 = $262;
  HEAP32[$263>>2] = $260;
  $264 = (($262) + 4)|0;
  $265 = $264;
  HEAP32[$265>>2] = $261;
  $266 = $ip;
  $267 = $266;
  $268 = HEAP32[$267>>2]|0;
  $269 = (($266) + 4)|0;
  $270 = $269;
  $271 = HEAP32[$270>>2]|0;
  $272 = $4;
  $273 = $272;
  $274 = HEAP32[$273>>2]|0;
  $275 = (($272) + 4)|0;
  $276 = $275;
  $277 = HEAP32[$276>>2]|0;
  $278 = (___muldi3(4,0,($274|0),($277|0))|0);
  $279 = tempRet0;
  $280 = (___remdi3(($268|0),($271|0),($278|0),($279|0))|0);
  $281 = tempRet0;
  $282 = (_i64Add(($280|0),($281|0),1,0)|0);
  $283 = tempRet0;
  $284 = $iphi2;
  $285 = $284;
  HEAP32[$285>>2] = $282;
  $286 = (($284) + 4)|0;
  $287 = $286;
  HEAP32[$287>>2] = $283;
  $288 = $iring1;
  $289 = $288;
  $290 = HEAP32[$289>>2]|0;
  $291 = (($288) + 4)|0;
  $292 = $291;
  $293 = HEAP32[$292>>2]|0;
  $294 = $4;
  $295 = $294;
  $296 = HEAP32[$295>>2]|0;
  $297 = (($294) + 4)|0;
  $298 = $297;
  $299 = HEAP32[$298>>2]|0;
  $300 = (_i64Add(($290|0),($293|0),($296|0),($299|0))|0);
  $301 = tempRet0;
  $302 = $300 & 1;
  $303 = ($302|0)!=(0);
  $304 = (0)!=(0);
  $305 = $303 | $304;
  $306 = $305 ? 1.0 : 0.5;
  $fodd = $306;
  $307 = $4;
  $308 = $307;
  $309 = HEAP32[$308>>2]|0;
  $310 = (($307) + 4)|0;
  $311 = $310;
  $312 = HEAP32[$311>>2]|0;
  $313 = (___muldi3(2,0,($309|0),($312|0))|0);
  $314 = tempRet0;
  $315 = $nl2;
  $316 = $315;
  HEAP32[$316>>2] = $313;
  $317 = (($315) + 4)|0;
  $318 = $317;
  HEAP32[$318>>2] = $314;
  $319 = $nl2;
  $320 = $319;
  $321 = HEAP32[$320>>2]|0;
  $322 = (($319) + 4)|0;
  $323 = $322;
  $324 = HEAP32[$323>>2]|0;
  $325 = $iring1;
  $326 = $325;
  $327 = HEAP32[$326>>2]|0;
  $328 = (($325) + 4)|0;
  $329 = $328;
  $330 = HEAP32[$329>>2]|0;
  $331 = (_i64Subtract(($321|0),($324|0),($327|0),($330|0))|0);
  $332 = tempRet0;
  $333 = (+($331>>>0)) + (4294967296.0*(+($332|0)));
  $334 = $fact1_;
  $335 = $333 * $334;
  $336 = $6;
  HEAPF64[$336>>3] = $335;
  $337 = $iphi2;
  $338 = $337;
  $339 = HEAP32[$338>>2]|0;
  $340 = (($337) + 4)|0;
  $341 = $340;
  $342 = HEAP32[$341>>2]|0;
  $343 = (+($339>>>0)) + (4294967296.0*(+($342|0)));
  $344 = $fodd;
  $345 = $343 - $344;
  $346 = $345 * 3.141592653589793116;
  $347 = $nl2;
  $348 = $347;
  $349 = HEAP32[$348>>2]|0;
  $350 = (($347) + 4)|0;
  $351 = $350;
  $352 = HEAP32[$351>>2]|0;
  $353 = (+($349>>>0)) + (4294967296.0*(+($352|0)));
  $354 = $346 / $353;
  $355 = $8;
  HEAPF64[$355>>3] = $354;
 } else {
  $356 = $npix_;
  $357 = $356;
  $358 = HEAP32[$357>>2]|0;
  $359 = (($356) + 4)|0;
  $360 = $359;
  $361 = HEAP32[$360>>2]|0;
  $362 = $5;
  $363 = $362;
  $364 = HEAP32[$363>>2]|0;
  $365 = (($362) + 4)|0;
  $366 = $365;
  $367 = HEAP32[$366>>2]|0;
  $368 = (_i64Subtract(($358|0),($361|0),($364|0),($367|0))|0);
  $369 = tempRet0;
  $370 = $ip3;
  $371 = $370;
  HEAP32[$371>>2] = $368;
  $372 = (($370) + 4)|0;
  $373 = $372;
  HEAP32[$373>>2] = $369;
  $374 = $ip3;
  $375 = $374;
  $376 = HEAP32[$375>>2]|0;
  $377 = (($374) + 4)|0;
  $378 = $377;
  $379 = HEAP32[$378>>2]|0;
  $380 = (___muldi3(2,0,($376|0),($379|0))|0);
  $381 = tempRet0;
  $382 = (_i64Subtract(($380|0),($381|0),1,0)|0);
  $383 = tempRet0;
  $384 = (_isqrt64($382,$383)|0);
  $385 = (1 + ($384))|0;
  $386 = (+($385|0));
  $387 = 0.5 * $386;
  $388 = (~~$387)>>>0;
  $389 = +Math_abs($387) >= 1.0 ? $387 > 0.0 ? (Math_min(+Math_floor($387 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($387 - +(~~$387 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $390 = $iring4;
  $391 = $390;
  HEAP32[$391>>2] = $388;
  $392 = (($390) + 4)|0;
  $393 = $392;
  HEAP32[$393>>2] = $389;
  $394 = $iring4;
  $395 = $394;
  $396 = HEAP32[$395>>2]|0;
  $397 = (($394) + 4)|0;
  $398 = $397;
  $399 = HEAP32[$398>>2]|0;
  $400 = (___muldi3(4,0,($396|0),($399|0))|0);
  $401 = tempRet0;
  $402 = (_i64Add(($400|0),($401|0),1,0)|0);
  $403 = tempRet0;
  $404 = $ip3;
  $405 = $404;
  $406 = HEAP32[$405>>2]|0;
  $407 = (($404) + 4)|0;
  $408 = $407;
  $409 = HEAP32[$408>>2]|0;
  $410 = $iring4;
  $411 = $410;
  $412 = HEAP32[$411>>2]|0;
  $413 = (($410) + 4)|0;
  $414 = $413;
  $415 = HEAP32[$414>>2]|0;
  $416 = (___muldi3(2,0,($412|0),($415|0))|0);
  $417 = tempRet0;
  $418 = $iring4;
  $419 = $418;
  $420 = HEAP32[$419>>2]|0;
  $421 = (($418) + 4)|0;
  $422 = $421;
  $423 = HEAP32[$422>>2]|0;
  $424 = (_i64Subtract(($420|0),($423|0),1,0)|0);
  $425 = tempRet0;
  $426 = (___muldi3(($416|0),($417|0),($424|0),($425|0))|0);
  $427 = tempRet0;
  $428 = (_i64Subtract(($406|0),($409|0),($426|0),($427|0))|0);
  $429 = tempRet0;
  $430 = (_i64Subtract(($402|0),($403|0),($428|0),($429|0))|0);
  $431 = tempRet0;
  $432 = $iphi5;
  $433 = $432;
  HEAP32[$433>>2] = $430;
  $434 = (($432) + 4)|0;
  $435 = $434;
  HEAP32[$435>>2] = $431;
  $436 = $iring4;
  $437 = $436;
  $438 = HEAP32[$437>>2]|0;
  $439 = (($436) + 4)|0;
  $440 = $439;
  $441 = HEAP32[$440>>2]|0;
  $442 = $iring4;
  $443 = $442;
  $444 = HEAP32[$443>>2]|0;
  $445 = (($442) + 4)|0;
  $446 = $445;
  $447 = HEAP32[$446>>2]|0;
  $448 = (___muldi3(($438|0),($441|0),($444|0),($447|0))|0);
  $449 = tempRet0;
  $450 = (+($448>>>0)) + (4294967296.0*(+($449|0)));
  $451 = $fact2_;
  $452 = $450 * $451;
  $tmp6 = $452;
  $453 = $tmp6;
  $454 = $453 - 1.0;
  $455 = $6;
  HEAPF64[$455>>3] = $454;
  $456 = $6;
  $457 = +HEAPF64[$456>>3];
  $458 = $457 < -0.989999999999999991118;
  if ($458) {
   $459 = $tmp6;
   $460 = $tmp6;
   $461 = 2.0 - $460;
   $462 = $459 * $461;
   $463 = (+Math_sqrt((+$462)));
   $464 = $7;
   HEAPF64[$464>>3] = $463;
  }
  $465 = $iphi5;
  $466 = $465;
  $467 = HEAP32[$466>>2]|0;
  $468 = (($465) + 4)|0;
  $469 = $468;
  $470 = HEAP32[$469>>2]|0;
  $471 = (+($467>>>0)) + (4294967296.0*(+($470|0)));
  $472 = $471 - 0.5;
  $473 = $472 * 1.570796326794896558;
  $474 = $iring4;
  $475 = $474;
  $476 = HEAP32[$475>>2]|0;
  $477 = (($474) + 4)|0;
  $478 = $477;
  $479 = HEAP32[$478>>2]|0;
  $480 = (+($476>>>0)) + (4294967296.0*(+($479|0)));
  $481 = $473 / $480;
  $482 = $8;
  HEAPF64[$482>>3] = $481;
 }
 STACKTOP = sp;return;
}
function _pix2ang_nest64($0,$1,$2,$3,$theta,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $theta = $theta|0;
 $phi = $phi|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0.0;
 var $30 = 0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0.0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $s = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $4 = sp + 24|0;
 $5 = sp + 16|0;
 $z = sp + 8|0;
 $s = sp;
 $8 = $4;
 $9 = $8;
 HEAP32[$9>>2] = $0;
 $10 = (($8) + 4)|0;
 $11 = $10;
 HEAP32[$11>>2] = $1;
 $12 = $5;
 $13 = $12;
 HEAP32[$13>>2] = $2;
 $14 = (($12) + 4)|0;
 $15 = $14;
 HEAP32[$15>>2] = $3;
 $6 = $theta;
 $7 = $phi;
 $16 = $4;
 $17 = $16;
 $18 = HEAP32[$17>>2]|0;
 $19 = (($16) + 4)|0;
 $20 = $19;
 $21 = HEAP32[$20>>2]|0;
 $22 = $5;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (($22) + 4)|0;
 $26 = $25;
 $27 = HEAP32[$26>>2]|0;
 $28 = $7;
 _pix2ang_nest_z_phi64($18,$21,$24,$27,$z,$s,$28);
 $29 = +HEAPF64[$s>>3];
 $30 = $29 < -2.0;
 if ($30) {
  $31 = +HEAPF64[$z>>3];
  $32 = (+Math_acos((+$31)));
  $37 = $32;
  $36 = $6;
  HEAPF64[$36>>3] = $37;
  STACKTOP = sp;return;
 } else {
  $33 = +HEAPF64[$s>>3];
  $34 = +HEAPF64[$z>>3];
  $35 = (+Math_atan2((+$33),(+$34)));
  $37 = $35;
  $36 = $6;
  HEAPF64[$36>>3] = $37;
  STACKTOP = sp;return;
 }
}
function _pix2ang_nest_z_phi64($0,$1,$2,$3,$z,$s,$phi) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $z = $z|0;
 $s = $s|0;
 $phi = $phi|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0, $146 = 0, $147 = 0.0, $148 = 0, $149 = 0.0, $15 = 0, $150 = 0.0, $151 = 0.0, $152 = 0.0, $153 = 0.0;
 var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
 var $209 = 0, $21 = 0, $210 = 0.0, $211 = 0.0, $212 = 0.0, $213 = 0.0, $214 = 0.0, $215 = 0, $216 = 0, $217 = 0.0, $218 = 0, $219 = 0.0, $22 = 0, $220 = 0.0, $221 = 0.0, $222 = 0.0, $223 = 0.0, $224 = 0, $225 = 0, $226 = 0;
 var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0.0, $238 = 0.0, $239 = 0.0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0;
 var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
 var $263 = 0, $264 = 0, $265 = 0, $266 = 0.0, $267 = 0.0, $268 = 0.0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0;
 var $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0.0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0.0;
 var $408 = 0.0, $409 = 0.0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0.0, $417 = 0.0, $418 = 0.0, $419 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0.0, $56 = 0.0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $face_num = 0, $fact1_ = 0.0, $fact2_ = 0.0, $ix = 0;
 var $iy = 0, $jp = 0, $jr = 0, $kshift = 0, $nl4 = 0, $npix_ = 0, $nr = 0, $tmp = 0.0, $tmp1 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0;
 $4 = sp + 88|0;
 $5 = sp + 32|0;
 $nl4 = sp + 80|0;
 $npix_ = sp + 24|0;
 $face_num = sp + 108|0;
 $ix = sp + 112|0;
 $iy = sp + 116|0;
 $jr = sp + 72|0;
 $nr = sp + 8|0;
 $kshift = sp + 16|0;
 $jp = sp + 40|0;
 $9 = $4;
 $10 = $9;
 HEAP32[$10>>2] = $0;
 $11 = (($9) + 4)|0;
 $12 = $11;
 HEAP32[$12>>2] = $1;
 $13 = $5;
 $14 = $13;
 HEAP32[$14>>2] = $2;
 $15 = (($13) + 4)|0;
 $16 = $15;
 HEAP32[$16>>2] = $3;
 $6 = $z;
 $7 = $s;
 $8 = $phi;
 $17 = $4;
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = (($17) + 4)|0;
 $21 = $20;
 $22 = HEAP32[$21>>2]|0;
 $23 = (___muldi3(($19|0),($22|0),4,0)|0);
 $24 = tempRet0;
 $25 = $nl4;
 $26 = $25;
 HEAP32[$26>>2] = $23;
 $27 = (($25) + 4)|0;
 $28 = $27;
 HEAP32[$28>>2] = $24;
 $29 = $4;
 $30 = $29;
 $31 = HEAP32[$30>>2]|0;
 $32 = (($29) + 4)|0;
 $33 = $32;
 $34 = HEAP32[$33>>2]|0;
 $35 = (___muldi3(12,0,($31|0),($34|0))|0);
 $36 = tempRet0;
 $37 = $4;
 $38 = $37;
 $39 = HEAP32[$38>>2]|0;
 $40 = (($37) + 4)|0;
 $41 = $40;
 $42 = HEAP32[$41>>2]|0;
 $43 = (___muldi3(($35|0),($36|0),($39|0),($42|0))|0);
 $44 = tempRet0;
 $45 = $npix_;
 $46 = $45;
 HEAP32[$46>>2] = $43;
 $47 = (($45) + 4)|0;
 $48 = $47;
 HEAP32[$48>>2] = $44;
 $49 = $npix_;
 $50 = $49;
 $51 = HEAP32[$50>>2]|0;
 $52 = (($49) + 4)|0;
 $53 = $52;
 $54 = HEAP32[$53>>2]|0;
 $55 = (+($51>>>0)) + (4294967296.0*(+($54|0)));
 $56 = 4.0 / $55;
 $fact2_ = $56;
 $57 = $7;
 HEAPF64[$57>>3] = -5.0;
 $58 = $4;
 $59 = $58;
 $60 = HEAP32[$59>>2]|0;
 $61 = (($58) + 4)|0;
 $62 = $61;
 $63 = HEAP32[$62>>2]|0;
 $64 = $5;
 $65 = $64;
 $66 = HEAP32[$65>>2]|0;
 $67 = (($64) + 4)|0;
 $68 = $67;
 $69 = HEAP32[$68>>2]|0;
 _nest2xyf64($60,$63,$66,$69,$ix,$iy,$face_num);
 $70 = HEAP32[$face_num>>2]|0;
 $71 = (648 + ($70<<2)|0);
 $72 = HEAP32[$71>>2]|0;
 $73 = ($72|0)<(0);
 $74 = $73 << 31 >> 31;
 $75 = $4;
 $76 = $75;
 $77 = HEAP32[$76>>2]|0;
 $78 = (($75) + 4)|0;
 $79 = $78;
 $80 = HEAP32[$79>>2]|0;
 $81 = (___muldi3(($72|0),($74|0),($77|0),($80|0))|0);
 $82 = tempRet0;
 $83 = HEAP32[$ix>>2]|0;
 $84 = ($83|0)<(0);
 $85 = $84 << 31 >> 31;
 $86 = (_i64Subtract(($81|0),($82|0),($83|0),($85|0))|0);
 $87 = tempRet0;
 $88 = HEAP32[$iy>>2]|0;
 $89 = ($88|0)<(0);
 $90 = $89 << 31 >> 31;
 $91 = (_i64Subtract(($86|0),($87|0),($88|0),($90|0))|0);
 $92 = tempRet0;
 $93 = (_i64Subtract(($91|0),($92|0),1,0)|0);
 $94 = tempRet0;
 $95 = $jr;
 $96 = $95;
 HEAP32[$96>>2] = $93;
 $97 = (($95) + 4)|0;
 $98 = $97;
 HEAP32[$98>>2] = $94;
 $99 = $jr;
 $100 = $99;
 $101 = HEAP32[$100>>2]|0;
 $102 = (($99) + 4)|0;
 $103 = $102;
 $104 = HEAP32[$103>>2]|0;
 $105 = $4;
 $106 = $105;
 $107 = HEAP32[$106>>2]|0;
 $108 = (($105) + 4)|0;
 $109 = $108;
 $110 = HEAP32[$109>>2]|0;
 $111 = ($104|0)<($110|0);
 $112 = ($104|0)==($110|0);
 $113 = ($101>>>0)<($107>>>0);
 $114 = $112 & $113;
 $115 = $111 | $114;
 if ($115) {
  $116 = $jr;
  $117 = $116;
  $118 = HEAP32[$117>>2]|0;
  $119 = (($116) + 4)|0;
  $120 = $119;
  $121 = HEAP32[$120>>2]|0;
  $122 = $nr;
  $123 = $122;
  HEAP32[$123>>2] = $118;
  $124 = (($122) + 4)|0;
  $125 = $124;
  HEAP32[$125>>2] = $121;
  $126 = $nr;
  $127 = $126;
  $128 = HEAP32[$127>>2]|0;
  $129 = (($126) + 4)|0;
  $130 = $129;
  $131 = HEAP32[$130>>2]|0;
  $132 = $nr;
  $133 = $132;
  $134 = HEAP32[$133>>2]|0;
  $135 = (($132) + 4)|0;
  $136 = $135;
  $137 = HEAP32[$136>>2]|0;
  $138 = (___muldi3(($128|0),($131|0),($134|0),($137|0))|0);
  $139 = tempRet0;
  $140 = (+($138>>>0)) + (4294967296.0*(+($139|0)));
  $141 = $fact2_;
  $142 = $140 * $141;
  $tmp = $142;
  $143 = $tmp;
  $144 = 1.0 - $143;
  $145 = $6;
  HEAPF64[$145>>3] = $144;
  $146 = $6;
  $147 = +HEAPF64[$146>>3];
  $148 = $147 > 0.989999999999999991118;
  if ($148) {
   $149 = $tmp;
   $150 = $tmp;
   $151 = 2.0 - $150;
   $152 = $149 * $151;
   $153 = (+Math_sqrt((+$152)));
   $154 = $7;
   HEAPF64[$154>>3] = $153;
  }
  $155 = $kshift;
  $156 = $155;
  HEAP32[$156>>2] = 0;
  $157 = (($155) + 4)|0;
  $158 = $157;
  HEAP32[$158>>2] = 0;
 } else {
  $159 = $jr;
  $160 = $159;
  $161 = HEAP32[$160>>2]|0;
  $162 = (($159) + 4)|0;
  $163 = $162;
  $164 = HEAP32[$163>>2]|0;
  $165 = $4;
  $166 = $165;
  $167 = HEAP32[$166>>2]|0;
  $168 = (($165) + 4)|0;
  $169 = $168;
  $170 = HEAP32[$169>>2]|0;
  $171 = (___muldi3(3,0,($167|0),($170|0))|0);
  $172 = tempRet0;
  $173 = ($164|0)>($172|0);
  $174 = ($164|0)==($172|0);
  $175 = ($161>>>0)>($171>>>0);
  $176 = $174 & $175;
  $177 = $173 | $176;
  if ($177) {
   $178 = $nl4;
   $179 = $178;
   $180 = HEAP32[$179>>2]|0;
   $181 = (($178) + 4)|0;
   $182 = $181;
   $183 = HEAP32[$182>>2]|0;
   $184 = $jr;
   $185 = $184;
   $186 = HEAP32[$185>>2]|0;
   $187 = (($184) + 4)|0;
   $188 = $187;
   $189 = HEAP32[$188>>2]|0;
   $190 = (_i64Subtract(($180|0),($183|0),($186|0),($189|0))|0);
   $191 = tempRet0;
   $192 = $nr;
   $193 = $192;
   HEAP32[$193>>2] = $190;
   $194 = (($192) + 4)|0;
   $195 = $194;
   HEAP32[$195>>2] = $191;
   $196 = $nr;
   $197 = $196;
   $198 = HEAP32[$197>>2]|0;
   $199 = (($196) + 4)|0;
   $200 = $199;
   $201 = HEAP32[$200>>2]|0;
   $202 = $nr;
   $203 = $202;
   $204 = HEAP32[$203>>2]|0;
   $205 = (($202) + 4)|0;
   $206 = $205;
   $207 = HEAP32[$206>>2]|0;
   $208 = (___muldi3(($198|0),($201|0),($204|0),($207|0))|0);
   $209 = tempRet0;
   $210 = (+($208>>>0)) + (4294967296.0*(+($209|0)));
   $211 = $fact2_;
   $212 = $210 * $211;
   $tmp1 = $212;
   $213 = $tmp1;
   $214 = $213 - 1.0;
   $215 = $6;
   HEAPF64[$215>>3] = $214;
   $216 = $6;
   $217 = +HEAPF64[$216>>3];
   $218 = $217 < -0.989999999999999991118;
   if ($218) {
    $219 = $tmp1;
    $220 = $tmp1;
    $221 = 2.0 - $220;
    $222 = $219 * $221;
    $223 = (+Math_sqrt((+$222)));
    $224 = $7;
    HEAPF64[$224>>3] = $223;
   }
   $225 = $kshift;
   $226 = $225;
   HEAP32[$226>>2] = 0;
   $227 = (($225) + 4)|0;
   $228 = $227;
   HEAP32[$228>>2] = 0;
  } else {
   $229 = $4;
   $230 = $229;
   $231 = HEAP32[$230>>2]|0;
   $232 = (($229) + 4)|0;
   $233 = $232;
   $234 = HEAP32[$233>>2]|0;
   $235 = (_bitshift64Shl(($231|0),($234|0),1)|0);
   $236 = tempRet0;
   $237 = (+($235>>>0)) + (4294967296.0*(+($236|0)));
   $238 = $fact2_;
   $239 = $237 * $238;
   $fact1_ = $239;
   $240 = $4;
   $241 = $240;
   $242 = HEAP32[$241>>2]|0;
   $243 = (($240) + 4)|0;
   $244 = $243;
   $245 = HEAP32[$244>>2]|0;
   $246 = $nr;
   $247 = $246;
   HEAP32[$247>>2] = $242;
   $248 = (($246) + 4)|0;
   $249 = $248;
   HEAP32[$249>>2] = $245;
   $250 = $4;
   $251 = $250;
   $252 = HEAP32[$251>>2]|0;
   $253 = (($250) + 4)|0;
   $254 = $253;
   $255 = HEAP32[$254>>2]|0;
   $256 = (___muldi3(2,0,($252|0),($255|0))|0);
   $257 = tempRet0;
   $258 = $jr;
   $259 = $258;
   $260 = HEAP32[$259>>2]|0;
   $261 = (($258) + 4)|0;
   $262 = $261;
   $263 = HEAP32[$262>>2]|0;
   $264 = (_i64Subtract(($256|0),($257|0),($260|0),($263|0))|0);
   $265 = tempRet0;
   $266 = (+($264>>>0)) + (4294967296.0*(+($265|0)));
   $267 = $fact1_;
   $268 = $266 * $267;
   $269 = $6;
   HEAPF64[$269>>3] = $268;
   $270 = $jr;
   $271 = $270;
   $272 = HEAP32[$271>>2]|0;
   $273 = (($270) + 4)|0;
   $274 = $273;
   $275 = HEAP32[$274>>2]|0;
   $276 = $4;
   $277 = $276;
   $278 = HEAP32[$277>>2]|0;
   $279 = (($276) + 4)|0;
   $280 = $279;
   $281 = HEAP32[$280>>2]|0;
   $282 = (_i64Subtract(($272|0),($275|0),($278|0),($281|0))|0);
   $283 = tempRet0;
   $284 = $282 & 1;
   $285 = $kshift;
   $286 = $285;
   HEAP32[$286>>2] = $284;
   $287 = (($285) + 4)|0;
   $288 = $287;
   HEAP32[$288>>2] = 0;
  }
 }
 $289 = HEAP32[$face_num>>2]|0;
 $290 = (696 + ($289<<2)|0);
 $291 = HEAP32[$290>>2]|0;
 $292 = ($291|0)<(0);
 $293 = $292 << 31 >> 31;
 $294 = $nr;
 $295 = $294;
 $296 = HEAP32[$295>>2]|0;
 $297 = (($294) + 4)|0;
 $298 = $297;
 $299 = HEAP32[$298>>2]|0;
 $300 = (___muldi3(($291|0),($293|0),($296|0),($299|0))|0);
 $301 = tempRet0;
 $302 = HEAP32[$ix>>2]|0;
 $303 = ($302|0)<(0);
 $304 = $303 << 31 >> 31;
 $305 = (_i64Add(($300|0),($301|0),($302|0),($304|0))|0);
 $306 = tempRet0;
 $307 = HEAP32[$iy>>2]|0;
 $308 = ($307|0)<(0);
 $309 = $308 << 31 >> 31;
 $310 = (_i64Subtract(($305|0),($306|0),($307|0),($309|0))|0);
 $311 = tempRet0;
 $312 = (_i64Add(($310|0),($311|0),1,0)|0);
 $313 = tempRet0;
 $314 = $kshift;
 $315 = $314;
 $316 = HEAP32[$315>>2]|0;
 $317 = (($314) + 4)|0;
 $318 = $317;
 $319 = HEAP32[$318>>2]|0;
 $320 = (_i64Add(($312|0),($313|0),($316|0),($319|0))|0);
 $321 = tempRet0;
 $322 = (___divdi3(($320|0),($321|0),2,0)|0);
 $323 = tempRet0;
 $324 = $jp;
 $325 = $324;
 HEAP32[$325>>2] = $322;
 $326 = (($324) + 4)|0;
 $327 = $326;
 HEAP32[$327>>2] = $323;
 $328 = $jp;
 $329 = $328;
 $330 = HEAP32[$329>>2]|0;
 $331 = (($328) + 4)|0;
 $332 = $331;
 $333 = HEAP32[$332>>2]|0;
 $334 = $nl4;
 $335 = $334;
 $336 = HEAP32[$335>>2]|0;
 $337 = (($334) + 4)|0;
 $338 = $337;
 $339 = HEAP32[$338>>2]|0;
 $340 = ($333|0)>($339|0);
 $341 = ($333|0)==($339|0);
 $342 = ($330>>>0)>($336>>>0);
 $343 = $341 & $342;
 $344 = $340 | $343;
 if ($344) {
  $345 = $nl4;
  $346 = $345;
  $347 = HEAP32[$346>>2]|0;
  $348 = (($345) + 4)|0;
  $349 = $348;
  $350 = HEAP32[$349>>2]|0;
  $351 = $jp;
  $352 = $351;
  $353 = HEAP32[$352>>2]|0;
  $354 = (($351) + 4)|0;
  $355 = $354;
  $356 = HEAP32[$355>>2]|0;
  $357 = (_i64Subtract(($353|0),($356|0),($347|0),($350|0))|0);
  $358 = tempRet0;
  $359 = $jp;
  $360 = $359;
  HEAP32[$360>>2] = $357;
  $361 = (($359) + 4)|0;
  $362 = $361;
  HEAP32[$362>>2] = $358;
 }
 $363 = $jp;
 $364 = $363;
 $365 = HEAP32[$364>>2]|0;
 $366 = (($363) + 4)|0;
 $367 = $366;
 $368 = HEAP32[$367>>2]|0;
 $369 = ($368|0)<(0);
 $370 = ($368|0)==(0);
 $371 = ($365>>>0)<(1);
 $372 = $370 & $371;
 $373 = $369 | $372;
 if (!($373)) {
  $392 = $jp;
  $393 = $392;
  $394 = HEAP32[$393>>2]|0;
  $395 = (($392) + 4)|0;
  $396 = $395;
  $397 = HEAP32[$396>>2]|0;
  $398 = (+($394>>>0)) + (4294967296.0*(+($397|0)));
  $399 = $kshift;
  $400 = $399;
  $401 = HEAP32[$400>>2]|0;
  $402 = (($399) + 4)|0;
  $403 = $402;
  $404 = HEAP32[$403>>2]|0;
  $405 = (_i64Add(($401|0),($404|0),1,0)|0);
  $406 = tempRet0;
  $407 = (+($405>>>0)) + (4294967296.0*(+($406|0)));
  $408 = $407 * 0.5;
  $409 = $398 - $408;
  $410 = $nr;
  $411 = $410;
  $412 = HEAP32[$411>>2]|0;
  $413 = (($410) + 4)|0;
  $414 = $413;
  $415 = HEAP32[$414>>2]|0;
  $416 = (+($412>>>0)) + (4294967296.0*(+($415|0)));
  $417 = 1.570796326794896558 / $416;
  $418 = $409 * $417;
  $419 = $8;
  HEAPF64[$419>>3] = $418;
  STACKTOP = sp;return;
 }
 $374 = $nl4;
 $375 = $374;
 $376 = HEAP32[$375>>2]|0;
 $377 = (($374) + 4)|0;
 $378 = $377;
 $379 = HEAP32[$378>>2]|0;
 $380 = $jp;
 $381 = $380;
 $382 = HEAP32[$381>>2]|0;
 $383 = (($380) + 4)|0;
 $384 = $383;
 $385 = HEAP32[$384>>2]|0;
 $386 = (_i64Add(($382|0),($385|0),($376|0),($379|0))|0);
 $387 = tempRet0;
 $388 = $jp;
 $389 = $388;
 HEAP32[$389>>2] = $386;
 $390 = (($388) + 4)|0;
 $391 = $390;
 HEAP32[$391>>2] = $387;
 $392 = $jp;
 $393 = $392;
 $394 = HEAP32[$393>>2]|0;
 $395 = (($392) + 4)|0;
 $396 = $395;
 $397 = HEAP32[$396>>2]|0;
 $398 = (+($394>>>0)) + (4294967296.0*(+($397|0)));
 $399 = $kshift;
 $400 = $399;
 $401 = HEAP32[$400>>2]|0;
 $402 = (($399) + 4)|0;
 $403 = $402;
 $404 = HEAP32[$403>>2]|0;
 $405 = (_i64Add(($401|0),($404|0),1,0)|0);
 $406 = tempRet0;
 $407 = (+($405>>>0)) + (4294967296.0*(+($406|0)));
 $408 = $407 * 0.5;
 $409 = $398 - $408;
 $410 = $nr;
 $411 = $410;
 $412 = HEAP32[$411>>2]|0;
 $413 = (($410) + 4)|0;
 $414 = $413;
 $415 = HEAP32[$414>>2]|0;
 $416 = (+($412>>>0)) + (4294967296.0*(+($415|0)));
 $417 = 1.570796326794896558 / $416;
 $418 = $409 * $417;
 $419 = $8;
 HEAPF64[$419>>3] = $418;
 STACKTOP = sp;return;
}
function _pix2vec_ring64($0,$1,$2,$3,$vec) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $vec = $vec|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0.0, $28 = 0, $29 = 0.0;
 var $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0, $46 = 0.0, $47 = 0, $48 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phi = 0, $stheta = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $4 = sp + 32|0;
 $5 = sp + 24|0;
 $z = sp + 16|0;
 $phi = sp + 8|0;
 $stheta = sp;
 $7 = $4;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $11 = $5;
 $12 = $11;
 HEAP32[$12>>2] = $2;
 $13 = (($11) + 4)|0;
 $14 = $13;
 HEAP32[$14>>2] = $3;
 $6 = $vec;
 $15 = $4;
 $16 = $15;
 $17 = HEAP32[$16>>2]|0;
 $18 = (($15) + 4)|0;
 $19 = $18;
 $20 = HEAP32[$19>>2]|0;
 $21 = $5;
 $22 = $21;
 $23 = HEAP32[$22>>2]|0;
 $24 = (($21) + 4)|0;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 _pix2ang_ring_z_phi64($17,$20,$23,$26,$z,$stheta,$phi);
 $27 = +HEAPF64[$stheta>>3];
 $28 = $27 < -2.0;
 if ($28) {
  $29 = +HEAPF64[$z>>3];
  $30 = 1.0 - $29;
  $31 = +HEAPF64[$z>>3];
  $32 = 1.0 + $31;
  $33 = $30 * $32;
  $34 = (+Math_sqrt((+$33)));
  HEAPF64[$stheta>>3] = $34;
 }
 $35 = +HEAPF64[$stheta>>3];
 $36 = +HEAPF64[$phi>>3];
 $37 = (+Math_cos((+$36)));
 $38 = $35 * $37;
 $39 = $6;
 HEAPF64[$39>>3] = $38;
 $40 = +HEAPF64[$stheta>>3];
 $41 = +HEAPF64[$phi>>3];
 $42 = (+Math_sin((+$41)));
 $43 = $40 * $42;
 $44 = $6;
 $45 = (($44) + 8|0);
 HEAPF64[$45>>3] = $43;
 $46 = +HEAPF64[$z>>3];
 $47 = $6;
 $48 = (($47) + 16|0);
 HEAPF64[$48>>3] = $46;
 STACKTOP = sp;return;
}
function _pix2vec_nest64($0,$1,$2,$3,$vec) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $vec = $vec|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0.0, $28 = 0, $29 = 0.0;
 var $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0, $46 = 0.0, $47 = 0, $48 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phi = 0, $stheta = 0, $z = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $4 = sp + 32|0;
 $5 = sp + 24|0;
 $z = sp + 16|0;
 $phi = sp + 8|0;
 $stheta = sp;
 $7 = $4;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $11 = $5;
 $12 = $11;
 HEAP32[$12>>2] = $2;
 $13 = (($11) + 4)|0;
 $14 = $13;
 HEAP32[$14>>2] = $3;
 $6 = $vec;
 $15 = $4;
 $16 = $15;
 $17 = HEAP32[$16>>2]|0;
 $18 = (($15) + 4)|0;
 $19 = $18;
 $20 = HEAP32[$19>>2]|0;
 $21 = $5;
 $22 = $21;
 $23 = HEAP32[$22>>2]|0;
 $24 = (($21) + 4)|0;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 _pix2ang_nest_z_phi64($17,$20,$23,$26,$z,$stheta,$phi);
 $27 = +HEAPF64[$stheta>>3];
 $28 = $27 < -2.0;
 if ($28) {
  $29 = +HEAPF64[$z>>3];
  $30 = 1.0 - $29;
  $31 = +HEAPF64[$z>>3];
  $32 = 1.0 + $31;
  $33 = $30 * $32;
  $34 = (+Math_sqrt((+$33)));
  HEAPF64[$stheta>>3] = $34;
 }
 $35 = +HEAPF64[$stheta>>3];
 $36 = +HEAPF64[$phi>>3];
 $37 = (+Math_cos((+$36)));
 $38 = $35 * $37;
 $39 = $6;
 HEAPF64[$39>>3] = $38;
 $40 = +HEAPF64[$stheta>>3];
 $41 = +HEAPF64[$phi>>3];
 $42 = (+Math_sin((+$41)));
 $43 = $40 * $42;
 $44 = $6;
 $45 = (($44) + 8|0);
 HEAPF64[$45>>3] = $43;
 $46 = +HEAPF64[$z>>3];
 $47 = $6;
 $48 = (($47) + 16|0);
 HEAPF64[$48>>3] = $46;
 STACKTOP = sp;return;
}
function _nest2ring64($0,$1,$2,$3,$ipring) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $ipring = $ipring|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $face_num = 0, $ix = 0, $iy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $4 = sp + 8|0;
 $5 = sp;
 $ix = sp + 24|0;
 $iy = sp + 20|0;
 $face_num = sp + 16|0;
 $7 = $4;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $11 = $5;
 $12 = $11;
 HEAP32[$12>>2] = $2;
 $13 = (($11) + 4)|0;
 $14 = $13;
 HEAP32[$14>>2] = $3;
 $6 = $ipring;
 $15 = $4;
 $16 = $15;
 $17 = HEAP32[$16>>2]|0;
 $18 = (($15) + 4)|0;
 $19 = $18;
 $20 = HEAP32[$19>>2]|0;
 $21 = $4;
 $22 = $21;
 $23 = HEAP32[$22>>2]|0;
 $24 = (($21) + 4)|0;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 $27 = (_i64Subtract(($23|0),($26|0),1,0)|0);
 $28 = tempRet0;
 $29 = $17 & $27;
 $30 = $20 & $28;
 $31 = ($29|0)!=(0);
 $32 = ($30|0)!=(0);
 $33 = $31 | $32;
 if ($33) {
  $34 = $6;
  $35 = $34;
  $36 = $35;
  HEAP32[$36>>2] = -1;
  $37 = (($35) + 4)|0;
  $38 = $37;
  HEAP32[$38>>2] = -1;
  STACKTOP = sp;return;
 } else {
  $39 = $4;
  $40 = $39;
  $41 = HEAP32[$40>>2]|0;
  $42 = (($39) + 4)|0;
  $43 = $42;
  $44 = HEAP32[$43>>2]|0;
  $45 = $5;
  $46 = $45;
  $47 = HEAP32[$46>>2]|0;
  $48 = (($45) + 4)|0;
  $49 = $48;
  $50 = HEAP32[$49>>2]|0;
  _nest2xyf64($41,$44,$47,$50,$ix,$iy,$face_num);
  $51 = $4;
  $52 = $51;
  $53 = HEAP32[$52>>2]|0;
  $54 = (($51) + 4)|0;
  $55 = $54;
  $56 = HEAP32[$55>>2]|0;
  $57 = HEAP32[$ix>>2]|0;
  $58 = HEAP32[$iy>>2]|0;
  $59 = HEAP32[$face_num>>2]|0;
  $60 = (_xyf2ring64($53,$56,$57,$58,$59)|0);
  $61 = tempRet0;
  $62 = $6;
  $63 = $62;
  $64 = $63;
  HEAP32[$64>>2] = $60;
  $65 = (($63) + 4)|0;
  $66 = $65;
  HEAP32[$66>>2] = $61;
  STACKTOP = sp;return;
 }
}
function _nest2xyf64($0,$1,$2,$3,$ix,$iy,$face_num) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $npface_ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $4 = sp + 16|0;
 $5 = sp + 8|0;
 $npface_ = sp;
 $9 = $4;
 $10 = $9;
 HEAP32[$10>>2] = $0;
 $11 = (($9) + 4)|0;
 $12 = $11;
 HEAP32[$12>>2] = $1;
 $13 = $5;
 $14 = $13;
 HEAP32[$14>>2] = $2;
 $15 = (($13) + 4)|0;
 $16 = $15;
 HEAP32[$16>>2] = $3;
 $6 = $ix;
 $7 = $iy;
 $8 = $face_num;
 $17 = $4;
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = (($17) + 4)|0;
 $21 = $20;
 $22 = HEAP32[$21>>2]|0;
 $23 = $4;
 $24 = $23;
 $25 = HEAP32[$24>>2]|0;
 $26 = (($23) + 4)|0;
 $27 = $26;
 $28 = HEAP32[$27>>2]|0;
 $29 = (___muldi3(($19|0),($22|0),($25|0),($28|0))|0);
 $30 = tempRet0;
 $31 = $npface_;
 $32 = $31;
 HEAP32[$32>>2] = $29;
 $33 = (($31) + 4)|0;
 $34 = $33;
 HEAP32[$34>>2] = $30;
 $35 = $5;
 $36 = $35;
 $37 = HEAP32[$36>>2]|0;
 $38 = (($35) + 4)|0;
 $39 = $38;
 $40 = HEAP32[$39>>2]|0;
 $41 = $npface_;
 $42 = $41;
 $43 = HEAP32[$42>>2]|0;
 $44 = (($41) + 4)|0;
 $45 = $44;
 $46 = HEAP32[$45>>2]|0;
 $47 = (___divdi3(($37|0),($40|0),($43|0),($46|0))|0);
 $48 = tempRet0;
 $49 = $8;
 HEAP32[$49>>2] = $47;
 $50 = $npface_;
 $51 = $50;
 $52 = HEAP32[$51>>2]|0;
 $53 = (($50) + 4)|0;
 $54 = $53;
 $55 = HEAP32[$54>>2]|0;
 $56 = (_i64Subtract(($52|0),($55|0),1,0)|0);
 $57 = tempRet0;
 $58 = $5;
 $59 = $58;
 $60 = HEAP32[$59>>2]|0;
 $61 = (($58) + 4)|0;
 $62 = $61;
 $63 = HEAP32[$62>>2]|0;
 $64 = $60 & $56;
 $65 = $63 & $57;
 $66 = $5;
 $67 = $66;
 HEAP32[$67>>2] = $64;
 $68 = (($66) + 4)|0;
 $69 = $68;
 HEAP32[$69>>2] = $65;
 $70 = $5;
 $71 = $70;
 $72 = HEAP32[$71>>2]|0;
 $73 = (($70) + 4)|0;
 $74 = $73;
 $75 = HEAP32[$74>>2]|0;
 $76 = (_compress_bits64($72,$75)|0);
 $77 = tempRet0;
 $78 = $6;
 HEAP32[$78>>2] = $76;
 $79 = $5;
 $80 = $79;
 $81 = HEAP32[$80>>2]|0;
 $82 = (($79) + 4)|0;
 $83 = $82;
 $84 = HEAP32[$83>>2]|0;
 $85 = (_bitshift64Ashr(($81|0),($84|0),1)|0);
 $86 = tempRet0;
 $87 = (_compress_bits64($85,$86)|0);
 $88 = tempRet0;
 $89 = $7;
 HEAP32[$89>>2] = $87;
 STACKTOP = sp;return;
}
function _xyf2ring64($0,$1,$ix,$iy,$face_num) {
 $0 = $0|0;
 $1 = $1|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
 var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0;
 var $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0;
 var $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0;
 var $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0;
 var $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0;
 var $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0;
 var $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0;
 var $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0;
 var $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0;
 var $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0;
 var $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0;
 var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0;
 var $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0;
 var $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0;
 var $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $jp = 0, $jr = 0, $kshift = 0, $n_before = 0, $ncap_ = 0, $nl4 = 0, $nr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $2 = sp;
 $nl4 = sp + 8|0;
 $jr = sp + 56|0;
 $jp = sp + 24|0;
 $nr = sp + 16|0;
 $kshift = sp + 48|0;
 $n_before = sp + 40|0;
 $ncap_ = sp + 32|0;
 $6 = $2;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $3 = $ix;
 $4 = $iy;
 $5 = $face_num;
 $10 = $2;
 $11 = $10;
 $12 = HEAP32[$11>>2]|0;
 $13 = (($10) + 4)|0;
 $14 = $13;
 $15 = HEAP32[$14>>2]|0;
 $16 = (___muldi3(4,0,($12|0),($15|0))|0);
 $17 = tempRet0;
 $18 = $nl4;
 $19 = $18;
 HEAP32[$19>>2] = $16;
 $20 = (($18) + 4)|0;
 $21 = $20;
 HEAP32[$21>>2] = $17;
 $22 = $5;
 $23 = (648 + ($22<<2)|0);
 $24 = HEAP32[$23>>2]|0;
 $25 = ($24|0)<(0);
 $26 = $25 << 31 >> 31;
 $27 = $2;
 $28 = $27;
 $29 = HEAP32[$28>>2]|0;
 $30 = (($27) + 4)|0;
 $31 = $30;
 $32 = HEAP32[$31>>2]|0;
 $33 = (___muldi3(($24|0),($26|0),($29|0),($32|0))|0);
 $34 = tempRet0;
 $35 = $3;
 $36 = ($35|0)<(0);
 $37 = $36 << 31 >> 31;
 $38 = (_i64Subtract(($33|0),($34|0),($35|0),($37|0))|0);
 $39 = tempRet0;
 $40 = $4;
 $41 = ($40|0)<(0);
 $42 = $41 << 31 >> 31;
 $43 = (_i64Subtract(($38|0),($39|0),($40|0),($42|0))|0);
 $44 = tempRet0;
 $45 = (_i64Subtract(($43|0),($44|0),1,0)|0);
 $46 = tempRet0;
 $47 = $jr;
 $48 = $47;
 HEAP32[$48>>2] = $45;
 $49 = (($47) + 4)|0;
 $50 = $49;
 HEAP32[$50>>2] = $46;
 $51 = $jr;
 $52 = $51;
 $53 = HEAP32[$52>>2]|0;
 $54 = (($51) + 4)|0;
 $55 = $54;
 $56 = HEAP32[$55>>2]|0;
 $57 = $2;
 $58 = $57;
 $59 = HEAP32[$58>>2]|0;
 $60 = (($57) + 4)|0;
 $61 = $60;
 $62 = HEAP32[$61>>2]|0;
 $63 = ($56|0)<($62|0);
 $64 = ($56|0)==($62|0);
 $65 = ($53>>>0)<($59>>>0);
 $66 = $64 & $65;
 $67 = $63 | $66;
 if ($67) {
  $68 = $jr;
  $69 = $68;
  $70 = HEAP32[$69>>2]|0;
  $71 = (($68) + 4)|0;
  $72 = $71;
  $73 = HEAP32[$72>>2]|0;
  $74 = $nr;
  $75 = $74;
  HEAP32[$75>>2] = $70;
  $76 = (($74) + 4)|0;
  $77 = $76;
  HEAP32[$77>>2] = $73;
  $78 = $nr;
  $79 = $78;
  $80 = HEAP32[$79>>2]|0;
  $81 = (($78) + 4)|0;
  $82 = $81;
  $83 = HEAP32[$82>>2]|0;
  $84 = (___muldi3(2,0,($80|0),($83|0))|0);
  $85 = tempRet0;
  $86 = $nr;
  $87 = $86;
  $88 = HEAP32[$87>>2]|0;
  $89 = (($86) + 4)|0;
  $90 = $89;
  $91 = HEAP32[$90>>2]|0;
  $92 = (_i64Subtract(($88|0),($91|0),1,0)|0);
  $93 = tempRet0;
  $94 = (___muldi3(($84|0),($85|0),($92|0),($93|0))|0);
  $95 = tempRet0;
  $96 = $n_before;
  $97 = $96;
  HEAP32[$97>>2] = $94;
  $98 = (($96) + 4)|0;
  $99 = $98;
  HEAP32[$99>>2] = $95;
  $100 = $kshift;
  $101 = $100;
  HEAP32[$101>>2] = 0;
  $102 = (($100) + 4)|0;
  $103 = $102;
  HEAP32[$103>>2] = 0;
 } else {
  $104 = $jr;
  $105 = $104;
  $106 = HEAP32[$105>>2]|0;
  $107 = (($104) + 4)|0;
  $108 = $107;
  $109 = HEAP32[$108>>2]|0;
  $110 = $2;
  $111 = $110;
  $112 = HEAP32[$111>>2]|0;
  $113 = (($110) + 4)|0;
  $114 = $113;
  $115 = HEAP32[$114>>2]|0;
  $116 = (___muldi3(3,0,($112|0),($115|0))|0);
  $117 = tempRet0;
  $118 = ($109|0)>($117|0);
  $119 = ($109|0)==($117|0);
  $120 = ($106>>>0)>($116>>>0);
  $121 = $119 & $120;
  $122 = $118 | $121;
  if ($122) {
   $123 = $nl4;
   $124 = $123;
   $125 = HEAP32[$124>>2]|0;
   $126 = (($123) + 4)|0;
   $127 = $126;
   $128 = HEAP32[$127>>2]|0;
   $129 = $jr;
   $130 = $129;
   $131 = HEAP32[$130>>2]|0;
   $132 = (($129) + 4)|0;
   $133 = $132;
   $134 = HEAP32[$133>>2]|0;
   $135 = (_i64Subtract(($125|0),($128|0),($131|0),($134|0))|0);
   $136 = tempRet0;
   $137 = $nr;
   $138 = $137;
   HEAP32[$138>>2] = $135;
   $139 = (($137) + 4)|0;
   $140 = $139;
   HEAP32[$140>>2] = $136;
   $141 = $2;
   $142 = $141;
   $143 = HEAP32[$142>>2]|0;
   $144 = (($141) + 4)|0;
   $145 = $144;
   $146 = HEAP32[$145>>2]|0;
   $147 = (___muldi3(12,0,($143|0),($146|0))|0);
   $148 = tempRet0;
   $149 = $2;
   $150 = $149;
   $151 = HEAP32[$150>>2]|0;
   $152 = (($149) + 4)|0;
   $153 = $152;
   $154 = HEAP32[$153>>2]|0;
   $155 = (___muldi3(($147|0),($148|0),($151|0),($154|0))|0);
   $156 = tempRet0;
   $157 = $nr;
   $158 = $157;
   $159 = HEAP32[$158>>2]|0;
   $160 = (($157) + 4)|0;
   $161 = $160;
   $162 = HEAP32[$161>>2]|0;
   $163 = (_i64Add(($159|0),($162|0),1,0)|0);
   $164 = tempRet0;
   $165 = (___muldi3(2,0,($163|0),($164|0))|0);
   $166 = tempRet0;
   $167 = $nr;
   $168 = $167;
   $169 = HEAP32[$168>>2]|0;
   $170 = (($167) + 4)|0;
   $171 = $170;
   $172 = HEAP32[$171>>2]|0;
   $173 = (___muldi3(($165|0),($166|0),($169|0),($172|0))|0);
   $174 = tempRet0;
   $175 = (_i64Subtract(($155|0),($156|0),($173|0),($174|0))|0);
   $176 = tempRet0;
   $177 = $n_before;
   $178 = $177;
   HEAP32[$178>>2] = $175;
   $179 = (($177) + 4)|0;
   $180 = $179;
   HEAP32[$180>>2] = $176;
   $181 = $kshift;
   $182 = $181;
   HEAP32[$182>>2] = 0;
   $183 = (($181) + 4)|0;
   $184 = $183;
   HEAP32[$184>>2] = 0;
  } else {
   $185 = $2;
   $186 = $185;
   $187 = HEAP32[$186>>2]|0;
   $188 = (($185) + 4)|0;
   $189 = $188;
   $190 = HEAP32[$189>>2]|0;
   $191 = (___muldi3(2,0,($187|0),($190|0))|0);
   $192 = tempRet0;
   $193 = $2;
   $194 = $193;
   $195 = HEAP32[$194>>2]|0;
   $196 = (($193) + 4)|0;
   $197 = $196;
   $198 = HEAP32[$197>>2]|0;
   $199 = (_i64Subtract(($195|0),($198|0),1,0)|0);
   $200 = tempRet0;
   $201 = (___muldi3(($191|0),($192|0),($199|0),($200|0))|0);
   $202 = tempRet0;
   $203 = $ncap_;
   $204 = $203;
   HEAP32[$204>>2] = $201;
   $205 = (($203) + 4)|0;
   $206 = $205;
   HEAP32[$206>>2] = $202;
   $207 = $2;
   $208 = $207;
   $209 = HEAP32[$208>>2]|0;
   $210 = (($207) + 4)|0;
   $211 = $210;
   $212 = HEAP32[$211>>2]|0;
   $213 = $nr;
   $214 = $213;
   HEAP32[$214>>2] = $209;
   $215 = (($213) + 4)|0;
   $216 = $215;
   HEAP32[$216>>2] = $212;
   $217 = $ncap_;
   $218 = $217;
   $219 = HEAP32[$218>>2]|0;
   $220 = (($217) + 4)|0;
   $221 = $220;
   $222 = HEAP32[$221>>2]|0;
   $223 = $jr;
   $224 = $223;
   $225 = HEAP32[$224>>2]|0;
   $226 = (($223) + 4)|0;
   $227 = $226;
   $228 = HEAP32[$227>>2]|0;
   $229 = $2;
   $230 = $229;
   $231 = HEAP32[$230>>2]|0;
   $232 = (($229) + 4)|0;
   $233 = $232;
   $234 = HEAP32[$233>>2]|0;
   $235 = (_i64Subtract(($225|0),($228|0),($231|0),($234|0))|0);
   $236 = tempRet0;
   $237 = $nl4;
   $238 = $237;
   $239 = HEAP32[$238>>2]|0;
   $240 = (($237) + 4)|0;
   $241 = $240;
   $242 = HEAP32[$241>>2]|0;
   $243 = (___muldi3(($235|0),($236|0),($239|0),($242|0))|0);
   $244 = tempRet0;
   $245 = (_i64Add(($219|0),($222|0),($243|0),($244|0))|0);
   $246 = tempRet0;
   $247 = $n_before;
   $248 = $247;
   HEAP32[$248>>2] = $245;
   $249 = (($247) + 4)|0;
   $250 = $249;
   HEAP32[$250>>2] = $246;
   $251 = $jr;
   $252 = $251;
   $253 = HEAP32[$252>>2]|0;
   $254 = (($251) + 4)|0;
   $255 = $254;
   $256 = HEAP32[$255>>2]|0;
   $257 = $2;
   $258 = $257;
   $259 = HEAP32[$258>>2]|0;
   $260 = (($257) + 4)|0;
   $261 = $260;
   $262 = HEAP32[$261>>2]|0;
   $263 = (_i64Subtract(($253|0),($256|0),($259|0),($262|0))|0);
   $264 = tempRet0;
   $265 = $263 & 1;
   $266 = $kshift;
   $267 = $266;
   HEAP32[$267>>2] = $265;
   $268 = (($266) + 4)|0;
   $269 = $268;
   HEAP32[$269>>2] = 0;
  }
 }
 $270 = $5;
 $271 = (696 + ($270<<2)|0);
 $272 = HEAP32[$271>>2]|0;
 $273 = ($272|0)<(0);
 $274 = $273 << 31 >> 31;
 $275 = $nr;
 $276 = $275;
 $277 = HEAP32[$276>>2]|0;
 $278 = (($275) + 4)|0;
 $279 = $278;
 $280 = HEAP32[$279>>2]|0;
 $281 = (___muldi3(($272|0),($274|0),($277|0),($280|0))|0);
 $282 = tempRet0;
 $283 = $3;
 $284 = ($283|0)<(0);
 $285 = $284 << 31 >> 31;
 $286 = (_i64Add(($281|0),($282|0),($283|0),($285|0))|0);
 $287 = tempRet0;
 $288 = $4;
 $289 = ($288|0)<(0);
 $290 = $289 << 31 >> 31;
 $291 = (_i64Subtract(($286|0),($287|0),($288|0),($290|0))|0);
 $292 = tempRet0;
 $293 = (_i64Add(($291|0),($292|0),1,0)|0);
 $294 = tempRet0;
 $295 = $kshift;
 $296 = $295;
 $297 = HEAP32[$296>>2]|0;
 $298 = (($295) + 4)|0;
 $299 = $298;
 $300 = HEAP32[$299>>2]|0;
 $301 = (_i64Add(($293|0),($294|0),($297|0),($300|0))|0);
 $302 = tempRet0;
 $303 = (___divdi3(($301|0),($302|0),2,0)|0);
 $304 = tempRet0;
 $305 = $jp;
 $306 = $305;
 HEAP32[$306>>2] = $303;
 $307 = (($305) + 4)|0;
 $308 = $307;
 HEAP32[$308>>2] = $304;
 $309 = $jp;
 $310 = $309;
 $311 = HEAP32[$310>>2]|0;
 $312 = (($309) + 4)|0;
 $313 = $312;
 $314 = HEAP32[$313>>2]|0;
 $315 = $nl4;
 $316 = $315;
 $317 = HEAP32[$316>>2]|0;
 $318 = (($315) + 4)|0;
 $319 = $318;
 $320 = HEAP32[$319>>2]|0;
 $321 = ($314|0)>($320|0);
 $322 = ($314|0)==($320|0);
 $323 = ($311>>>0)>($317>>>0);
 $324 = $322 & $323;
 $325 = $321 | $324;
 if ($325) {
  $326 = $nl4;
  $327 = $326;
  $328 = HEAP32[$327>>2]|0;
  $329 = (($326) + 4)|0;
  $330 = $329;
  $331 = HEAP32[$330>>2]|0;
  $332 = $jp;
  $333 = $332;
  $334 = HEAP32[$333>>2]|0;
  $335 = (($332) + 4)|0;
  $336 = $335;
  $337 = HEAP32[$336>>2]|0;
  $338 = (_i64Subtract(($334|0),($337|0),($328|0),($331|0))|0);
  $339 = tempRet0;
  $340 = $jp;
  $341 = $340;
  HEAP32[$341>>2] = $338;
  $342 = (($340) + 4)|0;
  $343 = $342;
  HEAP32[$343>>2] = $339;
  $373 = $n_before;
  $374 = $373;
  $375 = HEAP32[$374>>2]|0;
  $376 = (($373) + 4)|0;
  $377 = $376;
  $378 = HEAP32[$377>>2]|0;
  $379 = $jp;
  $380 = $379;
  $381 = HEAP32[$380>>2]|0;
  $382 = (($379) + 4)|0;
  $383 = $382;
  $384 = HEAP32[$383>>2]|0;
  $385 = (_i64Add(($375|0),($378|0),($381|0),($384|0))|0);
  $386 = tempRet0;
  $387 = (_i64Subtract(($385|0),($386|0),1,0)|0);
  $388 = tempRet0;
  tempRet0 = $388;
  STACKTOP = sp;return ($387|0);
 }
 $344 = $jp;
 $345 = $344;
 $346 = HEAP32[$345>>2]|0;
 $347 = (($344) + 4)|0;
 $348 = $347;
 $349 = HEAP32[$348>>2]|0;
 $350 = ($349|0)<(0);
 $351 = ($349|0)==(0);
 $352 = ($346>>>0)<(1);
 $353 = $351 & $352;
 $354 = $350 | $353;
 if ($354) {
  $355 = $nl4;
  $356 = $355;
  $357 = HEAP32[$356>>2]|0;
  $358 = (($355) + 4)|0;
  $359 = $358;
  $360 = HEAP32[$359>>2]|0;
  $361 = $jp;
  $362 = $361;
  $363 = HEAP32[$362>>2]|0;
  $364 = (($361) + 4)|0;
  $365 = $364;
  $366 = HEAP32[$365>>2]|0;
  $367 = (_i64Add(($363|0),($366|0),($357|0),($360|0))|0);
  $368 = tempRet0;
  $369 = $jp;
  $370 = $369;
  HEAP32[$370>>2] = $367;
  $371 = (($369) + 4)|0;
  $372 = $371;
  HEAP32[$372>>2] = $368;
 }
 $373 = $n_before;
 $374 = $373;
 $375 = HEAP32[$374>>2]|0;
 $376 = (($373) + 4)|0;
 $377 = $376;
 $378 = HEAP32[$377>>2]|0;
 $379 = $jp;
 $380 = $379;
 $381 = HEAP32[$380>>2]|0;
 $382 = (($379) + 4)|0;
 $383 = $382;
 $384 = HEAP32[$383>>2]|0;
 $385 = (_i64Add(($375|0),($378|0),($381|0),($384|0))|0);
 $386 = tempRet0;
 $387 = (_i64Subtract(($385|0),($386|0),1,0)|0);
 $388 = tempRet0;
 tempRet0 = $388;
 STACKTOP = sp;return ($387|0);
}
function _ring2nest64($0,$1,$2,$3,$ipnest) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $ipnest = $ipnest|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $face_num = 0, $ix = 0, $iy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $4 = sp + 8|0;
 $5 = sp;
 $ix = sp + 24|0;
 $iy = sp + 20|0;
 $face_num = sp + 16|0;
 $7 = $4;
 $8 = $7;
 HEAP32[$8>>2] = $0;
 $9 = (($7) + 4)|0;
 $10 = $9;
 HEAP32[$10>>2] = $1;
 $11 = $5;
 $12 = $11;
 HEAP32[$12>>2] = $2;
 $13 = (($11) + 4)|0;
 $14 = $13;
 HEAP32[$14>>2] = $3;
 $6 = $ipnest;
 $15 = $4;
 $16 = $15;
 $17 = HEAP32[$16>>2]|0;
 $18 = (($15) + 4)|0;
 $19 = $18;
 $20 = HEAP32[$19>>2]|0;
 $21 = $4;
 $22 = $21;
 $23 = HEAP32[$22>>2]|0;
 $24 = (($21) + 4)|0;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 $27 = (_i64Subtract(($23|0),($26|0),1,0)|0);
 $28 = tempRet0;
 $29 = $17 & $27;
 $30 = $20 & $28;
 $31 = ($29|0)!=(0);
 $32 = ($30|0)!=(0);
 $33 = $31 | $32;
 if ($33) {
  $34 = $6;
  $35 = $34;
  $36 = $35;
  HEAP32[$36>>2] = -1;
  $37 = (($35) + 4)|0;
  $38 = $37;
  HEAP32[$38>>2] = -1;
  STACKTOP = sp;return;
 } else {
  $39 = $4;
  $40 = $39;
  $41 = HEAP32[$40>>2]|0;
  $42 = (($39) + 4)|0;
  $43 = $42;
  $44 = HEAP32[$43>>2]|0;
  $45 = $5;
  $46 = $45;
  $47 = HEAP32[$46>>2]|0;
  $48 = (($45) + 4)|0;
  $49 = $48;
  $50 = HEAP32[$49>>2]|0;
  _ring2xyf64($41,$44,$47,$50,$ix,$iy,$face_num);
  $51 = $4;
  $52 = $51;
  $53 = HEAP32[$52>>2]|0;
  $54 = (($51) + 4)|0;
  $55 = $54;
  $56 = HEAP32[$55>>2]|0;
  $57 = HEAP32[$ix>>2]|0;
  $58 = HEAP32[$iy>>2]|0;
  $59 = HEAP32[$face_num>>2]|0;
  $60 = (_xyf2nest64($53,$56,$57,$58,$59)|0);
  $61 = tempRet0;
  $62 = $6;
  $63 = $62;
  $64 = $63;
  HEAP32[$64>>2] = $60;
  $65 = (($63) + 4)|0;
  $66 = $65;
  HEAP32[$66>>2] = $61;
  STACKTOP = sp;return;
 }
}
function _ring2xyf64($0,$1,$2,$3,$ix,$iy,$face_num) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
 var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
 var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
 var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
 var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
 var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
 var $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0;
 var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0;
 var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
 var $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0;
 var $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0;
 var $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0;
 var $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0;
 var $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0;
 var $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0;
 var $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0.0, $563 = 0.0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0;
 var $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0;
 var $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0;
 var $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0;
 var $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0;
 var $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0;
 var $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0;
 var $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0;
 var $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0;
 var $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0;
 var $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0;
 var $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0;
 var $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0;
 var $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0;
 var $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0;
 var $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0;
 var $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0;
 var $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $ifm = 0, $ifp = 0, $ip = 0, $ip1 = 0, $iphi = 0;
 var $ipt = 0, $ire = 0, $iring = 0, $irm = 0, $irt = 0, $kshift = 0, $ncap_ = 0, $nl2 = 0, $npix_ = 0, $nr = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $4 = sp + 16|0;
 $5 = sp + 88|0;
 $iring = sp + 80|0;
 $iphi = sp + 96|0;
 $kshift = sp + 112|0;
 $nr = sp + 128|0;
 $tmp = sp + 64|0;
 $irt = sp + 136|0;
 $ipt = sp + 8|0;
 $ncap_ = sp;
 $npix_ = sp + 72|0;
 $nl2 = sp + 32|0;
 $ire = sp + 40|0;
 $irm = sp + 104|0;
 $ifm = sp + 120|0;
 $ifp = sp + 24|0;
 $ip = sp + 56|0;
 $ip1 = sp + 48|0;
 $9 = $4;
 $10 = $9;
 HEAP32[$10>>2] = $0;
 $11 = (($9) + 4)|0;
 $12 = $11;
 HEAP32[$12>>2] = $1;
 $13 = $5;
 $14 = $13;
 HEAP32[$14>>2] = $2;
 $15 = (($13) + 4)|0;
 $16 = $15;
 HEAP32[$16>>2] = $3;
 $6 = $ix;
 $7 = $iy;
 $8 = $face_num;
 $17 = $4;
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = (($17) + 4)|0;
 $21 = $20;
 $22 = HEAP32[$21>>2]|0;
 $23 = (___muldi3(2,0,($19|0),($22|0))|0);
 $24 = tempRet0;
 $25 = $4;
 $26 = $25;
 $27 = HEAP32[$26>>2]|0;
 $28 = (($25) + 4)|0;
 $29 = $28;
 $30 = HEAP32[$29>>2]|0;
 $31 = (_i64Subtract(($27|0),($30|0),1,0)|0);
 $32 = tempRet0;
 $33 = (___muldi3(($23|0),($24|0),($31|0),($32|0))|0);
 $34 = tempRet0;
 $35 = $ncap_;
 $36 = $35;
 HEAP32[$36>>2] = $33;
 $37 = (($35) + 4)|0;
 $38 = $37;
 HEAP32[$38>>2] = $34;
 $39 = $4;
 $40 = $39;
 $41 = HEAP32[$40>>2]|0;
 $42 = (($39) + 4)|0;
 $43 = $42;
 $44 = HEAP32[$43>>2]|0;
 $45 = (___muldi3(12,0,($41|0),($44|0))|0);
 $46 = tempRet0;
 $47 = $4;
 $48 = $47;
 $49 = HEAP32[$48>>2]|0;
 $50 = (($47) + 4)|0;
 $51 = $50;
 $52 = HEAP32[$51>>2]|0;
 $53 = (___muldi3(($45|0),($46|0),($49|0),($52|0))|0);
 $54 = tempRet0;
 $55 = $npix_;
 $56 = $55;
 HEAP32[$56>>2] = $53;
 $57 = (($55) + 4)|0;
 $58 = $57;
 HEAP32[$58>>2] = $54;
 $59 = $4;
 $60 = $59;
 $61 = HEAP32[$60>>2]|0;
 $62 = (($59) + 4)|0;
 $63 = $62;
 $64 = HEAP32[$63>>2]|0;
 $65 = (___muldi3(2,0,($61|0),($64|0))|0);
 $66 = tempRet0;
 $67 = $nl2;
 $68 = $67;
 HEAP32[$68>>2] = $65;
 $69 = (($67) + 4)|0;
 $70 = $69;
 HEAP32[$70>>2] = $66;
 $71 = $5;
 $72 = $71;
 $73 = HEAP32[$72>>2]|0;
 $74 = (($71) + 4)|0;
 $75 = $74;
 $76 = HEAP32[$75>>2]|0;
 $77 = $ncap_;
 $78 = $77;
 $79 = HEAP32[$78>>2]|0;
 $80 = (($77) + 4)|0;
 $81 = $80;
 $82 = HEAP32[$81>>2]|0;
 $83 = ($76|0)<($82|0);
 $84 = ($76|0)==($82|0);
 $85 = ($73>>>0)<($79>>>0);
 $86 = $84 & $85;
 $87 = $83 | $86;
 if ($87) {
  $88 = $5;
  $89 = $88;
  $90 = HEAP32[$89>>2]|0;
  $91 = (($88) + 4)|0;
  $92 = $91;
  $93 = HEAP32[$92>>2]|0;
  $94 = (___muldi3(2,0,($90|0),($93|0))|0);
  $95 = tempRet0;
  $96 = (_i64Add(1,0,($94|0),($95|0))|0);
  $97 = tempRet0;
  $98 = (_isqrt64($96,$97)|0);
  $99 = (1 + ($98))|0;
  $100 = (+($99|0));
  $101 = 0.5 * $100;
  $102 = (~~$101)>>>0;
  $103 = +Math_abs($101) >= 1.0 ? $101 > 0.0 ? (Math_min(+Math_floor($101 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($101 - +(~~$101 >>> 0)) / 4294967296.0) >>> 0 : 0;
  $104 = $iring;
  $105 = $104;
  HEAP32[$105>>2] = $102;
  $106 = (($104) + 4)|0;
  $107 = $106;
  HEAP32[$107>>2] = $103;
  $108 = $5;
  $109 = $108;
  $110 = HEAP32[$109>>2]|0;
  $111 = (($108) + 4)|0;
  $112 = $111;
  $113 = HEAP32[$112>>2]|0;
  $114 = (_i64Add(($110|0),($113|0),1,0)|0);
  $115 = tempRet0;
  $116 = $iring;
  $117 = $116;
  $118 = HEAP32[$117>>2]|0;
  $119 = (($116) + 4)|0;
  $120 = $119;
  $121 = HEAP32[$120>>2]|0;
  $122 = (___muldi3(2,0,($118|0),($121|0))|0);
  $123 = tempRet0;
  $124 = $iring;
  $125 = $124;
  $126 = HEAP32[$125>>2]|0;
  $127 = (($124) + 4)|0;
  $128 = $127;
  $129 = HEAP32[$128>>2]|0;
  $130 = (_i64Subtract(($126|0),($129|0),1,0)|0);
  $131 = tempRet0;
  $132 = (___muldi3(($122|0),($123|0),($130|0),($131|0))|0);
  $133 = tempRet0;
  $134 = (_i64Subtract(($114|0),($115|0),($132|0),($133|0))|0);
  $135 = tempRet0;
  $136 = $iphi;
  $137 = $136;
  HEAP32[$137>>2] = $134;
  $138 = (($136) + 4)|0;
  $139 = $138;
  HEAP32[$139>>2] = $135;
  $140 = $kshift;
  $141 = $140;
  HEAP32[$141>>2] = 0;
  $142 = (($140) + 4)|0;
  $143 = $142;
  HEAP32[$143>>2] = 0;
  $144 = $iring;
  $145 = $144;
  $146 = HEAP32[$145>>2]|0;
  $147 = (($144) + 4)|0;
  $148 = $147;
  $149 = HEAP32[$148>>2]|0;
  $150 = $nr;
  $151 = $150;
  HEAP32[$151>>2] = $146;
  $152 = (($150) + 4)|0;
  $153 = $152;
  HEAP32[$153>>2] = $149;
  $154 = $8;
  HEAP32[$154>>2] = 0;
  $155 = $iphi;
  $156 = $155;
  $157 = HEAP32[$156>>2]|0;
  $158 = (($155) + 4)|0;
  $159 = $158;
  $160 = HEAP32[$159>>2]|0;
  $161 = (_i64Subtract(($157|0),($160|0),1,0)|0);
  $162 = tempRet0;
  $163 = $tmp;
  $164 = $163;
  HEAP32[$164>>2] = $161;
  $165 = (($163) + 4)|0;
  $166 = $165;
  HEAP32[$166>>2] = $162;
  $167 = $tmp;
  $168 = $167;
  $169 = HEAP32[$168>>2]|0;
  $170 = (($167) + 4)|0;
  $171 = $170;
  $172 = HEAP32[$171>>2]|0;
  $173 = $iring;
  $174 = $173;
  $175 = HEAP32[$174>>2]|0;
  $176 = (($173) + 4)|0;
  $177 = $176;
  $178 = HEAP32[$177>>2]|0;
  $179 = (___muldi3(2,0,($175|0),($178|0))|0);
  $180 = tempRet0;
  $181 = ($172|0)>($180|0);
  $182 = ($172|0)==($180|0);
  $183 = ($169>>>0)>=($179>>>0);
  $184 = $182 & $183;
  $185 = $181 | $184;
  if ($185) {
   $186 = $8;
   HEAP32[$186>>2] = 2;
   $187 = $iring;
   $188 = $187;
   $189 = HEAP32[$188>>2]|0;
   $190 = (($187) + 4)|0;
   $191 = $190;
   $192 = HEAP32[$191>>2]|0;
   $193 = (___muldi3(2,0,($189|0),($192|0))|0);
   $194 = tempRet0;
   $195 = $tmp;
   $196 = $195;
   $197 = HEAP32[$196>>2]|0;
   $198 = (($195) + 4)|0;
   $199 = $198;
   $200 = HEAP32[$199>>2]|0;
   $201 = (_i64Subtract(($197|0),($200|0),($193|0),($194|0))|0);
   $202 = tempRet0;
   $203 = $tmp;
   $204 = $203;
   HEAP32[$204>>2] = $201;
   $205 = (($203) + 4)|0;
   $206 = $205;
   HEAP32[$206>>2] = $202;
  }
  $207 = $tmp;
  $208 = $207;
  $209 = HEAP32[$208>>2]|0;
  $210 = (($207) + 4)|0;
  $211 = $210;
  $212 = HEAP32[$211>>2]|0;
  $213 = $iring;
  $214 = $213;
  $215 = HEAP32[$214>>2]|0;
  $216 = (($213) + 4)|0;
  $217 = $216;
  $218 = HEAP32[$217>>2]|0;
  $219 = ($212|0)>($218|0);
  $220 = ($212|0)==($218|0);
  $221 = ($209>>>0)>=($215>>>0);
  $222 = $220 & $221;
  $223 = $219 | $222;
  if ($223) {
   $224 = $8;
   $225 = HEAP32[$224>>2]|0;
   $226 = (($225) + 1)|0;
   HEAP32[$224>>2] = $226;
  }
 } else {
  $227 = $5;
  $228 = $227;
  $229 = HEAP32[$228>>2]|0;
  $230 = (($227) + 4)|0;
  $231 = $230;
  $232 = HEAP32[$231>>2]|0;
  $233 = $npix_;
  $234 = $233;
  $235 = HEAP32[$234>>2]|0;
  $236 = (($233) + 4)|0;
  $237 = $236;
  $238 = HEAP32[$237>>2]|0;
  $239 = $ncap_;
  $240 = $239;
  $241 = HEAP32[$240>>2]|0;
  $242 = (($239) + 4)|0;
  $243 = $242;
  $244 = HEAP32[$243>>2]|0;
  $245 = (_i64Subtract(($235|0),($238|0),($241|0),($244|0))|0);
  $246 = tempRet0;
  $247 = ($232|0)<($246|0);
  $248 = ($232|0)==($246|0);
  $249 = ($229>>>0)<($245>>>0);
  $250 = $248 & $249;
  $251 = $247 | $250;
  if ($251) {
   $252 = $5;
   $253 = $252;
   $254 = HEAP32[$253>>2]|0;
   $255 = (($252) + 4)|0;
   $256 = $255;
   $257 = HEAP32[$256>>2]|0;
   $258 = $ncap_;
   $259 = $258;
   $260 = HEAP32[$259>>2]|0;
   $261 = (($258) + 4)|0;
   $262 = $261;
   $263 = HEAP32[$262>>2]|0;
   $264 = (_i64Subtract(($254|0),($257|0),($260|0),($263|0))|0);
   $265 = tempRet0;
   $266 = $ip;
   $267 = $266;
   HEAP32[$267>>2] = $264;
   $268 = (($266) + 4)|0;
   $269 = $268;
   HEAP32[$269>>2] = $265;
   $270 = $ip;
   $271 = $270;
   $272 = HEAP32[$271>>2]|0;
   $273 = (($270) + 4)|0;
   $274 = $273;
   $275 = HEAP32[$274>>2]|0;
   $276 = $4;
   $277 = $276;
   $278 = HEAP32[$277>>2]|0;
   $279 = (($276) + 4)|0;
   $280 = $279;
   $281 = HEAP32[$280>>2]|0;
   $282 = (___muldi3(4,0,($278|0),($281|0))|0);
   $283 = tempRet0;
   $284 = (___divdi3(($272|0),($275|0),($282|0),($283|0))|0);
   $285 = tempRet0;
   $286 = $4;
   $287 = $286;
   $288 = HEAP32[$287>>2]|0;
   $289 = (($286) + 4)|0;
   $290 = $289;
   $291 = HEAP32[$290>>2]|0;
   $292 = (_i64Add(($284|0),($285|0),($288|0),($291|0))|0);
   $293 = tempRet0;
   $294 = $iring;
   $295 = $294;
   HEAP32[$295>>2] = $292;
   $296 = (($294) + 4)|0;
   $297 = $296;
   HEAP32[$297>>2] = $293;
   $298 = $ip;
   $299 = $298;
   $300 = HEAP32[$299>>2]|0;
   $301 = (($298) + 4)|0;
   $302 = $301;
   $303 = HEAP32[$302>>2]|0;
   $304 = $4;
   $305 = $304;
   $306 = HEAP32[$305>>2]|0;
   $307 = (($304) + 4)|0;
   $308 = $307;
   $309 = HEAP32[$308>>2]|0;
   $310 = (___muldi3(4,0,($306|0),($309|0))|0);
   $311 = tempRet0;
   $312 = (___remdi3(($300|0),($303|0),($310|0),($311|0))|0);
   $313 = tempRet0;
   $314 = (_i64Add(($312|0),($313|0),1,0)|0);
   $315 = tempRet0;
   $316 = $iphi;
   $317 = $316;
   HEAP32[$317>>2] = $314;
   $318 = (($316) + 4)|0;
   $319 = $318;
   HEAP32[$319>>2] = $315;
   $320 = $iring;
   $321 = $320;
   $322 = HEAP32[$321>>2]|0;
   $323 = (($320) + 4)|0;
   $324 = $323;
   $325 = HEAP32[$324>>2]|0;
   $326 = $4;
   $327 = $326;
   $328 = HEAP32[$327>>2]|0;
   $329 = (($326) + 4)|0;
   $330 = $329;
   $331 = HEAP32[$330>>2]|0;
   $332 = (_i64Add(($322|0),($325|0),($328|0),($331|0))|0);
   $333 = tempRet0;
   $334 = $332 & 1;
   $335 = $kshift;
   $336 = $335;
   HEAP32[$336>>2] = $334;
   $337 = (($335) + 4)|0;
   $338 = $337;
   HEAP32[$338>>2] = 0;
   $339 = $4;
   $340 = $339;
   $341 = HEAP32[$340>>2]|0;
   $342 = (($339) + 4)|0;
   $343 = $342;
   $344 = HEAP32[$343>>2]|0;
   $345 = $nr;
   $346 = $345;
   HEAP32[$346>>2] = $341;
   $347 = (($345) + 4)|0;
   $348 = $347;
   HEAP32[$348>>2] = $344;
   $349 = $iring;
   $350 = $349;
   $351 = HEAP32[$350>>2]|0;
   $352 = (($349) + 4)|0;
   $353 = $352;
   $354 = HEAP32[$353>>2]|0;
   $355 = $4;
   $356 = $355;
   $357 = HEAP32[$356>>2]|0;
   $358 = (($355) + 4)|0;
   $359 = $358;
   $360 = HEAP32[$359>>2]|0;
   $361 = (_i64Subtract(($351|0),($354|0),($357|0),($360|0))|0);
   $362 = tempRet0;
   $363 = (_i64Add(($361|0),($362|0),1,0)|0);
   $364 = tempRet0;
   $365 = $ire;
   $366 = $365;
   HEAP32[$366>>2] = $363;
   $367 = (($365) + 4)|0;
   $368 = $367;
   HEAP32[$368>>2] = $364;
   $369 = $nl2;
   $370 = $369;
   $371 = HEAP32[$370>>2]|0;
   $372 = (($369) + 4)|0;
   $373 = $372;
   $374 = HEAP32[$373>>2]|0;
   $375 = (_i64Add(($371|0),($374|0),2,0)|0);
   $376 = tempRet0;
   $377 = $ire;
   $378 = $377;
   $379 = HEAP32[$378>>2]|0;
   $380 = (($377) + 4)|0;
   $381 = $380;
   $382 = HEAP32[$381>>2]|0;
   $383 = (_i64Subtract(($375|0),($376|0),($379|0),($382|0))|0);
   $384 = tempRet0;
   $385 = $irm;
   $386 = $385;
   HEAP32[$386>>2] = $383;
   $387 = (($385) + 4)|0;
   $388 = $387;
   HEAP32[$388>>2] = $384;
   $389 = $iphi;
   $390 = $389;
   $391 = HEAP32[$390>>2]|0;
   $392 = (($389) + 4)|0;
   $393 = $392;
   $394 = HEAP32[$393>>2]|0;
   $395 = $ire;
   $396 = $395;
   $397 = HEAP32[$396>>2]|0;
   $398 = (($395) + 4)|0;
   $399 = $398;
   $400 = HEAP32[$399>>2]|0;
   $401 = (___divdi3(($397|0),($400|0),2,0)|0);
   $402 = tempRet0;
   $403 = (_i64Subtract(($391|0),($394|0),($401|0),($402|0))|0);
   $404 = tempRet0;
   $405 = $4;
   $406 = $405;
   $407 = HEAP32[$406>>2]|0;
   $408 = (($405) + 4)|0;
   $409 = $408;
   $410 = HEAP32[$409>>2]|0;
   $411 = (_i64Add(($403|0),($404|0),($407|0),($410|0))|0);
   $412 = tempRet0;
   $413 = (_i64Subtract(($411|0),($412|0),1,0)|0);
   $414 = tempRet0;
   $415 = $4;
   $416 = $415;
   $417 = HEAP32[$416>>2]|0;
   $418 = (($415) + 4)|0;
   $419 = $418;
   $420 = HEAP32[$419>>2]|0;
   $421 = (___divdi3(($413|0),($414|0),($417|0),($420|0))|0);
   $422 = tempRet0;
   $423 = $ifm;
   $424 = $423;
   HEAP32[$424>>2] = $421;
   $425 = (($423) + 4)|0;
   $426 = $425;
   HEAP32[$426>>2] = $422;
   $427 = $iphi;
   $428 = $427;
   $429 = HEAP32[$428>>2]|0;
   $430 = (($427) + 4)|0;
   $431 = $430;
   $432 = HEAP32[$431>>2]|0;
   $433 = $irm;
   $434 = $433;
   $435 = HEAP32[$434>>2]|0;
   $436 = (($433) + 4)|0;
   $437 = $436;
   $438 = HEAP32[$437>>2]|0;
   $439 = (___divdi3(($435|0),($438|0),2,0)|0);
   $440 = tempRet0;
   $441 = (_i64Subtract(($429|0),($432|0),($439|0),($440|0))|0);
   $442 = tempRet0;
   $443 = $4;
   $444 = $443;
   $445 = HEAP32[$444>>2]|0;
   $446 = (($443) + 4)|0;
   $447 = $446;
   $448 = HEAP32[$447>>2]|0;
   $449 = (_i64Add(($441|0),($442|0),($445|0),($448|0))|0);
   $450 = tempRet0;
   $451 = (_i64Subtract(($449|0),($450|0),1,0)|0);
   $452 = tempRet0;
   $453 = $4;
   $454 = $453;
   $455 = HEAP32[$454>>2]|0;
   $456 = (($453) + 4)|0;
   $457 = $456;
   $458 = HEAP32[$457>>2]|0;
   $459 = (___divdi3(($451|0),($452|0),($455|0),($458|0))|0);
   $460 = tempRet0;
   $461 = $ifp;
   $462 = $461;
   HEAP32[$462>>2] = $459;
   $463 = (($461) + 4)|0;
   $464 = $463;
   HEAP32[$464>>2] = $460;
   $465 = $ifp;
   $466 = $465;
   $467 = HEAP32[$466>>2]|0;
   $468 = (($465) + 4)|0;
   $469 = $468;
   $470 = HEAP32[$469>>2]|0;
   $471 = $ifm;
   $472 = $471;
   $473 = HEAP32[$472>>2]|0;
   $474 = (($471) + 4)|0;
   $475 = $474;
   $476 = HEAP32[$475>>2]|0;
   $477 = ($467|0)==($473|0);
   $478 = ($470|0)==($476|0);
   $479 = $477 & $478;
   if ($479) {
    $480 = $ifp;
    $481 = $480;
    $482 = HEAP32[$481>>2]|0;
    $483 = (($480) + 4)|0;
    $484 = $483;
    $485 = HEAP32[$484>>2]|0;
    $486 = ($482|0)==(4);
    $487 = ($485|0)==(0);
    $488 = $486 & $487;
    if ($488) {
     $498 = 4;$858 = 0;
    } else {
     $489 = $ifp;
     $490 = $489;
     $491 = HEAP32[$490>>2]|0;
     $492 = (($489) + 4)|0;
     $493 = $492;
     $494 = HEAP32[$493>>2]|0;
     $495 = (_i64Add(($491|0),($494|0),4,0)|0);
     $496 = tempRet0;
     $498 = $495;$858 = $496;
    }
    $497 = $8;
    HEAP32[$497>>2] = $498;
   } else {
    $499 = $ifp;
    $500 = $499;
    $501 = HEAP32[$500>>2]|0;
    $502 = (($499) + 4)|0;
    $503 = $502;
    $504 = HEAP32[$503>>2]|0;
    $505 = $ifm;
    $506 = $505;
    $507 = HEAP32[$506>>2]|0;
    $508 = (($505) + 4)|0;
    $509 = $508;
    $510 = HEAP32[$509>>2]|0;
    $511 = ($504|0)<($510|0);
    $512 = ($504|0)==($510|0);
    $513 = ($501>>>0)<($507>>>0);
    $514 = $512 & $513;
    $515 = $511 | $514;
    if ($515) {
     $516 = $ifp;
     $517 = $516;
     $518 = HEAP32[$517>>2]|0;
     $519 = (($516) + 4)|0;
     $520 = $519;
     $521 = HEAP32[$520>>2]|0;
     $522 = $8;
     HEAP32[$522>>2] = $518;
    } else {
     $523 = $ifm;
     $524 = $523;
     $525 = HEAP32[$524>>2]|0;
     $526 = (($523) + 4)|0;
     $527 = $526;
     $528 = HEAP32[$527>>2]|0;
     $529 = (_i64Add(($525|0),($528|0),8,0)|0);
     $530 = tempRet0;
     $531 = $8;
     HEAP32[$531>>2] = $529;
    }
   }
  } else {
   $532 = $npix_;
   $533 = $532;
   $534 = HEAP32[$533>>2]|0;
   $535 = (($532) + 4)|0;
   $536 = $535;
   $537 = HEAP32[$536>>2]|0;
   $538 = $5;
   $539 = $538;
   $540 = HEAP32[$539>>2]|0;
   $541 = (($538) + 4)|0;
   $542 = $541;
   $543 = HEAP32[$542>>2]|0;
   $544 = (_i64Subtract(($534|0),($537|0),($540|0),($543|0))|0);
   $545 = tempRet0;
   $546 = $ip1;
   $547 = $546;
   HEAP32[$547>>2] = $544;
   $548 = (($546) + 4)|0;
   $549 = $548;
   HEAP32[$549>>2] = $545;
   $550 = $ip1;
   $551 = $550;
   $552 = HEAP32[$551>>2]|0;
   $553 = (($550) + 4)|0;
   $554 = $553;
   $555 = HEAP32[$554>>2]|0;
   $556 = (___muldi3(2,0,($552|0),($555|0))|0);
   $557 = tempRet0;
   $558 = (_i64Subtract(($556|0),($557|0),1,0)|0);
   $559 = tempRet0;
   $560 = (_isqrt64($558,$559)|0);
   $561 = (1 + ($560))|0;
   $562 = (+($561|0));
   $563 = 0.5 * $562;
   $564 = (~~$563)>>>0;
   $565 = +Math_abs($563) >= 1.0 ? $563 > 0.0 ? (Math_min(+Math_floor($563 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($563 - +(~~$563 >>> 0)) / 4294967296.0) >>> 0 : 0;
   $566 = $iring;
   $567 = $566;
   HEAP32[$567>>2] = $564;
   $568 = (($566) + 4)|0;
   $569 = $568;
   HEAP32[$569>>2] = $565;
   $570 = $iring;
   $571 = $570;
   $572 = HEAP32[$571>>2]|0;
   $573 = (($570) + 4)|0;
   $574 = $573;
   $575 = HEAP32[$574>>2]|0;
   $576 = (___muldi3(4,0,($572|0),($575|0))|0);
   $577 = tempRet0;
   $578 = (_i64Add(($576|0),($577|0),1,0)|0);
   $579 = tempRet0;
   $580 = $ip1;
   $581 = $580;
   $582 = HEAP32[$581>>2]|0;
   $583 = (($580) + 4)|0;
   $584 = $583;
   $585 = HEAP32[$584>>2]|0;
   $586 = $iring;
   $587 = $586;
   $588 = HEAP32[$587>>2]|0;
   $589 = (($586) + 4)|0;
   $590 = $589;
   $591 = HEAP32[$590>>2]|0;
   $592 = (___muldi3(2,0,($588|0),($591|0))|0);
   $593 = tempRet0;
   $594 = $iring;
   $595 = $594;
   $596 = HEAP32[$595>>2]|0;
   $597 = (($594) + 4)|0;
   $598 = $597;
   $599 = HEAP32[$598>>2]|0;
   $600 = (_i64Subtract(($596|0),($599|0),1,0)|0);
   $601 = tempRet0;
   $602 = (___muldi3(($592|0),($593|0),($600|0),($601|0))|0);
   $603 = tempRet0;
   $604 = (_i64Subtract(($582|0),($585|0),($602|0),($603|0))|0);
   $605 = tempRet0;
   $606 = (_i64Subtract(($578|0),($579|0),($604|0),($605|0))|0);
   $607 = tempRet0;
   $608 = $iphi;
   $609 = $608;
   HEAP32[$609>>2] = $606;
   $610 = (($608) + 4)|0;
   $611 = $610;
   HEAP32[$611>>2] = $607;
   $612 = $kshift;
   $613 = $612;
   HEAP32[$613>>2] = 0;
   $614 = (($612) + 4)|0;
   $615 = $614;
   HEAP32[$615>>2] = 0;
   $616 = $iring;
   $617 = $616;
   $618 = HEAP32[$617>>2]|0;
   $619 = (($616) + 4)|0;
   $620 = $619;
   $621 = HEAP32[$620>>2]|0;
   $622 = $nr;
   $623 = $622;
   HEAP32[$623>>2] = $618;
   $624 = (($622) + 4)|0;
   $625 = $624;
   HEAP32[$625>>2] = $621;
   $626 = $nl2;
   $627 = $626;
   $628 = HEAP32[$627>>2]|0;
   $629 = (($626) + 4)|0;
   $630 = $629;
   $631 = HEAP32[$630>>2]|0;
   $632 = (___muldi3(2,0,($628|0),($631|0))|0);
   $633 = tempRet0;
   $634 = $iring;
   $635 = $634;
   $636 = HEAP32[$635>>2]|0;
   $637 = (($634) + 4)|0;
   $638 = $637;
   $639 = HEAP32[$638>>2]|0;
   $640 = (_i64Subtract(($632|0),($633|0),($636|0),($639|0))|0);
   $641 = tempRet0;
   $642 = $iring;
   $643 = $642;
   HEAP32[$643>>2] = $640;
   $644 = (($642) + 4)|0;
   $645 = $644;
   HEAP32[$645>>2] = $641;
   $646 = $8;
   HEAP32[$646>>2] = 8;
   $647 = $iphi;
   $648 = $647;
   $649 = HEAP32[$648>>2]|0;
   $650 = (($647) + 4)|0;
   $651 = $650;
   $652 = HEAP32[$651>>2]|0;
   $653 = (_i64Subtract(($649|0),($652|0),1,0)|0);
   $654 = tempRet0;
   $655 = $tmp;
   $656 = $655;
   HEAP32[$656>>2] = $653;
   $657 = (($655) + 4)|0;
   $658 = $657;
   HEAP32[$658>>2] = $654;
   $659 = $tmp;
   $660 = $659;
   $661 = HEAP32[$660>>2]|0;
   $662 = (($659) + 4)|0;
   $663 = $662;
   $664 = HEAP32[$663>>2]|0;
   $665 = $nr;
   $666 = $665;
   $667 = HEAP32[$666>>2]|0;
   $668 = (($665) + 4)|0;
   $669 = $668;
   $670 = HEAP32[$669>>2]|0;
   $671 = (___muldi3(2,0,($667|0),($670|0))|0);
   $672 = tempRet0;
   $673 = ($664|0)>($672|0);
   $674 = ($664|0)==($672|0);
   $675 = ($661>>>0)>=($671>>>0);
   $676 = $674 & $675;
   $677 = $673 | $676;
   if ($677) {
    $678 = $8;
    HEAP32[$678>>2] = 10;
    $679 = $nr;
    $680 = $679;
    $681 = HEAP32[$680>>2]|0;
    $682 = (($679) + 4)|0;
    $683 = $682;
    $684 = HEAP32[$683>>2]|0;
    $685 = (___muldi3(2,0,($681|0),($684|0))|0);
    $686 = tempRet0;
    $687 = $tmp;
    $688 = $687;
    $689 = HEAP32[$688>>2]|0;
    $690 = (($687) + 4)|0;
    $691 = $690;
    $692 = HEAP32[$691>>2]|0;
    $693 = (_i64Subtract(($689|0),($692|0),($685|0),($686|0))|0);
    $694 = tempRet0;
    $695 = $tmp;
    $696 = $695;
    HEAP32[$696>>2] = $693;
    $697 = (($695) + 4)|0;
    $698 = $697;
    HEAP32[$698>>2] = $694;
   }
   $699 = $tmp;
   $700 = $699;
   $701 = HEAP32[$700>>2]|0;
   $702 = (($699) + 4)|0;
   $703 = $702;
   $704 = HEAP32[$703>>2]|0;
   $705 = $nr;
   $706 = $705;
   $707 = HEAP32[$706>>2]|0;
   $708 = (($705) + 4)|0;
   $709 = $708;
   $710 = HEAP32[$709>>2]|0;
   $711 = ($704|0)>($710|0);
   $712 = ($704|0)==($710|0);
   $713 = ($701>>>0)>=($707>>>0);
   $714 = $712 & $713;
   $715 = $711 | $714;
   if ($715) {
    $716 = $8;
    $717 = HEAP32[$716>>2]|0;
    $718 = (($717) + 1)|0;
    HEAP32[$716>>2] = $718;
   }
  }
 }
 $719 = $iring;
 $720 = $719;
 $721 = HEAP32[$720>>2]|0;
 $722 = (($719) + 4)|0;
 $723 = $722;
 $724 = HEAP32[$723>>2]|0;
 $725 = $8;
 $726 = HEAP32[$725>>2]|0;
 $727 = (648 + ($726<<2)|0);
 $728 = HEAP32[$727>>2]|0;
 $729 = ($728|0)<(0);
 $730 = $729 << 31 >> 31;
 $731 = $4;
 $732 = $731;
 $733 = HEAP32[$732>>2]|0;
 $734 = (($731) + 4)|0;
 $735 = $734;
 $736 = HEAP32[$735>>2]|0;
 $737 = (___muldi3(($728|0),($730|0),($733|0),($736|0))|0);
 $738 = tempRet0;
 $739 = (_i64Subtract(($721|0),($724|0),($737|0),($738|0))|0);
 $740 = tempRet0;
 $741 = (_i64Add(($739|0),($740|0),1,0)|0);
 $742 = tempRet0;
 $743 = $irt;
 $744 = $743;
 HEAP32[$744>>2] = $741;
 $745 = (($743) + 4)|0;
 $746 = $745;
 HEAP32[$746>>2] = $742;
 $747 = $iphi;
 $748 = $747;
 $749 = HEAP32[$748>>2]|0;
 $750 = (($747) + 4)|0;
 $751 = $750;
 $752 = HEAP32[$751>>2]|0;
 $753 = (___muldi3(2,0,($749|0),($752|0))|0);
 $754 = tempRet0;
 $755 = $8;
 $756 = HEAP32[$755>>2]|0;
 $757 = (696 + ($756<<2)|0);
 $758 = HEAP32[$757>>2]|0;
 $759 = ($758|0)<(0);
 $760 = $759 << 31 >> 31;
 $761 = $nr;
 $762 = $761;
 $763 = HEAP32[$762>>2]|0;
 $764 = (($761) + 4)|0;
 $765 = $764;
 $766 = HEAP32[$765>>2]|0;
 $767 = (___muldi3(($758|0),($760|0),($763|0),($766|0))|0);
 $768 = tempRet0;
 $769 = (_i64Subtract(($753|0),($754|0),($767|0),($768|0))|0);
 $770 = tempRet0;
 $771 = $kshift;
 $772 = $771;
 $773 = HEAP32[$772>>2]|0;
 $774 = (($771) + 4)|0;
 $775 = $774;
 $776 = HEAP32[$775>>2]|0;
 $777 = (_i64Subtract(($769|0),($770|0),($773|0),($776|0))|0);
 $778 = tempRet0;
 $779 = (_i64Subtract(($777|0),($778|0),1,0)|0);
 $780 = tempRet0;
 $781 = $ipt;
 $782 = $781;
 HEAP32[$782>>2] = $779;
 $783 = (($781) + 4)|0;
 $784 = $783;
 HEAP32[$784>>2] = $780;
 $785 = $ipt;
 $786 = $785;
 $787 = HEAP32[$786>>2]|0;
 $788 = (($785) + 4)|0;
 $789 = $788;
 $790 = HEAP32[$789>>2]|0;
 $791 = $nl2;
 $792 = $791;
 $793 = HEAP32[$792>>2]|0;
 $794 = (($791) + 4)|0;
 $795 = $794;
 $796 = HEAP32[$795>>2]|0;
 $797 = ($790|0)>($796|0);
 $798 = ($790|0)==($796|0);
 $799 = ($787>>>0)>=($793>>>0);
 $800 = $798 & $799;
 $801 = $797 | $800;
 if (!($801)) {
  $822 = $ipt;
  $823 = $822;
  $824 = HEAP32[$823>>2]|0;
  $825 = (($822) + 4)|0;
  $826 = $825;
  $827 = HEAP32[$826>>2]|0;
  $828 = $irt;
  $829 = $828;
  $830 = HEAP32[$829>>2]|0;
  $831 = (($828) + 4)|0;
  $832 = $831;
  $833 = HEAP32[$832>>2]|0;
  $834 = (_i64Subtract(($824|0),($827|0),($830|0),($833|0))|0);
  $835 = tempRet0;
  $836 = (_bitshift64Ashr(($834|0),($835|0),1)|0);
  $837 = tempRet0;
  $838 = $6;
  HEAP32[$838>>2] = $836;
  $839 = $ipt;
  $840 = $839;
  $841 = HEAP32[$840>>2]|0;
  $842 = (($839) + 4)|0;
  $843 = $842;
  $844 = HEAP32[$843>>2]|0;
  $845 = $irt;
  $846 = $845;
  $847 = HEAP32[$846>>2]|0;
  $848 = (($845) + 4)|0;
  $849 = $848;
  $850 = HEAP32[$849>>2]|0;
  $851 = (_i64Add(($841|0),($844|0),($847|0),($850|0))|0);
  $852 = tempRet0;
  $853 = (_i64Subtract(0,0,($851|0),($852|0))|0);
  $854 = tempRet0;
  $855 = (_bitshift64Ashr(($853|0),($854|0),1)|0);
  $856 = tempRet0;
  $857 = $7;
  HEAP32[$857>>2] = $855;
  STACKTOP = sp;return;
 }
 $802 = $4;
 $803 = $802;
 $804 = HEAP32[$803>>2]|0;
 $805 = (($802) + 4)|0;
 $806 = $805;
 $807 = HEAP32[$806>>2]|0;
 $808 = (___muldi3(8,0,($804|0),($807|0))|0);
 $809 = tempRet0;
 $810 = $ipt;
 $811 = $810;
 $812 = HEAP32[$811>>2]|0;
 $813 = (($810) + 4)|0;
 $814 = $813;
 $815 = HEAP32[$814>>2]|0;
 $816 = (_i64Subtract(($812|0),($815|0),($808|0),($809|0))|0);
 $817 = tempRet0;
 $818 = $ipt;
 $819 = $818;
 HEAP32[$819>>2] = $816;
 $820 = (($818) + 4)|0;
 $821 = $820;
 HEAP32[$821>>2] = $817;
 $822 = $ipt;
 $823 = $822;
 $824 = HEAP32[$823>>2]|0;
 $825 = (($822) + 4)|0;
 $826 = $825;
 $827 = HEAP32[$826>>2]|0;
 $828 = $irt;
 $829 = $828;
 $830 = HEAP32[$829>>2]|0;
 $831 = (($828) + 4)|0;
 $832 = $831;
 $833 = HEAP32[$832>>2]|0;
 $834 = (_i64Subtract(($824|0),($827|0),($830|0),($833|0))|0);
 $835 = tempRet0;
 $836 = (_bitshift64Ashr(($834|0),($835|0),1)|0);
 $837 = tempRet0;
 $838 = $6;
 HEAP32[$838>>2] = $836;
 $839 = $ipt;
 $840 = $839;
 $841 = HEAP32[$840>>2]|0;
 $842 = (($839) + 4)|0;
 $843 = $842;
 $844 = HEAP32[$843>>2]|0;
 $845 = $irt;
 $846 = $845;
 $847 = HEAP32[$846>>2]|0;
 $848 = (($845) + 4)|0;
 $849 = $848;
 $850 = HEAP32[$849>>2]|0;
 $851 = (_i64Add(($841|0),($844|0),($847|0),($850|0))|0);
 $852 = tempRet0;
 $853 = (_i64Subtract(0,0,($851|0),($852|0))|0);
 $854 = tempRet0;
 $855 = (_bitshift64Ashr(($853|0),($854|0),1)|0);
 $856 = tempRet0;
 $857 = $7;
 HEAP32[$857>>2] = $855;
 STACKTOP = sp;return;
}
function _xyf2nest64($0,$1,$ix,$iy,$face_num) {
 $0 = $0|0;
 $1 = $1|0;
 $ix = $ix|0;
 $iy = $iy|0;
 $face_num = $face_num|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $2 = sp;
 $6 = $2;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $3 = $ix;
 $4 = $iy;
 $5 = $face_num;
 $10 = $5;
 $11 = ($10|0)<(0);
 $12 = $11 << 31 >> 31;
 $13 = $2;
 $14 = $13;
 $15 = HEAP32[$14>>2]|0;
 $16 = (($13) + 4)|0;
 $17 = $16;
 $18 = HEAP32[$17>>2]|0;
 $19 = (___muldi3(($10|0),($12|0),($15|0),($18|0))|0);
 $20 = tempRet0;
 $21 = $2;
 $22 = $21;
 $23 = HEAP32[$22>>2]|0;
 $24 = (($21) + 4)|0;
 $25 = $24;
 $26 = HEAP32[$25>>2]|0;
 $27 = (___muldi3(($19|0),($20|0),($23|0),($26|0))|0);
 $28 = tempRet0;
 $29 = $3;
 $30 = (_spread_bits64($29)|0);
 $31 = tempRet0;
 $32 = (_i64Add(($27|0),($28|0),($30|0),($31|0))|0);
 $33 = tempRet0;
 $34 = $4;
 $35 = (_spread_bits64($34)|0);
 $36 = tempRet0;
 $37 = (_bitshift64Shl(($35|0),($36|0),1)|0);
 $38 = tempRet0;
 $39 = (_i64Add(($32|0),($33|0),($37|0),($38|0))|0);
 $40 = tempRet0;
 tempRet0 = $40;
 STACKTOP = sp;return ($39|0);
}
function _spread_bits64($v) {
 $v = $v|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $v;
 $1 = $0;
 $2 = $1 & 255;
 $3 = (136 + ($2<<1)|0);
 $4 = HEAP16[$3>>1]|0;
 $5 = $4 << 16 >> 16;
 $6 = ($5|0)<(0);
 $7 = $6 << 31 >> 31;
 $8 = $0;
 $9 = $8 >> 8;
 $10 = $9 & 255;
 $11 = (136 + ($10<<1)|0);
 $12 = HEAP16[$11>>1]|0;
 $13 = $12 << 16 >> 16;
 $14 = ($13|0)<(0);
 $15 = $14 << 31 >> 31;
 $16 = (_bitshift64Shl(($13|0),($15|0),16)|0);
 $17 = tempRet0;
 $18 = $5 | $16;
 $19 = $7 | $17;
 $20 = $0;
 $21 = $20 >> 16;
 $22 = $21 & 255;
 $23 = (136 + ($22<<1)|0);
 $24 = HEAP16[$23>>1]|0;
 $25 = $24 << 16 >> 16;
 $26 = ($25|0)<(0);
 $26 << 31 >> 31;
 $27 = $19 | $25;
 $28 = $0;
 $29 = $28 >> 24;
 $30 = $29 & 255;
 $31 = (136 + ($30<<1)|0);
 $32 = HEAP16[$31>>1]|0;
 $33 = $32 << 16 >> 16;
 $34 = ($33|0)<(0);
 $35 = $34 << 31 >> 31;
 $36 = (_bitshift64Shl(($33|0),($35|0),48)|0);
 $37 = tempRet0;
 $38 = $18 | $36;
 $39 = $27 | $37;
 tempRet0 = $39;
 STACKTOP = sp;return ($38|0);
}
function _compress_bits64($0,$1) {
 $0 = $0|0;
 $1 = $1|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $raw = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $2 = sp + 8|0;
 $raw = sp;
 $3 = $2;
 $4 = $3;
 HEAP32[$4>>2] = $0;
 $5 = (($3) + 4)|0;
 $6 = $5;
 HEAP32[$6>>2] = $1;
 $7 = $2;
 $8 = $7;
 $9 = HEAP32[$8>>2]|0;
 $10 = (($7) + 4)|0;
 $11 = $10;
 $12 = HEAP32[$11>>2]|0;
 $13 = $9 & 1431655765;
 $14 = $12 & 1431655765;
 $15 = $raw;
 $16 = $15;
 HEAP32[$16>>2] = $13;
 $17 = (($15) + 4)|0;
 $18 = $17;
 HEAP32[$18>>2] = $14;
 $19 = $raw;
 $20 = $19;
 $21 = HEAP32[$20>>2]|0;
 $22 = (($19) + 4)|0;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (_bitshift64Ashr(($21|0),($24|0),15)|0);
 $26 = tempRet0;
 $27 = $raw;
 $28 = $27;
 $29 = HEAP32[$28>>2]|0;
 $30 = (($27) + 4)|0;
 $31 = $30;
 $32 = HEAP32[$31>>2]|0;
 $33 = $29 | $25;
 $34 = $32 | $26;
 $35 = $raw;
 $36 = $35;
 HEAP32[$36>>2] = $33;
 $37 = (($35) + 4)|0;
 $38 = $37;
 HEAP32[$38>>2] = $34;
 $39 = $raw;
 $40 = $39;
 $41 = HEAP32[$40>>2]|0;
 $42 = (($39) + 4)|0;
 $43 = $42;
 $44 = HEAP32[$43>>2]|0;
 $45 = $41 & 255;
 $46 = (744 + ($45<<1)|0);
 $47 = HEAP16[$46>>1]|0;
 $48 = $47 << 16 >> 16;
 $49 = $raw;
 $50 = $49;
 $51 = HEAP32[$50>>2]|0;
 $52 = (($49) + 4)|0;
 $53 = $52;
 $54 = HEAP32[$53>>2]|0;
 $55 = (_bitshift64Ashr(($51|0),($54|0),8)|0);
 $56 = tempRet0;
 $57 = $55 & 255;
 $58 = (744 + ($57<<1)|0);
 $59 = HEAP16[$58>>1]|0;
 $60 = $59 << 16 >> 16;
 $61 = $60 << 4;
 $62 = $48 | $61;
 $63 = $raw;
 $64 = $63;
 $65 = HEAP32[$64>>2]|0;
 $66 = (($63) + 4)|0;
 $67 = $66;
 $68 = HEAP32[$67>>2]|0;
 $69 = (_bitshift64Ashr(($65|0),($68|0),32)|0);
 $70 = tempRet0;
 $71 = $69 & 255;
 $72 = (744 + ($71<<1)|0);
 $73 = HEAP16[$72>>1]|0;
 $74 = $73 << 16 >> 16;
 $75 = $74 << 16;
 $76 = $62 | $75;
 $77 = $raw;
 $78 = $77;
 $79 = HEAP32[$78>>2]|0;
 $80 = (($77) + 4)|0;
 $81 = $80;
 $82 = HEAP32[$81>>2]|0;
 $83 = (_bitshift64Ashr(($79|0),($82|0),40)|0);
 $84 = tempRet0;
 $85 = $83 & 255;
 $86 = (744 + ($85<<1)|0);
 $87 = HEAP16[$86>>1]|0;
 $88 = $87 << 16 >> 16;
 $89 = $88 << 20;
 $90 = $76 | $89;
 $91 = ($90|0)<(0);
 $92 = $91 << 31 >> 31;
 tempRet0 = $92;
 STACKTOP = sp;return ($90|0);
}
function _fmodulo($v1,$v2) {
 $v1 = +$v1;
 $v2 = +$v2;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $3 = 0.0, $4 = 0, $5 = 0.0;
 var $6 = 0.0, $7 = 0, $8 = 0.0, $9 = 0.0, $tmp = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $v1;
 $2 = $v2;
 $3 = $1;
 $4 = $3 >= 0.0;
 if ($4) {
  $5 = $1;
  $6 = $2;
  $7 = $5 < $6;
  if ($7) {
   $8 = $1;
   $12 = $8;
  } else {
   $9 = $1;
   $10 = $2;
   $11 = (+_fmod((+$9),(+$10)));
   $12 = $11;
  }
  $0 = $12;
  $23 = $0;
  STACKTOP = sp;return (+$23);
 } else {
  $13 = $1;
  $14 = $2;
  $15 = (+_fmod((+$13),(+$14)));
  $16 = $2;
  $17 = $15 + $16;
  $tmp = $17;
  $18 = $tmp;
  $19 = $2;
  $20 = $18 == $19;
  if ($20) {
   $22 = 0.0;
  } else {
   $21 = $tmp;
   $22 = $21;
  }
  $0 = $22;
  $23 = $0;
  STACKTOP = sp;return (+$23);
 }
 return +0;
}
function _imodulo64($0,$1,$2,$3) {
 $0 = $0|0;
 $1 = $1|0;
 $2 = $2|0;
 $3 = $3|0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $v = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $4 = sp + 16|0;
 $5 = sp + 8|0;
 $v = sp;
 $6 = $4;
 $7 = $6;
 HEAP32[$7>>2] = $0;
 $8 = (($6) + 4)|0;
 $9 = $8;
 HEAP32[$9>>2] = $1;
 $10 = $5;
 $11 = $10;
 HEAP32[$11>>2] = $2;
 $12 = (($10) + 4)|0;
 $13 = $12;
 HEAP32[$13>>2] = $3;
 $14 = $4;
 $15 = $14;
 $16 = HEAP32[$15>>2]|0;
 $17 = (($14) + 4)|0;
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = $5;
 $21 = $20;
 $22 = HEAP32[$21>>2]|0;
 $23 = (($20) + 4)|0;
 $24 = $23;
 $25 = HEAP32[$24>>2]|0;
 $26 = (___remdi3(($16|0),($19|0),($22|0),($25|0))|0);
 $27 = tempRet0;
 $28 = $v;
 $29 = $28;
 HEAP32[$29>>2] = $26;
 $30 = (($28) + 4)|0;
 $31 = $30;
 HEAP32[$31>>2] = $27;
 $32 = $v;
 $33 = $32;
 $34 = HEAP32[$33>>2]|0;
 $35 = (($32) + 4)|0;
 $36 = $35;
 $37 = HEAP32[$36>>2]|0;
 $38 = ($37|0)>(0);
 $39 = ($37|0)==(0);
 $40 = ($34>>>0)>=(0);
 $41 = $39 & $40;
 $42 = $38 | $41;
 if ($42) {
  $43 = $v;
  $44 = $43;
  $45 = HEAP32[$44>>2]|0;
  $46 = (($43) + 4)|0;
  $47 = $46;
  $48 = HEAP32[$47>>2]|0;
  $63 = $48;$64 = $45;
  tempRet0 = $63;
  STACKTOP = sp;return ($64|0);
 } else {
  $49 = $v;
  $50 = $49;
  $51 = HEAP32[$50>>2]|0;
  $52 = (($49) + 4)|0;
  $53 = $52;
  $54 = HEAP32[$53>>2]|0;
  $55 = $5;
  $56 = $55;
  $57 = HEAP32[$56>>2]|0;
  $58 = (($55) + 4)|0;
  $59 = $58;
  $60 = HEAP32[$59>>2]|0;
  $61 = (_i64Add(($51|0),($54|0),($57|0),($60|0))|0);
  $62 = tempRet0;
  $63 = $62;$64 = $61;
  tempRet0 = $63;
  STACKTOP = sp;return ($64|0);
 }
 return 0|0;
}
function _isqrt($v) {
 $v = $v|0;
 var $0 = 0, $1 = 0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $v;
 $1 = $0;
 $2 = (+($1|0));
 $3 = $2 + 0.5;
 $4 = (+Math_sqrt((+$3)));
 $5 = (~~(($4)));
 STACKTOP = sp;return ($5|0);
}
function _imodulo($v1,$v2) {
 $v1 = $v1|0;
 $v2 = $v2|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $v = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $v1;
 $1 = $v2;
 $2 = $0;
 $3 = $1;
 $4 = (($2|0) % ($3|0))&-1;
 $v = $4;
 $5 = $v;
 $6 = ($5|0)>=(0);
 if ($6) {
  $7 = $v;
  $11 = $7;
  STACKTOP = sp;return ($11|0);
 } else {
  $8 = $v;
  $9 = $1;
  $10 = (($8) + ($9))|0;
  $11 = $10;
  STACKTOP = sp;return ($11|0);
 }
 return 0|0;
}
function runPostSets() {
 
}
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[(ptr)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[(ptr)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[(curr)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[(dest)]=((HEAP8[(src)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
  }
function _llvm_ctlz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((ctlz_i8)+(x >>> 24))|0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 16)&0xff))|0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 8)&0xff))|0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((ctlz_i8)+(x&0xff))|0)])|0) + 24)|0;
  }

function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))|0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))|0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))|0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))|0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



// EMSCRIPTEN_END_FUNCS

  

  // EMSCRIPTEN_END_FUNCS
  

  return { _strlen: _strlen, _ang2pix_ring: _ang2pix_ring, _vec2pix_ring64: _vec2pix_ring64, _xyf2ring64: _xyf2ring64, _pix2ang_ring: _pix2ang_ring, _ring2nest: _ring2nest, _ang2pix_nest_z_phi: _ang2pix_nest_z_phi, _pix2ang_nest_z_phi64: _pix2ang_nest_z_phi64, _pix2ang_nest: _pix2ang_nest, _ang2pix_nest64: _ang2pix_nest64, _nest2ring: _nest2ring, _ang2pix_nest_z_phi64: _ang2pix_nest_z_phi64, _bitshift64Shl: _bitshift64Shl, _pix2ang_nest64: _pix2ang_nest64, _vec2pix_ring: _vec2pix_ring, _vec2pix_nest64: _vec2pix_nest64, _bitshift64Ashr: _bitshift64Ashr, _ang2pix_nest: _ang2pix_nest, _memset: _memset, _vec2pix_nest: _vec2pix_nest, _memcpy: _memcpy, _i64Subtract: _i64Subtract, _ring2xyf64: _ring2xyf64, _ang2pix_ring64: _ang2pix_ring64, _nest2ring64: _nest2ring64, _i64Add: _i64Add, _nest2xyf64: _nest2xyf64, _ang2vec: _ang2vec, _ang2pix_ring_z_phi64: _ang2pix_ring_z_phi64, _pix2ang_ring_z_phi: _pix2ang_ring_z_phi, _pix2vec_nest64: _pix2vec_nest64, _xyf2nest64: _xyf2nest64, _pix2ang_nest_z_phi: _pix2ang_nest_z_phi, _pix2vec_ring64: _pix2vec_ring64, _pix2vec_nest: _pix2vec_nest, _ring2nest64: _ring2nest64, _vec2ang: _vec2ang, _nest2xyf: _nest2xyf, _ring2xyf: _ring2xyf, _pix2ang_ring64: _pix2ang_ring64, _pix2ang_ring_z_phi64: _pix2ang_ring_z_phi64, _pix2vec_ring: _pix2vec_ring, _xyf2nest: _xyf2nest, _xyf2ring: _xyf2ring, _ang2pix_ring_z_phi: _ang2pix_ring_z_phi, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9 };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_fabs": _fabs, "_sin": _sin, "_acos": _acos, "_fmod": _fmod, "_atan2": _atan2, "___setErrNo": ___setErrNo, "_fflush": _fflush, "_pwrite": _pwrite, "__reallyNegative": __reallyNegative, "_send": _send, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "__exit": __exit, "_cos": _cos, "_mkport": _mkport, "_write": _write, "_free": _free, "_fwrite": _fwrite, "_malloc": _malloc, "_fprintf": _fprintf, "__formatString": __formatString, "_sqrt": _sqrt, "_exit": _exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _ang2pix_ring = Module["_ang2pix_ring"] = asm["_ang2pix_ring"];
var _vec2pix_ring64 = Module["_vec2pix_ring64"] = asm["_vec2pix_ring64"];
var _xyf2ring64 = Module["_xyf2ring64"] = asm["_xyf2ring64"];
var _pix2ang_ring = Module["_pix2ang_ring"] = asm["_pix2ang_ring"];
var _ring2nest = Module["_ring2nest"] = asm["_ring2nest"];
var _ang2pix_nest_z_phi = Module["_ang2pix_nest_z_phi"] = asm["_ang2pix_nest_z_phi"];
var _pix2ang_nest_z_phi64 = Module["_pix2ang_nest_z_phi64"] = asm["_pix2ang_nest_z_phi64"];
var _pix2ang_nest = Module["_pix2ang_nest"] = asm["_pix2ang_nest"];
var _ang2pix_nest64 = Module["_ang2pix_nest64"] = asm["_ang2pix_nest64"];
var _nest2ring = Module["_nest2ring"] = asm["_nest2ring"];
var _ang2pix_nest_z_phi64 = Module["_ang2pix_nest_z_phi64"] = asm["_ang2pix_nest_z_phi64"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var _pix2ang_nest64 = Module["_pix2ang_nest64"] = asm["_pix2ang_nest64"];
var _vec2pix_ring = Module["_vec2pix_ring"] = asm["_vec2pix_ring"];
var _vec2pix_nest64 = Module["_vec2pix_nest64"] = asm["_vec2pix_nest64"];
var _bitshift64Ashr = Module["_bitshift64Ashr"] = asm["_bitshift64Ashr"];
var _ang2pix_nest = Module["_ang2pix_nest"] = asm["_ang2pix_nest"];
var _memset = Module["_memset"] = asm["_memset"];
var _vec2pix_nest = Module["_vec2pix_nest"] = asm["_vec2pix_nest"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _ring2xyf64 = Module["_ring2xyf64"] = asm["_ring2xyf64"];
var _ang2pix_ring64 = Module["_ang2pix_ring64"] = asm["_ang2pix_ring64"];
var _nest2ring64 = Module["_nest2ring64"] = asm["_nest2ring64"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _nest2xyf64 = Module["_nest2xyf64"] = asm["_nest2xyf64"];
var _ang2vec = Module["_ang2vec"] = asm["_ang2vec"];
var _ang2pix_ring_z_phi64 = Module["_ang2pix_ring_z_phi64"] = asm["_ang2pix_ring_z_phi64"];
var _pix2ang_ring_z_phi = Module["_pix2ang_ring_z_phi"] = asm["_pix2ang_ring_z_phi"];
var _pix2vec_nest64 = Module["_pix2vec_nest64"] = asm["_pix2vec_nest64"];
var _xyf2nest64 = Module["_xyf2nest64"] = asm["_xyf2nest64"];
var _pix2ang_nest_z_phi = Module["_pix2ang_nest_z_phi"] = asm["_pix2ang_nest_z_phi"];
var _pix2vec_ring64 = Module["_pix2vec_ring64"] = asm["_pix2vec_ring64"];
var _pix2vec_nest = Module["_pix2vec_nest"] = asm["_pix2vec_nest"];
var _ring2nest64 = Module["_ring2nest64"] = asm["_ring2nest64"];
var _vec2ang = Module["_vec2ang"] = asm["_vec2ang"];
var _nest2xyf = Module["_nest2xyf"] = asm["_nest2xyf"];
var _ring2xyf = Module["_ring2xyf"] = asm["_ring2xyf"];
var _pix2ang_ring64 = Module["_pix2ang_ring64"] = asm["_pix2ang_ring64"];
var _pix2ang_ring_z_phi64 = Module["_pix2ang_ring_z_phi64"] = asm["_pix2ang_ring_z_phi64"];
var _pix2vec_ring = Module["_pix2vec_ring"] = asm["_pix2vec_ring"];
var _xyf2nest = Module["_xyf2nest"] = asm["_xyf2nest"];
var _xyf2ring = Module["_xyf2ring"] = asm["_xyf2ring"];
var _ang2pix_ring_z_phi = Module["_ang2pix_ring_z_phi"] = asm["_ang2pix_ring_z_phi"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



//# sourceMappingURL=healpix.js.map  
  function HEALPix() {
    
    // void ang2pix_ring64(hpint64 nside, double theta, double phi, hpint64 *ipix);
    // void ang2pix_nest64(hpint64 nside, double theta, double phi, hpint64 *ipix);
    // void vec2pix_ring64(hpint64 nside, const double *vec, hpint64 *ipix);
    // void vec2pix_nest64(hpint64 nside, const double *vec, hpint64 *ipix);
    // void pix2ang_ring64(hpint64 nside, hpint64 ipix, double *theta, double *phi);
    // void pix2ang_nest64(hpint64 nside, hpint64 ipix, double *theta, double *phi);
    // void pix2vec_ring64(hpint64 nside, hpint64 ipix, double *vec);
    // void pix2vec_nest64(hpint64 nside, hpint64 ipix, double *vec);
    // void nest2ring64(hpint64 nside, hpint64 ipnest, hpint64 *ipring);
    // void ring2nest64(hpint64 nside, hpint64 ipring, hpint64 *ipnest);
    
    this.longPtr = Module._malloc(4);
    this.vectorPtr = Module._malloc(24);
    this.thetaPtr = Module._malloc(8);
    this.phiPtr = Module._malloc(8);
  }
  
  HEALPix.prototype.setVector = function(vec) {
    Module.setValue(this.vectorPtr, vec[0], 'double');
    Module.setValue(this.vectorPtr + 8, vec[1], 'double');
    Module.setValue(this.vectorPtr + 16, vec[2], 'double');
  }
  
  HEALPix.prototype.getVector = function() {
    var x = Module.getValue(this.vectorPtr, 'double');
    var y = Module.getValue(this.vectorPtr + 8, 'double');
    var z = Module.getValue(this.vectorPtr + 16, 'double');
    
    return [x, y, z];
  }
  
  
  // void ang2vec(double theta, double phi, double *vec);
  HEALPix.prototype.ang2vec = function(theta, phi) {
    Module._ang2vec(theta, phi, this.vectorPtr);
    
    return this.getVector();
  }
  
  // void vec2ang(const double *vec, double *theta, double *phi);
  HEALPix.prototype.vec2ang = function(vec) {
    setVector(vec);
    Module._vec2ang(this.vectorPtr, this.thetaPtr, this.phiPtr);
    var theta = Module.getValue(this.thetaPtr, 'double');
    var phi = Module.getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void ang2pix_ring(long nside, double theta, double phi, long *ipix);
  HEALPix.prototype.ang2pix_ring = function(nside, theta, phi) {
    Module._ang2pix_ring(nside, theta, phi, this.longPtr);
    var ipix = Module.getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void ang2pix_nest(long nside, double theta, double phi, long *ipix);
  HEALPix.prototype.ang2pix_nest = function(nside, theta, phi) {
    Module._ang2pix_nest(nside, theta, phi, this.longPtr);
    var ipix = Module.getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void vec2pix_ring(long nside, const double *vec, long *ipix);
  HEALPix.prototype.vec2pix_ring = function(nside, vec) {
    this.setVector(vec);
    Module._vec2pix_ring(nside, this.vectorPtr, this.longPtr);
    var ipix = Module.getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void vec2pix_nest(long nside, const double *vec, long *ipix);
  HEALPix.prototype.vec2pix_nest = function(nside, vec) {
    this.setVector(vec);
    Module._vec2pix_nest(nside, this.vectorPtr, this.longPtr);
    var ipix = Module.getValue(this.longPtr, 'i32');
    
    return ipix;
  }
  
  // void pix2ang_ring(long nside, long ipix, double *theta, double *phi);
  HEALPix.prototype.pix2ang_ring = function(nside, ipix) {
    Module._pix2ang_ring(nside, ipix, this.thetaPtr, this.phiPtr);
    var theta = Module.getValue(this.thetaPtr, 'double');
    var phi = Module.getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void pix2ang_nest(long nside, long ipix, double *theta, double *phi);
  HEALPix.prototype.pix2ang_nest = function(nside, ipix) {
    Module._pix2ang_nest(nside, ipix, this.thetaPtr, this.phiPtr);
    var theta = Module.getValue(this.thetaPtr, 'double');
    var phi = Module.getValue(this.phiPtr, 'double');
    
    return [theta, phi];
  }
  
  // void pix2vec_ring(long nside, long ipix, double *vec);
  HEALPix.prototype.pix2vec_ring = function(nside, ipix) {
    Module._pix2vec_ring(nside, ipix, this.vectorPtr);
    
    return this.getVector();
  }
  
  // void pix2vec_nest(long nside, long ipix, double *vec);
  HEALPix.prototype.pix2vec_nest = function(nside, ipix) {
    Module._pix2vec_nest(nside, ipix, this.vectorPtr);
    
    return this.getVector();
  }
  
  // void nest2ring(long nside, long ipnest, long *ipring);
  HEALPix.prototype.nest2ring = function(nside, ipnest) {
    Module._nest2ring(nside, ipnest, this.longPtr);
    var ipring = Module.getValue(this.longPtr, 'i32');
    
    return ipring;
  }
  
  // void ring2nest(long nside, long ipring, long *ipnest);
  HEALPix.prototype.ring2nest = function(nside, ipring) {
    Module._ring2nest(nside, ipring, this.longPtr);
    var ipnest = Module.getValue(this.longPtr, 'i32');
    
    return ipnest;
  }
  
  HEALPix.version = '0.1.0';
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HEALPix;
  }
  else {
    window.HEALPix = HEALPix;
  }

}());