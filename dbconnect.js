const {default : mongoose} = require("mongoose")
const dbConnect=()=>{
try{
    const conn=mongoose.connect(process.env.MONGODB_URL);
    console.log("dbconnected successfully")
}
catch(err){
    console.log(`DB connection error ${err}`);
}
}
module.exports=dbConnect;