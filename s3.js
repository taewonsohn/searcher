require('dotenv').config();
const fs = require('fs');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;



const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

// Uploads a file to S3
async function uploadFile(file) {
  console.log(bucketName, region, accessKeyId, secretAccessKey);
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  };

  const command = new PutObjectCommand(uploadParams);
  const response = await s3Client.send(command);

  return response;
}
exports.uploadFile = uploadFile;

// Downloads a file from S3
async function downloadFile(fileKey) {
  console.log('fileKey: ',fileKey)
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  };

  const command = new GetObjectCommand(downloadParams);
  const response = await s3Client.send(command);

  return response.Body;
}
exports.downloadFile = downloadFile;
