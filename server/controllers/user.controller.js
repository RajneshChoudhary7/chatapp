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