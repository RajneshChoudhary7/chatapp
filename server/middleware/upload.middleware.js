import multer from 'multer'
import path from 'path'

// storage config 
const storage = multer.diskStorage({
    destination: (req , file , cb) =>{
        cb(null, "uploads/")
    },

    filename:(req, file,cb) =>{
        cb(null , Date.now() + "-" + file.originalname)
    }
})

// file filter 
const  fileFilter = (req, file, cb) => {
    cb(null , true)
}

export const upload = multer({
    storage,
    fileFilter
})