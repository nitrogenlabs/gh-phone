import path from 'path';

let config = {
  env: process.env.NODE_ENV || 'development',
  name: 'gh-phone',
  url: '',
  port: {
    development: 8080,
    production: 8080
  },
  
  filenames: {
    entry: 'app.js',
    index: 'index.html',
    icons: 'icons.svg',
    scss: 'core.scss'
  },
  
  directories: {
    src: 'src',
    dist: 'dist',
    test: 'test'
  },
  
  allowedOrigins: {
    development: [
      'localhost'
    ],
    production: [
      'localhost'
    ]
  }
};

// Utilities
const basePath = path.resolve(__dirname, '../');
config.absolute = (...args) => path.resolve.apply(path.resolve, [basePath, ...args]);
config.relative = (...args) => [...args].join('/');

config.path = {
  tmp: 'tmp',
  doc: './doc',
  test: {
    e2e: config.relative(config.directories.test, 'e2e/**/*.js'),
    unit: config.relative(config.directories.test, 'unit/**/*.spec.js'),
    entry: config.relative(config.directories.test, 'unit/index.js')
  }
};

// Documentation
config.yuidoc = {
  parser: {
    project: {
      name: "LyfePage",
      description: "Documentation",
      version: "0.1.0",
      url: "http://yuilibrary.com/projects/yuidoc",
      logo: "http://yuilibrary.com/img/yui-logo.png",
      options: {
        external: {
          data: "http://yuilibrary.com/yui/docs/api/data.json"
        },
        linkNatives: true,
        attributesEmit: true,
        outdir: "docs/api"
      }
    }
  },
  render: {}
};

// JWT
config.jwt = {
  secret: 'Reaktor2016_AKIAIMMF4IRFHF6ZAILA'
};

// Twilio
// config.twilio = {
//   number: config.env === 'production' ? '+18554165227' : '+15005550006',
//   sid: config.env === 'production' ? 'AC90b0528a911e652d643329a4d7b4d2c7' : 'AC6bd7f513cbed2e5134c650be06cc732e',
//   token: config.env === 'production' ? '3c11de2318b6d5e4209eb2eaa86a9eca' : '520ae739e761bab759b147f1ad28278f',
//   app: 'AP7ecbcef24bb42d182e8bff15a10ffa5b'
// };

config.twilio = {
  number: '+18554165227',
  sid: 'AC90b0528a911e652d643329a4d7b4d2c7',
  token: '3c11de2318b6d5e4209eb2eaa86a9eca',
  app: 'AP7ecbcef24bb42d182e8bff15a10ffa5b',
  agent: 'AP8037dbbb4760e1cfcd4cd0a720051c6f'
};

export default config;