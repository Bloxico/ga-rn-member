// const env = process.env; // eslint-disable-line

// const APP_PREFIX = 'ENRG_';

// http

export const CLIENT_ID: string = 'clEnrgId';

export const CLIENT_PASS: string = 'Hm7FrtWRyuuTFlJS5Sz71HPJE19iLXtkAJFM4dmC';

export const API_URL: string = 'https://dev-api.enrg.bloxico.com/api';

// Hours per step
export const REWARD_STEPS: Array = [
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
  0.01,
];

// sum of rewards per each step + first step 0
export const REWARD_SUM: Array = [
  0,
  1,
  2,
  3,
  5,
  7,
  9,
  11,
  13,
  15,
  17,
  19,
  21,
  23,
  26,
  29,
];

// addition 1 + supply for every step
export const REWARD_SUPPLY: Array = [
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
];
