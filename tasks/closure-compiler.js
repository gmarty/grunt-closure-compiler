module.exports = function(grunt) {

  'use strict';

  var exec = require('child_process').exec,
      fs = require('fs'),
      path = require('path'),
      gzip = require('zlib').gzip;

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('closure-compiler', 'Minify JS files using Closure Compiler.', function() {

    var closurePath = '',
        reportFile = '',
        data = this.data,
        done = this.async();

    // Check for closure path.
    if (data.closurePath) {
      closurePath = data.closurePath;
    } else if (process.env.CLOSURE_PATH) {
      closurePath = process.env.CLOSURE_PATH;
    } else {
      grunt.log.error('' +
          '/!\\'.red +
          ' Set an environment variable called ' +
          'CLOSURE_PATH'.red + ' or the build parameter' + 'closurePath'.red +
          ' and\nmake it point to your root install of Closure Compiler.' +
          '\n');
      return false;
    }

    var command = 'java -jar "' + closurePath + '/build/compiler.jar"';

    data.cwd = data.cwd || './';
    
    var output_mode;
    
    // --module mode
    if ("modules" in data) {
      output_mode = 'modules';
    } else { // --js mode
      output_mode = 'js';
      
      data.js = grunt.file.expand({cwd: data.cwd}, data.js);

      // Sanitize options passed.
      if (!data.js.length) {
        // This task requires a minima an input file.
        grunt.warn('Missing js property.');
        return false;
      }

      // Build command line.
      command += ' --js "' + data.js.join('" --js "') + '"';

      if (data.jsOutputFile) {
        if (!grunt.file.isPathAbsolute(data.jsOutputFile)) {
          data.jsOutputFile = path.resolve('./') + '/' + data.jsOutputFile;
        }
        command += ' --js_output_file "' + data.jsOutputFile + '"';
        reportFile = data.reportFile || data.jsOutputFile + '.report.txt';
      }
    }

    if (data.externs) {
      data.externs = grunt.file.expand(data.externs);
      command += ' --externs ' + data.externs.join(' --externs ');

      if (!data.externs.length) {
        delete data.externs;
      }
    }

    if (data.options.externs) {
      data.options.externs = grunt.file.expand(data.options.externs);

      if (!data.options.externs.length) {
        delete data.options.externs;
      }
    }

    for (var directive in data.options) {
      if (Array.isArray(data.options[directive])) {
        command += ' --' + directive + ' ' + data.options[directive].join(' --' + directive + ' ');
      } else if (data.options[directive] === undefined || data.options[directive] === null) {
        command += ' --' + directive;
      } else {
        command += ' --' + directive + ' "' + String(data.options[directive]) + '"';
      }
    }

    if (output_mode === 'js') {
      // because closure compiler does not create dirs.
      grunt.file.write(data.jsOutputFile, '');
    } else { // modules
      
      for (var module in data.modules) {
          
          // @todo add --define option for modules
          //command += '" --define="DEBUG=false"';
        
          data.modules[module].src.forEach(function(src) {
              command += ' --js "' + src + '"';
          });
        
          command += ' --chunk "' + module + ':' + data.modules[module].src.length + ':';
        
          // add dependency
          if (data.modules[module].dep) {
              command += data.modules[module].dep.join(',');
              command += ':';
          }
          command += '"';
      }

      // module output directory
      command += ' --module_output_path_prefix ' + data.moduleOutputPath;
      
    }

    // Minify WebGraph class.
    exec(command, { maxBuffer: data.maxBuffer * 1024, cwd: data.cwd }, function(err, stdout, stderr) {
      if (err) {
        grunt.warn(err);
        done(false);
      }

      if (stdout) {
        grunt.log.writeln(stdout);
      }

      // If OK, calculate gzipped file size.
      if (reportFile.length) {
        var min = fs.readFileSync(data.jsOutputFile, 'utf8');
        min_info(min, function(err) {
          if (err) {
            grunt.warn(err);
            done(false);
          }

          if (data.noreport) {
            done();
          } else {
            // Write compile report to a file.
            fs.writeFile(reportFile, stderr, function(err) {
              if (err) {
                grunt.warn(err);
                done(false);
              }

              grunt.log.writeln('A report is saved in ' + reportFile + '.');
              done();
            });
          }

        });
      } else {
        if (data.report) {
          grunt.log.error(stderr);
        }
        done();
      }

    });

  });

  // Output some size info about a file.
  function min_info(min, onComplete) {
    gzip(min, function(err, buffer) {
      if (err) {
        onComplete.call(this, err);
      }

      var gzipSize = buffer.toString().length;
      grunt.log.writeln('Compressed size: ' + String((gzipSize / 1024).toFixed(2)).green + ' kb gzipped (' + String(gzipSize).green + ' bytes).');

      onComplete.call(this, null);
    });
  }

};
