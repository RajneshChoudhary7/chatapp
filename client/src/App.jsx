import React from 'react'
import { Routes ,Route } from 'react-router-dom'
import LoginSignup from './components/LoginSignup'

const App = () => {
  return (
    <div className='flex items-center justify-center mt-24'>
    <Routes>
        <Route path='/' element={<LoginSignup/>} />
    </Routes>
    </div>
  )
}

export default App
