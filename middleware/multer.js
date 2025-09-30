import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})



// import { v2 as cloudinary } from "cloudinary";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: "blogs",
//         format: async (req, file) => "png", // adjust based on file type
//         public_id: (req, file) => file.originalname,
//     },
// });

// const upload = multer({ storage });

// export { cloudinary, upload };
