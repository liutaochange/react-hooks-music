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
  changeSpeed,
} from './store/actionCreators'
import { getLyricRequest } from 'Api/index'
import MiniPlayer from './miniPlayer'
import NormalPlayer from './normalPlayer'
import PlayList from './playList'
import { getSongUrl, isEmptyObject, shuffle, findIndex } from 'Utils'
import Toast from 'Base/tips/index'
import { playMode } from 'Api/config'
import Lyric from 'Api/lyric-parser'

const Player = (props) => {
  const dispatch = useDispatch()
  const audioRef = useRef()
  const toastRef = useRef()
  const currentLyric = useRef()
  const currentLineNum = useRef(0)
  const songReady = useRef(true)
  const [modeText, setModeText] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentPlayingLyric, setPlayingLyric] = useState('')
  const [preSong, setPreSong] = useState({})
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration

  const fullScreen = useSelector((state) =>
    state.getIn(['player', 'fullScreen'])
  )
  const playing = useSelector((state) => state.getIn(['player', 'playing']))
  const currentSong = useSelector((state) =>
    state.getIn(['player', 'currentSong']).toJS()
  )
  const mode = useSelector((state) => state.getIn(['player', 'mode']))
  const speed = useSelector((state) => state.getIn(['player', 'speed']))
  const currentIndex = useSelector((state) =>
    state.getIn(['player', 'currentIndex'])
  )
  const playList = useSelector((state) =>
    state.getIn(['player', 'playList'])
  ).toJS()
  const sequencePlayList = useSelector((state) =>
    state.getIn(['player', 'sequencePlayList']).toJS()
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
  const changeSpeedDispatch = (data) => {
    dispatch(changeSpeed(data))
  }

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady.current
    )
      return
    songReady.current = false
    let current = playList[currentIndex]
    changeCurrentDispatch(current)
    setPreSong(current)
    setPlayingLyric('')
    audioRef.current.src = getSongUrl(current.id)
    audioRef.current.autoplay = true
    audioRef.current.playbackRate = speed
    togglePlayingDispatch(true)
    getLyric(current.id)
    setCurrentTime(0)
    setDuration((current.dt / 1000) | 0)
    // eslint-disable-next-line
  }, [currentIndex, playList])

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause()
  }, [playing])

  useEffect(() => {
    if (!fullScreen) return
    if (currentLyric.current && currentLyric.current.lines.length) {
      handleLyric({
        lineNum: currentLineNum.current,
        txt: currentLyric.current.lines[currentLineNum.current].txt,
      })
    }
  }, [fullScreen])

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
    // 避免songReady恒为false的情况
    setTimeout(() => {
      songReady.current = true
    }, 3000)
    getLyricRequest(id)
      .then((data) => {
        lyric = data.lrc && data.lrc.lyric
        if (!lyric) {
          currentLyric.current = null
          return
        }
        currentLyric.current = new Lyric(lyric, handleLyric, speed)
        currentLyric.current.play()
        currentLineNum.current = 0
        currentLyric.current.seek(0)
      })
      .catch(() => {
        currentLyric.current = ''
        songReady.current = true
        audioRef.current.play()
      })
  }

  const clickPlaying = (e, state) => {
    e.stopPropagation()
    togglePlayingDispatch(state)
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000)
    }
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

  const updateTime = (e) => {
    setCurrentTime(e.target.currentTime)
  }

  const handleLoop = () => {
    audioRef.current.currentTime = 0
    togglePlayingDispatch(true)
    audioRef.current.play()
    if (currentLyric.current) {
      currentLyric.current.seek(0)
    }
  }

  const handlePrev = () => {
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex - 1
    if (index === 0) index = playList.length - 1
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const handleNext = () => {
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex + 1
    if (index === playList.length) index = 0
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop()
    } else {
      handleNext()
    }
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
  const handleError = () => {
    songReady.current = true
    handleNext()
    alert('播放出错')
  }

  const clickSpeed = (newSpeed) => {
    changeSpeedDispatch(newSpeed)
    audioRef.current.playbackRate = newSpeed
    currentLyric.current.changeSpeed(newSpeed)
    currentLyric.current.seek(currentTime * 1000)
  }

  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          full={fullScreen}
          playing={playing}
          mode={mode}
          percent={percent}
          modeText={modeText}
          duration={duration}
          currentTime={currentTime}
          currentLyric={currentLyric.current}
          currentPlayingLyric={currentPlayingLyric}
          speed={speed}
          changeMode={changeMode}
          handlePrev={handlePrev}
          handleNext={handleNext}
          onProgressChange={onProgressChange}
          currentLineNum={currentLineNum.current}
          clickPlaying={clickPlaying}
          toggleFullScreenDispatch={toggleFullScreenDispatch}
          togglePlayListDispatch={togglePlayListDispatch}
          clickSpeed={clickSpeed}
        ></NormalPlayer>
      )}
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          playing={playing}
          full={fullScreen}
          song={currentSong}
          percent={percent}
          clickPlaying={clickPlaying}
          setFullScreen={toggleFullScreenDispatch}
          togglePlayList={togglePlayListDispatch}
        ></MiniPlayer>
      )}

      <PlayList clearPreSong={setPreSong.bind(null, {})}></PlayList>
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <Toast text={modeText} ref={toastRef}></Toast>
    </div>
  )
}

export default React.memo(Player)
