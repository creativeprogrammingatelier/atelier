var multer = require('multer');
var express = require('express');
var upload = multer({
    dest: 'uploads/'
})
const File = require('../models/file')
const auth = require('../middleware/auth')

var router = express.Router();


router.post('/uploadfile', upload.single('file'),
    function (request, result, next) {
        try {
            let file = request.file;
            auth.getUser(request, (user) => {
                const {
                    originalname,
                    path,
                } = file;
                const newFile = new File({
                    name: originalname,
                    path: path,
                    owner: user
                });
                newFile.save((error) => {
                    if (error) {
                        console.log(`File Uploading error has occured: ${error}`)
                        result.status(500).send('Error Uploading File');
                    } else {
                        result.status(200).send("File Uploaded");
                    }
                });
            })
        } catch (error) {
            console.log(`File Uploading error has occured: ${error}`), result.status(500).send('Error Uploading File');
        }
    })

// router.post('/uploadfile', upload.single("file"), function (request, result, next) {}
module.exports = router;