const express = require('express')

const {signup, login} = require('../controllers/auth.controller.js')
const router = express.Router()

router.post('/register',signup)
router.post('/login',login)

module.exports = router