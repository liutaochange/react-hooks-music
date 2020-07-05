import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen,
} from './store/actionCreators'
import { getLyricRequest } from 'Api/index'
import MiniPlayer from './miniPlayer'
import NormalPlayer from './normalPlayer'
import { getSongUrl, isEmptyObject, shuffle, findIndex } from 'Utils'
import Toast from 'Base/tips/index'
import { playMode } from 'Api/config'
import Lyric from 'Api/lyric-parser'

const Player = (props) => {
  const dispatch = useDispatch()
  const audioRef = useRef()
  const toastRef = useRef()
  const preSong = useRef({})
  const songReady = useRef(true)
  // 存放歌词信息
  const currentLyric = useRef()
  // 记录歌词行数
  const currentLineNum = useRef(0)

  const [modeText, setModeText] = useState('')
  // 目前播放时间
  const [currentTime, setCurrentTime] = useState(0)
  // 歌曲总时长
  const [duration, setDuration] = useState(0)
  // 存放当前歌词
  const [currentPlayingLyric, setPlayingLyric] = useState('')
  // 歌曲播放进度
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration
  // 是否是全屏播放
  const fullScreen = useSelector((state) =>
    state.getIn(['player', 'fullScreen'])
  )
  // 是否正在播放中
  const playing = useSelector((state) => state.getIn(['player', 'playing']))
  // 当前歌曲
  const currentSong = useSelector((state) =>
    state.getIn(['player', 'currentSong'])
  )
  const showPlayList = useSelector((state) =>
    state.getIn(['player', 'showPlayList'])
  )
  const mode = useSelector((state) => state.getIn(['player', 'mode']))
  const currentIndex = useSelector((state) =>
    state.getIn(['player', 'currentIndex'])
  )
  const playList = useSelector((state) => state.getIn(['player', 'playList']))
  const sequencePlayList = useSelector((state) =>
    state.getIn(['player', 'sequencePlayList'])
  )

  const togglePlayingDispatch = (data) => {
    dispatch(changePlayingState(data))
  }
  const toggleFullScreenDispatch = (data) => {
    dispatch(changeFullScreen(data))
  }
  const togglePlayListDispatch = (data) => {
    dispatch(changeShowPlayList(data))
  }
  const changeCurrentIndexDispatch = (index) => {
    dispatch(changeCurrentIndex(index))
  }
  const changeCurrentDispatch = (data) => {
    dispatch(changeCurrentSong(data))
  }
  const changeModeDispatch = (data) => {
    dispatch(changePlayMode(data))
  }
  const changePlayListDispatch = (data) => {
    dispatch(changePlayList(data))
  }
  const clickPlaying = (e, state) => {
    e.stopPropagation()
    togglePlayingDispatch(state)
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000)
    }
  }
  const updateTime = (e) => {
    setCurrentTime(e.target.currentTime)
  }
  const onProgressChange = (curPercent) => {
    const newTime = curPercent * duration
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
    if (!playing) {
      togglePlayingDispatch(true)
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000)
    }
  }
  //单曲循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0
    changePlayingState(true)
    audioRef.current.play()
  }

  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex - 1
    if (index < 0) index = playList.length - 1
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const handleNext = () => {
    // 播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex + 1
    if (index === playList.length) index = 0
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }
  const changeMode = () => {
    let newMode = (mode + 1) % 3
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList)
      let index = findIndex(currentSong, sequencePlayList)
      changeCurrentIndexDispatch(index)
      setModeText('顺序循环')
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList)
      setModeText('单曲循环')
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList)
      let index = findIndex(currentSong, newList)
      changePlayListDispatch(newList)
      changeCurrentIndexDispatch(index)
      setModeText('随机播放')
    }
    changeModeDispatch(newMode)
    toastRef.current.show()
  }
  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop()
    } else {
      handleNext()
    }
  }
  const handleLyric = ({ lineNum, txt }) => {
    if (!currentLyric.current) return
    currentLineNum.current = lineNum
    setPlayingLyric(txt)
  }
  const getLyric = (id) => {
    let lyric = ''
    if (currentLyric.current) {
      currentLyric.current.stop()
    }
    // 避免 songReady 恒为 false 的情况
    getLyricRequest(id)
      .then((data) => {
        console.log(data)
        lyric = data.lrc.lyric
        if (!lyric) {
          currentLyric.current = null
          return
        }
        currentLyric.current = new Lyric(lyric, handleLyric)
        currentLyric.current.play()
        currentLineNum.current = 0
        currentLyric.current.seek(0)
      })
      .catch(() => {
        songReady.current = true
        audioRef.current.play()
      })
  }

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.current.id ||
      !songReady.current // 标志位为 false
    )
      return
    let current = playList[currentIndex]
    preSong.current = current
    songReady.current = false // 把标志位置为 false, 表示现在新的资源没有缓冲完成，不能切歌
    changeCurrentDispatch(current) // 赋值 currentSong
    audioRef.current.src = getSongUrl(current.id)
    setTimeout(() => {
      // 注意，play 方法返回的是一个 promise 对象
      audioRef.current.play().then(() => {
        songReady.current = true
      })
    })
    togglePlayingDispatch(true) // 播放状态
    getLyric(current.id)
    setCurrentTime(0) // 从头开始播放
    setDuration((current.dt / 1000) | 0) // 时长
  }, [playList, currentIndex])
  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause()
  }, [playing])
  const handleError = () => {
    songReady.current = true
    setModeText('播放出错')
    toastRef.current.show()
  }
  console.log(isEmptyObject(currentSong));
  console.log(currentSong);
  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <>
          <NormalPlayer
            song={currentSong}
            fullScreen={fullScreen}
            playing={playing}
            duration={duration} //总时长
            currentTime={currentTime} //播放时间
            percent={percent} //进度
            toggleFullScreen={toggleFullScreenDispatch}
            clickPlaying={clickPlaying}
            onProgressChange={onProgressChange}
            handlePrev={handlePrev}
            handleNext={handleNext}
            mode={mode}
            changeMode={changeMode}
            togglePlayList={togglePlayListDispatch}
            currentLyric={currentLyric.current}
            currentPlayingLyric={currentPlayingLyric}
            currentLineNum={currentLineNum.current}
          />
          <MiniPlayer
            song={currentSong}
            fullScreen={fullScreen}
            playing={playing}
            duration={duration} //总时长
            currentTime={currentTime} //播放时间
            percent={percent} //进度
            toggleFullScreen={toggleFullScreenDispatch}
            clickPlaying={clickPlaying}
            togglePlayList={togglePlayListDispatch}
          />
        </>
      )}
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
      ></audio>
      <Toast text={modeText} ref={toastRef} onError={handleError}></Toast>
    </div>
  )
}

export default React.memo(Player)
