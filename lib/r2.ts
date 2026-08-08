import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const r2Configured = Boolean(
  process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT,
)

function client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = () => process.env.R2_BUCKET!

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: contentType })
  // Full Match uploads are advertised as "up to 2GB" — on a slow connection
  // a short-lived URL can expire mid-upload, so this matches the download
  // URL's 1hr window rather than the 15min that's plenty for a skill clip
  // but not for a large one.
  return getSignedUrl(client(), cmd, { expiresIn: 3600 })
}

export async function getDownloadUrl(key: string): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET(), Key: key })
  return getSignedUrl(client(), cmd, { expiresIn: 3600 })
}
