import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service.js";
import { StatusAnalise } from "../generated/prisma/enums.js";
import { StorageService } from "../storage/storage.service.js";
import { ClassificadorService } from "../ia/classificador.service.js";
import { Logger } from "@nestjs/common";

type DadosAnalise = { documentoId: string }

@Processor('analise-documentos', {
  concurrency: 1,
  limiter: { max: 10, duration: 60_000 }
})
export class AnaliseDocumentosProcessor extends WorkerHost {
  private readonly logger = new Logger(AnaliseDocumentosProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly classificador: ClassificadorService,
  ) {
    super();
  }
  async process(job: Job<DadosAnalise>) {
    const documento = await this.prisma.documento.findUnique({
      where: { id: job.data.documentoId },
    });

    if (!documento || documento.statusAnalise !== StatusAnalise.PENDENTE) {
      return;
    }

    const pdf = await this.storage.baixar(documento.key);
    const analise = await this.classificador.classificar(pdf);

    if (!analise) {
      throw new Error(`Falha ao classificar o documento ${documento.id}`);
    }

    const recusado = !analise.comprovante && analise.confianca !== 'baixa';
    await this.prisma.documento.update({
      where: { id: documento.id },
      data: {
        statusAnalise: recusado ? StatusAnalise.RECUSADO : StatusAnalise.APROVADO,
        motivoAnalise: analise.motivo,
      },
    });
  }

  @OnWorkerEvent('failed')
  async aoFalhar(job: Job<DadosAnalise> | undefined, erro: Error) {
    if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) {
      return;
    }

    this.logger.error(
      `Análise do documento ${job.data.documentoId} esgotou as tentativas`,
      erro,
    );

    // updateMany não lança erro se o documento tiver sido apagado.
    await this.prisma.documento.updateMany({
      where: { id: job.data.documentoId, statusAnalise: StatusAnalise.PENDENTE },
      data: { statusAnalise: StatusAnalise.REVISAO_MANUAL },
    });
  }
}