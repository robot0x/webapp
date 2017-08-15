// Generated on 2015-09-28 using
// generator-webapp 1.1.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'
/*
expand：如果设为true，就表示下面文件名的占位符（即*号）都要扩展成具体的文件名。
cwd：需要处理的文件（input）所在的目录。
src：表示需要处理的文件。如果采用数组形式，数组的每一项就是一个文件名，可以使用通配符。
dest：表示处理后的文件名或所在目录。
ext：表示处理后的文件后缀名。
*/
module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    app: 'dd',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    pkg: grunt.file.readJSON("package.json"),

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      babel: {
        // 匹配的文件
        // app/js/*.js    匹配js文件夹下所有的js文件
        // app/js/*/*.js  匹配js文件夹下第一层子文件夹下的js文件 因为 * 不能包含 / 所以只能找一层
        // 这样做主要是出于对性能的考虑
        files: ['<%= config.app %>/js/{,*/}*.js'],
        tasks: ['babel:dist']
      },
      babelTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['babel:test', 'test:watch']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      sass: {
        files: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
        tasks: ['sass', 'postcss', 'cssmin']
      },
      jsmin: {
        files:['<%= config.dist %>/js/{,*}*.js'],
        tasks:['uglify']
      },
      styles: {
        files: ['<%= config.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'postcss']
      }
    },

    browserSync: {
      options: {
        notify: false,
        background: true,
        watchOptions: {
          ignored: ''
        }
      },
      livereload: {
        options: {
          files: [
            '<%= config.app %>/{,*/}*.html',
            '<%= config.app %>/css/{,*/}*.css',
            '<%= config.app %>/images/{,*/}*',
            '<%= config.app %>/js/{,*/}*.js'
          ],
          port: 9000,
          server: {
            baseDir: ['.tmp', config.app],
            routes: {
              '/bower_components': './bower_components'
            }
          }
        }
      },
      test: {
        options: {
          port: 9001,
          open: false,
          logLevel: 'silent',
          host: 'localhost',
          server: {
            baseDir: ['.tmp', './test', config.app],
            routes: {
              '/bower_components': './bower_components'
            }
          }
        }
      },
      dist: {
        options: {
          background: false,
          server: '<%= config.dist %>'
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    eslint: {
      target: [
        'Gruntfile.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%= browserSync.test.options.host %>:<%= browserSync.test.options.port %>/index.html']
        }
      }
    },

    // Compiles ES6 with Babel
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/scripts',
          src: '{,*/}*.js',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.js',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: false,
        sourceMapEmbed: true,
        sourceMapContents: true,
        includePaths: ['.']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/sass',
          src: ['*.{scss,sass}'],
          dest: '<%= config.app %>/css',
          ext: '.css'
        }]
      }
    },
   /*
   .test{
    transform: rotate(20deg);
    transition:1s;
    background-image:linear-gradient(to bottom,#444,#444);
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    -ms-border-radius: 10px;
    -o-border-radius: 10px;
    border-radius: 10px;
  }
  .test {
    -webkit-transform: rotate(20deg);
    -ms-transform: rotate(20deg);
    transform: rotate(20deg);
    -webkit-transition: 1s;
    transition: 1s;
    background-image: -webkit-linear-gradient(top, #444, #444);
    background-image: linear-gradient(to bottom, #444, #444);
    border-radius: 10px; 
  }
   */
   /**
    * https://zhidao.baidu.com/question/1991133663151546027.html
      postcss是一种工具，解析css，生成可供javascript使用的数据，其本身并不会改变css文件
      它只是一个插件，为执行任何转换铺平道路
      https://segmentfault.com/a/1190000003909268
      PostCSS 可以直观的理解为：它就是一个平台、平台、平台，重要的事情来三遍比较爽，哈哈！
      为什么说它是一个平台呢？因为我们直接用它，感觉不能干什么事情，但是如果让一些插件在它上面跑，那么将会很强大。
      PostCSS 提供了一个解析器，它能够将 CSS 解析成抽象语法树（AST）
    */
    postcss: {
      options: {
        map: false,
        processors: [
          // Add vendor prefixed styles
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/css',
          src: '{,*/}*.css',
          dest: '<%= config.app %>/css/'
        }]
      }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        src: ['<%= config.app %>/index.html'],
        // 忽略以 ../any number of characters..
        ignorePath: /^(\.\.\/)*\.\./
      },
      sass: {
        src: ['<%= config.app %>/sass/{,*/}*.{scss,sass}'],
        ignorePath: /^(\.\.\/)+/
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= config.dist %>/js/{,*/}*.js',
          '<%= config.dist %>/css/{,*/}*.css',
          '<%= config.dist %>/images/{,*/}*.*',
          '<%= config.dist %>/css/fonts/{,*/}*.*',
          '<%= config.dist %>/*.{ico,png}'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles'
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/css/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: false,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          // true would impact styles with attribute selectors
          removeRedundantAttributes: false,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>/minhtml'
        }]
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= config.dist %>/css/main.css': [
    //         '.tmp/css/{,*/}*.css',
    //         '<%= config.app %>/css/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
      cssmin: {
        target: {
          files: [{
            expand: true,
            cwd: '<%= config.app %>/css',
            src: ['*.css', '!*.min.css'],
            dest: '<%= config.app %>/css',
            ext: '.css'
          }]
        }
     },
     uglify: {
        options: {
                banner: '/*! <%= pkg.name %> <%= pkg.author %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',//添加banner
                report: "min"//输出压缩率
        },
        buildall: {//任务三：按原文件结构压缩js文件夹内所有JS文件
            files: [{
                expand:true,
                cwd:'<%= config.app %>/js',//js目录下
                src:'**/*.js',//所有js文件
                // src: ['*.js', '!*.min.js'], // 错误的写法
                dest: '<%= config.app %>/javascripts',//输出到此目录下
                ext:".min.js"
            }]
        }
     },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= config.dist %>/js/scripts.js': [
    //         '<%= config.dist %>/js/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        }]
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'babel:dist',
        'sass'
      ],
      test: [
        'babel'
      ],
      dist: [
        'babel',
        'sass',
        'imagemin',
        'svgmin'
      ]
    }
  });


  grunt.registerTask('serve', 'start the server and preview your app', function (target) {

    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'postcss',
      'cssmin',
      'browserSync:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test',
        'postcss'
      ]);
    }

    grunt.task.run([
      'browserSync:test',
      'mocha'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'filerev',
    'usemin',
    'htmlmin'
  ]);
  // default 任务是可以在命令行中直接输入grunt运行的。
  grunt.registerTask('default',[
     'serve'
  ])
  // grunt.registerTask('default', [
  //   'newer:eslint',
  //   'test',
  //   'build'
  // ]);
};
