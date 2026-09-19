import cloudinary from "./config";

export async function deleteImageFromCloudinary(
  publicId: string,
): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}