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
  10,
  20,
  30,
  50,
  70,
  90,
  110,
  130,
  150,
  170,
  190,
  210,
  230,
  260,
  300,
];

// addition 1 + supply for every step
export const REWARD_SUPPLY: Array = [
  0,
  0,
  0,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  10,
  20,
  30,
];
