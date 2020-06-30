import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Content = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 32px;
`

const Marquee = (props) => {
  const txt = useRef()
  const outer = useRef()
  useEffect(() => {
    const outerWidth = outer.current.offsetWidth
    const txtWidth = txt.current.offsetWidth
    let w = outerWidth
    const inter = setInterval(() => {
      w = w + txtWidth === 0 ? outerWidth : w - 1
      txt.current.style.transform = `translate(${w}px)`
    }, 10)
    return () => {
      clearInterval(inter)
    }
  }, [])
  return (
    <Content ref={outer}>
      <div ref={txt}>{props.content}</div>
    </Content>
  )
}
Marquee.defaultProps = {
  content: '',
}
Marquee.propTypes = {
  content: PropTypes.string,
}
export default Marquee
