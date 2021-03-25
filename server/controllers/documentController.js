const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { google } = require('googleapis');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Binary = require('mongodb').Binary;
const Document = require('../models/document');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const Agenda = require('agenda');
const moment = require('moment');
const Jimp = require("jimp")
var shasum = require('shasum')


const { body, validationResult, sanitizeBody } = require("express-validator");
require('dotenv').config();
const mongoConnectionString = process.env.DB;
const agenda = new Agenda({ db: { address: mongoConnectionString } });
const client = new google.auth.OAuth2(process.env.googleClientId, process.env.googleClientSecret, "http://localhost:3001/auth/google/callback");
const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASS
    }
});

//Utitlity function to retrieve email from the JWT.
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

//returns the list of documents owned by the user and the documents shared by others to the user 
exports.getUserDocuments = (req, res, next) => {
    let email = getEmail(req, res);
    User.findOne({ 'email': email }, { ownerdDocuments: 1, sharedDocuments: 1 }).populate('ownedDocuments', { buffer: 0 }).populate('sharedDocuments', { buffer: 0 }).exec((err, resp) => {
        if (err) {
            res.status(401).json({ error: "user not found" })
        }
        else {
            res.status(200).json({
                ownedDocuments: resp.ownedDocuments,
                sharedDocuments: resp.sharedDocuments.filter((document) => document.status === 'sent')
            });
        }
    })
}

exports.uploadDocument = async (req, res, next) => {
    let email = getEmail(req, res);
    let document = req.files.doc;
    let documentPath = document.tempFilePath;
    let documentBufferData = fs.readFileSync(documentPath);
    let documentData = {};

    documentData.buffer = Binary(documentBufferData);
    documentData.name = req.files.doc.name;
    documentData.description = req.body.description;
    documentData.owner = getEmail(req);
    documentData.timeline = [{ action: 'created', time: new Date(), email: email }];
    documentData.status = 'uploaded';
    try {

        let document = await Document.create(documentData);
        let pdfDoc = await PDFDocument.load(document.buffer);
        pdfDoc.setKeywords([document._id]);
        let pdfBytes = await pdfDoc.save();
        document.buffer = Binary(pdfBytes);
        console.log(pdfBytes);
        document.lastModifiedHash = shasum(pdfBytes);
        await document.save();
        let user = await User.findOne({ 'email': email }).exec();
        user.ownedDocuments.push(document._id);
        await user.save();
        res.status(200).json({ _id: document._id });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }

}

