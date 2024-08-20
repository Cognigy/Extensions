import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';
import t from '../translations';
import {
  normalizeText,
} from "../helpers/util";
import {
  bargeInFields,
  bargeInForm,
  BargeInInputs,
  bargeInSection,
  convertBargeIn,
} from "../common/bargeIn";
import {
  generalSection,
  generalSectionFormElement,
} from "../common/shared";

interface ISpeakNodeInputs extends BargeInInputs {
  text: string,
  timeout?: number,
  // additionalText: Array<string>,
  linear?: boolean,
  loop?: boolean,
}

export interface ISpeakNodeParams extends INodeFunctionBaseParams {
  config: ISpeakNodeInputs;
}

export const speakNode = createNodeDescriptor({
  type: 'speak',
  defaultLabel: t.speak.nodeLabel,
  summary: t.speak.nodeSummary,
  appearance: {
    color: '#5c48ef',
  },
  tags: ['message'],
  fields: [
    {
      key: 'text',
      label: t.speak.inputTextLabel,
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
                prefix: '<say-as interpret-as="time" format="hms24">',
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
    ...bargeInFields,
    // will be needed for later implementation
    // {
    //   key: 'additionalText',
    //   label: t('speak.inputAdditionalTextLabel'),
    //   type: 'textArray',
    //   defaultValue: false,
    // },
    // {
    //   key: 'linear',
    //   label: 'Linear',
    //   type: 'toggle',
    //   defaultValue: false
    // },
    // {
    //   key: 'loop',
    //   label: 'Loop',
    //   type: 'toggle',
    //   defaultValue: false
    // }
  ],
  preview: {
    key: 'text',
    type: 'text',
  },
  sections: [
    generalSection(['text']),
    bargeInSection,
    // {
    //   fields: ['additionalText'],
    //   key: 'textOptions',
    //   label: t.speak.sectionTextOptionsLabel,
    //   defaultCollapsed: true
    // },
    // {
    //   key: 'sendOptions',
    //   fields: ['linear', 'loop'],
    //   label: 'Optionen',
    //   defaultCollapsed: true,
    // },
  ],
  form: [
    generalSectionFormElement,
    bargeInForm,
    // {
    //   key: 'textOptions',
    //   type: 'section'
    // },
    // {
    //   key: 'sendOptions',
    //   type: 'section'
    // },
  ],
  function: async ({ cognigy, config }: ISpeakNodeParams) => {
    const { api } = cognigy;
    //#region Future Functionality (Need to be able to determine the global execution amount of the node)
    // const { additionalText, loop, linear } = config;
    //const execs = cognigy.api.getExecutionAmount(speakNode._id);
    // let textToTransmit: string;

    // if (!linear) {
    //   textToTransmit = additionalText[Math.floor(Math.random() * additionalText.length - 1)];
    // } else {
    //   if (execs > additionalText.length) {
    //     if (loop) {
    //       textToTransmit = additionalText[execs % additionalText.length];
    //     } else {
    //       textToTransmit = additionalText[additionalText.length - 1];
    //     }
    //   } else {
    //     textToTransmit = additionalText[execs];
    //   }
    // }
    // cognigy.api.say(`Execution Count: ${execs}, text to say: ${textToTransmit}, linear: ${linear}; loop: ${loop}`);
    //#endregion

    const normalizedText = normalizeText(config.text);
    if (!normalizedText) {
      api.log("error", "The text given to the speak out node should not be empty!");
      return;
    }

    const speakTagMissing = !normalizedText.startsWith('<speak>') || !normalizedText.endsWith('</speak>');
    const text = speakTagMissing ? `<speak>${normalizedText}</speak>` : normalizedText;

    const payload = {
      interpretAs: 'SSML',
      bargeIn: convertBargeIn(api, config),
    };
    cognigy.api.say(text, payload);
  },
});

