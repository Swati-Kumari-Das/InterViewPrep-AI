// const multer = require('multer');  // Fixed typo: "mutter" → "multer"

// // Configure storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);  // Fixed template literals
//     },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (allowedTypes.includes(file.mimetype)) {  // Fixed typo: "minetype" → "mimetype"
//         cb(null, true);
//     } else {
//         cb(new Error('Only .jpeg, .jpg and .png formats are allowed'), false);
//     }
// };

// const upload = multer({ 
//     storage: storage, 
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }  // Added file size limit (5MB)
// });

// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});
// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads", // Optional folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  },
});

const upload = multer({ storage });

module.exports = upload;
