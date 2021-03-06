import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import LazyLoad, { forceCheck } from 'react-lazyload'
import { renderRoutes } from 'react-router-config'
import Horizen from 'Base/horizen-item/index'
import Scroll from 'Base/scroll/index'
import Loading from 'Base/loading'
import { categoryTypes, alphaTypes } from 'Api/config'
import { NavContainer, ListContainer, List, ListItem } from './style'
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList,
  changeCategory,
  changeAlpha,
} from './store/actionCreators'

const Singers = (props) => {
  const dispatch = useDispatch()
  const category = useSelector((state) => state.getIn(['singers', 'category']))
  const alpha = useSelector((state) => state.getIn(['singers', 'alpha']))
  const singerList = useSelector((state) =>
    state.getIn(['singers', 'singerList'])
  )
  const enterLoading = useSelector((state) =>
    state.getIn(['singers', 'enterLoading'])
  )
  const pullUpLoading = useSelector((state) =>
    state.getIn(['singers', 'pullUpLoading'])
  )
  const pullDownLoading = useSelector((state) =>
    state.getIn(['singers', 'pullDownLoading'])
  )
  const pageCount = useSelector((state) =>
    state.getIn(['singers', 'pageCount'])
  )
  const songsCount = useSelector(
    (state) => state.getIn(['player', 'playList']).size
  )

  const getHotSingerDispatch = () => {
    dispatch(getHotSingerList())
  }
  const updateDispatch = (category, alpha) => {
    dispatch(changePageCount(0)) //由于改变了分类，所以pageCount清零
    dispatch(changeEnterLoading(true)) //loading，现在实现控制逻辑，效果实现放到下一节，后面的loading同理
    dispatch(getSingerList(category, alpha))
  }
  // 滑到最底部刷新部分的处理
  const pullUpRefreshDispatch = (category, alpha, hot, count) => {
    dispatch(changePullUpLoading(true))
    dispatch(changePageCount(count + 1))
    if (hot) {
      dispatch(refreshMoreHotSingerList())
    } else {
      dispatch(refreshMoreSingerList(category, alpha))
    }
  }
  //顶部下拉刷新
  const pullDownRefreshDispatch = (category, alpha) => {
    dispatch(changePullDownLoading(true))
    dispatch(changePageCount(0)) //属于重新获取数据
    if (category === '' && alpha === '') {
      dispatch(getHotSingerList())
    } else {
      dispatch(getSingerList(category, alpha))
    }
  }

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount)
  }

  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha)
  }
  const handleUpdateAlpha = (val) => {
    dispatch(changeAlpha(val))
    updateDispatch(category, val)
  }

  const handleUpdateCatetory = (val) => {
    dispatch(changeCategory(val))
    updateDispatch(val, alpha)
  }
  useEffect(() => {
    if (!singerList.size) {
      getHotSingerDispatch()
    }
    // eslint-disable-next-line
  }, [])

  const enterDetail = (id) => {
    props.history.push(`/singers/${id}`)
  }

  // 渲染函数，返回歌手列表
  const renderSingerList = () => {
    const list = singerList ? singerList.toJS() : []
    return (
      <List>
        {list.map((item, index) => {
          return (
            <ListItem
              key={item.accountId + '' + index}
              onClick={() => enterDetail(item.id)}
            >
              <div className="img_wrapper">
                <LazyLoad
                  placeholder={
                    <img
                      width="100%"
                      height="100%"
                      src={require('./singer.png')}
                      alt="music"
                    />
                  }
                >
                  <img
                    src={`${item.picUrl}?param=300x300`}
                    width="100%"
                    height="100%"
                    alt="music"
                  />
                </LazyLoad>
              </div>
              <span className="name">{item.name}</span>
            </ListItem>
          )
        })}
      </List>
    )
  }
  return (
    <div>
      <NavContainer>
        <Horizen
          list={categoryTypes}
          title={'分类 (默认热门):'}
          handleClick={(val) => handleUpdateCatetory(val)}
          oldVal={category}
        ></Horizen>
        <Horizen
          list={alphaTypes}
          title={'首字母:'}
          handleClick={(val) => handleUpdateAlpha(val)}
          oldVal={alpha}
        ></Horizen>
      </NavContainer>
      <ListContainer play={songsCount}>
        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList()}
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
      {renderRoutes(props.route.routes)}
    </div>
  )
}

export default React.memo(Singers)
