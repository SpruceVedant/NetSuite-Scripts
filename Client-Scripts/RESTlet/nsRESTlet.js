/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/file', 'N/encode', 'N/log'], function (file, encode, log) {
    function post(context) {
        log.debug('Received context', JSON.stringify(context));
        try {
            var files = context.files;

            if (!files || files.length === 0) {
                throw new Error('No files uploaded.');
            }

            var uploadedFile = files[0];

            var folderId = context.folderId;
            var fileName = uploadedFile.name;
            var extension = fileName.split('.').pop().toUpperCase();
            var fileTypeMapping = {
                'PDF': file.Type.PDF,
                'JPG': file.Type.JPG,
                'JPEG': file.Type.JPG,
                'CSV': file.Type.CSV,
                'TXT': file.Type.PLAINTEXT,
                'TEXT': file.Type.PLAINTEXT,
                'LOG': file.Type.PLAINTEXT
            };
            var fileType = fileTypeMapping[extension] || file.Type.PLAINTEXT;

            log.debug('Creating file', { name: fileName, type: fileType });

            var uploadFile = file.create({
                name: fileName,
                fileType: fileType,
                contents: uploadedFile.getContents(), // Raw file content
                folder: folderId
            });

            log.debug('Saving file');
            var fileId = uploadFile.save();

            var fileRecord = file.load({
                id: fileId
            });

            var fileUrl = fileRecord.url;

            log.audit('File uploaded successfully', fileUrl);

            return {
                success: true,
                message: 'File uploaded successfully!',
                fileId: fileId,
                fileUrl: fileUrl
            };
        } catch (e) {
            log.error('Error in file upload', e.toString());
            return {
                success: false,
                message: e.toString()
            };
        }
    }

    return {
        post: post
    };
});
