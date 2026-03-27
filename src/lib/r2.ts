import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Public R2 Bucket ─────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned PUT URL for uploading a file to R2.
 * Expires in 10 minutes.
 */
export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 600 });
}

/**
 * Upload a file directly to R2 from the server.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
}

/**
 * Generate a presigned GET URL for downloading a file from R2.
 * Expires in 1 hour.
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

// ─── Private R2 Bucket (Product Downloads) ────────────────

const R2_PRIVATE_ACCOUNT_ID = process.env.R2_PRIVATE_ACCOUNT_ID!;
const R2_PRIVATE_ACCESS_KEY_ID = process.env.R2_PRIVATE_ACCESS_KEY_ID!;
const R2_PRIVATE_SECRET_ACCESS_KEY = process.env.R2_PRIVATE_SECRET_ACCESS_KEY!;
const R2_PRIVATE_BUCKET_NAME = process.env.R2_PRIVATE_BUCKET_NAME!;

export const r2PrivateClient = new S3Client({
  region: "auto",
  endpoint: `https://${R2_PRIVATE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_PRIVATE_ACCESS_KEY_ID,
    secretAccessKey: R2_PRIVATE_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned PUT URL for uploading to the private R2 bucket.
 * Expires in 10 minutes.
 */
export async function getPrivatePresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_PRIVATE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2PrivateClient, command, { expiresIn: 600 });
}

/**
 * Generate a presigned GET URL for downloading from the private R2 bucket.
 * Expires in 1 hour.
 */
export async function getPrivatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_PRIVATE_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2PrivateClient, command, { expiresIn: 3600 });
}

/**
 * Upload a file directly to the private R2 bucket from the server.
 */
export async function uploadToR2Private(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_PRIVATE_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2PrivateClient.send(command);
}
