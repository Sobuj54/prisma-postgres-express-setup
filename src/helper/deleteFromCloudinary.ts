import cloudinary from "../config/cloudinary.config";

export const deleteFromCloudinary = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
  } catch (error) {
    throw new Error("Image deletion failed from cloudinary.");
  }
};
