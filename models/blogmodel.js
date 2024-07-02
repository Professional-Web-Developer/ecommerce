const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numViews:{
        type:Number,
        default:0,
    },
    isLiked:{
        type:Boolean,
        default:false,
    },
    isDisLiked:{
        type:Boolean,
        default:false,
    },
    likes:[{
        type:mongoose.Schema.Types.objectId,
        ref:"User"
    },],
    dislikes:[{
        type:mongoose.Schema.Types.objectId,
        ref:"User"
    }]
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);