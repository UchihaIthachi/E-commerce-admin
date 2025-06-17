import { router, protectedProcedure } from '../../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import S3 from "@/server/infrastructure/clients/s3"; // Assuming S3 client is correctly configured and exported
import { createId } from "@paralleldrive/cuid2";
import { log } from "@/server/application/common/services/logging";

const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;
const CLOUDFLARE_PUBLIC_DOMAIN = process.env.CLOUDFLARE_PUBLIC_DOMAIN;

if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
  // This check is important. If env vars are not set, the router shouldn't even initialize
  // or should throw a very clear error during setup.
  // For simplicity in this context, we'll let it potentially fail at runtime if env vars are missing,
  // but in a real app, this should be handled more gracefully, perhaps at server startup.
  log('SEVERE', 'Cloudflare R2/S3 environment variables (CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_PUBLIC_DOMAIN) are not set.');
  // Depending on strictness, you might throw an error here to prevent router initialization:
  // throw new Error("Cloudflare R2/S3 environment variables are not set.");
}

export const adminImageRouter = router({
  createPresignedUploadUrl: protectedProcedure
    .input(z.object({
      fileType: z.string().min(1, "File type cannot be empty"),
    }))
    .output(z.object({
      url: z.string().url(),
      publicURL: z.string().url(),
      fileId: z.string(), // Return the generated fileId as well
    }))
    .mutation(async ({ input, ctx }) => {
      if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image storage not configured.' });
      }
      try {
        const fileId = createId();
        const presignedUrl = await getSignedUrl(
          S3,
          new PutObjectCommand({
            Bucket: CLOUDFLARE_BUCKET_NAME,
            Key: fileId,
            ContentType: input.fileType,
          }),
          { expiresIn: 60 } // URL expires in 60 seconds
        );

        return {
          url: presignedUrl,
          publicURL: `${CLOUDFLARE_PUBLIC_DOMAIN}/${fileId}`,
          fileId: fileId,
        };
      } catch (error: any) {
        log('SEVERE', `Failed to create presigned upload URL: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create presigned upload URL.',
          cause: error,
        });
      }
    }),

  // Option 1: Create a presigned URL for deletion (client performs DELETE)
  createPresignedDeleteUrl: protectedProcedure
    .input(z.object({
      fileId: z.string().min(1, "File ID cannot be empty"),
    }))
    .output(z.object({
      url: z.string().url(),
      publicURL: z.string().url(), // Or perhaps just a success message
    }))
    .mutation(async ({ input, ctx }) => {
      if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image storage not configured.' });
      }
      try {
        const presignedUrl = await getSignedUrl(
          S3,
          new DeleteObjectCommand({
            Bucket: CLOUDFLARE_BUCKET_NAME,
            Key: input.fileId,
          }),
          { expiresIn: 60 } // URL expires in 60 seconds
        );

        return {
          url: presignedUrl,
          publicURL: `${CLOUDFLARE_PUBLIC_DOMAIN}/${input.fileId}`,
        };
      } catch (error: any) {
        log('SEVERE', `Failed to create presigned delete URL: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create presigned delete URL.',
          cause: error,
        });
      }
    }),

  // Option 2: Direct server-side deletion (more common for deletes to ensure execution)
  // This would be an alternative to createPresignedDeleteUrl
  deleteImage: protectedProcedure
    .input(z.object({
      fileId: z.string().min(1, "File ID cannot be empty"),
    }))
    .output(z.object({
        success: z.boolean(),
        message: z.string(),
    }))
    .mutation(async ({input, ctx}) => {
        if (!CLOUDFLARE_BUCKET_NAME) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Image storage not configured.' });
        }
        try {
            await S3.send(new DeleteObjectCommand({
                Bucket: CLOUDFLARE_BUCKET_NAME,
                Key: input.fileId,
            }));
            return { success: true, message: "Image deleted successfully." };
        } catch (error: any) {
            log('SEVERE', `Failed to delete image directly: ${input.fileId}, error: ${error.message}`);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete image.',
                cause: error,
            });
        }
    }),
});
