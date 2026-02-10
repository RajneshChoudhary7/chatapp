import User from "../models/user.model.js";
import bcrypt, { hash } from 'bcrypt'
import getToken from "../utils/token.js";
import jwt from 'jsonwebtoken'

export const signup = async (req,res)=>{
    const {name , email , password} = req.body
    try {
        const existringUser = await User.findOne({email})
        if(existringUser) return res.status(400).json({message:"user already exists"})

            const hashedPassword = await bcrypt.hash(password,10)
            const newUser = await User.create({name,email,password:hashedPassword})

            res.status(201).json({message:`User Registered Successfully`,user:newUser})


    } catch (error) {
        res.status(400).json({message:"Sigup controller error "})

    }
}

exports.login = async (req,res)=>{
    const {email , password} = req.body
    
    try{
        const user = await User.findOne({email})
        if(!user) return res.status(404).json({message:'user not found '})

            const isMatch = await bcrypt.compare(password , user.password)
            if(!isMatch) return res.status(400).json({message:'Invalid Credentials'})

                const token = jwt.sign({ id:user._id},'secret123',{expiresIn:'1h'})
                res.json({message:'login Sccessful',token})
    }
    catch (error){
        res.status(500).json({message:error.message})
    }
}