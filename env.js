const envalid = require('envalid');


module.exports = envalid.cleanEnv(process.env, {
  DIST_PATH: envalid.str(), // DO NOT add trailing '/' here
  PUBLIC_URL_PATH: envalid.str({ default: '' }), // Add trailing '/' here
  AWS_REGION: envalid.str({ default: '' }),
  AWS_ACCESS_KEY_ID: envalid.str({ default: '' }),
  AWS_SECRET_ACCESS_KEY: envalid.str({ default: '' }),
  AWS_S3_BUCKET: envalid.str({ default: '' }),
  AWS_CLOUDFRONT_ID: envalid.str({ default: '' }),
});
