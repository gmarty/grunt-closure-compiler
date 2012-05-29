# grunt-closure-compiler

A Grunt task for [Closure Compiler](https://developers.google.com/closure/compiler/).

## Getting Started

First you need to build [Closure Compiler from the source](http://code.google.com/p/closure-compiler/). Set up an environment variable called `CLOSURE_PATH` that points to your Closure Compiler dir (see [details below](#closure-compiler-installation)).

Install this module on your project's [grunt.js gruntfile](https://github.com/cowboy/grunt/blob/master/docs/getting_started.md) with: `npm install grunt-closure-compiler`

Then register the task by adding the following line to your `grunt.js` gruntfile:
```javascript
grunt.loadNpmTasks('grunt-closure-compiler');
```

Then you can minify JavaScript calling:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT5_STRICT'
      }
    }
  }
});
```

`js` is the only property required.

If `jsOutputFile` property is set, the script will be minified and saved to the file specified. Otherwise it will be output to the command line.

Optionally, several parameters can be passed to `options` object.

## Documentation

### Closure Compiler installation

Install dependencies:
```
sudo apt-get install svn ant openjdk-6-jdk
```

Then checkout the source from SVN and build:
```
svn checkout http://closure-compiler.googlecode.com/svn/trunk/ closure-compiler
cd closure-compiler
ant
```

To refresh your build, simply call:
```
svn up
ant clean
ant
```

When creating the `CLOSURE_PATH` environment variable, make sure to have it point to the `closure-compiler` dir created earlier (and not to the `build` subdirectory where the jar is located).

This method is preferred because doing so make it possible to use easily contributed externs. In case you're wondering, Closure Compiler utilizes continuous integration, so it's unlikely to break.

### `js` property

This task is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md), you can specify several targets. The task can minify many scripts at a time.

`js` can be an array if you need to concatenate several files to a target.

You can use Grunt `<config:...>` or `*` based syntax to have the file list expanded:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
    },
    frontend_debug: {
      js: [
        '<config:closure-compiler.frontend.js>',
        // Will expand to 'static/src/frontend.js'
        'static/src/debug.*.js'
        // Will expand to 'static/src/debug.api.js',
        //   'static/src/debug.console.js'...
      ],
      jsOutputFile: 'static/js/frontend.debug.js',
      options: {
        debug: true,
        formatting: 'PRETTY_PRINT'
      }
    },
  }
});
```

### `options` properties

Properties in `options` are mapped to Closure Compiler command line. Just pass options as a map of option-value.

If you need to pass the same options several times, make it an array. See `externs` below:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        externs: [
          'framework.js',
          'service_api.js',
          'new_shim.js'
        ]
      }
    }
  }
});
```

When defining externs, you can easily reference Closure Compiler builtin externs using `<%= process.env.CLOSURE_PATH %>` Grunt template:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        externs: '<%= process.env.CLOSURE_PATH %>/contrib/externs/jquery-1.7.js'
      }
    }
  }
});
```

## Note

grunt-closure-compiler development was founded by [Dijiwan](http://www.dijiwan.com/). Our team uses it on a daily basis to minify our frontend JavaScript.

The directory structure was inspired by [grunt-less](https://github.com/jharding/grunt-less), a Grunt task for Less.

## License

Copyright (c) 2012 Guillaume Marty

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
