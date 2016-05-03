/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-output-handling' ] = {
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
      'slotId': 'outputvalue2',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputvalue3',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputobject',
      'type': 'object',
      'direction': [ 'output' ],
      'value': {
        first: 'xxxfirstxxx',
        second: {
          third: 'xxxthirdxxx'
        }
      }
    },
    {
      'slotId': 'outputobjectarray',
      'type': 'array',
      'direction': [ 'output' ],
      'value': [ { foo: 'bar' }, { foo2: 'bar2' } ]
    },

    {
      'slotId': 'outputstringarray',
      'type': 'array',
      'direction': [ 'output' ],
      'value': [ 'foo', 'bar' ]
    }
  ]
};
