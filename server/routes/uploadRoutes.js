import express from "express"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

// upolad api

router.post("/file", upload.single("file"), (req,res)=>{
    res.json({
        fileUrl:`http://localhost:5000/uploads/${req.file.fieldname}`,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
    })
})

export default router