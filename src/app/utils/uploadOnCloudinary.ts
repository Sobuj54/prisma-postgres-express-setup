import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import fs from "fs";
import cloudinary from "../../config/cloudinary.config";
import ApiError from "./ApiError";

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "uploads",
    });

    fs.unlinkSync(localFilePath);
    return res;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(
      500,
      `Cloudinary upload failed: ${(error as UploadApiErrorResponse).message}`
    );
  }
};
