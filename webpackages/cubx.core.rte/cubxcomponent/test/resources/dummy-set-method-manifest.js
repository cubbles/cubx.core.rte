/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-set-method' ] = {
  'slots': [
    {
      'slotId': 'inputvalue',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'Hallo Cubbles World!'
    },
    {
      'slotId': 'outputvalue',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Cubbles World!'
    },
    {
      'slotId': 'test',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'changehooktest!'
    },
    {
      'slotId': 'secondtest',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'changehooktest with cloned value'
    },
    {
      'slotId': 'inputoutputwithoutdirectionvalue',
      'type': 'string',
      'value': 'Hallo Cubbles World!'
    },
    {
      'slotId': 'inputoutputvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Cubbles World!'
    }
  ]
};
