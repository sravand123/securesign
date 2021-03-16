const User = require('../models/user');
const passport = require("passport");



exports.user_signin=passport.authenticate('google', { scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"] })



exports.google_callback = function(req,res,next){
    var query = { email: req.user.email },
      update = { email: req.user.email, name: req.user.name,image:req.user.image },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };

    User.findOneAndUpdate(query, update, options, function (error, result) {
      if (error) res.send(error);
      else {
        res.cookie('JWT', req.user.token, {
          maxAge: 3600_000,
          httpOnly: true
        });

        res.cookie('access_token', req.user.accessToken, {
          maxAge: 3600_000,
          httpOnly: true
        });
        res.cookie('name', req.user.name, {
          maxAge: 3600_000,
        });

        res.cookie('email', req.user.email, {
          maxAge: 3600_000,
        });
        res.cookie('id', req.user.token.split('.')[1], {
          maxAge: 3600_000,
        });
        
        res.redirect("http://localhost:3000");
      }

    });

  
}

exports.logout = (req,res,next)=>{
  res.clearCookie('acess_token');
  res.clearCookie('JWT');
  res.clearCookie('name');
  res.clearCookie('email');
  res.clearCookie('id');
  res.status(200).json({message:'ok'});
}
