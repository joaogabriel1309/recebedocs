import { Module } from "@nestjs/common";
import { AnaliseDocumentosProcessor } from "./analise-documentos.processor.js";
import { BullModule } from "@nestjs/bullmq";
import { IaModule } from "../ia/ia.module.js";
import { StorageModule } from "../storage/storage.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analise-documentos',
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 30_000 },
        removeOnComplete: true,
        removeOnFail: 100,
      }
    }),
    BullBoardModule.forFeature({
      name: 'analise-documentos',
      adapter: BullMQAdapter,
    }),
    IaModule,
    StorageModule,
    PrismaModule,
  ],
  providers: [AnaliseDocumentosProcessor],
  exports: [BullModule],
}
)

export class AnaliseModule { }