const User = require('../models/user');

exports.getUserNamesList = async(req,res,next)=>{
    try{

        let users =  await User.find({},{email:1,name:1,image:1}).exec();
        console.log(users);
        res.status(200).json(users);
    }
    catch(err){
        res.status(500).json({ error: "Internal Server Error" });   
    }
}