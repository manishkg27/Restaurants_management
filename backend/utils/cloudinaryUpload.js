const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folder = "eatify") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Unknown error during Cloudinary upload"));
        }
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = { uploadToCloudinary };
