/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-get-method' ] = {
  'slots': [
    {
      'slotId': 'inputvalue',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'Hallo Webble Word! (inputvalue)'
    },
    {
      'slotId': 'outputvalue',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word! (outputvalue)'
    },
    {
      'slotId': 'inputoutputvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word! (inputoutputvalue)'
    }

  ]
};
