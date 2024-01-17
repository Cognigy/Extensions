import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from '@cognigy/extension-tools/build';

interface Inputs {
  text?: any
  rule?: any
  json?: any
  checkbox?: any
  time?: any
  date?: any
  datetime?: any
  select?: any
  typescript?: any
  xml?: any
  textArray?: any
  chipInput?: any
  cognigyText?: any
  toggle?: any
  slider?: any
  number?: any
  daterange?: any
  connection?: any
  say?: any
  condition?: any
  adaptivecard?: any
}

interface Params extends INodeFunctionBaseParams {
  config: Inputs;
}

export const fieldReferenceNode = createNodeDescriptor({
  type: 'test',
  defaultLabel: 'test',
  summary: 'test',
  fields: [
    {
      type: 'text',
      key: 'text',
      label: 'text',
      description: 'text',
      params: {
        required: false,
      },
    },
    {
      type: 'rule',
      key: 'rule',
      label: 'rule',
      description: 'rule',
      params: {
        required: false,
      },
    },
    {
      type: 'json',
      key: 'json',
      label: 'json',
      description: 'json',
      params: {
        required: false,
      },
    },
    {
      type: 'checkbox',
      key: 'checkbox',
      label: 'checkbox',
      description: 'checkbox',
      params: {
        required: false,
      },
    },
    {
      type: 'time',
      key: 'time',
      label: 'time',
      description: 'time',
      params: {
        required: false,
        locale: "en", // this is a moment.js locale
      },
    },
    {
      type: 'date',
      key: 'date',
      label: 'date',
      description: 'date',
      params: {
        required: false,
        locale: "en", // this is a moment.js locale
      },
    },
    {
      type: 'datetime',
      key: 'datetime',
      label: 'datetime',
      description: 'datetime',
      params: {
        required: false,
        locale: "en", // this is a moment.js locale
      },
    },
    {
      type: 'select',
      key: 'select',
      label: 'select',
      description: 'select',
      params: {
        required: false,
        options: [
          { value: 'test', label: 'test' },
        ],
      },
    },
    {
      type: 'typescript',
      key: 'typescript',
      label: 'typescript',
      description: 'typescript',
      params: {
        required: false,
      },
    },
    {
      type: 'xml',
      key: 'xml',
      label: 'xml',
      description: 'xml',
      params: {
        required: false,
      },
    },
    {
      type: 'textArray',
      key: 'textArray',
      label: 'textArray',
      description: 'textArray',
      params: {
        required: false,
      },
    },
    {
      type: 'chipInput',
      key: 'chipInput',
      label: 'chipInput',
      description: 'chipInput',
      params: {
        required: false,
      },
    },
    {
      type: 'cognigyText',
      key: 'cognigyText',
      label: 'cognigyText',
      description: 'cognigyText',
      params: {
        required: false,
      },
    },
    {
      type: 'toggle',
      key: 'toggle',
      label: 'toggle',
      description: 'toggle',
      params: {
        required: false,
      },
    },
    {
      type: 'slider',
      key: 'slider',
      label: 'slider',
      description: 'slider',
      params: {
        required: false,
        min: 1000,
        max: 2000,
        step: 100,
      },
    },
    {
      type: 'number',
      key: 'number',
      label: 'number',
      description: 'number',
      params: {
        required: false,
        min: 1000,
        max: 2000,
      },
    },
    {
      type: 'daterange',
      key: 'daterange',
      label: 'daterange',
      description: 'daterange',
      params: {
        required: false,
        locale: "en", // this is a moment.js locale
      },
    },
    {
      type: 'connection',
      key: 'connection',
      label: 'connection',
      description: 'connection',
      params: {
        required: false,
        connectionType: "api-key", // this needs to match the connections 'type' property
      },
    },
    {
      type: 'say',
      key: 'say',
      label: 'say',
      description: 'say',
      params: {
        required: false,
      },
    },
    {
      type: 'condition',
      key: 'condition',
      label: 'condition',
      description: 'condition',
      params: {
        required: false,
      },
    },
    {
      type: 'adaptivecard',
      key: 'adaptivecard',
      label: 'adaptivecard',
      description: 'adaptivecard',
      params: {
        required: false,
      },
    },
  ],
  function: async ({ cognigy, config }: Params) => {
  },
});