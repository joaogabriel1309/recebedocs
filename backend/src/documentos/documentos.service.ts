import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly storageService: StorageService,
  ) { }

  buscarTodos() {
    return [];
  }

  async criar(file: Express.Multer.File) {
    const key = await this.storageService.uploadPdf(file.buffer);

    return {
      key,
      nomeOriginal: file.originalname,
      tamanho: file.size,
    }
  }
}
