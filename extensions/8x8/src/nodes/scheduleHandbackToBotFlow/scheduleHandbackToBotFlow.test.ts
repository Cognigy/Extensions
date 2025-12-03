import { scheduleHandbackToBotFlowNode } from './scheduleHandbackToBotFlow';

describe('scheduleHandbackToBotFlowNode', () => {
  it('should have correct node configuration', () => {
    expect(scheduleHandbackToBotFlowNode.type).toBe('scheduleHandbackToBotFlow');
    expect(scheduleHandbackToBotFlowNode.defaultLabel).toBe('Schedule Handback to Bot Flow');
    expect(scheduleHandbackToBotFlowNode.summary).toBe('Schedules a post-agent handback to transition the conversation to a bot flow');
    expect(scheduleHandbackToBotFlowNode.appearance.color).toBe('#ff0050');
  });

  it('should have required fields', () => {
    const fieldKeys = scheduleHandbackToBotFlowNode.fields?.map(field => field.key);
    expect(fieldKeys).toContain('connection');
    expect(fieldKeys).toContain('id');
    expect(fieldKeys).toContain('type');
    expect(fieldKeys).toContain('configuration');
    expect(fieldKeys).toContain('storeLocation');
    expect(fieldKeys).toContain('inputKey');
    expect(fieldKeys).toContain('contextKey');
  });

  it('should have correct connection field configuration', () => {
    const connectionField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'connection');
    expect(connectionField).toBeDefined();
    if (!connectionField) return;

    expect(connectionField.type).toBe('connection');
    expect((connectionField.params as any)?.connectionType).toBe('eightbyeightsimple');
    expect((connectionField.params as any)?.required).toBe(true);
  });

  it('should have webhook dropdown with options resolver', () => {
    const idField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'id');
    expect(idField).toBeDefined();
    if (!idField) return;

    expect(idField.type).toBe('select');
    expect((idField.params as any)?.required).toBe(true);
    expect(idField.optionsResolver).toBeDefined();
    expect(idField.optionsResolver?.dependencies).toContain('connection');
  });

  it('should have correct assignment type field', () => {
    const typeField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'type');
    expect(typeField).toBeDefined();
    if (!typeField) return;

    expect(typeField.type).toBe('select');
    expect(typeField.defaultValue).toBe('webhook');
    expect((typeField.params as any)?.options).toEqual([
      { label: 'Webhook', value: 'webhook' }
    ]);
  });

  it('should have correct configuration field', () => {
    const configField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'configuration');
    expect(configField).toBeDefined();
    if (!configField) return;

    expect(configField.type).toBe('json');
    expect(configField.defaultValue).toEqual({
      notifyChannelWebhookIfExists: 'false',
      maxTotalMinutes: '300',
      userTimeoutInMinutes: '150'
    });
  });

  it('should have correct storage location field', () => {
    const storeLocationField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'storeLocation');
    expect(storeLocationField).toBeDefined();
    if (!storeLocationField) return;

    expect(storeLocationField.type).toBe('select');
    expect(storeLocationField.defaultValue).toBe('input');
    expect((storeLocationField.params as any)?.options).toEqual([
      { label: 'Input', value: 'input' },
      { label: 'Context', value: 'context' }
    ]);
  });

  it('should have conditional input key field', () => {
    const inputKeyField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'inputKey');
    expect(inputKeyField).toBeDefined();
    if (!inputKeyField) return;

    expect(inputKeyField.type).toBe('cognigyText');
    expect(inputKeyField.defaultValue).toBe('handbackResult');
    expect(inputKeyField.condition).toEqual({
      key: 'storeLocation',
      value: 'input'
    });
  });

  it('should have conditional context key field', () => {
    const contextKeyField = scheduleHandbackToBotFlowNode.fields?.find(field => field.key === 'contextKey');
    expect(contextKeyField).toBeDefined();
    if (!contextKeyField) return;

    expect(contextKeyField.type).toBe('cognigyText');
    expect(contextKeyField.defaultValue).toBe('handbackResult');
    expect(contextKeyField.condition).toEqual({
      key: 'storeLocation',
      value: 'context'
    });
  });

  it('should have correct sections configuration', () => {
    expect(scheduleHandbackToBotFlowNode.sections).toHaveLength(2);

    const assignmentSection = scheduleHandbackToBotFlowNode.sections?.find(section => section.key === 'assignment');
    expect(assignmentSection).toBeDefined();
    if (assignmentSection) {
      expect(assignmentSection.label).toBe('Assignment Configuration');
      expect(assignmentSection.defaultCollapsed).toBe(true);
      expect(assignmentSection.fields).toEqual(['type', 'configuration']);
    }

    const storageSection = scheduleHandbackToBotFlowNode.sections?.find(section => section.key === 'storage');
    expect(storageSection).toBeDefined();
    if (storageSection) {
      expect(storageSection.label).toBe('Storage Option');
      expect(storageSection.defaultCollapsed).toBe(true);
      expect(storageSection.fields).toEqual(['storeLocation', 'inputKey', 'contextKey']);
    }
  });

  it('should have correct form configuration', () => {
    expect(scheduleHandbackToBotFlowNode.form).toEqual([
      { type: 'field', key: 'connection' },
      { type: 'field', key: 'id' },
      { type: 'section', key: 'assignment' },
      { type: 'section', key: 'storage' }
    ]);
  });

  it('should have function defined', () => {
    expect(scheduleHandbackToBotFlowNode.function).toBeDefined();
    expect(typeof scheduleHandbackToBotFlowNode.function).toBe('function');
  });
});
