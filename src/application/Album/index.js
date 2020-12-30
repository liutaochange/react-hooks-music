import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container, TopDesc, Menu } from './style'
import style from 'Assets/js/global-style'
import { CSSTransition } from 'react-transition-group'
import Header from 'Base/header/index'
import Scroll from 'Base/scroll/index'
import Loading from 'Base/loading/index'
import SongsList from 'Components/songslist'
import MusicNote from 'Base/music-note/index'
import {
  changeEnterLoading,
  getAlbumList,
  changePullUpLoading,
} from './store/actionCreators'
import { isEmptyObject, getCount } from 'Utils'
export const HEADER_HEIGHT = 45

const Album = (props) => {
  const dispatch = useDispatch()
  const musicNoteRef = useRef()
  const headerEl = useRef()
  const id = props.match.params.id || ''
  const [showStatus, setShowStatus] = useState(true)
  const [title, setTitle] = useState('歌单')
  const [isMarquee, setIsMarquee] = useState(false) // 是否跑马灯
  const currentAlbum = useSelector((state) =>
    state.getIn(['album', 'currentAlbum']).toJS()
  )
  const pullUpLoading = useSelector((state) =>
    state.getIn(['album', 'pullUpLoading'])
  )
  const enterLoading = useSelector((state) =>
    state.getIn(['album', 'enterLoading'])
  )
  const songsCount = useSelector(
    (state) => state.getIn(['player', 'playList']).size
  )
  useEffect(() => {
    if (id) {
      dispatch(changeEnterLoading(true))
      dispatch(getAlbumList(id))
    }
  }, [id, dispatch])

  const handlePullUp = () => {
    dispatch(changePullUpLoading(true))
    dispatch(changePullUpLoading(false))
  }

  const handleBack = useCallback(() => {
    setShowStatus(false)
  }, [])

  const handleScroll = useCallback(
    (pos) => {
      let minScrollY = -HEADER_HEIGHT
      let percent = Math.abs(pos.y / minScrollY)
      let headerDom = headerEl.current
      // 滑过顶部的高度开始变化
      if (pos.y < minScrollY) {
        headerDom.style.backgroundColor = style['theme-color']
        headerDom.style.opacity = Math.min(1, (percent - 1) / 2)
        setTitle(currentAlbum.name)
        setIsMarquee(true)
      } else {
        headerDom.style.backgroundColor = ''
        headerDom.style.opacity = 1
        setTitle('歌单')
        setIsMarquee(false)
      }
    },
    [currentAlbum]
  )

  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y })
  }
  const renderTopDesc = () => {
    return (
      <TopDesc background={currentAlbum.coverImgUrl}>
        <div className="background">
          <div className="filter"></div>
        </div>
        <div className="img_wrapper">
          <div className="decorate"></div>
          <img src={currentAlbum.coverImgUrl} alt="" />
          <div className="play_count">
            <i className="iconfont play">&#xe885;</i>
            <span className="count">
              {getCount(currentAlbum.subscribedCount)}
            </span>
          </div>
        </div>
        <div className="desc_wrapper">
          <div className="title">{currentAlbum.name}</div>
          <div className="person">
            <div className="avatar">
              <img src={currentAlbum.creator.avatarUrl} alt="" />
            </div>
            <div className="name">{currentAlbum.creator.nickname}</div>
          </div>
        </div>
      </TopDesc>
    )
  }
  const renderMenu = () => {
    return (
      <Menu>
        <div>
          <i className="iconfont">&#xe6ad;</i>
          评论
        </div>
        <div>
          <i className="iconfont">&#xe86f;</i>
          点赞
        </div>
        <div>
          <i className="iconfont">&#xe62d;</i>
          收藏
        </div>
        <div>
          <i className="iconfont">&#xe606;</i>
          更多
        </div>
      </Menu>
    )
  }
  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container play={songsCount}>
        <Header
          title={title}
          ref={headerEl}
          handleClick={handleBack}
          isMarquee={isMarquee}
        ></Header>
        {!isEmptyObject(currentAlbum) ? (
          <Scroll
            bounceTop={false}
            onScroll={handleScroll}
            pullUp={handlePullUp}
            pullUpLoading={pullUpLoading}
          >
            <div>
              {renderTopDesc()}
              {renderMenu()}
              <SongsList
                songs={currentAlbum.tracks}
                collectCount={currentAlbum.subscribedCount}
                showCollect={true}
                showBackground={true}
                musicAnimation={musicAnimation}
                loading={pullUpLoading}
              ></SongsList>
            </div>
          </Scroll>
        ) : null}
        {enterLoading ? <Loading></Loading> : null}
        <MusicNote ref={musicNoteRef}></MusicNote>
      </Container>
    </CSSTransition>
  )
}

export default React.memo(Album)
