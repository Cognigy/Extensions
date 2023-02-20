import checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan from './checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan';

describe('testConditionOfQueue > checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan', () => {
  it('should return true if there is an interaction in this queue that has been waiting longer than the value', () => {
    expect(checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan({
      thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds: 0
    }, { 'longest-wait-time': 1 })).toBe(true);
  }
  );
  it('should return false if there is no interaction in this queue that has been waiting longer than the value', () => {
    expect(checkThereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThan({
      thereIsAnInteractionInThisQueueThatHasBeenWaitingLongerThanValueInSeconds: 1
    }, { 'longest-wait-time': 0 })).toBe(false);
  }
  );
});
