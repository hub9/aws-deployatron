# 🚀 AWS Deployatron

## Requirements

* Node 8.9+

## Installation

```bash
$ npm install @hub9/aws-deployatron
```

## Usage

1) Setup the following env vars:

| Environment variables   | Description              |
|:------------------------|:-------------------------|
| `PUBLIC_URL`            | Public url for deployed files. Target directory is extracted for this. |
| `AWS_REGION`            | AWS Region to connect to |
| `AWS_ACCESS_KEY_ID`     | AWS Key ID               |
| `AWS_SECRET_ACCESS_KEY` | AWS Access Key           |
| `AWS_S3_BUCKET`         | S3 Bucket name           |
| `AWS_CLOUDFRONT_ID`     | Cloudfront distribution ID associated with this bucket |

2) Call the binary:

```bash
$ aws-deployatron --inputDir <sourceDir>
```

### Todo
* [ ] Improve options
* [ ] Improve CLI usage
* [ ] Improve modularization