exports.addSigners = async (req, res, next) => {
    let signers = req.body.signers;
    let documentId = req.params.id;
    let isOwnerSigner = false;
    let sequential = req.body.sequential;
    try {
        signers.forEach(async (signer, index) => {
            agenda.define("set_document_expired", async (job) => {
                let document = await Document.findById(job.attrs.data.documentId, { signers: 1, timeline: 1, status: 1 }).exec();
                let signers = document.signers;
                let timeline = document.timeline;

                timeline.push({ action: 'expired', time: new Date(), email: job.attrs.data.email });
                signers.forEach((signer, index) => {
                    if (signer.email === job.attrs.data.email) signers[index].status = 'expired';
                })
                document.timeline = timeline;
                document.signers = signers;
                await document.save();
            });
            (async function () {

                var date = moment(signer.deadline).format();
                agenda.start();
                agenda.schedule(date, 'set_document_expired', { documentId: documentId, email: signer.email });

            })();

            let user = await User.findOne({ 'email': signer.email }).exec();
            if (!user) {
                let newUser = new User({ email: signer.email, signedUp: false });
                await newUser.save();
                user = newUser;
            }

            if (!user.ownedDocuments.includes(documentId)) {
                user.sharedDocuments.push(documentId);
                await user.save();
            }
            else isOwnerSigner = true;

        });
        let document = await Document.findById(documentId, { buffer: 0 }).exec();
        if (sequential) {
            signers.forEach((signer, index) => {
                signer = { ...signer, order: index };
                signers[index] = signer;
            })
        }
        else {
            signers.forEach((signer, index) => {
                signer = { ...signer, order: 0 };
                signers[index] = signer;
            })

        }
        document.signers = signers;
        document.sequential = sequential;
        document.isOwnerSigner = isOwnerSigner;
        document.status = 'added_signers';
        await document.save();
        res.status(200).json({ message: 'ok' });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
}

exports.uploadDocumentFromDrive = async (req, res, next) => {

    let fileId = req.params.id;
    let access_token = req.cookies.access_token;

    client.credentials = { access_token: access_token };
    const drive = google.drive({ version: 'v3', auth: client });
    let tempFilePath = __dirname + "/files/" + uuidv4() + ".pdf";

    fs.appendFile(tempFilePath, null, (err, resp) => {
        if (err) {
            res.status(500).json({ err: "Internal Server Error" });
        }
        else {

            let temp = fs.createWriteStream(tempFilePath);


            drive.files.get({ fileId: fileId, alt: "media" }, { responseType: "stream" },
                function (err, resp) {

                    resp.data.on("end", () => {

                        let file = fs.createReadStream(tempFilePath);
                        res.status(200);
                        res.writeHead(200, { 'Content-disposition': 'attachment; filename=demo.pdf' });
                        file.pipe(res);

                    })
                        .on("error", err => {

                            res.status(500).json({ err: "Internal Server Error" });

                        })
                        .pipe(temp);
                });
        }
    });

};

exports.sendEmail = async (req, res, next) => {
    try {

        let fileId = req.params.id;
        let document = await Document.findById(fileId, { signers: 1, status: 1 });
        document.status = 'sent';
        await document.save();
        let signers = document.signers;
        let mailOptions;
        console.log(signers);
        for (let index = 0; index < signers.length; index++) {
            mailOptions = {
                from: process.env.EMAIL,
                to: signers[index].email,
                subject: req.body.subject,
                body: req.body.body
            };

            await mailTransporter.sendMail(mailOptions);

        }


        res.status(200).json({ message: 'ok' });
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });

    }

};

