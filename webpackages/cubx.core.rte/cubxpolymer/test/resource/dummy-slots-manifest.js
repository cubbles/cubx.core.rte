/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-slots-handling' ] = {
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
      'slotId': 'inputoutputvalue',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputvalueWithoutType',
      'direction': [ 'input' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputvalueWithoutType',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvalueWithoutType',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvaluePerDefault',
      'type': 'string',
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
      'slotId': 'inputobject',
      'type': 'object',
      'direction': [ 'input' ],
      'value': {
        first: 'xxxfirstxxx',
        second: {
          third: 'xxxthirdxxx'
        }
      }
    },
    {
      'slotId': 'inputobjectarray',
      'type': 'array',
      'direction': [ 'input' ],
      'value': [ { foo: 'bar' }, { foo2: 'bar2' } ]
    }
  ]
};
