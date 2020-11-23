import { combineReducers } from 'redux-immutable'
import { reducer as recommendReducer } from 'Application/Recommend/store/index'
import { reducer as singersReducer } from 'Application/Singers/store/index'
import { reducer as rankReducer } from 'Application/Rank/store/index'
import { reducer as albumReducer } from 'Application/Album/store/index'
import { reducer as singerInfoReducer } from 'Application/Singer/store/index'
import { reducer as playerReducer } from 'Application/Player/store/index'
import { reducer as searchReducer } from 'Application/Search/store/index'

export default combineReducers({
  recommend: recommendReducer,
  singers: singersReducer,
  rank: rankReducer,
  album: albumReducer,
  singerInfo: singerInfoReducer,
  player: playerReducer,
  search: searchReducer,
})
