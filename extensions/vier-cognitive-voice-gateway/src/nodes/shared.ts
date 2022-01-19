import { INodeField } from '@cognigy/extension-tools/build/interfaces/descriptor';

export const promptFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'text',
    label: 'Message',
    description: 'The message to introduce the prompt to the caller',
    params: {
      required: true,
    }
  },
  {
    type: 'number',
    key: 'timeout',
    label: 'Timeout',
    description: 'The duration in seconds after which the prompt will be cancelled',
    params: {
      required: true
    }
  },
  {
    type: 'text',
    key: 'language',
    label: 'Language',
    description: 'This allows to override the synthesizer language for specific messages',
  },
  {
    type: 'textArray',
    key: 'synthesizers',
    label: 'Synthesizers',
    description: 'If specified, this parameter overrides the synthesizer list from the project settings',
  },
  {
    type: 'select',
    key: 'interpretAs',
    label: 'Interpret as',
    description: 'Explicitly states what the given text should be interpreted as.',
    params: {
      options: [
        {
          value: 'SSML',
          label: 'SSML'
        },
        {
          value: 'TEXT',
          label: 'Text'
        }
      ]
    }
  },
  {
    type: 'checkbox',
    key: 'bargeIn',
    label: 'Barge In',
    description: 'Allows the message to be interrupted by the speaker',
    defaultValue: false,
  },
];

export const commonRedirectFields: Array<INodeField> = [
  {
    type: 'cognigyText',
    key: 'callerId',
    label: 'Displayed Caller ID',
    description: 'The phone number displayed to the callee. (This is a best-effort option, correct display can not be guaranteed)',
    params: {
      placeholder: '+E.164 format, e.g. "+49721480848680"'
    }
  },
  {
    type: 'json',
    key: 'customSipHeaders',
    label: 'Custom SIP Headers',
    description: 'An object where each property is the name of a header, and the value is a list of strings. All header names must begin with X-.'
  },
  {
    type: 'number',
    key: 'ringTimeout',
    label: 'Ring Timeout (s)',
    description: 'The maximum time (in seconds) the call will be ringing before the attempt will be cancelled',
    defaultValue: 15,
    params: {
      placeholder: 'Value in Seconds, e.g. 60 for 1 minute',
      min: 10,
      max: 120
    },
  },
  {
    type: 'checkbox',
    key: 'acceptAnsweringMachines',
    label: 'Accept Answering Machines',
    description: 'Wether the bot should accept answering machines picking up.',
    defaultValue: false,
  },
  {
    type: 'json',
    key: 'data',
    label: 'Custom Data',
    description: 'An object with key-value pairs to be attached as custom data to the dialog',
  },
  {
    type: 'checkbox',
    key: 'endFlow',
    label: 'Quit Flow',
    defaultValue: false,
    description: 'Stop the flow after executing this node'
  },
  {
    type: 'checkbox',
    key: 'experimentalEnableRingingTone',
    label: '(EXPERIMENTAL) Enable Ringing Tone',
    description: 'Enables the playback of a ringing tone while the call is pending. This option will change in the future.',
    defaultValue: false,
  },
  {
    type: 'cognigyText',
    key: 'whisperingText',
    label: 'Whisperred Text to the transfered party',
    description: 'The text played out to the person the call is transfered to before both call parties will be joined'
  }
];
