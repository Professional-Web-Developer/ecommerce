const User=require("../models/usermodel");
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv').config();
const asyncHandler=require( 'express-async-handler' );
const authMiddleware=asyncHandler(async(req,res,next)=> {
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1]
        try{
            if(token){
                const decoded=jwt.verify(token,process.env.JWT_SECRET)
                const user=await User.findById(decoded.id);
                req.user=user;
            // var user =jwt.verify(token,process.env.JWT_SECRET)
            // req.user=await User.findById(user.id)
            console.log(req.user);
            next();
            }
        } catch(err){
throw new Error("invalid token")   }
    }
    else  throw new Error("Not Authorized");

})
const isAdmin=asyncHandler(async(req,res,next)=>{
    // res.status(req.user) 
    const {email}=req.user;
    const adminUser=await User.findOne({email})
    if(adminUser.role!="admin"){
        throw new Error("You're not an admin");
    }
    else{
        next();
    }
})
module.exports={authMiddleware,isAdmin};