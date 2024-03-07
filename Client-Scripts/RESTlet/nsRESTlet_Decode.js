/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/file', 'N/encode', 'N/log'], function (file, encode, log) {
    function post(context) {
        log.debug('Received context', JSON.stringify(context));
        try {
            var base64Content = context.fileContent;// Content to encode from fileContent Parameter
            var decodedContent = encode.convert({
                string: base64Content,
                inputEncoding: encode.Encoding.BASE_64,
                outputEncoding: encode.Encoding.UTF_8
            });

            var folderId = context.folderId;
            var fileName = context.fileName;
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
                contents: decodedContent,
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
