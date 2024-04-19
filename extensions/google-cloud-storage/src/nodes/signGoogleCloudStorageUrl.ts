import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
const { Storage } = require('@google-cloud/storage');

export interface ISignUrlParams extends INodeFunctionBaseParams {
  config: {
    connection: {
      credentialsJson: string;
    };
    bucket: string;
    filePath: string;
    contentType: string;
    virtualHostedStyle: boolean;
    action: string;
    expiresIn: number;
    storeLocation: string,
    contextKey: string,
    inputKey: string
  };
}
export const signGoogleCloudStorageUrl = createNodeDescriptor({
  type: 'signGoogleCloudStorageUrl',
  defaultLabel: 'Sign GCloud URL',
  fields: [
    {
      key: 'connection',
      label: 'Google Cloud Storage connection',
      description: 'The complete login configuration JSON',
      type: 'connection',
      params: {
        connectionType: 'google-cloud-bucket',
        required: true
      }
    },
    {
      key: 'bucket',
      label: 'Bucket',
      description: 'Google Cloud Storage bucket name',
      type: 'cognigyText',
      params: { required: true }
    },
    {
      key: 'filePath',
      label: 'File Path',
      description: 'Full path of the file in the Google Cloud Storage bucket without gs:// prefix',
      type: 'cognigyText',
      params: { required: true }
    },
    {
      key: 'contentType',
      label: 'Content Type',
      description: 'MIME type, e.g. application/pdf',
      type: 'cognigyText',
      params: { required: false }
    },
    {
      key: 'virtualHostedStyle',
      label: 'Virtual Hosted-style',
      description: 'Use virtual hosted-style URLs (e.g. https://mybucket.storage.googleapis.com/...) instead of path-style (e.g. https://storage.googleapis.com/mybucket/...)',
      defaultValue: false,
      type: 'toggle',
      params: { required: true }
    },
    {
      key: 'action',
      label: 'Action',
      description: 'read (HTTP: GET), write (HTTP: PUT), or delete (HTTP: DELETE)',
      type: 'select',
      defaultValue: 'read',
      params: {
        required: true,
        options: [
          { label: 'read', value: 'read' },
          { label: 'write', value: 'write' },
          { label: 'delete', value: 'delete' },
        ]
      }
    },
    {
      key: 'expiresIn',
      label: 'Expires in milliseconds',
      description: 'After how many milliseconds should the Signed URL expire. Must be at least 1 second and at most 7 days. Default is 15 minutes',
      type: 'number',
      defaultValue: 15 * 60 * 1000, // 15 minutes
      params: {
        required: false,
        min: 1000,
        max: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    },
    {
      key: 'storeLocation',
      type: 'select',
      label: 'Where to store the result',
      defaultValue: 'input',
      params: {
        options: [
          { label: 'Input', value: 'input' },
          { label: 'Context', value: 'context' }
        ],
        required: true
      }
    },
    {
      key: 'inputKey',
      type: 'cognigyText',
      label: 'Input Key to store Result',
      defaultValue: 'signedUrl',
      condition: { key: 'storeLocation', value: 'input' }
    },
    {
      key: 'contextKey',
      type: 'cognigyText',
      label: 'Context Key to store Result',
      defaultValue: 'signedUrl',
      condition: { key: 'storeLocation', value: 'context' }
    }
  ],
  sections: [
    {
      key: 'storage',
      label: 'Storage Option',
      defaultCollapsed: false,
      fields: ['storeLocation', 'inputKey', 'contextKey']
    }
  ],
  form: [
    { type: 'field', key: 'connection' },
    { type: 'field', key: 'bucket' },
    { type: 'field', key: 'filePath' },
    { type: 'field', key: 'contentType' },
    { type: 'field', key: 'virtualHostedStyle' },
    { type: 'field', key: 'action' },
    { type: 'field', key: 'expiresIn' },
    { type: 'section', key: 'storage' }
  ],
  appearance: { color: '#4183F4' },
  function: async ({ cognigy, config }: ISignUrlParams) => {
    const { api } = cognigy;
    const { connection, bucket, filePath, contentType, virtualHostedStyle, action, expiresIn, storeLocation, contextKey, inputKey } = config;
    // api.log('debug', `[X] config: ${JSON.stringify(config)}`);
    const { credentialsJson } = connection;

    const credentials = JSON.parse(credentialsJson);
    const projectId = credentials.project_id;
    const storage = new Storage({ projectId, credentials });

    const [url] = await storage.bucket(bucket).file(filePath).getSignedUrl({
      version: 'v4',
      action,
      expires: Date.now() + expiresIn,
      virtualHostedStyle,
      contentType
    });

    // api.log('debug', `[X] Signed URL: ${url}`);

    if (storeLocation === 'input') {
      // @ts-expect-error
      api.addToInput(inputKey, url);
    } else {
      api.addToContext(contextKey, url, 'simple');
    }
  }
});