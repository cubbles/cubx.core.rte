/* globals getTestComponentCacheEntry */
'use strict';

getTestComponentCacheEntry()[ 'dummy-slots-handling' ] = {
  'slots': [
    {
      'slotId': 'inputvalue',
      'description': 'This is the inputvalue slot',
      'type': 'string',
      'direction': [ 'input' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputvalue',
      'description': 'This is the outputvalue slot',
      'type': 'string',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvalue',
      'description': 'This is the inputoutputvalue slot',
      'type': 'string',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputvalueWithoutType',
      'description': 'This is the inputvalueWithoutType slot',
      'direction': [ 'input' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputvalueWithoutType',
      'description': 'This is the outputvalueWithoutType slot',
      'direction': [ 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvalueWithoutType',
      'description': 'This is the inputoutputvalueWithoutType slot',
      'direction': [ 'input', 'output' ],
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'inputoutputvaluePerDefault',
      'description': 'This is the inputoutputvaluePerDefault slot',
      'type': 'string',
      'value': 'Hallo Webble Word!'
    },
    {
      'slotId': 'outputobject',
      'description': 'This is the outputobject slot',
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
      'description': 'This is the outputobjectarray slot',
      'type': 'array',
      'direction': [ 'output' ],
      'value': [ { foo: 'bar' }, { foo2: 'bar2' } ]
    },

    {
      'slotId': 'inputobject',
      'description': 'This is the inputobject slot',
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
      'description': 'This is the inputobjectarray slot',
      'type': 'array',
      'direction': [ 'input' ],
      'value': [ { foo: 'bar' }, { foo2: 'bar2' } ]
    }
  ]
};
