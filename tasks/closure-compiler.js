module.exports = function(grunt) {

  var exec = require('child_process').exec,
      fs = require('fs'),
      gzip = require('zlib').gzip;

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('closure-compiler', 'Minify JS files using Closure Compiler.', function() {

    // Check for env var.
    if (process.env.CLOSURE_PATH === undefined) {
      grunt.log.error('' +
          '/!\\'.red +
          ' Set an environment variable called ' +
          'CLOSURE_PATH'.red +
          ' and\nmake it point to your root install of Closure Compiler.' +
          '\n');

      // Return an error and stop grunt.
      return false;
    }

    var closureCompilerDir = process.env.CLOSURE_PATH,
        command = 'java -jar ' + closureCompilerDir + '/build/compiler.jar',
        reportFile = '',
        data = this.data,
        done = this.async();

    if (data.externs == undefined) {
      data.externs = [];
    }

    data.js = grunt.file.expandFiles(data.js);
    data.externs = grunt.file.expandFiles(data.externs);

    // Sanitize options passed.
    if (!data.js.length) {
      // This task requires a minima an input file.
      grunt.warn('Missing js property.');
      return false;
    }

    // Build command line.
    command += ' --js ' + data.js.join(' --js ');

    if (data.jsOutputFile) {
      command += ' --js_output_file ' + data.jsOutputFile;
      reportFile = data.jsOutputFile + '.report.txt';
    }

    data.externs.forEach(function(file) {
      command += ' --externs ' + file;
    });

    for (var directive in data.options) {
      if (Array.isArray(data.options)) {
        command += ' --' + directive + ' ' + data.js.join(' --' + directive + ' ');
      } else {
        command += ' --' + directive + ' ' + String(data.options[directive]);
      }
    }

    // Minify WebGraph class.
    exec(command, function(err, stdout, stderr) {
      if (err) {
        grunt.warn(err);
        done(false);
      }

      if (stdout) {
        grunt.log.writeln(stdout);
      }

      // If OK, calculate gzipped file size.
      if (data.jsOutputFile) {
        var min = fs.readFileSync(data.jsOutputFile, 'utf8');
        grunt.helper('min_info', min, function(err) {
          if (err) {
            grunt.warn(err);
            done(false);
          }

          // Write compile report to a file.
          fs.writeFile(reportFile, stderr, function(err) {
            if (err) {
              grunt.warn(err);
              done(false);
            }

            grunt.log.writeln('A report is saved in ' + reportFile + '.');
            done();
          });

        });
      }

    });

  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  // Output some size info about a file.
  grunt.registerHelper('min_info', function(min, onComplete) {
    gzip(min, function(err, buffer) {
      if (err) {
        onComplete.call(this, err);
      }

      var gzipSize = buffer.toString().length;
      grunt.log.writeln('Compressed size: ' + String((gzipSize / 1024).toFixed(2)).green + ' kb gzipped (' + String(gzipSize).green + ' bytes).');

      onComplete.call(this, null);
    });
  });

};
