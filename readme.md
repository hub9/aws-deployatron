# 🚀 AWS Deployatron

### REQUIREMENTS

* Node 7.8+

### USAGE

Setup the following env vars:

| Environment variables   | Description              |
|:------------------------|:-------------------------|
| `AWS_REGION`            | AWS Region to connect to |
| `AWS_ACCESS_KEY_ID`     | AWS Key ID               |
| `AWS_SECRET_ACCESS_KEY` | AWS Access Key           |
| `PUBLIC_URL`            | Public url for deployed files. Target directory is extracted for this. |
| `AWS_S3_BUCKET`         | S3 Bucket name           |
| `AWS_CLOUDFRONT_ID`     | Cloudfront distribution ID associated with this bucket |

And call the binary `aws-deployatron --inputDir <sourceDir>`

### TODO
* Improve options
* Transform code using Babel to support older Node versions;
