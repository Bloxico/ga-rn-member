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

export const getRandomNumber = ({ portal: { randomNumber } }) => ({
  randomNumber,
});

export const getToClaimReward = ({ portal: { toClaimReward } }) => ({
  toClaimReward,
});
