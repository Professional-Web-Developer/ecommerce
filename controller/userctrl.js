// const { error } = require('jquery');
const generatetoken=require('../jwtToken');
const crypto=require('crypto')
const jwt=require( 'jsonwebtoken' );
const User=require('../models/usermodel')
const asyncHandler=require('express-async-handler');
const { Error } = require('mongoose');
const generateRefreshtoken=require("../config/refreshtoken")
const validatemongodbid=require("../utils/validateMongoDbId");
const sendEmail = require('./emailcontrol');
const CreateUser=asyncHandler(async(req,res)=>{
    const email=req.body.email;
    const findUser=await User.findOne({email});
    if(!findUser){
        const newUser=await User.create(req.body)
        res.json(newUser); 
    }
    else{
        throw new Error('User Already Exist');
    }
})
const LoginUser=asyncHandler(async(req,res)=>{ 
    const {email,password}=req.body;
    //Checking user exist or not
    const finduser=await User.findOne( {email} )
    if(finduser && (await finduser.isCorrectPassword(password))){
        const refreshtoken=await generateRefreshtoken(finduser._id)
        const updateuser=await User.findByIdAndUpdate(finduser._id,{
            refreshtoken:refreshtoken
        },{
            new:true
        })
        res.cookie('refreshtoken',refreshtoken,{
            httpOnly:true,
            maxAge:72*60*60*1000,
                })
        res.json({
            id:finduser?._id,
            firstname:finduser.firstname,
            lastname:finduser.lastname,
            email:finduser.email,
            mobile:finduser.mobile,
            token:generatetoken(finduser.id),
        })
        
    }
    else{
        // throw new Error("Invalid Credentials")
        throw new Error(401,`Invalid Email Or Password ${email,password}`);
        // console.log({email,password})
    }
 

})
const handlerefreshtoken=asyncHandler(async(req,res)=>{
    const cookie=req.cookies;
    //get the refresh token from cookies
    // console.log(cookie)
    if(!cookie?.refreshtoken) throw new Error("No refresh token in cookies")
    const refreshtoken=cookie.refreshtoken;
// console.log(refreshtoken)
// verify the refresh token
const user= await User.findOne({refreshtoken})
// console.log(user)
if(!user)throw new Error('Invalid Token')
jwt.verify(refreshtoken,process.env.JWT_SECRET,(err,decoded)=>{
    // res.json(err)
    if(err||user.id !==decoded.id){
        throw new Error("Please Login again");
    }
     const accesstoken=generatetoken(user.id)
     res.json({accesstoken})
    
});

res.json({user})
})

//logout handle
const logout=asyncHandler(async(req,res)=>{
const cookie=req.cookies
if(!cookie.refreshtoken){
    throw new Error("You need to login")
}
const refreshtoken=cookie.refreshtoken;
const user=await User.findOne({refreshtoken})
if(!user){
    res.clearCookie("refreshtoken",{
        httpOnly:true,
        secure:true
    })
    return res.json({
        message:"logout  successful"
    })
}
await User.findOneAndUpdate({refreshtoken},{
    refreshtoken:""
})
res.clearCookie("refreshtoken",{
    httpOnly:true,
    secure:true
})
})
const getalluser=asyncHandler(async(req,res)=>{
    try{
        const getuser=await User.find();
        res.json(getuser)
    }
    catch(err){
        throw new Error(err)
    }
})
const getuser = asyncHandler(async (req, res) => {
    const { id } = req.params; // Corrected variable name to _id
    validatemongodbid(id);
    try {
        const getuser = await User.findById(_id);
        res.json(getuser);
    } catch (err) {
        throw new Error(`User Not Found With Id=${_id}`);
    }
});

const deleteauser=asyncHandler(async(req,res)=>{
    const {_id}=req.params;
    await validatemongodbid(_id);
    try{
        const getuser=await User.findByIdAndDelete(_id);
        // const getuser=await User.remove({_id:id});
        res.json(getuser)
    }
    catch(err){
       throw err;
    }
})
const updateauser=asyncHandler(async(req,res)=>{
    const {_id}=req.user;
    console.log(req.user)
    try{
        const updateuser=await User.findByIdAndUpdate(_id,{
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile : req?.body?.mobile,
            password:req?.body?.password
        },{
            new:true,
        }
        );
        res.json(updateuser)
    }
    catch(err){
        throw new Error(err.message)
    }
})
const blockuser=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    try{
        const block=await User.findByIdAndUpdate(id,{
            isBlocked: true
        },
        {
            new: true
        })
        res.json({
            message: "User Blocked Successfully"
        })
    }
    catch(err){
        throw new Error(err);
    }
})
    const unblockuser=asyncHandler(async(req,res,next)=>{
        const {id}=req.params;
        try{
            const unblock=await User.findByIdAndUpdate(id,{
                isBlocked:false
            },{
                new:true
            })
            res.json({
                message:"User Unblocked Successfully"
            });
        } 
        catch(err){
            throw new Error(err);
        }       
  
})
const updatepassword=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    const password=req.body;
    validatemongodbid(_id);
    try{
        const user=await User.findById(_id)
        if(password){
            user.password=password.password;
            const updatepassword=await user.save()
            res.json(updatepassword)
        }
        else{
            res.json(user)
        }
    }catch(err){
        throw new Error(err)
    }
   
})

const forgetpasswordToken=asyncHandler(async(req,res)=>{
const {email}=req.body
const user=await User.findOne({email});
if(!user){
    throw new Error("user not found for this email")
}
try{
    const token=await user.createPasswordResetToken()
    await user.save()
    const resetURL=`Pleasse follow this url to reset your password it will only valid for 10 minutes from now. <a href="http://localhost:4000/api/user/reset-password/${token}">Click Here</>`
    const data={
        to:email,
        text:"Hey User",
        subject:"Forgot Password Link",
        htm:resetURL
    }
    sendEmail(data)
    res.json({token,email})
}
catch(err){
    throw new Error(err)
}

})
const resetpassword=asyncHandler(async(req,res)=>{
    const {password}=req.body;
    const {token}=req.params;
    const hashedToken=crypto.createHash('sha256').update(token).digest("hex");
    const user=await User.findOne(
        {
            passwordResetToken:hashedToken,
            passwordResetExpiresIn:{$gt:Date.now()},
        }
    )
    if(!user){
        throw new Error("Token Expired");
    }
    user.password=password;
    user.passwordResetToken=undefined,
    user.passwordResetExpiresIn=undefined;
    await user.save();
    res.json(user)
})

module.exports={CreateUser,LoginUser,handlerefreshtoken,getalluser,getuser,deleteauser,updateauser,blockuser,unblockuser,logout,updatepassword,forgetpasswordToken,resetpassword};