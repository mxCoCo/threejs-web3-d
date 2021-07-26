import { TEST } from './actionTypes';
import { fromJS } from 'immutable';

const defaultState = fromJS({
})

export default (preState = defaultState, action) => {
  switch (action.type) {
    case TEST:
      return preState.set('num', action.num);
    default:
      return preState
  }

}