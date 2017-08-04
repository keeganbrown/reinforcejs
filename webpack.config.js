const ENV = process.env.NODE_ENV;

let config;
switch(ENV){
  case 'production':
    config = require('./webpack/config.prod');
    break;
  default:
    config = require('./webpack/config.dev');
    break;
};

module.exports = config;
