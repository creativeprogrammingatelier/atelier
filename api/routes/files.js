/**
 * Routes for request relating to Files
 * 
 * @Author Andrew Heath
 */



var multer = require('multer');
var express = require('express');
var upload = multer({
    dest: 'uploads/'
})
const File = require('../models/file')
const Auth = require('../middleware/auth')
const Filesmid = require('../middleware/filesmid')
var router = express.Router();
const path = require('path');

/**
 * Upload file end point, uses multer to read file
 * @TODO refactor
 */
router.post('/uploadfile', Auth.withAuth, upload.single('file'),
    (request, result, next) => {
        try {
            let file = request.file;
            Auth.getUser(request, (user) => {
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
/**
 * End point to fetch all files belonging to a user
 * @TODO implement a selected number of files to fetch possible pagination 
 */
router.get('/getfiles', Auth.withAuth, (request, result) => {
    Auth.getUser(request, (user) => {
        Filesmid.getFiles(user.id, 1).then(files => result.status(200).send(files)).catch(error => result.status(500).send(error));

    })
});
/**
 * End point pint to delete a file with a given ID
 */
router.delete('/deletefile', Auth.withAuth, (request, result) => {
    Filesmid.deleteFile(request.query.fileId).then(() => result.status(200).send()).catch(error => result.status(500).send(error));
})

/**
 * End point to read file from disk with given ID 
 * @TODO Refactor, far too nested 
 */
router.get('/getfile', Auth.withAuth, (request, result) => {
    const fileId = request.query.fileId;
    Filesmid.getFile(fileId, (file) => {
        Auth.getUser(request, (user, request) => {
            file = file[0];
            if (user.id == file.owner) {
                let pathToFile = path.join(`${__dirname}../../${file.path}`);
                try {
                    Filesmid.readFile(pathToFile, (fileData) => {
                        let returnFile = {
                            name: file.name,
                            body: fileData
                        };
                        result.status(200).json(returnFile);
                    });
                } catch (error) {
                    result.status(500).send("error");
                }
            } else {
                result.status(401).send("You are not the file owner");
            }
        })
    }).catch((error) => {
        result.status(500).send("Error");
    });

});
/**
 * Download file given a ID
 */
router.get('/downloadfile', (request, result) => {
    //TODO check if user has permission to view file
    const fileId = request.query.fileId;
    Filesmid.getFilePath(fileId).then(file => {
        const filepath = `${__dirname}../../${file[0].path}`;
        result.download(filepath, file[0].name);
    }).catch(error => result.status(500).send(error))


});
module.exports = router;