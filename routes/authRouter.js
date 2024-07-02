 const express= require('express')
 const router=express.Router()
 const {authMiddleware,isAdmin}=require( '../middlewares/authMiddleware' )
 
 // GET all users
 const {CreateUser, LoginUser, getalluser,handlerefreshtoken, getuser, deleteauser, updateauser, blockuser, unblockuser, logout,updatepassword,forgetpasswordToken,resetpassword}=require('../controller/userctrl')
 router.post('/register',CreateUser);
 router.post('/forget-password-token',forgetpasswordToken)
 router.put('/reset-password/:token',resetpassword)

 router.put("/resetpassword",authMiddleware,updatepassword)
 router.post('/login',LoginUser)
 router.get('/allusers',isAdmin,getalluser)
 router.get("/refresh-token",handlerefreshtoken)
 router.get('/logout',logout)
 router.get('/:id',authMiddleware,isAdmin,getuser)
 router.delete('/:id',deleteauser)
 router.put('/edit-user',authMiddleware,updateauser)
 router.put('/block-user/:id',authMiddleware,isAdmin,blockuser)
 router.put('/unblock-user/:id',authMiddleware,isAdmin,unblockuser)

 module.exports=router;