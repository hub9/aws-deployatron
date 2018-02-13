#! /usr/bin/env node
const url = require('url');
const npmlog = require('npmlog');
const program = require('commander');
const env = require('./env');
const S3Deploy = require('./s3-deploy');
const CloudfrontInvalidate = require('./cloudfront-invalidate');
const packageInfo = require('../package.json');


async function deploy(options) {
  // AWS Client Options
  const clientOptions = {
    region: env.AWS_REGION || undefined,
    accessKeyId: env.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || undefined,
    sslEnabled: true,
  };

  try {
    // Setup log
    npmlog.enableProgress();
    npmlog.level = options.verbose ? 'verbose' : 'info';

    const bucketName = options.s3Bucket || env.AWS_S3_BUCKET;
    const publicUrl = options.publicUrl || env.PUBLIC_URL;
    const outputPath = url.parse(publicUrl)
      .path // Remove hostname
      .replace(/^[\/]+|[\/]+$/g, ''); // Trims '/' char

    // S3 Deploy configuration
    const uploadedFiles = await S3Deploy(clientOptions, bucketName, options.inputDir, '**', outputPath);

    // CloudFront Invalidate configuration
    const distributionId = options.cloudfrontId || env.AWS_CLOUDFRONT_ID;

    if (distributionId) {
      await CloudfrontInvalidate(clientOptions, distributionId, uploadedFiles);
    }
  } catch (error) {
    npmlog.disableProgress();
    npmlog.error(null, error);
    process.exit(1);
  }
}

program
  .version(packageInfo.version)
  .option('-i, --inputDir <path>', 'Input files')
  .option('-p, --publicUrl [url]', 'Target directory on S3 bucket (or PUBLIC_URL env)')
  .option('-b, --s3Bucket [name]', 'S3 Bucket name  (or AWS_S3_BUCKER env)')
  .option('-c, --cloudfrontId [id]', 'CloudFront Distribution ID (or AWS_CLOUDFRONT_ID env)')
  .option('-v, --verbose', 'Output more detailed log')
  .parse(process.argv);

deploy(program);
