import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { forceCheck } from 'react-lazyload'
import { renderRoutes } from 'react-router-config'
import Slider from 'Components/slider'
import RecommendList from 'Components/list'
import Scroll from 'Base/scroll/index'
import Loading from 'Base/loading/index'
import { Content } from './style'
import * as actionTypes from './store/actionCreators'
const Recommend = (props) => {
  const dispatch = useDispatch()
  const bannerList = useSelector((state) =>
    state.getIn(['recommend', 'bannerList'])
  )
  const recommendList = useSelector((state) =>
    state.getIn(['recommend', 'recommendList'])
  )
  const enterLoading = useSelector((state) =>
    state.getIn(['recommend', 'enterLoading'])
  )
  const songsCount = useSelector(
    (state) => state.getIn(['player', 'playList']).size
  )
  useEffect(() => {
    if (!bannerList.size) {
      dispatch(actionTypes.getBannerList())
    }
    if (!recommendList.size) {
      dispatch(actionTypes.getRecommendList())
    }
    // eslint-disable-next-line
  }, [])
  const bannerListJS = bannerList ? bannerList.toJS() : []
  const recommendListJS = recommendList ? recommendList.toJS() : []
  return (
    <Content play={songsCount}>
      <Scroll onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      {enterLoading ? <Loading></Loading> : null}
      {/* 将目前所在路由的下一层子路由加以渲染 */}
      {renderRoutes(props.route.routes)}
    </Content>
  )
}

export default React.memo(Recommend)
