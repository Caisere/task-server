import { Queue } from "bullmq";
import { bullmqConnection } from "./connection";

export const DELETE_CLOUDINARY_IMAGE_QUEUE_NAME = "delete-cloudinary-banner";
export const DELETE_CLOUDINARY_IMAGE_JOB_NAME = "delete-cloudinary-image";

export type DeleteCloudinaryImageJobData = {
  publicId: string;
};

export const deleteCloudinaryImageQueue = new Queue(
  DELETE_CLOUDINARY_IMAGE_QUEUE_NAME,
  {
    connection: bullmqConnection,
  },
);

export async function deleteCloudinaryImageJob(
  publicId: string,
): Promise<void> {
  const jobData: DeleteCloudinaryImageJobData = {
    publicId,
  };

  await deleteCloudinaryImageQueue.add(
    DELETE_CLOUDINARY_IMAGE_JOB_NAME,
    jobData,
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
}
