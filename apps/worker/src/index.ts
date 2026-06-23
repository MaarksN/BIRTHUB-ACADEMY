import { Worker } from 'bullmq';

const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };

export const worker = new Worker(
  'inside-sales-jobs',
  async (job) => {
    if (job.name === 'certificate.issue') {
      return { ok: true, mode: '[SIMULACAO]', certificateCode: job.data?.code };
    }
    if (job.name === 'export.user-data') {
      return { ok: true, mode: '[SIMULACAO]', exportedAt: new Date().toISOString() };
    }
    return { ok: true, mode: '[SIMULACAO]', jobName: job.name };
  },
  { connection },
);

worker.on('completed', (job) => {
  console.log(`job completed: ${job.id}`);
});
