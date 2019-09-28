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

var router = express.Router();

import AuthMiddlware from "../middleware/AuthMiddleware";
import UserMiddleware from "../middleware/UsersMiddleware";
import FilesMiddleware from "../middleware/FilesMiddleware";
/**
 * Upload file end point, uses multer to read file
 * @TODO refactor
 */
router.post('/uploadfile', AuthMiddlware.withAuth, upload.single('file'),
    (request, result, next) => {
        try {
            let file = request.file;
            UserMiddleware.getUser(request, (user) => {
                FilesMiddleware.createFile(file.originalname, file.path, user,()=>  result.status(200).send("File Uploaded"), () => result.status(500).send('Error Uploading File'));
            }, () => result.status(500).send('Error Uploading File'));
            } catch (error) {
            console.log(`File Uploading error has occured: ${error}`), result.status(500).send('Error Uploading File');
        }
    })
/**
 * End point to fetch all files belonging to a user
 * @TODO implement a selected number of files to fetch possible pagination 
 */
router.get('/getfiles', AuthMiddlware.withAuth, (request, result) => {
    UserMiddleware.getUser(request, (user) => {
        FilesMiddleware.getFiles(user.id, (files) => result.status(200).send(files), error => result.status(500).send(error));
        }, error => result.status(500).send(error))
});

router.get('/getStudentFiles', AuthMiddlware.withAuth, AuthMiddlware.isTa, (request, result)=>{
    const studentId = request.query.studentId;
    FilesMiddleware.getFiles(studentId, (files) => result.status(200).send(files), error => result.status(500).send(error));
});


/**
 * End point pint to delete a file with a given ID
 * @TODO check user has permissions required to delete files
 */
router.delete('/deletefile', AuthMiddlware.withAuth, (request, result) => {
    FilesMiddleware.deleteFile(request.query.fileId, () => result.status(200).send(), (error: Error) => result.status(500).send(error));
})

/**
 * End point to read file from disk with given ID 
 * @TODO Refactor, far too nested 
 */
router.get('/getfile', AuthMiddlware.withAuth, (request, result) => {
    const fileId = request.query.fileId;
    FilesMiddleware.getFile(fileId, (file) => {
        UserMiddleware.getUser(request, (user, request) => {
            file = file[0];
            if (user.id == file.owner || user.role == "ta") {
                let pathToFile = path.join(`${__dirname}../../${file.path}`);
                try {
                    FilesMiddleware.readFile(pathToFile, (fileData) => {
                        let returnFile = {
                            name: file.name,
                            body: fileData,
                            id: file._id
                        };
                        result.status(200).json(returnFile);
                    },(error)=> result.status(500).send("error"));
                } catch (error) {
                    result.status(500).send("error");
                }
            } else {
                result.status(401).send("You are not the file owner");
            }
        },error => result.status(500).send(error))
    }).catch((error) => {
        result.status(500).send("Error");
    });
});
/**
 * Download file given a ID
 * @TODO check if user has permission to view file
 */
router.get('/downloadfile', (request, result) => {
    const fileId = request.query.fileId;
    FilesMiddleware.getFilePath(fileId).then(file => {
        const filepath = `${__dirname}../../${file[0].path}`;
        result.download(filepath, file[0].name);
    }).catch(error => result.status(500).send(error))
});
module.exports = router;