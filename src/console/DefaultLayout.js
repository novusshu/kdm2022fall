import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from './components/index'
import './scss/style.scss'
import { Provider } from 'react-redux'
import store from './store'
import { Footer } from '../layouts/Footer'

const DefaultLayout = () => {
  return (
    <Provider store={store}>
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>

        <Footer />
      </div>
    </div>
    </Provider>
  )
}

export default DefaultLayout
