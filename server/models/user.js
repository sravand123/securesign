const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
    image:String,
    signedUp:Boolean,
    signature:Buffer,
    imageSignature:Buffer,
    defaultSignature:{type:Number,default:0},
    ownedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    sharedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ]
  }
);
const User = mongoose.model('user', userSchema);

module.exports = User;
