const { default: slugify } = require("slugify")
const product=require("../models/productmodel")
const asyncHandler=require("express-async-handler")
const isAdmin=require('../middlewares/authMiddleware')
const createproduct=asyncHandler(async (req,res)=>{
try{
    if(req.body.title){
        req.body.slug=slugify(req.body.title)
    }
    const newProduct=await product.create(req.body)
    res.json(newProduct)
}
catch(err){
    throw new Error(err)
}
})
const updateproduct=asyncHandler(async(req,res)=>{
    const id=req.params.id;
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title);

        }
        const updateproducts= await product.findByIdAndUpdate(id,req.body,{new:true})
        res.json(updateproducts)
    }
    catch(err){
        throw new Error(err)
    }
})
const deleteproduct=asyncHandler(async(req,res)=>{
    const id=req.params;
    try{
        const deleteproducts=await product.findOneAndDelete(id)
        res.json({
            message:"Deleted Successfully"
        })
    }
    catch(err){
        throw new  Error(err);
    }
})
const getaproduct=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    try{
        const findproduct=await product.findById(id);
        res.json(findproduct)
    }
    catch(err){
        throw new Error(err)
    }
})
const getallproduct=asyncHandler(async(req,res)=>{
    try{
        //filtering
        const queryobj={...req.query}
        const excludefields=["page","sort", "limit","fields"];
        excludefields.forEach((el)=>delete queryobj[el]);
        let querystr=JSON.stringify(queryobj);
        // console.log(querystr)
        querystr=querystr.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>`$${match}`);
        let query=product.find(JSON.parse(querystr))
        //console.log(query)
        // const products=await query;
        // res.json(products)
        // console.log(queryobj,querystr)
        //const getallproducts=await product.find(req.query);
        // const getallproducts=await product.find({
        //     brand:req.query.brand,
        //     category:req.query.category,
        // })
        //const getallproducts=await product.where("category").equals(req.query.category).sort('-createdAt');
        // res.json(getallproducts)
        


        //sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(" ")
            query=query.sort(sortBy)
        }
        else{
            query=query.sort("-createdAt")
        }


        //limiting the fields
        if(req.query.fields){
            const fields=req.query.fields.split(',').join(" ");
            query=query.select(fields)
        }
        else{
            query=query.select('-__v')
        }

        //pagination
        const page=req.query.page;
        const limit=req.query.limit;
        const skip=(page-1)*limit;
        //console.log(page,limit,skip)

        
        if(req.query.page){
            query=query.skip(skip).limit(limit)
            const productcount=await product.countDocuments();
            if(skip>=productcount){
                throw new Error("This page doesnt exist")
            }
        }
        const products=await query;
        res.json(products)

    }
    catch(err){
        throw new Error(err)
    }
})
module.exports={createproduct,getaproduct,getallproduct,updateproduct,deleteproduct};