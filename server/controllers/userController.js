const Binary = require('mongodb').Binary;
const User = require('../models/user');
const fs = require('fs');
const Jimp = require("jimp")
const { google } = require('googleapis');
const client = new google.auth.OAuth2(process.env.googleClientId, process.env.googleClientSecret, "http://localhost:3001/auth/google/callback");

function getEmail(req, res) {
    if (!req.cookies.JWT) {
        res.status(401).json({ error: "user not found" });
        return null;
    }
    else {
        let buff = Buffer.from(req.cookies.JWT.split('.')[1], 'base64');
        let text = buff.toString('ascii');
        let email = JSON.parse(text).email;
        return email;
    }
}
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
const convertToPng = async(file)=>{
    
       let image =  await Jimp.read(file);
       let imageBuffer  = await image.getBufferAsync(Jimp.MIME_PNG);
       return imageBuffer;
    
}

exports.uploadSignature = async(req,res,next)=>{
    try{
        let email = getEmail(req,res);
        console.log(email);
        let user =  await User.findOne({email:email},{signature:1,imageSignature:1}).exec();
        let image = req.files.doc;
        console.log(image);
        let imagePath = image.tempFilePath;
      
        let imageBuffer  = await convertToPng(imagePath);
        console.log(imageBuffer);
       
        console.log(req.body.type);
        if(req.body.type==="handwritten"){
           user.signature  = Binary(imageBuffer);
           // console.log(Binary(imageBuffer));

        }
        else{
            user.imageSignature  = Binary(imageBuffer);
        }
        await user.save();
        res.status(200).json({message:'ok'});
    }
    catch(err){
        res.status(500).json({ error: "Internal Server Error" });   
    }
}
exports.getSignatures = async(req,res,next)=>{
    try{
        let email = getEmail(req,res);
        let user =  await User.findOne({email:email},{signature:1,imageSignature:1,defaultSignature:1}).exec();
        res.status(200).json(user);
    }
    catch(err){
        res.status(500).json({ error: "Internal Server Error" });   
    }
}
exports.setDefaultSignature  =  async(req,res,next)=>{
    try{
        let email = getEmail(req,res);
        let user =  await User.findOne({email:email},{signature:1,imageSignature:1,defaultSignature:1}).exec();
        user.defaultSignature = req.body.defaultSignature;
        await user.save();
        res.status(200).json({message:'ok'});
    }
    catch(err){
        res.status(500).json({ error: "Internal Server Error" });   
    }
}

exports.getAccessToken =  (req,res,next)=>{
    res.status(200).json({accessToken:req.cookies.access_token});
}
exports.storeKeys = async(req,res,next)=>{
   try{
        let email = getEmail(req,res);
        let user =  await User.findOne({email:email},{publicKeys:1,encryptedPrivateKey:1,latestPublicKey:1}).exec();
        let publicKeys = user.publicKeys;
        publicKeys.push(req.body.publicKey);
        console.log(publicKeys);
        user.publicKeys = publicKeys;
        user.latestPublicKey = req.body.publicKey;
        user.encryptedPrivateKey = req.body.encryptedPrivateKey;
        await user.save();
        res.status(200).json({message:'ok'});
   }
   catch(err){
    res.status(500).json({ error: "Internal Server Error" });   

   }

}
exports.getKeys = async(req,res,next)=>{
    try{
        let email = getEmail(req,res);
        let user =  await User.findOne({email:email},{latestPublicKey:1,encryptedPrivateKey:1}).exec();
        res.status(200).json({publicKey:user.latestPublicKey,encryptedPrivateKey:user.encryptedPrivateKey});
    }
    catch(err){
    res.status(500).json({ error: "Internal Server Error" });   

    }
}
exports.getKeyStatus = async (req,res,next)=>{
    try{
        let email = getEmail(req,res);
        let user =  await User.findOne({email:email},{latestPublicKey:1,publicKeys:1}).exec();
        if(user.publicKeys.length===0){
            res.status(200).json({keyStatus:false})
        }
        else{
            res.status(200).json({keyStatus:true})

        }
    }
    catch(err){
    res.status(500).json({ error: "Internal Server Error" });   

    }
}
