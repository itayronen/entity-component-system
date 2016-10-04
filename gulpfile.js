"use strict"

var gulp = require("gulp");
var merge2 = require('merge2');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var gulpServer = require('gulp-live-server');
var tap = require('gulp-tap');
var path = require('path');
var del = require("del");
var tsExport = require('gulp-ts-export').default;

// Config

var packageJson = require("./package.json");
packageJson.config = packageJson.config || {};
var packageSource = packageJson.config.sourceDir || "src";
var outputDir = packageJson.config.outputDir || "lib";
var rootExport = packageJson.config.rootExport || "No Root...";

var tsconfigPath = packageSource + '/tsconfig.json';
let tsconfigToCodePath = "code";
var typescriptsDir = packageSource + "/" + tsconfigToCodePath;
let externalTypesSrc = ["typings/index.d.ts"];
var libraryTsSrc = [typescriptsDir + "/**/*.ts", "!" + typescriptsDir + "/**/*.test.ts"];
var tsAndTestsSrc = [typescriptsDir + "/**/*.ts"];
var unitTestsSrc = [typescriptsDir + "/**/*.test.ts"];
var unitTestsOutput = "unit-tests";

let mainFilePath = packageJson.main;
let mainFileName = path.basename(mainFilePath);
let mainFileDir = path.dirname(mainFilePath);

let typingsFilePath = packageJson.typings || packageJson.types;
let typingsFileName = path.basename(typingsFilePath);
let typingsFileDir = path.dirname(typingsFilePath);

// Tasks names

let buildTask = 'build';
let cleanTask = "clean";
let compileTsTask = "compile";
let compileToMemoryTask = "compile ts to memory";
let injectTestsToPageTask = 'inject test to html';
let generateExportsTask = "generate exports";
let compileTsBundleTask = "compile ts bundle";

// Tasks

gulp.task(buildTask, [generateExportsTask, injectTestsToPageTask, compileTsTask, compileTsBundleTask]);

gulp.task(cleanTask, function () {
    return del([
        outputDir + '/**/*'
    ]);
});

gulp.task(generateExportsTask, function () {
    return gulp.src(libraryTsSrc, { base: packageSource, read: false })
        .pipe(tsExport(typingsFileName, { exportedBase: "./" }))
        .pipe(gulp.dest(typingsFileDir))
        ;
});

gulp.task(compileTsBundleTask, () => {
    let tsBundledProject = ts.createProject(tsconfigPath, {
        outFile: mainFileName,
        rootDir: tsconfigToCodePath
    });

    return gulp.src(libraryTsSrc.concat(externalTypesSrc), { base: typescriptsDir })
        .pipe(tap(file => {
            file.path = file.path.replace(file.relative, packageJson.name + "/" + file.relative);
        }))
        .pipe(sourcemaps.init())
        .pipe(ts(tsBundledProject))
        .pipe(tap(file => {
            file.contents = new Buffer(file.contents.toString().replace(
                packageJson.name + "/" + rootExport.replace(".ts", ""),
                packageJson.name));
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(mainFileDir))
        ;
});

let jsStream;
let dtsStream;
gulp.task(compileToMemoryTask, function () {
    let tsProject = ts.createProject(tsconfigPath, {
        declaration: true,
    });

    let tsResults = gulp.src(tsAndTestsSrc.concat(externalTypesSrc), { base: packageSource })
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    dtsStream = tsResults.dts
        ;

    jsStream = tsResults.js
        .pipe(sourcemaps.write())
        ;
});

gulp.task(compileTsTask, [compileToMemoryTask, cleanTask], function () {
    return merge2([
        jsStream.pipe(gulp.dest(outputDir)),
        dtsStream.pipe(gulp.dest(outputDir))]);
});

// gulp.task('watch ts', function () {
//     // TODO: Only compile changed files.
//     gulp.watch('**/*.ts', [compileTsTask]);
// });

gulp.task(injectTestsToPageTask, function () {
    var token = "// Unit tests token";
    var packageNameToken = "<package name token>";
    var scripts = [];
    var isFirst = true;

    gulp.src(unitTestsSrc)
        .pipe(tap(function (file) {
            var relativePath = path.relative(packageSource, file.path);
            var relativePathToJs = "./" + relativePath.replace(/\\/g, '/').replace(".ts", ".js");
            var scriptToTest = scripts.length == 0 ?
                "System.import(\"" + relativePathToJs + "\")" :
                ".then(()=>System.import(\"" + relativePathToJs + "\"))";

            scripts.push(scriptToTest);
        })).on('end', function () {
            gulp.src('src/unit-tests.html')
                .pipe(tap(function (file) {
                    file.contents = new Buffer(file.contents.toString()
                        .replace(token, scripts.join('\n')));
                }))
                .pipe(gulp.dest(outputDir));
        });
});

gulp.task('start web server', function () {
    var server = gulpServer.static("./", 8888);
    server.start();

    // gulp.watch([outputDir + '/**/*'], function (file) {
    //     server.notify.apply(server, [file]);
    // });
});