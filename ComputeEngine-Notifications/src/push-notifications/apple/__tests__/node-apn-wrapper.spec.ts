import { parseResult } from '../node-apn-wrapper';

describe('node-apn-wrapper - parseResult', () => {
  it('Handles successful response', () => {
    const result = parseResult({
      'sent': [
        { 'device': 'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486f' },
        { 'device': '7c9f00d0c65400d954dc98bc57c7fe197604bb3d595aa2871e30be311bf09e8c' },
        { 'device': 'faee7d835579ae702335016965ed098d7a791b8e761f79fbb4a6e79a639b14e2' }
      ],
      'failed': []
    });

    expect(result).toEqual({
      delivered: [
        'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486f',
        '7c9f00d0c65400d954dc98bc57c7fe197604bb3d595aa2871e30be311bf09e8c',
        'faee7d835579ae702335016965ed098d7a791b8e761f79fbb4a6e79a639b14e2',
      ],
      failed: []
    });
  });

  it("Handles '400 BadDeviceToken' error response", () => {
    const result = parseResult({
      'sent': [],
      'failed': [
        {
          'device': 'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486fAAAA',
          'status': 400,
          'response': {
            'reason': 'BadDeviceToken'
          }
        }
      ]
    });

    expect(result).toEqual({
      delivered: [],
      failed: [
        {
          device: 'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486fAAAA',
          reason: "Status: '400', message: 'BadDeviceToken'"
        }
      ]
    });
  });


  it('Handles rejected error response', () => {
    const result = parseResult({
      'sent': [],
      'failed': [
        {
          'device': 'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486f',
          error: new Error('ERROR_MESSAGE')
        }
      ]
    });

    expect(result).toEqual({
      delivered: [],
      failed: [
        {
          'device': 'dfb7de32f2f4d1261c9ddf224f21c8f5e402c2f9d64b17e51e4409b5f3d5486f',
          'reason': 'ERROR_MESSAGE'
        }
      ]
    });
  });
});
