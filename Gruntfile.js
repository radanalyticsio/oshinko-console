'use strict';
/* jshint unused: false */

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,


        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        less: {
            development: {
                files: {
                    '.tmp/styles/oshinko.css': '<%= yeoman.app %>/styles/oshinko.less'
                },
                options: {
                    paths: ['<%= yeoman.app %>/styles'],
                    sourceMap: true,
                    sourceMapFilename: '.tmp/styles/oshinko.css.map',
                    sourceMapURL: 'oshinko.css.map',
                    outputSourceFiles: true
                }
            },
            production: {
                files: {
                    'dist/styles/oshinko.css': '<%= yeoman.app %>/styles/oshinko.less'
                },
                options: {
                    cleancss: true,
                    paths: ['<%= yeoman.app %>/styles']
                }
            }
        },


        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {
                            css: [{
                                name:'cssmin',
                                createConfig: function(context, block) {
                                    var generated = context.options.generated;
                                    generated.options = {
                                        keepBreaks: true,
                                        compatibility: {
                                            properties: {
                                                zeroUnits: false
                                            }
                                        }
                                    };
                                }
                            }],

                            js: [{
                                name:'uglify',
                                createConfig: function(context, block) {
                                    var generated = context.options.generated;
                                    generated.options = {
                                        compress: {},
                                        mangle: {},
                                        beautify: {
                                            beautify: true,
                                            indent_level: 0, // Don't waste characters indenting
                                            space_colon: false, // Don't waste characters
                                            width: 1000
                                        },
                                    };
                                }
                            }]
                        }
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
            }
        },


        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        htmlhint: {
            html: {
                options: {
                    'tag-pair': true,
                    'attr-no-duplication': true
                },
                src: ['app/**/*.html']
            }
        },

        htmlmin: {
            dist: {
                options: {
                    preserveLineBreaks: true,
                    collapseWhitespace: true,
                    conservativeCollapse: false,
                    collapseBooleanAttributes: true,
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: false,
                    keepClosingSlash: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: ['*.js', '!oldieshim.js'],
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        ngtemplates: {
            dist: {
                cwd: '<%= yeoman.app %>',
                src: 'views/**/*.html',
                dest: 'dist/scripts/templates.js',
                options: {
                    module: 'openshiftConsoleTemplates',
                    standalone: true,
                    htmlmin: '<%= htmlmin.dist.options %>'
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'images/{,*/}*.{ico,png,jpg,jpeg,gif}',
                        'images/{,*/}*.{webp}',
                        'fonts/*',
                        'styles/fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }]
            },
            styles: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    dest: '.tmp/styles/',
                    src: '{,*/}*.css'
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less:development',
                'copy:styles',
                'copy:extensions',
                'copy:localConfig'
            ],
            test: [
                'less:development'
            ],
            dist: [
                'less:production',
                // remove imagemin from build, since it doesn't tend to behave well cross-platform
                // 'imagemin',
                'svgmin',
                // Also do everything we do in concurrent server so that you can leave grunt server running while doing a build
                'concurrent:server'
            ]
        }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.loadNpmTasks('grunt-htmlhint');

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('build', [
        'clean:dist',
        'newer:jshint',
        'htmlhint',
        'useminPrepare',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'less',
        'cssmin',
        'uglify',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build'
    ]);
};
