import User from '../models/user.model.js'

export const getAllUsers = async (req,res) =>{
    try {
        const currentUserId = req.user;

        const users = await User.find({ _id:{$ne:currentUserId}}).select("-password")

        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
}

export const getUserStatus = async(req,res) =>{
    try {
        const user = await User.findById(req.params.id).select(
            "isOnline lastSeen name"
        );

        res.json(user)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}