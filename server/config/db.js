import mongoose from 'mongoose'

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_CON)
        
    } catch (error) {
        console.log("database connection error" + error)
    }
}

export default connectDb