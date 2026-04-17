const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sendEmail = require('../utils/sendEmail');


exports.forgotPassword = async(req,res) => {
  try{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message: "User not found"});

    const otp = Math.floor(100000 + Math.random()*900000).toString();

    user.otp=otp;
    user.otpExpires = Date.now() + 5*60*1000;
    await user.save();
    await sendEmail(email, "TickeGo OTP",`Your OTP is ${otp}`);
    res.json({message: "OTP sent to email"});
  }
  catch(error){
    res.status(500).json({ error: error.message});
  }
}


exports.resetPassword = async (req,res)=>{
  try{
    const {email,otp,newPassword} = req.body;
    const user = await User.findOne({email});
    console.log("Stored OTP:", user.otp);
    console.log("Entered OTP:", otp);
    if(!user || user.otp !== String(otp))
      return res.status(400).json({message:"Invalid OTP"});
    if(user.otpExpiry < Date.now())
     return res.status(400).json({message:"OTP has expired"});
    const hashedPassword = await bcrypt.hash(newPassword,10);
    user.password = hashedPassword;
    user.otp=null;
    user.otpExpiry=null;

    await user.save();
    res.json({message: "Password reset successful"});
  }
  catch(error){
    res.status(500).json({error: error.message});
  }  
};


exports.signup = async (req,res) => {
  try {
    const {name, email, password} = req.body;
    
    const existingUser = await User.findOne({ email });

    if(existingUser){
      return res.status(400).json({ message : "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password : hashedPassword,
    });

    await user.save();

    res.status(201).json({ message : "User created successfully"});
  }
  catch(error){
    res.status(500).json({ error : error.message});
  }
}


exports.login = async (req,res) =>{
  try{
    const { email, password } = req.body;

    const user = await User.findOne({ email });
     
    if(!user){
      return res.status(400).json({ message : " User not found"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.status(400).json({ message : "Invalid credentials"});
    }

    const token = jwt.sign(
      {id : user._id},
      process.env.JWT_SECRET,
      { expiresIn: "1d"}
    );

    res.json({
      message : "Login Successful",
      token,
    });
  }
  catch(error){
    res.status(500).json({ error: error.message});
  }
};