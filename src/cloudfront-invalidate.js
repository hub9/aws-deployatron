const AWS = require('aws-sdk');
const npmlog = require('npmlog');


function invalidate(clientOptions, distributionId, paths) {
  npmlog.heading = 'Cloudfront Invalidate';

  const items = paths
    .filter(destPath => !!destPath)
    .map(destPath => `/${destPath}`);

  if (items.length === 0) {
    npmlog.info('Success', 'Nothing to invalidate');
    return Promise.resolve();
  }

  const cloudfront = new AWS.CloudFront(clientOptions);

  const requestId = `cf-invalidate-${Date.now()}`;

  const request = cloudfront.createInvalidation({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: requestId,
      Paths: {
        Quantity: items.length,
        Items: items,
      },
    },
  });

  return request.promise()
    .then((response) => {
      const invalidationId = response.Invalidation.Id;
      npmlog.info('Success', `Operation ID: ${invalidationId}`);
      return invalidationId;
    });
}

module.exports = invalidate;
