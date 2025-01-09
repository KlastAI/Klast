/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for Pollens Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: Pollens deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `Pollens.ts` file.
//    For example, Pollens Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `Pollens.ts` file.
//
//    ```
//    if (Pollens.deploy) {
//      Pollens.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

Pollens.metrics.enabled = !Pollens.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  Pollens.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  Pollens.storage.storages.avatar.provider = 'cloudflare-r2';
  Pollens.storage.storages.avatar.bucket = 'account-avatar';
  Pollens.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.Pollensassets.com/${key}`;

  Pollens.storage.storages.blob.provider = 'cloudflare-r2';
  Pollens.storage.storages.blob.bucket = `workspace-blobs-${
    Pollens.Pollens.canary ? 'canary' : 'prod'
  }`;

  Pollens.storage.storages.copilot.provider = 'cloudflare-r2';
  Pollens.storage.storages.copilot.bucket = `workspace-copilot-${
    Pollens.Pollens.canary ? 'canary' : 'prod'
  }`;
}

Pollens.plugins.use('copilot', {
  openai: {},
  fal: {},
});
Pollens.plugins.use('redis');
Pollens.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
Pollens.plugins.use('oauth');

if (Pollens.deploy) {
  Pollens.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  Pollens.plugins.use('gcloud');
}
