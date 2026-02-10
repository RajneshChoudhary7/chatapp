import jwt from 'jsonwebtoken'

const getToken = async(userId) =>{
    try {
        const token = await jwt.sign({userId}.process.env.jwt_secret,{expiresIn:"7d"})
        return token
    } catch (error) {
        console.log("error in generating toke = "+error);
        
    }
}

export default getToken