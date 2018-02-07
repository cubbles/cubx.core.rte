/* eslint no-unused-vars: [2, { "varsIgnorePattern": "createTestConnection" }] */
'use strict';
function createTestConnection (obj, staticFlag, internalFlag) {
  var con;
  con = new window.cubx.cif.ConnectionManager.Connection();
  con.connectionId = obj.connectionId;
  con.source.memberId = obj.source.memberId;
  con.source.component = obj.source.component;
  con.source.slot = obj.source.slot;
  con.destination.memberId = obj.destination.memberId;
  con.destination.component = obj.destination.component;
  con.destination.slot = obj.destination.slot;
  if (obj.repeatedValues) {
    con.repeatedValues = obj.repeatedValues;
  }
  if (obj.copyValue) {
    con.copyValue = obj.copyValue;
  }
  if (obj.hookFunction) {
    con.hookFunction = obj.hookFunction;
  }

  con.static = staticFlag;
  con.internal = typeof internalFlag === 'boolean' ? internalFlag : false;
  return con;
};
