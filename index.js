'use strict';

let build = require('gulp-core-build');

let plugins = {
  build: build,
  typescript: require('gulp-core-build-typescript'),
  sass: require('gulp-core-build-sass'),
  karma: require('gulp-core-build-karma'),
  webpack: require('gulp-core-build-webpack'),
  serve: require('gulp-core-build-serve')
};

let tasks = {
  typescript: plugins.typescript.typescript,
  tslint: plugins.typescript.tslint,
  text: plugins.typescript.text,
  sass: plugins.sass.default,
  karma: plugins.karma.default,
  webpack: plugins.webpack.default,
  serve: plugins.serve.serve,
  reload: plugins.serve.reload
};

// Shortcuts since node doesn't support destructuring by default yet.
let task = build.task;
let parallel = build.parallel;
let serial = build.serial;
let watch = build.watch;

// Define task groups.
let buildTasks = task('build', parallel(tasks.tslint, tasks.typescript, tasks.text, tasks.sass));
let testTasks = task('test', serial(buildTasks, tasks.karma));
let bundleTasks = task('bundle', serial(buildTasks, tasks.webpack));
let defaultTasks = task('default', bundleTasks);
let serveTasks = task('serve',
  serial(
    bundleTasks,
    tasks.serve,
    watch('src/**/*.{ts,tsx,scss,js,txt,html}', serial(bundleTasks, tasks.reload))
  )
);

// Export tasks, groups, and initialize.
module.exports = {
  plugins: plugins,

  tasks: tasks,

  setConfig: (config) => build.setConfig(config),

  replaceConfig: (config) => build.replaceConfig(config),

  initialize: (gulp) => build.initialize(gulp)
};
