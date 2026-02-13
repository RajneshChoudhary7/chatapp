import React from 'react'
import { Routes ,Route } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'

const App = () => {
  return (
    <div className=''>
    <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/' element={<Signup/>} />
        <Route path='/home' element={<Home/>} />
    </Routes>
    </div>
  )
}

export default App
