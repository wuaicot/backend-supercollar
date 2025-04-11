//server/src/utils/storage.js

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1', // 👈 Control absoluto
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


const getContentType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp'
  };
  return types[extension] || 'application/octet-stream';
};

exports.uploadToS3 = async (filePath, fileName) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const s3FileName = `pets/${uuidv4()}-${path.basename(fileName)}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3FileName,
      Body: fileContent,
      
    };

    await s3Client.send(new PutObjectCommand(params));
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    
  } catch (error) {
    console.error('Error en uploadToS3:', error);
    throw error;
  }
};


// Nueva función para eliminar imágenes
exports.deleteFromS3 = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(3).join('/');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};