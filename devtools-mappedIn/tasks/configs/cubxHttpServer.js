'use strict';

module.exports = function (grunt) {
  return {
    tasks: {
      'cubx-http-server': {
        'dev': {
          // the server root directory
          root: '../<%= workspaceName %>/',

          // the server port
          // can also be written as a function, e.g.
          // port: function() { return 8282; }
          port: 8282,

          // the host ip address
          // If specified to, for example, "127.0.0.1" the server will
          // only be available on that ip.
          // Specify "0.0.0.0" to be available everywhere
          host: 'localhost',

          cache: 1,
          showDir: true,
          autoIndex: true,

          // server default file extension
          ext: 'html',

          // run in parallel with other tasks
          runInBackground: false,

          // specify a logger function. By default the requests are
          // sent to stdout.
          logFn: function (req, res, error) {
          },

          // Proxies all requests which can't be resolved locally to the given url
          // Note this this will disable 'showDir'
          proxy: '<%= workspaceConfig.remoteStoreUrl %>',

          // open browser after start
          openBrowser: true

          // set networkProxyUrl if you need to connect to given proxy server using a proxy
          // networkProxyUrl: '[proto]://[host]:[port]' e.g. 'http://proxy:1234'
        }
      }
    }
  };
};
