'use strict';
require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.generatePresignedUrl = async (event) => {

  try {
    console.log({"event log":event}); 
    
    let body = JSON.parse(event.body); 
    let objectKey = body.objectKey;
    let s3Action = body.s3Action;
    let contentType = body.contentType;
    let expirationTime = 60; 

    let params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: objectKey,
      Expires: expirationTime
    }

    if(s3Action === 'putObject'){ 
      params.ContentType = contentType;
      params.Expires = 300
    }

    const signedUrl = s3.getSignedUrl(s3Action, params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(signedUrl)
    }

  } catch (error) {
    console.log(error);

    return{
      statueCode:500
    }
  }
};
