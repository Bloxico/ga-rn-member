export const getBatteryList = ({ portal: { batteryList } }) => ({
  batteryList,
});

export const getRewardNumber = ({ portal: { reward } }) => ({
  reward,
});

export const getPercentTillRewarded = ({
  portal: { percentTillRewarded },
}) => ({
  percentTillRewarded,
});

export const getTimeTillRewarded = ({ portal: { timeTillRewarded } }) => ({
  timeTillRewarded,
});

export const getStepReward = ({ portal: { stepReward } }) => ({
  stepReward,
});

export const isClaimButton = ({ portal: { claimButton } }) => ({
  claimButton,
});

export const getRewardToClaim = ({ portal: { toClaimReward } }) => ({
  toClaimReward,
});

export const isBatteryFetching = ({ portal: { batteryFetchInProgress } }) => ({
  batteryFetchInProgress,
});

export const isUserIntegrated = ({ portal: { userIntegrated } }) => ({
  userIntegrated,
});
