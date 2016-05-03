/* globals jQuery, cubx*/
/**
 * Created by pwr on 02.12.2014.
 */
// module for loading jquery without letting it set any global variables like "$" or "jQuery"
cubx.amd.define([ 'jquery' ], function () {
  'use strict';
  return jQuery.noConflict(true);
});
