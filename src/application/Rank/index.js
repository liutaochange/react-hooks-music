import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import { filterIndex, filterIdx } from 'Utils'
import Loading from 'Base/loading'
import Scroll from 'Base/scroll/index'
import Toast from 'Base/toast/index'
import { EnterLoading } from 'Application/Singers/style'
import { getRankList } from './store/index'
import { List, ListItem, SongList, Container } from './style'
function Rank(props) {
  const dispatch = useDispatch()
  const list = useSelector((state) => state.getIn(['rank', 'rankList']))
  const loading = useSelector((state) => state.getIn(['rank', 'loading']))
  const getRankListDataDispatch = () => {
    dispatch(getRankList())
  }
  let rankList = list ? list.toJS() : []
  useEffect(() => {
    if (!rankList.length) {
      getRankListDataDispatch()
    }
    // eslint-disable-next-line
  }, [])
  let globalStartIndex = filterIndex(rankList)
  let officialList = rankList.slice(0, globalStartIndex)
  let globalList = rankList.slice(globalStartIndex)

  const enterDetail = (name) => {
    const idx = filterIdx(name)
    if (idx === null) {
      Toast.info('暂无相关数据')
      return
    }
  }
  const renderSongList = (list) => {
    return list.length ? (
      <SongList>
        {list.map((item, index) => {
          return (
            <li key={index}>
              {index + 1}. {item.first} - {item.second}
            </li>
          )
        })}
      </SongList>
    ) : null
  }
  const renderRankList = (list, global) => {
    return (
      <List globalRank={global}>
        {list.map((item, index) => {
          return (
            <ListItem
              key={`${item.coverImgId}_${index}`}
              tracks={item.tracks}
              onClick={() => enterDetail(item.name)}
            >
              <div className="img_wrapper">
                <img src={item.coverImgUrl} alt="" />
                <div className="decorate"></div>
                <span className="update_frequency">{item.updateFrequency}</span>
              </div>
              {renderSongList(item.tracks)}
            </ListItem>
          )
        })}
      </List>
    )
  }

  let displayStyle = loading ? { display: 'none' } : { display: '' }
  return (
    <Container>
      <Scroll>
        <div>
          <h1 className="official" style={displayStyle}>
            官方榜
          </h1>
          {renderRankList(officialList)}
          <h1 className="global" style={displayStyle}>
            全球榜
          </h1>
          {renderRankList(globalList, true)}
          {loading ? (
            <EnterLoading>
              <Loading></Loading>
            </EnterLoading>
          ) : null}
        </div>
      </Scroll>
      {renderRoutes(props.route.routes)}
    </Container>
  )
}

export default React.memo(Rank)
