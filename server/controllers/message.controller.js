import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Send Message Error:", error.message);

    res.status(500).json({
      message: "Server error in sendMessage",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const message = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createAt: 1 });

    res.status(200).json(message);
  } catch (error) {
    console.log("GetMessages Error:", error.message);

    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

export const getConversations = async (req,res)=>{
    try {
        const {userId} = req.params;

        const messages = await Message.find({
            $or:[{ senderId: userId },{receiverId:userId}],

        })
        .sort({ createdAt: -1 })
        .populate("senderId", "name")
        .populate("receiverId", "name");

        const conversationsMap = new Map();
        
        messages.forEach((msg)=>{
            const otherUser = 
            msg.senderId.id.toString() === userId 
            ? msg.receiverId
            : msg.senderId

            if(!conversationsMap.has(otherUser._id.toString())){
                conversationsMap.set(otherUser._id.toString(),{
                    userId : otherUser._id,
                    userName: otherUser.name,
                    lastMessage: msg.text,
                    time:msg.createdAt,
                })
            }
        })


        res.status(200).json(Array.from(conversationsMap.values()))




    } catch (error) {
        console.log("Conversation Error:", error.message);

    res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
    }
}