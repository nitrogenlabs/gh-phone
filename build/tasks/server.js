import gulp from 'gulp';
import childProcess from 'child_process';

gulp.task('server:dev', (done) => {
  let exec = childProcess.exec;
  let proc = exec('nodemon --watch build --watch graphql --watch models development.js');
  proc.stderr.on('data', (data) => {
    return process.stdout.write(data);
  });
  proc.stdout.on('data', (data) => {
    return process.stdout.write(data);
  });
  proc.stdout.on('end', function () {
    done();
  });
});