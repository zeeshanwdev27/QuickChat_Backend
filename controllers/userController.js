import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/generateToken.js'
import cloudinary from '../lib/cloudinary.js'


export const signup = async(req,res)=>{
    const { fullName, email, password, bio } = req.body
    try {

        if( !fullName || !email || !password || !bio ){
            return res.json({ success: false, message: "Missing Details" })
        }

        const user = await User.findOne({ email })
        if(!user){
            return res.json({ success: false, message: "Account already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({ fullName, email, password: hashedPassword, bio})

        const token = generateToken( newUser._id )

        res.json({ success: true, message: "Account created successfully", userData: newUser, token})
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const login = async(req,res)=>{
    try {
        const { email, password } = req.body

        const userData = await User.findOne({ email })

        const isPassword = await bcrypt.compare( password, userData.password )
        if(!isPassword){
            return res.json({ success: false, message: "Invalid Crediantials" })
        }

        const token = generateToken( userData._id )

        res.json({ success: true, message: "Login successfully", userData, token})
      
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// check is user Authenticated
export const checkAuth = async (req, res)=>{
    res.json({ success: true, user: req.user})
}



// update userProfile
export const updateProfile = async (req, res)=>{
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate( userId, {bio, fullName}, { new: true })
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate( userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }

        res.json({ success: true, user: updatedUser })
        
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}