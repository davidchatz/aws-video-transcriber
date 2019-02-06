
var path = require("path");
var AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
var s3 = new AWS.S3();

/**
 * Fetches signed urls for uploading to S3
 */
exports.handler = async (event, context, callback) => {

    console.log('[INFO] got event: %j', event);

    var responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
    };

	try
	{
		var uploadFile = event.pathParameters.uploadFile;
		const videoBucket = process.env.VIDEO_BUCKET;
        const videoKey = 'videos/' + uploadFile;
        // 6 hours
        const signedUrlExpireSeconds = 60 * 60 * 6;

        var signParams = {
            Bucket: videoBucket,
            Key: videoKey,
            Expires: signedUrlExpireSeconds,
            ACL: 'bucket-owner-full-control',
            ContentType: 'video/mp4'
        };

        if (uploadFile.toLowerCase().endsWith('.mov'))
        {
			signParams.ContentType = 'video/quicktime';
        }        

        console.log('[INFO] signing request using params: %j', signParams);

		const url = await s3.getSignedUrl('putObject', signParams);

		const response = {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify({  "signedUrl" : url })
        };

        console.log('[INFO] made signed url for upload responding with: %j', response);

        callback(null, response);
	}
	catch (error)
	{
		console.log("[ERROR] Failed to fetch signed putObject url", error);
        const response = {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({  "message": "Failed to fetch signed putObject url: " + error })
        };
        callback(null, response);
	}
	
};
