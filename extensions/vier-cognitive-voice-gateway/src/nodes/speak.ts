import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';

export interface ISpeakNodeParams extends INodeFunctionBaseParams {
  config: {
    text: string,
    bargeIn?: boolean,
  };
}

export const speakNode = createNodeDescriptor({
  type: 'speak',
  defaultLabel: 'Speak out (SSML)',
  summary: 'Speak something out to the caller with SSML Support',
  appearance: {
    color: '#5c48ef'
  },
  tags: ['message'],
  fields: [
    {
      key: 'text',
			label: 'Text',
      type: 'cognigyText',
      params: {
        required: true,
        ssmlOptions: [
          {
            label: 'emphasize',
            buttons: [
                {
                  label: 'strong',
                  prefix: '<emphasis level="strong">',
                  suffix: '</emphasis> ',
                },
                {
                  label: 'moderate',
                  prefix: '<emphasis level="moderate">',
                  suffix: '</emphasis> ',
                },
                {
                  label: 'reduced',
                  prefix: '<emphasis level="reduced">',
                  suffix: '</emphasis> ',
                },
            ],
        },
        {
          label: 'pause',
          buttons: [
            {
              label: 'medium pause',
              prefix: '<break strength="medium"/>',
            },
            {
              label: 'strong pause',
              prefix: '<break strength="strong"/>',
            },
            {
              label: 'extra strong pause',
              prefix: '<break strength="x-strong"/>',
            },
            {
              label: 'no pause',
              prefix: '<break strength="none"/>',
            },
            {
              label: '0.3 seconds pause',
              prefix: '<break time="300ms"/>',
            },
            {
              label: '1 second pause',
              prefix: '<break time="1s"/>',
            },
          ],
        },
        {
          label: 'structure',
          buttons: [
            {
              label: 'paragraph',
              prefix: '<p>',
              suffix: '</p>',
            },
            {
              label: 'sentence',
              prefix: '<s>',
              suffix: '</s>',
            },
          ],
        },
        {
          label: 'say as',
          buttons: [
            {
              label: 'verbatim',
              prefix: '<say-as interpret-as="verbatim">',
              suffix: '</say-as>',
            },
            {
              label: 'cardinal',
              prefix: '<say-as interpret-as="cardinal">',
              suffix: '</say-as>',
            },
            {
              label: 'ordinal',
              prefix: '<say-as interpret-as="ordinal">',
              suffix: '</say-as>',
            },
            {
              label: 'characters',
              prefix: '<say-as interpret-as="characters">',
              suffix: '</say-as>',
            },
            {
              label: 'fraction',
              prefix: '<say-as interpret-as="fraction">',
              suffix: '</say-as>',
            },
            {
              label: 'unit',
              prefix: '<say-as interpret-as="unit">',
              suffix: '</say-as>',
            },
            {
              label: 'time',
              prefix: '<say-as interpret-as="time format="hms24">',
              suffix: '</say-as>',
            },
            {
              label: 'expletive (beep)',
              prefix: '<say-as interpret-as="expletive">',
              suffix: '</say-as>',
            },
            {
              label: 'date',
              prefix: '<say-as interpret-as="date" format="dmy">',
              suffix: '</say-as>',
            },
          ],
        },
        {
          label: 'speech rate',
          buttons: [
            {
              label: 'slow',
              prefix: '<prosody rate="slow">',
              suffix: '</prosody>',
            },
            {
              label: 'medium',
              prefix: '<prosody rate="medium">',
              suffix: '</prosody>',
            },
            {
              label: 'fast',
              prefix: '<prosody rate="fast">',
              suffix: '</prosody>',
            },
            {
              label: '80%',
              prefix: '<prosody rate="80%">',
              suffix: '</prosody>',
            },
            {
              label: '125%',
              prefix: '<prosody rate="125%">',
              suffix: '</prosody>',
            },
          ],
        },
        {
          label: 'speech volume',
          buttons: [
            {
              label: 'low',
              prefix: '<prosody volume="low">',
              suffix: '</prosody>',
            },
            {
              label: 'medium',
              prefix: '<prosody volume="medium">',
              suffix: '</prosody>',
            },
            {
              label: 'high',
              prefix: '<prosody volume="high">',
              suffix: '</prosody>',
            },
            {
              label: '-6dB',
              prefix: '<prosody volume="-6dB">',
              suffix: '</prosody>',
            },
            {
              label: '+6dB',
              prefix: '<prosody volume="+6dB">',
              suffix: '</prosody>',
            },
          ],
        },
        {
          label: 'speech pitch',
          buttons: [
            {
              label: 'x-low',
              prefix: '<prosody pitch="x-low">',
              suffix: '</prosody>',
            },
            {
              label: 'low',
              prefix: '<prosody pitch="low">',
              suffix: '</prosody>',
            },
            {
              label: 'medium',
              prefix: '<prosody pitch="medium">',
              suffix: '</prosody>',
            },
            {
              label: 'high',
              prefix: '<prosody pitch="high">',
              suffix: '</prosody>',
            },
            {
              label: 'xhigh',
              prefix: '<prosody pitch="x-high">',
              suffix: '</prosody>',
            },
          ],
        },
        {
            label: 'phoneme',
            prefix: '<phoneme alphabet="ipa" ph="təmei̥ɾou̥"> tomato </phoneme>',
        },
        {
            label: 'audio',
            prefix: '<audio src=""/>',
        },
        {
            label: 'voice',
            prefix: '<voice name="en-US-AriaNeural">',
            suffix: '</voice>',
        },
      ],
      },
    },
    {
      type: 'checkbox',
      key: 'bargeIn',
      label: 'Barge In',
      description: 'Allows the message to be interrupted by the speaker',
      defaultValue: false,
    },
  ],
  sections: [
    {
      key: 'general',
      fields: ['text'],
      label: 'General Settings',
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: ['bargeIn'],
      label: 'Additional Settings',
      defaultCollapsed: true
    }
  ],
  form: [
    {
      key: 'general',
      type: 'section'
    },
    {
      key: 'additional',
      type: 'section',
    }
  ],
  function: async ({ cognigy, config }: ISpeakNodeParams) => {
    if (!config.text.startsWith('<speak>') || !config.text.endsWith('</speak>')) {
      cognigy.api.say(`<speak>${config.text}</speak>`, {
        interpretAs: 'SSML',
        bargeIn: config.bargeIn,
      });
    } else {
      cognigy.api.say(config.text, {
        interpretAs: 'SSML',
        bargeIn: config.bargeIn,
      });
    }
  },
});
