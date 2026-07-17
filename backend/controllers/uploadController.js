import cloudinary from "../config/cloudinary.js";

// POST /api/upload  (multipart/form-data, field name "image")
export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });

  const streamUpload = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "foodhub-ai" },
        (error, result) => (result ? resolve(result) : reject(error))
      );
      stream.end(req.file.buffer);
    });

  try {
    const result = await streamUpload();
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
