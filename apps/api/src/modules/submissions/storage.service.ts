import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import type { AuthContext } from '../auth/auth.types';

const allowedMimeTypes = new Set(['application/pdf', 'text/plain', 'image/png', 'image/jpeg']);
const maxUploadBytes = 10 * 1024 * 1024;

@Injectable()
export class StorageService {
  private client() {
    if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      throw new ServiceUnavailableException('Storage de arquivos não configurado');
    }
    return new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION ?? 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
  }

  async createUploadUrl(input: { originalName: string; mimeType: string; sizeBytes: number }, auth: AuthContext) {
    if (!allowedMimeTypes.has(input.mimeType) || input.sizeBytes <= 0 || input.sizeBytes > maxUploadBytes) {
      throw new BadRequestException('Tipo ou tamanho de arquivo não permitido');
    }
    const extension = input.originalName.includes('.') ? input.originalName.split('.').pop()!.toLowerCase() : 'bin';
    const objectKey = `${auth.activeTenantId}/${auth.userId}/${crypto.randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? 'inside-sales-course',
      Key: objectKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
      Metadata: { tenant: auth.activeTenantId, owner: auth.userId },
    });
    return {
      objectKey,
      uploadUrl: await getSignedUrl(this.client(), command, { expiresIn: 15 * 60 }),
      expiresInSeconds: 15 * 60,
    };
  }

  async storeBuffer(objectKey: string, body: Uint8Array, contentType: string) {
    await this.client().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? 'inside-sales-course',
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    }));
    return objectKey;
  }
}
