import {combineReducers} from 'redux-immutable';
import {testReducer} from '../components/store';

/**
 * 联合redux,模块化处理
 */
export default combineReducers({
    test: testReducer,
})
