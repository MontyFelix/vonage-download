const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function uploadFile(file, filename) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: file
  };
  s3.upload(params, function(s3Err, data) {
    if (s3Err) {
      throw s3Err
    }
    console.log(`File uploaded successfully at ${data.Location}`)
  });
}

module.exports = uploadFile;