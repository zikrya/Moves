import type {
  GetObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import invariant from "tiny-invariant";
import { createId } from "@paralleldrive/cuid2";

invariant(
  process.env.AWS_ACCESS_KEY_ID,
  "Missing AWS_ACCESS_KEY_ID environment variable"
);
invariant(
  process.env.AWS_SECRET_ACCESS_KEY,
  "Missing AWS_SECRET_ACCESS_KEY environment variable"
);

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const generateImageUrls = async (namespace: string) => {
  const identifier: PutObjectCommandInput | GetObjectCommandInput = {
    Bucket: "moves-user-images",
    Key: `${namespace}/${createId()}`,
  };
  const [put, get] = await Promise.all([
    getSignedUrl(s3, new PutObjectCommand(identifier)),
    getSignedUrl(s3, new GetObjectCommand(identifier)),
  ]);
  return { put, get, identifier };
};
