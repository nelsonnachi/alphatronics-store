import cloudinary from "./config";

type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export async function uploadImageToCloudinary(
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(
            error ?? new Error("Cloudinary upload failed"),
          );

          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
}