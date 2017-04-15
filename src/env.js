const envalid = require('envalid');


module.exports = envalid.cleanEnv(process.env, {
  AWS_REGION: envalid.str(),
  AWS_ACCESS_KEY_ID: envalid.str(),
  AWS_SECRET_ACCESS_KEY: envalid.str(),
  AWS_S3_BUCKET: envalid.str({ default: '' }),
  AWS_CLOUDFRONT_ID: envalid.str({ default: '' }),
  PUBLIC_URL: envalid.str({ default: ''}),
});
