import gulp from 'gulp';
import env from 'gulp-env';
import runSequence from 'run-sequence';

gulp.task('default', ['dev']);
gulp.task('dev', done => {
  runSequence(
    'env:dev',
    'clean',
    'server:dev',
    done
  );
});

gulp.task('release', done => {
  runSequence(
    'compile',
    'js:copy',
    'server:release',
    done
  );
});

gulp.task('compile', done => {
  runSequence(
    'env:release',
    'clean',
    done
  );
});

gulp.task('env:dev', () => {
  env.set({
    NODE_ENV: 'development'
  })
});

gulp.task('env:release', () => {
  env.set({
    NODE_ENV: 'production'
  })
});