exports.getDocment = async (req, res, next) => {
    try {

        let documentId = req.params.id;
        let document = await Document.findById(documentId).exec();
        let email = getEmail(req, res);
        let signers = document.signers;
        signers.forEach((signer, index) => {
            if (signer.email === email) {
                if (!signer.viewed) {
                    let timeline = document.timeline;
                    timeline.push({ action: 'viewed', time: new Date(), email: getEmail(req, res) });
                    signers[index].viewed = true;
                    document.timeline = timeline;
                }
            }
        });
        console.log(signers);

        document.signers = signers;
        await document.save();
        res.status(200).json(document);
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
}
exports.getComments = async (req, res, next) => {
    try {
        let documentId = req.params.id;
        let document = await Document.findById(documentId, { comments: 1 }).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: { email: 1, name: 1, image: 1 }
            }
        }).exec();
        console.log(document);
        res.status(200).json(document);
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
}
exports.postComment = async (req, res, next) => {
    try {
        let documentId = req.params.id;
        let document = await Document.findById(documentId, { comments: 1 });
        let user = await User.findOne({ email: getEmail(req, res) }, { _id: 1 }).exec();
        let comments = document.comments;
        comments = [...comments, { user: user.id, comment: req.body.message }];
        console.log(comments);
        document.comments = comments;
        await document.save();
        res.status(200).json({ message: 'ok' });

    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
}
exports.sigDocument = async (req, res, next) => {
    try {
        let modifications = req.body.modifications;
        let scale = req.body.scale;

        let email = getEmail(req, res);
        let documentId = req.params.id;
        let document = await Document.findById(documentId, { signers: 1, timeline: 1, buffer: 1 }).exec();
        let user = await User.findOne({ email: email }, { signature: 1, imageSignature: 1, defaultSignature: 1 });




        let signers = document.signers;
        await signers.forEach(async (signer, index) => {
            if (signer.email === email) {
                if (signer.status !== 'signed' && signer.status !== 'rejected' && signer.status !== 'expired') {



                    const pdfDoc = await PDFDocument.load(document.buffer);
                    let pngImageBytes = (user.defaultSignature == 0 ? user.signature : user.imageSignature);
                    const pngImage = await pdfDoc.embedPng(pngImageBytes);
                    console.log(pngImage);
                    const pages = pdfDoc.getPages();
                    console.log(modifications);
                    modifications.forEach((modification, index) => {

                        if (modification) {
                            modification.forEach((image, id) => {
                                let { width, height } = pages[index].getSize();
                                let imageDims = {
                                    x: image.x / scale,
                                    y: height - ((image.y + image.imageheight) / (scale)),
                                    width: (image.imagewidth / scale),
                                    height: (image.imageheight / scale)
                                }
                                console.log(imageDims);
                                pages[index].drawImage(pngImage, imageDims)
                            })
                        }
                    })
                    let pdfBytes = await pdfDoc.save();
                    document.buffer = Binary(pdfBytes);
                    console.log(pdfBytes);
                    document.lastModifiedHash = shasum(pdfBytes);





                    let timeline = document.timeline;
                    timeline.push({ action: 'signed', time: new Date(), email: getEmail(req, res) });
                    signers[index].status = 'signed';
                    console.log(signers[index]);
                    document.timeline = timeline;

                    document.signers = signers;
                    await document.save();
                }
            }
        });

        res.status(200).json({ message: 'ok' });
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
}

exports.rejectDocument = async (req, res, next) => {
    try {
        let documentId = req.params.id;
        let document = await Document.findById(documentId, { signers: 1, timeline: 1 }).exec();
        let email = getEmail(req, res);
        let signers = document.signers;
        signers.forEach((signer, index) => {
            if (signer.email === email) {
                if (signer.status !== 'signed' && signer.status !== 'rejected' && signer.status !== 'expired') {
                    let timeline = document.timeline;
                    timeline.push({ action: 'rejected', time: new Date(), email: getEmail(req, res) });
                    signers[index].status = 'rejected';
                    document.timeline = timeline;
                }
            }
        });

        document.signers = signers;
        await document.save();
        res.status(200).json(document);
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
}

exports.getStatus = async (req, res, next) => {
    try {
        let documentId = req.params.id;
        let document = await Document.findById(documentId, { status: 1 }).exec();
        if (document) {
            res.status(200).json(document);
        }
        else {
            res.status(200).json({ status: 'not_uploaded' });
        }
    }
    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });

    }
}

exports.verifyDocument = async (req, res, next) => {
    try {

        let document = req.files.doc;
        let documentPath = document.tempFilePath;
        let documentBufferData = fs.readFileSync(documentPath);
        let pdfDoc = await PDFDocument.load((documentBufferData), {
            updateMetadata: false
        });
        let keywords = pdfDoc.getKeywords();
        let pdfBytes = await pdfDoc.save();
        let uploadedDocumentHash = shasum(pdfBytes);

        console.log(pdfBytes);
        if (keywords && keywords.length > 0) {
            let id = keywords;
            let doc = await Document.findById(id).exec();
            if (doc) {

                console.log(doc.name);
                console.log(doc.lastModifiedHash);
                console.log(uploadedDocumentHash);
                if (doc.lastModifiedHash === uploadedDocumentHash) {
                    res.status(200).json({ verified: true, document: doc });
                }
                else {
                    res.status(200).json({ verified: false });

                }
            }
            else {
                res.status(200).json({ verified: false });

            }
        }
        else {
            res.status(200).json({ verified: false });
        }
    }

    catch (err) {
        res.status(500).json({ err: "Internal Server Error" });

    }
}