import React, { useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  PlayListWrapper,
  ScrollWrapper,
  ListHeader,
  ListContent,
} from './style'
import { CSSTransition } from 'react-transition-group'
import { prefixStyle, getName, shuffle, findIndex } from 'Utils'
import {
  changeShowPlayList,
  changeSequecePlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayingState,
  changePlayMode,
  changePlayList,
  deleteSong,
} from '../store/actionCreators'
import { playMode } from 'Api/config'
import Scroll from 'Base/scroll/index'
import Confirm from 'Base/confirm/index'
const PlayList = (props) => {
  const dispatch = useDispatch()
  const playListRef = useRef()
  const listWrapperRef = useRef()
  const confirmRef = useRef()
  const listContentRef = useRef()
  const [isShow, setIsShow] = useState(false)
  // 是否允许滑动事件生效
  const [canTouch, setCanTouch] = useState(true)
  //touchStart 后记录 y 值
  const [startY, setStartY] = useState(0)
  //touchStart 事件是否已经被触发
  const [initialed, setInitialed] = useState(0)
  // 用户下滑的距离
  const [distance, setDistance] = useState(0)
  const showPlayList = useSelector((state) =>
    state.getIn(['player', 'showPlayList'])
  )
  // 当前选中歌曲的索引
  const currentIndex = useSelector((state) =>
    state.getIn(['player', 'currentIndex'])
  )
  // 当前选中歌曲
  const currentSong = useSelector((state) =>
    state.getIn(['player', 'currentSong']).toJS()
  )
  // 播放列表
  const playList = useSelector((state) =>
    state.getIn(['player', 'playList']).toJS()
  )
  // 顺序排列时的播放列表
  const sequencePlayList = useSelector((state) =>
    state.getIn(['player', 'sequencePlayList']).toJS()
  )
  // 播放模式
  const mode = useSelector((state) => state.getIn(['player', 'mode']))

  // 修改当前歌曲在列表中的 index，也就是切歌
  const changeCurrentIndexDispatch = (data) => {
    dispatch(changeCurrentIndex(data))
  }
  // 修改当前的播放模式
  const changeModeDispatch = (data) => {
    dispatch(changePlayMode(data))
  }
  // 修改当前的歌曲列表
  const changePlayListDispatch = (data) => {
    dispatch(changePlayList(data))
  }
  // 删除歌曲
  const deleteSongDispatch = (data) => {
    dispatch(deleteSong(data))
  }
  // 清空歌曲
  const handleShowClear = () => {
    confirmRef.current.show()
  }
  const handleConfirmClear = () => {
    // 1. 清空两个列表
    dispatch(changePlayList([]))
    dispatch(changeSequecePlayList([]))
    // 2. 初始 currentIndex
    dispatch(changeCurrentIndex(-1))
    // 3. 关闭 PlayList 的显示
    dispatch(changeShowPlayList(false))
    // 4. 将当前歌曲置空
    dispatch(changeCurrentSong({}))
    // 5. 重置播放状态
    dispatch(changePlayingState(false))
  }

  const handleScroll = (pos) => {
    // 只有当内容偏移量为 0 的时候才能下滑关闭 PlayList。否则一边内容在移动，一边列表在移动，出现 bug
    let state = pos.y === 0
    setCanTouch(state)
  }

  const transform = prefixStyle('transform')

  const onEnterCB = useCallback(() => {
    // 让列表显示
    setIsShow(true)
    // 最开始是隐藏在下面
    listWrapperRef.current.style[transform] = `translate3d (0, 100%, 0)`
  }, [transform])

  const onEnteringCB = useCallback(() => {
    // 让列表展现
    listWrapperRef.current.style['transition'] = 'all 0.3s'
    listWrapperRef.current.style[transform] = `translate3d (0, 0, 0)`
  }, [transform])

  const onExitingCB = useCallback(() => {
    listWrapperRef.current.style['transition'] = 'all 0.3s'
    listWrapperRef.current.style[transform] = `translate3d (0px, 100%, 0px)`
  }, [transform])

  const onExitedCB = useCallback(() => {
    setIsShow(false)
    listWrapperRef.current.style[transform] = `translate3d (0px, 100%, 0px)`
  }, [transform])
  const togglePlayListDispatch = (data) => {
    dispatch(changeShowPlayList(data))
  }

  const getCurrentIcon = (item) => {
    // 是不是当前正在播放的歌曲
    const current = currentSong.id === item.id
    const className = current ? 'icon-play' : ''
    const content = current ? '&#xe6e3;' : ''
    return (
      <i
        className={`current iconfont ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      ></i>
    )
  }
  const getPlayMode = () => {
    let content, text
    if (mode === playMode.sequence) {
      content = '&#xe625;'
      text = '顺序播放'
    } else if (mode === playMode.loop) {
      content = '&#xe653;'
      text = '单曲循环'
    } else {
      content = '&#xe61b;'
      text = '随机播放'
    }
    return (
      <div>
        <i
          className="iconfont"
          onClick={(e) => changeMode(e)}
          dangerouslySetInnerHTML={{ __html: content }}
        ></i>
        <span className="text" onClick={(e) => changeMode(e)}>
          {text}
        </span>
      </div>
    )
  }
  const changeMode = (e) => {
    e.stopPropagation()
    let newMode = (mode + 1) % 3
    if (newMode === 0) {
      // 顺序模式
      changePlayListDispatch(sequencePlayList)
      let index = findIndex(currentSong, sequencePlayList)
      changeCurrentIndexDispatch(index)
    } else if (newMode === 1) {
      // 单曲循环
      changePlayListDispatch(sequencePlayList)
    } else if (newMode === 2) {
      // 随机播放
      let newList = shuffle(sequencePlayList)
      let index = findIndex(currentSong, newList)
      changePlayListDispatch(newList)
      changeCurrentIndexDispatch(index)
    }
    changeModeDispatch(newMode)
  }

  const handleChangeCurrentIndex = (index) => {
    if (currentIndex === index) return
    changeCurrentIndexDispatch(index)
  }
  const handleDeleteSong = (e, song) => {
    e.stopPropagation()
    deleteSongDispatch(song)
  }
  const handleTouchStart = (e) => {
    if (!canTouch || initialed) return
    listWrapperRef.current.style['transition'] = ''
    setStartY(e.nativeEvent.touches[0].pageY) // 记录 y 值
    setInitialed(true)
  }
  const handleTouchMove = (e) => {
    if (!canTouch || !initialed) return
    let distance = e.nativeEvent.touches[0].pageY - startY
    if (distance < 0) return
    setDistance(distance) // 记录下滑距离
    listWrapperRef.current.style.transform = `translate3d (0, ${distance} px, 0)`
  }
  const handleTouchEnd = (e) => {
    setInitialed(false)
    // 这里设置阈值为 150px
    if (distance >= 150) {
      // 大于 150px 则关闭 PlayList
      togglePlayListDispatch(false)
    } else {
      // 否则反弹回去
      listWrapperRef.current.style['transition'] = 'all 0.3s'
      listWrapperRef.current.style[transform] = `translate3d (0px, 0px, 0px)`
    }
  }
  return (
    <CSSTransition
      in={showPlayList}
      timeout={300}
      classNames="list-fade"
      onEnter={onEnterCB}
      onEntering={onEnteringCB}
      onExiting={onExitingCB}
      onExited={onExitedCB}
    >
      <PlayListWrapper
        ref={playListRef}
        style={isShow === true ? { display: 'block' } : { display: 'none' }}
        onClick={() => togglePlayListDispatch(false)}
      >
        <div
          className="list_wrapper"
          ref={listWrapperRef}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ListHeader>
            <h1 className="title">
              {getPlayMode()}
              <span className="iconfont clear" onClick={handleShowClear}>
                &#xe63d;
              </span>
            </h1>
          </ListHeader>
          <ScrollWrapper>
            <Scroll
              ref={listContentRef}
              onScroll={(pos) => handleScroll(pos)}
              bounceTop={false}
            >
              <ListContent>
                {playList.map((item, index) => {
                  return (
                    <li
                      className="item"
                      key={item.id}
                      onClick={() => handleChangeCurrentIndex(index)}
                    >
                      {getCurrentIcon(item)}
                      <span className="text">
                        {item.name} - {getName(item.ar)}
                      </span>
                      <span className="like">
                        <i className="iconfont">&#xe601;</i>
                      </span>
                      <span
                        className="delete"
                        onClick={(e) => handleDeleteSong(e, item)}
                      >
                        <i className="iconfont">&#xe63d;</i>
                      </span>
                    </li>
                  )
                })}
              </ListContent>
            </Scroll>
          </ScrollWrapper>
        </div>
        <Confirm
          ref={confirmRef}
          text={'是否删除全部？'}
          cancelBtnText={'取消'}
          confirmBtnText={'确定'}
          handleConfirm={handleConfirmClear}
        />
      </PlayListWrapper>
    </CSSTransition>
  )
}
export default React.memo(PlayList)
