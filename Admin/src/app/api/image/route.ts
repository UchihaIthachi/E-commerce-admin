import { NextRequest } from "next/server";
import {
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import S3 from "@/server/infrastructure/clients/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { log } from "@/server/application/common/services/logging";
import lifeCycleErrorHandlingMiddleware from "@/server/api/middleware/lifecycle-error-handling-middleware";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileType } = body;

    const id = createId();

    const res = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: id,
        ContentType: fileType,
      }),
      {
        expiresIn: 60,
      }
    );

    return new Response(
      JSON.stringify({
        url: res,
        publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = z.string().parse(request.nextUrl.searchParams.get("id"));
    const res = await getSignedUrl(
      S3,
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: id,
      }),
      {
        expiresIn: 60,
      }
    );

    return new Response(
      JSON.stringify({
        url: res,
        publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    log("SEVERE", error);
    return lifeCycleErrorHandlingMiddleware(error as Error);
  }
}
