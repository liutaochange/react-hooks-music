import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { forceCheck } from 'react-lazyload'
import Slider from 'Components/slider'
import RecommendList from 'Components/list'
import Scroll from 'Base/scroll/index'
import Loading from 'Base/loading/index'
import { Content } from './style'
import * as actionTypes from './store/actionCreators'
const Recommend = () => {
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
    <Content>
      <Scroll onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      {enterLoading ? <Loading></Loading> : null}
    </Content>
  )
}

export default React.memo(Recommend)
