const bodyParser = require('body-parser');
const express=require ('express');
const dbConnect = require('./dbconnect');
const app=express();
const dotenv=require('dotenv').config();
var cors = require("cors");  //Cross Origin Resource Sharing (C
const  CookieParser=require( 'cookie-parser') ;
const PORT =process.env.PORT || 3000;
const authRouter=require('./routes/authRouter');
const { notfound, errorHandler } = require('./middlewares/errorhandler');
const cookieParser = require('cookie-parser');
const morgan=require('morgan')
const slugify=require('slugify')
const productrouter=require("./routes/productrouter")
dbConnect();
app.use(bodyParser.json());
app.use(CookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/",(req,res)=>{
//     res.send("hi");
// })
// app.use(cors({
//     origin:"*",
// }))

app.use(morgan('dev'))
app.use('/api/user/',authRouter)
app.use('/api/product',productrouter)



app.use(notfound)
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log(`Server is running in the port ${PORT}`);
}) 