module.exports = function(grunt) {

    'use strict';

    var exec = require('child_process').exec,
        fs = require('fs'),
        path = require('path'),
        gzip = require('zlib').gzip,
		closurePath = require.resolve('google-closure-compiler');

	if (closurePath) {
		closurePath = closurePath.replace(/package\.json$/, 'compiler.jar');
	}
	
    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerMultiTask('closure-compiler', 'Minify JS files using Closure Compiler.', function() {

        var reportFile = '',
            data = this.data,
            done = this.async();
        
        if(data.closurePath){
            closurePath = data.closurePath + 'compiler.jar';
        }
            
        var command = 'java -jar "' + closurePath + '"';
        data.cwd = data.cwd || './';

        data.js = grunt.file.expand({cwd: data.cwd}, data.js||[]);

        // Sanitize options passed.
        if (!data.js.length&&!data.modules) {
            // This task requires a minima an input file.
            grunt.warn('Missing js property.');
            return false;
        }
        // Build command line.
        //case : js parameter passed (no module then)
        if(data.js && data.js.length && data.js.length>0) {

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

        if (data.options && data.options.externs) {
            data.options.externs = grunt.file.expand(data.options.externs);

            if (!data.options.externs.length) {
                delete data.options.externs;
            }
        }
        //adding module compilation support
        if(data.modules){
            if(data.modules.output_path_prefix){
                command += ' --module_output_path_prefix ' + data.modules.output_path_prefix+' ';
            }
            if(data.modules.definitions){
                for(var module in data.modules.definitions){
                    for(var fileIndex = 0;fileIndex<data.modules.definitions[module].files.length;fileIndex++){
                        command += ' --js ' +data.modules.definitions[module].files[fileIndex]+' ';
                    }
                    command += ' --module '+module+':'+data.modules.definitions[module].files.length;
                    if(data.modules.definitions[module].dependencies && data.modules.definitions[module].dependencies.length>0){
                        command+=':'+data.modules.definitions[module].dependencies.join(',');
                    }
                    command+= ' ';
                    if(data.modules.definitions[module].wrapper){
                        command+='--module_wrapper '+module+':"'+data.modules.definitions[module].wrapper+'" ';
                    }
                }

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

        // because closure compiler does not create dirs.
        if(data.jsOutputFile){
            grunt.file.write(data.jsOutputFile, '');
        }
        else{
            if(data.modules.output_path_prefix){
                grunt.file.write('./'+data.modules.output_path_prefix+'/.tmp', '');
            }
        }

console.log(command);

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
