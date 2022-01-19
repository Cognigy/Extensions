import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools/build';

export interface IPlayParams extends INodeFunctionBaseParams {
  config: {
    url: string,
    bargeIn?: boolean
  };
}

export const playNode = createNodeDescriptor({
  type: 'playAudioFile',
  defaultLabel: 'Play Audio File',
  summary: 'Play an audio file to the call',
  appearance: {
    color: '#678465'
  },
  tags: ['message'],
  fields: [
    {
      type: 'text',
      key: 'url',
      label: 'Audio URL',
      description: 'Location of audio file. Allowed formats: Linear PCM with signed 16 bits 8 kHz or 16 Hz, A-law or µ-law 8 kHz.',
      params: {
        required: true,
        placeholder: '',
      }
    },
    {
      type: 'checkbox',
      key: 'bargeIn',
      label: 'Barge In',
      description: 'Allows the audio file to be interrupted by the speaker',
      defaultValue: false,
    }
  ],
  sections: [
    {
      key: 'general',
      fields: ['url'],
      label: 'General Settings',
      defaultCollapsed: false,
    },
    {
      key: 'additional',
      fields: ['bargeIn'],
      label: 'Additional Settings',
      defaultCollapsed: true,
    }
  ],
  form: [
    {
      key: 'general',
      type: 'section',
    },
    {
      key: 'additional',
      type: 'section'
    }
  ],
  function: async ({ cognigy, config }: IPlayParams) => {
    const { api } = cognigy;

    api.say('', {
      status: 'play',
      ...config,
    });
  }
});
