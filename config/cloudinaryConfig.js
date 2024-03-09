const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ 
  cloud_name: 'duvnbonci', 
  api_key: '917625448577369', 
  api_secret: 'OTd5fyZ2jmNRT1cWNWmqp-AiQp0' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'YourFolderName', // Specify the folder name in Cloudinary
    public_id: (req, file) => file.filename, // Use file's original name as the public ID
  },
});

module.exports = { cloudinary, storage };