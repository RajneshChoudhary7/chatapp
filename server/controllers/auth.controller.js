import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import getToken from "../utils/token.js";


export const signup = async (req,res)=>{
    const {name , email , password} = req.body
    try {
        const existringUser = await User.findOne({email})
        if(existringUser) return res.status(400).json({message:"user already exists"})

            const hashedPassword = await bcrypt.hash(password,10)
            const newUser = await User.create({name,email,password:hashedPassword})

            const token = await getToken(newUser._id)
            res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })

            res.status(201).json({message:`User Registered Successfully`,user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
                        }})


    } catch (error) {
        res.status(500).json({message:"Sigup controller error "})

    }
}

export const login = async (req,res)=>{
    const {email , password} = req.body
    
    try{
        const user = await User.findOne({email})
        if(!user) return res.status(404).json({message:'user not found '})

            const isMatch = await bcrypt.compare(password , user.password)
            if(!isMatch) return res.status(400).json({message:'Invalid Credentials'})

                const token = await getToken(user._id)
                res.cookie("token",token,{
                secure:false,
                sameSite:"strict",
                maxAge:7*24*60*60*1000,
                httpOnly:true
                })

                res.json({message:'login Sccessful',token})
                


    }
    catch (error){
        res.status(500).json({message:error.message})
    }
}