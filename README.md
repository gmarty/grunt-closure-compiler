# grunt-closure-compiler

A Grunt task for [Closure Compiler](https://developers.google.com/closure/compiler/).

## Getting Started

Install this module on your project's [grunt.js gruntfile](https://github.com/cowboy/grunt/blob/master/docs/getting_started.md):
```bash
$ npm install grunt-closure-compiler
```

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
      maxBuffer: 500,
      options: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT5_STRICT'
      }
    }
  }
});
```

`closureCompiler`: (Optional) can be set to the closure compiler Path, if it has not been installed from sources.

`js` property is always required.

If `jsOutputFile` property is set, the script will be minified and saved to the file specified. Otherwise it will be output to the command line.

`maxBuffer` property

If the buffer returned by closure compiler is more than 200kb, you will get an error saying "maxBuffer exceeded". To prevent this, you can set the maxBuffer to the preffered size you want (in kb)

Use `cwd` to specify the working directory where closure compiler is called. Useful in when you want
to process common js modules.

Optionally, several parameters can be passed to `options` object.

## Documentation

### Specify the Closure Compiler Version

Closure-compiler is [distributed via NPM](https://www.npmjs.com/package/google-closure-compiler). You may specify the version of Closure-compiler used in your package.json.

### Minification report

By default, a report file is generated next to the built file.

You can specify the path and name where the report will be saved using the `reportFile` property.

To deactivate report creation, set `noreport` to `true`.

### `js` property

This task is a [multi task](https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md), you can specify several targets. The task can minify many scripts at a time.

`js` can be an array if you need to concatenate several files to a target.

You can use Grunt `<%= somePropInitConfig.sub.sub.prop %>` or `*` based syntax to have the file list expanded:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
    },
    frontend_debug: {
      js: [
        '<%= closure-compiler.frontend.js %>',
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

If you need to pass the same options several times, make it an array. See `define` below:
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        language_in: 'ECMASCRIPT5_STRICT',
        define: [
          '"DEBUG=false"',
          '"UI_DELAY=500"'
        ],
      }
    }
  }
});
```

When using externs, you can easily reference Closure Compiler contributed externs which are distributed as part of the NPM package:
```javascript
var closurePath = require.resolve('google-closure-compiler').replace(/package\.json$/, '');

grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        externs: '<%= closurePath %>/contrib/externs/jquery-1.7.js',
      }
    }
  }
});
```

To specify boolean options (such as `process_common_js_modules`, i.e. no value are required), set its value to `undefined` (or `null`):
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      js: 'static/src/frontend.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        process_common_js_modules: undefined,
        common_js_entry_module: 'exports'
      }
    }
  }
});
```

For automatic resolving common js modules you can use 
```javascript
grunt.initConfig({
  'closure-compiler': {
    frontend: {
      cwd: 'static/src/'
      js: '*.js',
      jsOutputFile: 'static/js/frontend.min.js',
      options: {
        common_js_entry_module: 'frontend.js',
        transform_amd_modules: undefined,
        process_common_js_modules: undefined
      }
    }
  }
});
```
### `modules` property
Closure compiler can be used to procude multiple JS files, using the --module parameter and related ones. These modules can have dependencies, can be the result of multiple JS source files, and can be wrapped. The ```jsOutputFile``` parameter is useless using modules, but a directory can be specified using ```output_path_prefix```.
#### Parameters
```output_path_prefix``` specifies a prefix to append to the output files. Can be either a directory or just a string.

```definitions``` must contain the description of each module. Available parameters are:



- ```files``` : (Required) Array of source file to in clude in the module
- ```dependencies``` : (Optional) Array of modules it depends on. If ModuleB requires ModuleA, then ModuleB definition must include ```dependencies:['ModuleA']```.
- ```wrapper``` : (Optional) string to wrap the resulting module code in. Placeholder for the code is %s. module name can be inserted using the placeholder %basename% (please refer to Closure Compiler documentation for more detailed information on wrapping).

    
    	modules: {
            output_path_prefix: '.\\compiled\\',
            definitions: {
                'Core':{
                    files:['src\\builder.js','src\\events.js','src\\plugins.js','src\\storage.js','src\\core.js','src\\main.js'],
                    dependencies:[],
                    wrapper:'(function(){ %s }).call(window);'
                },
                'sample':{
                    files:['src\\plugins\\sample.js'],
                    dependencies:['Core'],
                    wrapper:'(function(){ %s }).call(window);'
                }
            }
        }
```
## Note

grunt-closure-compiler initial development was founded by [Dijiwan](http://www.dijiwan.com/).

The directory structure was inspired by [grunt-less](https://github.com/jharding/grunt-less), a Grunt task for Less.

## License

Copyright (c) 2013 Guillaume Marty

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
