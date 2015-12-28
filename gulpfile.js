const lazyReq = require("lazy-req")(require);
/// <binding Clean="clean" ProjectOpened="watch" />

// LazyRequire helps us speed things up considerably,
// but also tends to make our code really ugly. Still it
// is worth it to keep every gulp command from loading
// every package it may not use and taking a long time to start
const gulp = require("gulp"),
    jshint = lazyReq("gulp-jshint"),
    socketServer = lazyReq("gulp-develop-server"),
    staticServer = lazyReq("gulp-webserver"),
    // TODO: implement production vs dev build pipeline
    gulpif = lazyReq("gulp-if"),
    yargs = lazyReq("yargs"),
    replace = lazyReq("gulp-replace"),
    guppy = lazyReq("git-guppy"),
    gulpFilter = lazyReq("gulp-filter");

gulp.task("lint", ["lint:js"]);
gulp.task("lint:js", function () {
    return gulp.src(["src/**/*.js"])
        .pipe(jshint()(".jshintrc"))
        .pipe(jshint().reporter("default"));
});

// for now build is very simple, and just makes sure
// that any pointers to localhost get replaced with
// our test server instead, but in the future this will
// allow for proper seperation of client/server code,
// minification, and uglification
// set --test to replace to test server
gulp.task("build", function() {
  return gulp.src("src/**/*.*")
    // TODO: real templating support!
    .pipe(gulpif()(yargs().argv.test,
      replace()("localhost",
                "gameserver.westus.cloudapp.azure.com")))
    .pipe(gulp.dest("build"));
});

gulp.task("server", ["server:socket", "server:static"]);
gulp.task("server:socket", ["build"], function(){
  // TODO: debug mode?
  socketServer().listen({
    path: "../ige/server/ige.js",
    args: ["-g", "./build"]
  });
});
gulp.task("server:static", function() {
  gulp.src(["build", "../ige", "assets"])
    .pipe(staticServer()({
      fallback: "index.html"
    }));
});

// watch task to reprocess src and maybe restart server when changed
gulp.task("watch", ["server"], function () {
    gulp.watch("src/**/*.js").on("change", function(event){

      // get the destination for this file
      console.log("\r\nFile " + event.path +
        " was " + event.type + ", running tasks...");

      var outPath = event.path.replace("src", "build");
      outPath = outPath.substring(0, outPath.lastIndexOf("\\"));

      // TODO this is common file build pipe, refactor
      // out into reusable code.
      return gulp.src(event.path)
        .pipe(gulp.dest(outPath))
        .pipe(socketServer().restart(function(){
          console.log("Server restarted");
        }));
    });
});

gulp.task("pre-commit", function() {
  return guppy()(gulp).stream("pre-commit")
    .pipe(gulpFilter()(["src/*.js"]))
    .pipe(jshint()(".jshintrc"))
    .pipe(jshint().reporter("default"))
    .pipe(jshint().reporter("fail"));
});

gulp.task("default", function(){
  console.log("No default, try one of:");
  console.log("\t" + Object.keys(gulp.tasks).join("\n\t"));
});
