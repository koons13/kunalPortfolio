// The require statement tells Node to look into the node_modules folder for a package
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
'use strict';
const { src, dest, watch, series, parallel } = require('gulp');
const colors = require('ansi-colors');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const bourbon = require('node-bourbon').includePaths;
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const del = require('del');
const panini = require('panini');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const removeCode = require('gulp-remove-code');
const removeLog = require('gulp-remove-logging');
const prettyHtml = require('gulp-pretty-html');
const sassLint = require('gulp-sass-lint');
const htmllint = require('gulp-htmllint');
const jshint = require('gulp-jshint');
const htmlreplace = require('gulp-html-replace');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const accessibility = require('gulp-accessibility');
const babel = require('gulp-babel');
const ghPages = require('gulp-gh-pages');
const chalk = require('chalk');
const log = console.log;
const cleanCSS = require('gulp-clean-css');
const realFavicon = require ('gulp-real-favicon');
const fs = require('fs');

// File paths
const files = {
  scssPath: 'app/scss/**/*.scss',
  jsPath: 'app/js/**/*.js'
};

// ------------ DEVELOPMENT TASKS -------------

// COMPILE SCSS INTO CSS
function compileSCSS() {
  log(chalk.red.bold('---------------COMPILING SCSS---------------'));
  return src(['src/assets/scss/style.scss'])
    .pipe(sass({
      outputStyle: 'expanded',
      sourceComments: 'map',
      sourceMap: 'scss',
      includePaths: bourbon
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(dest('dist/assets/css'))
    .pipe(browserSync.stream());
}

// USING PANINI, TEMPLATE, PAGE AND PARTIAL FILES ARE COMBINED TO FORM HTML MARKUP
function compileHTML() {
  log(chalk.red.bold('---------------COMPILING HTML WITH PANINI---------------'));
  panini.refresh();
  return src('src/pages/**/*.html')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      // pageLayouts: {
          //All pages inside src/pages/blog will use the blog.html layout
          //'blog': 'blog'
      // }
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// COPY CUSTOM JS
function compileJS() {
  log(chalk.red.bold('---------------COMPILE CUSTOM.JS---------------'));
  return src(['src/assets/js/**/*.js'])
    .pipe(babel())
    .pipe(dest('dist/assets/js/'))
    .pipe(browserSync.stream());
}

// COPY JSON DATA
function copyJSON() {
  log(chalk.red.bold('---------------COMPILE DATA.JSON---------------'));
  return src(['src/data/**/*.json'])
    .pipe(dest('dist/data/'))
    .pipe(browserSync.stream());
}

// RESET PANINI'S CACHE OF LAYOUTS AND PARTIALS
function resetPages(done) {
  log(chalk.red.bold('---------------CLEARING PANINI CACHE---------------'));
  panini.refresh();
  done();
}

// SCSS LINT
function scssLint() {
  log(chalk.red.bold('---------------SCSS LINTING---------------'));
  return src('src/assets/scss/**/*.scss')
    .pipe(sassLint({
      configFile: '.scss-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
}

// HTML LINTER
function htmlLint() {
  log(chalk.red.bold('---------------HTML LINTING---------------'));
  return src('dist/**/*.html')
    .pipe(htmllint({}, htmllintReporter));
}

function htmllintReporter(filepath, issues) {
  if (issues.length > 0) {
    issues.forEach(function (issue) {
      log(colors.cyan('[gulp-htmllint] ') + colors.white(filepath + ' [' + issue.line + ']: ') + colors.red('(' + issue.code + ') ' + issue.msg));
    });
    process.exitCode = 1;
  } else {
    log(chalk.green.bold('---------------NO HTML LINT ERROR---------------'));
  }
}

// JS LINTER
function jsLint() {
  return src('src/assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

// WATCH FILES
function watchFiles() {
  watch('src/**/*.html', compileHTML);
  watch(['src/assets/scss/**/*.scss', 'src/assets/scss/*.scss'] , compileSCSS);
  watch('src/assets/js/**/*.js', compileJS);
  watch('src/assets/img/**/*', copyImages);
 // watch('src/data/**/*', copyJSON);
}


// BROWSER SYNC
function browserSyncInit(done) {
  log(chalk.red.bold('---------------BROWSER SYNC INIT---------------'));
  browserSync.init({
    server: './dist'
  });
  return done();
}

// DEPLOY TO GIT
function deploy() {
  return src('/*')
    .pipe(ghPages({
      remoteUrl: 'https://github.com/jasvvinder/kunal-portfolio.git',
      branch: 'master',
      message: 'Automated push of contents via gulp'
    }));
}

// ------------ OPTIMIZATION TASKS -------------

// COPIES AND MINIFY IMAGE TO DIST
function copyImages() {
  log(chalk.red.bold('---------------OPTIMIZING IMAGES---------------'));
  return src('src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(newer('dist/assets/img/'))
    /*.pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
    })) */
    .pipe(dest('dist/assets/img/'))
    .pipe(browserSync.stream());
}

// PLACES FONT FILES IN THE DIST FOLDER
function copyFont() {
  log(chalk.red.bold('---------------COPYING FONTS INTO DIST FOLDER---------------'));
  return src([
      'src/assets/fonts/*',
    ])
    .pipe(dest('dist/assets/fonts'))
    .pipe(browserSync.stream());
}

// GET JS VENDOR FILES FROM NODE_MODULES INTO SRC
function getVendor() {
  log(chalk.red.bold('---------------COPY JAVASCRIPT VENDOR FILES INTO SRC---------------'));
  return src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/popper.js/dist/umd/popper.js'
    ])
    .pipe(dest('src/assets/js/vendors'))
    .pipe(browserSync.stream());
}

// GET Bootstrap SCSS FILES FROM NODE_MODULES INTO SRC
function getBootstrap() {
  log(chalk.red.bold('---------------GET Bootstrap FILES INTO SRC---------------'));
  return src([
      'node_modules/bootstrap/scss/**//*'
    ])
    .pipe(dest('src/assets/scss/vendors/bootstrap'))
    .pipe(browserSync.stream());
}

// COPY JS VENDOR FILES
function jsVendor() {
  log(chalk.red.bold('---------------COPY JAVASCRIPT VENDOR FILES INTO DIST---------------'));
  return src([
      'src/assets/js/vendors/*',
    ])
    .pipe(dest('dist/assets/js/vendors/'))
    .pipe(browserSync.stream());
}

// COPY CONFIG FILES
function copyConfig() {
  log(chalk.red.bold('---------------COPY CONFIG FILES INTO DIST---------------'));
  return src([
    'src/config.js',
    'src/config.prod.js'
  ])
    .pipe(dest('dist/'))
    .pipe(browserSync.stream());
}

// COPY FAVICON ICON FILES
function copyFavicon() {
  log(chalk.red.bold('---------------COPY FAVICON ICON INTO DIST---------------'));
  return src([
    'src/favicon-package/*'
  ])
    .pipe(dest('dist/'))
    .pipe(browserSync.stream());
}

// COPY CSS VENDOR FILES
function cssVendor() {
  log(chalk.red.bold('---------------COPY CSS VENDOR FILES INTO DIST---------------'));
  return src([
      'src/assets/vendor/css/*',
    ])
    .pipe(dest('dist/assets/vendor/css'))
    .pipe(browserSync.stream());
}

// PRETTIFY HTML FILES
function prettyHTML() {
  log(chalk.red.bold('---------------HTML PRETTIFY---------------'));
  return src('dist/**/*.html')
    .pipe(prettyHtml({
      indent_size: 4,
      indent_char: ' ',
      unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
    }))
    .pipe(dest('dist'));
}

// DELETE DIST FOLDER
function cleanDist(done) {
  log(chalk.red.bold('---------------REMOVING OLD FILES FROM DIST---------------'));
  del.sync('dist');
  return done();
}

// CREATE DOCS FOLDER FOR DEMO
function generateDocs() {
  log(chalk.red.bold('---------------CREATING DOCS---------------'));
  return src([
      'dist/**/*',
    ])
    .pipe(dest('docs'))
    .pipe(browserSync.stream());
}

// ACCESSIBILITY CHECK
function HTMLAccessibility() {
  return src('dist/**/*.html')
    .pipe(accessibility({
      force: true
    }))
    .on('error', console.log)
    .pipe(accessibility.report({
      reportType: 'txt'
    }))
    .pipe(rename({
      extname: '.txt'
    }))
    .pipe(dest('accessibility-reports'));
}

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).

function generateFavicon(done) {
  log(chalk.red.bold('---------------GENERATING FAVICON---------------'));
  realFavicon.generateFavicon({
    masterPicture: 'src/assets/img/master_favicon.png',
    dest: 'dist',
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '28%',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {
        design: 'background',
        backgroundColor: '#ffffff',
        backgroundRadius: 0.25,
        imageScale: 0.8
      },
      windows: {
        pictureAspect: 'whiteSilhouette',
        backgroundColor: '#2b5797',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'backgroundAndMargin',
        margin: '17%',
        backgroundColor: '#ffffff',
        themeColor: '#ffffff',
        manifest: {
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: true,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#3d3d3d'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false,
      readmeFile: false,
      htmlCodeFile: false,
      usePathAsIs: false
    },
    markupFile: FAVICON_DATA_FILE
  });
  return done();
}

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
function injectFaviconMarkups(){
  log(chalk.red.bold('---------------INJECTING FAVICON MARKUPS---------------'));
	return src([ 'dist/**/*.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
function checkForFaviconUpdates(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
  return done();
}

// ------------ PRODUCTION TASKS -------------

// CHANGE TO MINIFIED VERSIONS OF JS AND CSS
function renameSources() {
  log(chalk.red.bold('---------------RENAMING SOURCES---------------'));
  return src('dist/**/*.html')
    .pipe(htmlreplace({
      'js': 'assets/js/main.min.js',
      'css': 'assets/css/style.min.css'
    }))
    .pipe(dest('dist/'));
}

// CONCATINATE JS SCRIPTS
function concatScripts() {
  log(chalk.red.bold('---------------CONCATINATE SCRIPTS---------------'));
  return src([
     // 'src/assets/js/vendors/jquery.js',
     // 'src/assets/js/vendors/popper.js',
     // 'src/assets/js/vendors/bootstrap.js',
      'src/assets/js/util/autoPadding.js',
      'src/assets/js/util/crossPlatform.js',
      'src/assets/js/*'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/assets/js'))
    .pipe(browserSync.stream());
}

// MINIFY SCRIPTS
function minifyScripts() {
  log(chalk.red.bold('---------------MINIFY SCRIPTS---------------'));
  return src('dist/assets/js/**/*.js')
    .pipe(removeLog())
    .pipe(removeCode({
      production: true
    }))
    .pipe(uglify().on('error', console.error))
    //.pipe(rename('main.min.js'))
    .pipe(dest('dist/assets/js'));
}

// MINIFY CSS

function minifyCss(){
//gulp.task('minify-css',() => {
  log(chalk.red.bold('---------------MINIFY CSS---------------'));
  return src(['src/assets/vendor/css/**/*', 'dist/assets/css/style.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(rename('style.min.css'))
    .pipe(dest('dist/assets/css'));
    //.pipe(gulp.dest('dist'));
}

//generate-favicon, inject-favicon-markups,

// DEFAULT
exports.default = series(cleanDist, copyFont, copyConfig, getVendor, jsVendor, cssVendor, copyImages, compileHTML, compileJS, resetPages, prettyHTML, compileSCSS, browserSyncInit, generateFavicon, injectFaviconMarkups, watchFiles);

// DEVELOPMENT
exports.dev = series(cleanDist, copyFont, copyConfig, getVendor, jsVendor, cssVendor, copyImages, compileHTML, compileJS, resetPages, prettyHTML, compileSCSS, browserSyncInit, generateFavicon, injectFaviconMarkups, watchFiles);

// PRODUCTION
exports.prod = series(cleanDist, copyFont, copyConfig, getVendor, jsVendor, cssVendor, copyImages, compileHTML, compileJS, resetPages, prettyHTML, compileSCSS, minifyCss, minifyScripts, renameSources, browserSyncInit, generateFavicon, injectFaviconMarkups);

// RUN ALL LINTERS
exports.lint = series(htmlLint, scssLint, jsLint);

// RUN ACCESSIILITY CHECK
exports.a11y = HTMLAccessibility;
