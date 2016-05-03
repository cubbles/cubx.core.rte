/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-default-value' ] = {
  'slots': [
    {
      'slotId': 'stringvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'numbervalue',
      'type': 'number',
      'direction': [ 'input', 'output' ],
      'value': 3
    },
    {
      'slotId': 'objectvalue',
      'type': 'object',
      'direction': [ 'object', 'output' ],
      'value': { 'foo': 'bar' }
    },
    {
      'slotId': 'arrayvalue',
      'type': 'array',
      'direction': [ 'input', 'output' ],
      'value': [ 2, 3, 4 ]
    },
    {
      'slotId': 'stringvalue2',
      'type': 'string',
      'direction': [ 'input', 'output' ]
    },
    {
      'slotId': 'numbervalue2',
      'type': 'number',
      'direction': [ 'input', 'output' ]
    },
    {
      'slotId': 'objectvalue2',
      'type': 'object',
      'direction': [ 'input', 'output' ]
    },
    {
      'slotId': 'arrayvalue2',
      'type': 'array',
      'direction': [ 'input', 'output' ]
    },
    {
      'slotId': 'typlessvalue',
      'direction': [ 'input', 'output' ]
    }
  ]
};
