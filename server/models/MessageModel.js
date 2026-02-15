import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,

    text:String,
    
    fileUrl:String,
    fileType:String,
    fileName: String,

    messageType : {
        type: String,
        default : "text", // text , image ,, video , pdf
    },

    time : Date
})

const file = mongoose.model("file", messageSchema)

export default file