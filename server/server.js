import express from 'express'
import connectDb from './config/db.js'
import dotenv from 'dotenv'
dotenv.config()
const port = process.env.port





const app = express()

app.get('/',(req, res)=>{
    res.send("server is running")
})

app.listen(port,()=>{
    connectDb()
    console.log("server is started at + " + port)
})