const notfound=(req,res,next)=>{
    const error=new Error(`Not Found : ${req.originalUrl}`);
    res.status(404);
    next(error);
} ;
const errorHandler=(req,res,next)=>{
    const stauscode=res.statusCode===200 ? 500:res.statusCode;
    res.status(stauscode)
    res.json({
        message:err?.message,
        stack:err?.stack,
    });
};
module.exports={notfound,errorHandler};