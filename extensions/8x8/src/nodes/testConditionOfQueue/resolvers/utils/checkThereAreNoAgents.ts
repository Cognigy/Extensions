import type { TestConditionOfQueueValues } from '../../types';
import { ThereAreNoAgentsValueOption } from '../../types';

export const checkThereAreNoAgents = (options: TestConditionOfQueueValues, queueStatistics: {
  'agent-count-waitTransact': number
  'agent-count-busy': number
  'agent-count-workOffline': number
  'agent-count-onBreak': number
  'agent-count-loggedOut': number
  'agent-count-postProcess': number
}): boolean => {
  const { thereAreNoAgentsValue } = options;
  const agentCountWaitTransact = queueStatistics['agent-count-waitTransact'];
  const agentCountBusy = queueStatistics['agent-count-busy'];
  const agentCountWorkOffline = queueStatistics['agent-count-workOffline'];
  const agentCountOnBreak = queueStatistics['agent-count-onBreak'];

  switch (thereAreNoAgentsValue) {
    case ThereAreNoAgentsValueOption.Available:
      return agentCountWaitTransact === 0;
    case ThereAreNoAgentsValueOption.AvailableorBusy: {
      let agentsOnLineCount = 0;
      agentsOnLineCount += agentCountBusy;
      agentsOnLineCount += agentCountWaitTransact;

      return agentsOnLineCount === 0;
    }
    case ThereAreNoAgentsValueOption.AvailableBusyOrWorkingOffline: {
      let agentsOnLineCount = 0;
      agentsOnLineCount += agentCountBusy;
      agentsOnLineCount += agentCountWaitTransact;
      agentsOnLineCount += agentCountWorkOffline;

      return agentsOnLineCount === 0;
    }
    case ThereAreNoAgentsValueOption.AvailableBusyWorkingOfflineOrOnBreak: {
      let agentsOnLineCount = 0;
      agentsOnLineCount += agentCountBusy;
      agentsOnLineCount += agentCountWaitTransact;
      agentsOnLineCount += agentCountWorkOffline;
      agentsOnLineCount += agentCountOnBreak;

      return agentsOnLineCount === 0;
    }

    case ThereAreNoAgentsValueOption.LoggedIn: {
      let agentsOnLineCount = 0;
      agentsOnLineCount += agentCountBusy;
      agentsOnLineCount += agentCountWaitTransact;
      agentsOnLineCount += agentCountWorkOffline;
      agentsOnLineCount += agentCountOnBreak;
      agentsOnLineCount += queueStatistics['agent-count-loggedOut'];
      agentsOnLineCount += queueStatistics['agent-count-postProcess'];

      return agentsOnLineCount === 0;
    }
    default:
      return false;
  }
};

export default checkThereAreNoAgents;
