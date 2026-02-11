import jwt from 'jsonwebtoken'

const protect = (req , res , next ) =>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Not Authorized, no Token"})
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET)

        req.user = decode.userId
        next()


    } catch (error) {
        res.status(401).json({ message: "Token Invalid" });
    }
}

export default protect