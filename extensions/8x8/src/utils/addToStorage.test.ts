import StoreLocationName from '../constants/StoreLocationName';
import addToStorage from './addToStorage';

describe('addToStorage', () => {
  const api = { addToContext: jest.fn(), addToInput: jest.fn() };
  const mockInputKey = 'mockInputKey';
  const mockContextKey = 'mockContextKey';

  it('should not call addToContext if contextKey is empty', () => {
    addToStorage({
      api,
      contextKey: '',
      data: 'test',
      storeLocation: StoreLocationName.Context
    });
    expect(api.addToContext).not.toHaveBeenCalled();
  });

  it('should not call addToInput if inputKey is empty', () => {
    addToStorage({
      api,
      inputKey: '',
      data: 'test',
      storeLocation: StoreLocationName.Input
    });
    expect(api.addToInput).not.toHaveBeenCalled();
  });

  it('should store data in input', () => {
    const data = 'Open';
    const storeLocation = StoreLocationName.Input;

    addToStorage({ api, data, storeLocation, inputKey: mockInputKey });

    expect(api.addToInput).toHaveBeenCalledWith(mockInputKey, data);
  });

  it('should store data in context', () => {
    const data = 'Closed';
    const storeLocation = StoreLocationName.Context;

    addToStorage({ api, data, storeLocation, contextKey: mockContextKey });

    expect(api.addToContext).toHaveBeenCalledWith(mockContextKey, data, 'simple');
  });

  it('should not store data in context if api ', () => {
    const data = 'Closed';
    const storeLocation = StoreLocationName.Context;
    const contextKey = 'scheduleStatus';

    addToStorage({ api: {}, data, storeLocation, contextKey });
  });
});
