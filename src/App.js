import React from 'react'
import { Provider } from 'react-redux'
import { GlobalStyle } from './style'
import { IconStyle } from 'Assets/iconfont/iconfont.js'
import router from './router/index'
import store from './store/index'
import { renderRoutes } from 'react-router-config'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <GlobalStyle />
        <IconStyle />
        {renderRoutes(router)}
      </BrowserRouter>
    </Provider>
  )
}

export default App
