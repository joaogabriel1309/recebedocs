import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Exibe o PDF no navegador com o nome original ao salvar (RFC 6266/5987).
export function montarContentDisposition(nomeArquivo: string): string {
  const nomeAscii = nomeArquivo
    .normalize('NFKD')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/["\\]/g, '')
    .trim() || 'documento.pdf';

  const nomeCodificado = encodeURIComponent(nomeArquivo).replace(
    /['()*]/g,
    (caractere) => `%${caractere.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `inline; filename="${nomeAscii}"; filename*=UTF-8''${nomeCodificado}`;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>('R2_BUCKET_NAME');

    this.client = new S3Client({
      region: 'auto',
      endpoint: config.getOrThrow<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    })
  }

  async uploadPdf(buffer: Buffer): Promise<string> {
    const key = `documentos/${randomUUID()}.pdf`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      }),
    );

    return key;
  }

  async remover(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async gerarUrlDownload(key: string, nomeArquivo?: string) {
    const expiraEmSegundos = 300;

    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentType: 'application/pdf',
        ResponseContentDisposition: nomeArquivo
          ? montarContentDisposition(nomeArquivo)
          : undefined,
      }),
      { expiresIn: expiraEmSegundos },
    );

    return { url, expiraEmSegundos }
  }

  async baixar(key: string): Promise<Buffer> {
    const resposta = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    return Buffer.from(await resposta.Body!.transformToByteArray());
  }
}
