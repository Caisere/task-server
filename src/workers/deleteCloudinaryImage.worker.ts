import { Worker, Job } from "bullmq";
import {
  DELETE_CLOUDINARY_IMAGE_JOB_NAME,
  DELETE_CLOUDINARY_IMAGE_QUEUE_NAME,
  DeleteCloudinaryImageJobData,
} from "../queues/deleteCloudinaryImage.queue";
import { bullmqConnection } from "../queues/connection";
import { logger } from "../lib/logger";
import { deleteBannerFromCloudinary } from "../lib/cloudinary";

export const deleteCloudinaryImageWorker = new Worker(
  DELETE_CLOUDINARY_IMAGE_QUEUE_NAME,
  async (job: Job<DeleteCloudinaryImageJobData>) => {
    if (job.name !== DELETE_CLOUDINARY_IMAGE_JOB_NAME) {
      return;
    }
    const { publicId } = job.data;

    await deleteBannerFromCloudinary(publicId);
  },
  { connection: bullmqConnection },
);

deleteCloudinaryImageWorker.on("completed", (job) => {
  logger.info(`Cloudinary delete job completed ${job.id}`);
});

deleteCloudinaryImageWorker.on("failed", (job, error) => {
  logger.error({ err: error, jobId: job?.id }, "Delete Cloudinary job failed");
});

logger.info("Delete Cloudinary image worker started");
