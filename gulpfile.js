/// <binding Clean='clean' ProjectOpened='watch' />
var gulp = require("gulp"),
    jshint = require("gulp-jshint"),
    socketServer = require("gulp-develop-server");
    staticServer = require("gulp-webserver");

gulp.task("lint", ["lint:js"]);
gulp.task("lint:js", function () {
    return gulp.src(["./**/*.js", "!node_modules/**/**.js"])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("default"));
})

gulp.task("server", ["server:socket", "server:static"]);
gulp.task("server:socket", function(){
  socketServer.listen({
    path: "../ige/server/ige.js",
    args: ["-g", "./src"]
  });
})
gulp.task('server:static', function() {
  gulp.src(['src', '../ige', 'assets'])
    .pipe(staticServer({
      fallback: 'index.html'
    }));
});

// watch task to reprocess src and maybe restart server when changed
gulp.task("watch", ["server"], function () {
    gulp.watch("src/**/*.js").on("change", function(event){
      console.log("\r\nFile " + event.path + " was " + event.type + ", running tasks...");
      return socketServer.restart(function(){
        console.log("Server restarted");
      });
    });
});

gulp.task("default", function(){
  console.log('No default, try one of:');
  console.log('\t' + Object.keys(gulp.tasks).join('\n\t'));
})
