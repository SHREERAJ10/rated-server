import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";

configDotenv();

export const rollbackMedia = async (publicIds: [string]) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  });

  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error("Error rolling back media:", error);
    throw error;
  }
};
