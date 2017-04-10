#! /usr/bin/env node
const npmlog = require('npmlog');
const env = require('./env');
const S3Deploy = require('./s3-deploy');
const CloudfrontInvalidate = require('./cloudfront-invalidate');


async function deploy() {
  // Setup log
  npmlog.enableProgress();
  npmlog.level = (process.argv.indexOf('-v') >= 0 || process.argv.indexOf('--verbose') >= 0)
    ? 'verbose' : 'info';

  // AWS Client Options
  const clientOptions = {
    region: env.AWS_REGION || undefined,
    accessKeyId: env.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || undefined,
    sslEnabled: true,
  };

  try {
    // S3 Deploy configuration
    const srcDir = env.DIST_PATH;
    const srcGlob = '**';
    const destDir = env.PUBLIC_URL_PATH;
    const bucket = env.AWS_S3_BUCKET;

    const uploadedFiles = await S3Deploy(clientOptions, bucket, srcDir, srcGlob, destDir);

    // Cloudfront Invalidate configuration
    const distributionId = env.AWS_CLOUDFRONT_ID;

    await CloudfrontInvalidate(clientOptions, distributionId, uploadedFiles);
  } catch (error) {
    npmlog.disableProgress();
    npmlog.error(null, error);
    process.exit(1);
  }
}

deploy();
