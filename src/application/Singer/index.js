import React, { useState, useCallback, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  ImgWrapper,
  CollectButton,
  SongListWrapper,
  BgLayer,
} from './style'
import Header from 'Base/header/index'
import Scroll from 'Base/scroll/index'
import Loading from 'Base/loading/index'
import SongsList from 'Components/songslist/index'
import { getSingerInfo, changeEnterLoading } from './store/actionCreators'

const Singer = (props) => {
  const [showStatus, setShowStatus] = useState(true)
  const collectButton = useRef()
  const imageWrapper = useRef()
  const songScrollWrapper = useRef()
  const songScroll = useRef()
  const header = useRef()
  const layer = useRef()

  const dispatch = useDispatch()
  const artist = useSelector((state) => state.getIn(['singerInfo', 'artist']))
  const songs = useSelector((state) =>
    state.getIn(['singerInfo', 'songsOfArtist'])
  )
  const loading = useSelector((state) => state.getIn(['singerInfo', 'loading']))

  const getSingerDataDispatch = (id) => {
    dispatch(changeEnterLoading(true))
    dispatch(getSingerInfo(id))
  }
  // 图片初始高度
  const initialHeight = useRef(0)
  // 往上偏移的尺寸，露出圆角
  const OFFSET = 5

  useEffect(() => {
    let h = imageWrapper.current.offsetHeight
    songScrollWrapper.current.style.top = `${h - OFFSET} px`
    initialHeight.current = h
    // 把遮罩先放在下面，以裹住歌曲列表
    layer.current.style.top = `${h - OFFSET} px`
    songScroll.current.refresh()
    const id = props.match.params.id
    getSingerDataDispatch(id)
    //eslint-disable-next-line
  }, [])

  const setShowStatusFalse = useCallback(() => {
    setShowStatus(false)
  }, [])

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <Header
          handleClick={setShowStatusFalse}
          title={artist.name}
          ref={header}
        ></Header>
        <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
          <div className="filter"></div>
        </ImgWrapper>
        <CollectButton ref={collectButton}>
          <i className="iconfont">&#xe62d;</i>
          <span className="text"> 收藏 </span>
        </CollectButton>
        <BgLayer ref={layer}></BgLayer>
        <SongListWrapper ref={songScrollWrapper}>
          <Scroll ref={songScroll}>
            <SongsList songs={artist.hotSongs} showCollect={false}></SongsList>
          </Scroll>
        </SongListWrapper>
      </Container>
      {loading ? <Loading></Loading> : null}
    </CSSTransition>
  )
}

export default Singer
