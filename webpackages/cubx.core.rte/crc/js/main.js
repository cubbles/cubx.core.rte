/**
 * Created by pwr on 02.12.2014.
 */

(function () {
  'use strict';
  var url = window.cubx.CRCLoader.getCRCBaseUrl();
  var requireConfig = {
    paths: {
      'storageManager': url + '/modules/storageManager/storageManager',
      'text': url + '/modules/text/text',
      'dependencyManager': url + '/modules/dependencyManager/depMgr',
      'cache': url + '/modules/cache/cache',
      'componentResolver': url + '/modules/componentResolver/componentResolver',
      'utils': url + '/modules/utils/utils',
      'eventFactory': url + '/modules/eventFactory/eventFactory',
      'responseCache': url + '/modules/responseCache/responseCache',
      'manifestConverter': url + '/modules/manifestConverter/manifestConverter',
      'axios': url + '/modules/axios/axios.min',
      'dependencyTree': url + '/modules/dependencyTree/dependencyTree'
    }
  };

  window.cubx.amd.require.config(requireConfig);
})();
