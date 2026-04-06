const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const filename = `${Date.now()}-${file.originalname}`;

    cloudinary.uploader.upload_stream(
      {
        public_id: filename,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

module.exports = uploadToCloudinary;