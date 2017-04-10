# 🚀 AWS Deployatron

### REQUIREMENTS

* Node 7.8+

### USAGE

Setup the following env vars:
* `DIST_PATH` Where the files are located
* `PUBLIC_URL_PATH` Destination folder
* `AWS_S3_BUCKET` S3 Bucket name
* `AWS_CLOUDFRONT_ID` Cloudfront distribution ID associated with this bucket
* `AWS_REGION` Region to connect to 
* `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` AWS Credentials

And call the binary `aws-deployatron`

### TODO
* Transform code using Babel to support older Node versions;
* Allow parameters to be passed as arguments using `commander` library.
