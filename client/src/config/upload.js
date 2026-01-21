import axios from "axios";

export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Qucikchat");

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const isRaw = !isImage && !isVideo;

    let uploadUrl = "";

    if (isImage) {
      uploadUrl = "https://api.cloudinary.com/v1_1/dfkji2k7x/image/upload";
    } else if (isVideo) {
      uploadUrl = "https://api.cloudinary.com/v1_1/dfkji2k7x/video/upload";
    } else {
      uploadUrl = "https://api.cloudinary.com/v1_1/dfkji2k7x/raw/upload";
    }

    const res = await axios.post(uploadUrl, formData);
      console.log(isRaw);

    return {
      url: res.data.secure_url,
      type: isImage ? "image" : isVideo ? "video" : "file",
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Cloudinary upload failed");
  }
};
