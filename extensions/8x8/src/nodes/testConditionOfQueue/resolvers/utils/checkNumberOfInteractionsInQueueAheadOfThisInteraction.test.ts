import checkNumberOfInteractionsInQueueAheadOfThisInteraction from './checkNumberOfInteractionsInQueueAheadOfThisInteraction';

describe('testConditionOfQueue > checkNumberOfInteractionsInQueueAheadOfThisInteraction', () => {
  it('should return true if queueSize is greater than numberOfInteractionsInQueueAheadOfThisInteractionValue', () => {
    expect(checkNumberOfInteractionsInQueueAheadOfThisInteraction({
      numberOfInteractionsInQueueAheadOfThisInteractionValue: 0
    }, { 'queue-size': 1 })).toBe(true);
  });

  it('should return false if queueSize is less than numberOfInteractionsInQueueAheadOfThisInteractionValue', () => {
    expect(checkNumberOfInteractionsInQueueAheadOfThisInteraction({
      numberOfInteractionsInQueueAheadOfThisInteractionValue: 1
    }, { 'queue-size': 0 })).toBe(false);
  });
});
