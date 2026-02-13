const express = require('express')

const {signup, login} = require('../controllers/auth.controller.js')
const { default: protect } = require('../middleware/authMiddleware.js')
const { getAllUsers, getUserStatus } = require('../controllers/user.controller.js')
const router = express.Router()

router.post('/register',signup)
router.post('/login',login)
router.get("/all",getAllUsers)
router.get("/status/:id", getUserStatus)

module.exports = router