import multer from 'multer';
import path from 'path';
import fs from 'fs';
import unzipper from 'unzipper';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to find the main HTML file
async function findMainHtmlFile(directoryPath) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    // Prioritize index.html
    if (files.includes('index.html')) {
      return 'index.html';
    }
    // Find any other .html file
    const htmlFile = files.find(file => file.endsWith('.html'));
    return htmlFile || null;
  } catch (error) {
    console.error(`Error finding main HTML file in ${directoryPath}:`, error);
    return null;
  }
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'), // Temporary storage for all files
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// File filter for images and zip files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images and zip files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit for files
  fileFilter: fileFilter,
}).single('file'); // 'file' is the name of the input field

export const uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file selected!' });
    }

    const uploadedFilePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.zip') {
      const extractDirName = req.file.filename.replace('.zip', '');
      const extractPath = path.join(__dirname, '../public/book_content', extractDirName);
      try {
        await fs.promises.mkdir(extractPath, { recursive: true });
        await fs.createReadStream(uploadedFilePath)
          .pipe(unzipper.Extract({ path: extractPath }))
          .promise();

        // Delete the temporary zip file
        await fs.promises.unlink(uploadedFilePath);

        const mainHtmlFile = await findMainHtmlFile(extractPath);

        if (!mainHtmlFile) {
          // Clean up extracted directory if no HTML file is found
          if (fs.existsSync(extractPath)) {
            await fs.promises.rm(extractPath, { recursive: true, force: true });
          }
          return res.status(400).json({ message: 'No HTML file found in the uploaded ZIP.' });
        }

        return res.status(200).json({
          message: 'ZIP file uploaded and extracted successfully',
          filePath: `/public/book_content/${extractDirName}/${mainHtmlFile}`,
          fileType: 'zip',
        });
      } catch (zipErr) {
        // Clean up extracted directory if extraction fails
        if (fs.existsSync(extractPath)) {
          await fs.promises.rm(extractPath, { recursive: true, force: true });
        }
        return res.status(500).json({ message: `Error extracting ZIP file: ${zipErr.message}` });
      }
    } else {
      // Handle image upload by sending to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(uploadedFilePath, {
          folder: 'library_uploads',
          use_filename: true,
          unique_filename: true,
        });

        // Delete the temporary local file
        await fs.promises.unlink(uploadedFilePath);

        return res.status(200).json({
          message: 'Image uploaded successfully to Cloudinary',
          filePath: result.secure_url, // Return Cloudinary URL
          fileType: 'image',
        });
      } catch (uploadErr) {
        // Attempt to delete the local file even if upload fails
        try {
          await fs.promises.unlink(uploadedFilePath);
        } catch (deleteErr) {
          console.error('Failed to delete temporary file after failed upload:', deleteErr);
        }
        return res.status(500).json({ message: `Cloudinary upload error: ${uploadErr.message}` });
      }
    }
  });
};
