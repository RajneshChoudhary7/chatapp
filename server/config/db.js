import mongoose from 'mongoose'

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.mongo_con)
        console.log("Database connect ho gya h chatapp ka ")
    } catch (error) {
        console.log("database connection error" + error)
    }
}

export default connectDb