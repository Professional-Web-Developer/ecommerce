const express=require('express');
const {isAdmin,authMiddleware}=require("../middlewares/authMiddleware")
const router=express.Router();
const {createproduct, getaproduct,getallproduct, updateproduct, deleteproduct}=require("../controller/productcontroller");
router.post('/create',authMiddleware,isAdmin,createproduct)
router.get('/allproducts',getallproduct);
router.get('/:id',getaproduct);
router.put('/update/:id',authMiddleware,isAdmin,updateproduct)
router.delete('/delete/:id',authMiddleware,isAdmin,deleteproduct)
module.exports=router;