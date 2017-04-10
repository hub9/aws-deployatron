const path = require('path');
const glob = require('glob-promise');
const AWS = require('aws-sdk');
const npmlog = require('npmlog');
const S3File = require('./s3-file');


const deployFilesParallel = (handler) => (files) => {
  const uploadPromises = files.map(handler);
  return Promise.all(uploadPromises);
};

const deployFilesSequential = (handler) => (files) => {
  const uploadedFiles = [];

  const fileReducer = (lastPromise, nextFile) => lastPromise.then((uploadedFile) => {
    uploadedFiles.push(uploadedFile);
    return handler(nextFile);
  });

  return files.reduce(fileReducer, Promise.resolve())
    .then(() => uploadedFiles);
};

function deploy(clientOptions, bucket, srcDir, srcGlob, destDir, sequential = false) {
  npmlog.heading = 'S3 Upload';

  const s3Client = new AWS.S3(clientOptions);
  const pattern = path.join(srcDir, srcGlob);

  const fileHandler = (filePath) => {
    const file = new S3File(bucket, filePath, srcDir);
    return file.sync(s3Client, destDir);
  };

  const deployFiles = sequential
    ? deployFilesSequential(fileHandler)
    : deployFilesParallel(fileHandler);

  return glob(pattern, { nodir: true, nosort: true })
    .then(deployFiles);
}

module.exports = {
  deploy,
};
