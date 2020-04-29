import { combineReducers } from 'redux-immutable'
import { reducer as recommendReducer } from 'Application/Recommend/store/index'
export default combineReducers({
  recommend: recommendReducer,
})
