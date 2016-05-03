/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-set-method' ] = {
  'slots': [
    {
      'slotId': 'inputvalue',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputvalue',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
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
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    }
  ]
};
