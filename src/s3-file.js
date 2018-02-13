const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const stream = require('stream');
const mime = require('mime-types');
const zopfli = require('node-zopfli');
const npmlog = require('npmlog');

const COMPRESSION_THRESHOLD = 1024;

class S3File {
  constructor(bucket, filePath, srcDir) {
    this.bucket = bucket;
    this.path = filePath;
    this.name = path.basename(filePath);
    this.relativePath = path.relative(srcDir, filePath);
    this.contentType = mime.contentType(this.name);
    this.log = npmlog.newGroup(this.relativePath);
    this.logInfo = this.log.info.bind(this.log, this.toString());
    this.logVerbose = this.log.verbose.bind(this.log, this.toString());
    this.logInfo(this.contentType);
  }

  toString() {
    return this.relativePath;
  }

  isMedia() {
    return ['audio/', 'video/', 'image/', 'application/x-font-']
      .some(type => this.contentType.startsWith(type));
  }

  isSVG() {
    return this.contentType.startsWith('image/svg+xml');
  }

  allowCompression() {
    return this.stats.size >= COMPRESSION_THRESHOLD
      && (this.isSVG() || !this.isMedia());
  }

  load() {
    this.stats = fs.statSync(this.path);
    this.stream = fs.createReadStream(this.path);
    let logLoad;

    if (this.allowCompression()) {
      this.encoding = 'gzip';
      this.stream = this.stream.pipe(zopfli.createGzip());
      logLoad = this.log.newStream('Compress');
    } else {
      this.encoding = undefined;
      logLoad = this.log.newStream('Load', this.stats.size);
    }

    const md5 = crypto.createHash('md5');
    const chunks = [];

    return new Promise((resolve) => {
      this.stream
        .pipe(logLoad)
        .on('data', (chunk) => {
          chunks.push(chunk);
          md5.update(chunk);
        })
        .on('end', () => {
          this.data = Buffer.concat(chunks);
          const base64 = md5.digest('base64');
          const hex = new Buffer(base64, 'base64').toString('hex');
          this.hash = { base64, hex };
          logLoad.verbose(this.relativePath, `Hash ${this.hash.hex} | ${this.data.length} bytes`);
          resolve();
        });
    });
  }

  buildParams(destDir, params) {
    const destPath = path.join(destDir, this.relativePath);

    return Object.assign({
      Key: destPath,
      Bucket: this.bucket,
    }, params);
  }

  /** Check if file is already synced */
  async isSynced(s3Client, destDir) {
    const params = this.buildParams(destDir, {
      IfNoneMatch: this.hash.hex,
      // IfUnmodifiedSince: this.stats.mtime,
    });

    const logSync = this.log.newItem('Sync');
    const request = s3Client.headObject(params);

    return request.promise()
      .then((res) => {
        logSync.verbose(this.relativePath, 'Sync: Needs upload');
        logSync.finish();
        return false;
      },
      (err) => {
        switch (err.statusCode) {
          case 304:
          case 412:
            logSync.verbose(this.relativePath, 'Sync: Already synced');
            logSync.finish();
            return true;
          case 404:
            logSync.verbose(this.relativePath, 'Sync: Needs upload');
            logSync.finish();
            return false;
          default:
            throw new Error(`Syncing file "${this}" resulted:\n${JSON.stringify(err, null, 2)}`);
        }
      });
  }

  /** Upload file to S3 */
  async upload(s3Client, destDir) {
    const logUpload = this.log.newStream('Upload', this.data.length);

    let bufferStream = new stream.PassThrough();
    bufferStream.end(this.data);
    bufferStream = bufferStream.pipe(logUpload);

    const params = this.buildParams(destDir, {
      ACL: 'public-read',
      Body: bufferStream,
      ContentMD5: this.hash.base64,
      ContentType: this.contentType,
      ContentEncoding: this.encoding,
    });

    // Upload the file to s3.
    const upload = s3Client.upload(params);

    const response = await upload.promise();

    return response.Key;
  }

  async sync(s3Client, destDir) {
    let key;

    await this.load();
    const isSynced = await this.isSynced(s3Client, destDir);

    // Upload the file
    if (!isSynced) {
      key = await this.upload(s3Client, destDir);
    }

    this.logInfo('Done');
    return key;
  }
}

module.exports = S3File;
