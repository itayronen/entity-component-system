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
var packageSourceDir = packageJson.config.sourceDir || "src";
var outputDir = packageJson.config.outputDir || "lib";
var rootExportPath = packageJson.config.rootExport || undefined;

var tsconfigPath = packageSourceDir + '/tsconfig.json';
let tsconfigToCodePath = "code";
var typescriptsDir = packageSourceDir + "/" + tsconfigToCodePath;
let externalTypesSrc = ["typings/index.d.ts"];
var libraryTsSrc = [typescriptsDir + "/**/*.ts", "!" + typescriptsDir + "/**/*.test.ts"];
var tsAndTestsSrc = [typescriptsDir + "/**/*.ts"];
var unitTestsSrc = [typescriptsDir + "/**/*.test.ts"];

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
let generateMainDeclerationFileTask = "generate main decleration file";
let compileTsBundleTask = "compile ts bundle";

// Help functions

function prefixPathByPackageName(file) {
    file.path = file.path.replace(file.relative, packageJson.name + "/" + file.relative);
}

function prefixPathByPackageNameStream() {
    return tap(file =>
        file.path = file.path.replace(file.relative, packageJson.name + "/" + file.relative));
}

function getPackageTsStream() {
    return gulp.src(libraryTsSrc, { base: typescriptsDir })
        .pipe(prefixPathByPackageNameStream());
}

function replace_RootExport_Registration_With_PackageName(mainFile) {
    let rootExportRelativePath = path.relative(typescriptsDir, rootExportPath);
    let rootRegistration = packageJson.name + "/" + rootExportRelativePath.replace(".ts", "");

    mainFile.contents = new Buffer(mainFile.contents.toString()
        .replace(rootRegistration, packageJson.name));
}

// Tasks

gulp.task(buildTask, [generateMainDeclerationFileTask, injectTestsToPageTask, compileTsTask, compileTsBundleTask]);

gulp.task(cleanTask, function () {
    return del([
        outputDir + '/**/*'
    ]);
});

gulp.task(generateMainDeclerationFileTask, function () {
    let src = rootExportPath ?
        gulp.src(rootExportPath, { base: packageSourceDir }) :
        gulp.src(libraryTsSrc, { base: packageSource, read: false });

    return src
        .pipe(tsExport(typingsFileName, { exportedBase: "./" }))
        .pipe(gulp.dest(typingsFileDir))
        ;
});

gulp.task(compileTsBundleTask, () => {
    let tsBundledProject = ts.createProject(tsconfigPath, {
        outFile: mainFileName,
        rootDir: tsconfigToCodePath
    });

    return merge2(
        getPackageTsStream(),
        gulp.src(externalTypesSrc))
        .pipe(sourcemaps.init())
        .pipe(ts(tsBundledProject))
        .pipe(tap(file => replace_RootExport_Registration_With_PackageName(file)))
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

    let tsResults = gulp.src(tsAndTestsSrc.concat(externalTypesSrc), { base: packageSourceDir })
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
            var relativePath = path.relative(packageSourceDir, file.path);
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