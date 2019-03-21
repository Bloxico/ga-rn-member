// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducer';
import sagas from './saga';
import { StateT } from './state';

export default (initialState?: StateT) => {
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware /* loggerMiddleware */];

  const enhancers = [];
  enhancers.push(applyMiddleware(...middleware));

  const enhancer = compose(...enhancers);
  const store = createStore<any, StateT, any>(
    rootReducer,
    initialState,
    enhancer,
  );

  sagaMiddleware.run(sagas);

  return { store };
};
