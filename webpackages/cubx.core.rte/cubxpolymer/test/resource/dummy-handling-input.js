/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-handling-input' ] = {
  'slots': [
    {
      'slotId': 'inputtest',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'input test 1'
    },
    {
      'slotId': 'inputtest2',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'input test 21'
    },
    {
      'slotId': 'inputtest3',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'input test 3'
    }
  ]
};

