import { combineReducers } from 'redux-immutable'
import { reducer as recommendReducer } from 'Application/Recommend/store/index'
import { reducer as singersReducer } from 'Application/Singers/store/index'
export default combineReducers({
  recommend: recommendReducer,
  singers: singersReducer,
})
