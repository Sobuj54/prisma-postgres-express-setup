import multer from "multer";
import path from "path";
import fs from "fs";

// ensure uploads dir exists (run once at module load)
const ROOT_DIR = path.resolve(process.cwd());
export const UPLOAD_DIR = path.join(ROOT_DIR, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|avif/;
    const extensionName = allowedExtensions.test(
      path.extname(file.originalname).toLocaleLowerCase()
    );

    // 2. Regex for MIME Types (Recommended for stricter checking)
    const allowedMimeTypes = /image\/(jpeg|jpg|png|avif)/;
    const mimeTypeIsValid = allowedMimeTypes.test(file.mimetype);

    if (extensionName && mimeTypeIsValid) {
      cb(null, true);
    } else {
      const fileIdentification = file.mimetype || file.originalname;

      cb(
        new Error(
          `File type/MIME ${fileIdentification} not allowed. Allowed types: JPEG, PNG, and AVIF.`
        )
      );
    }
  },
});

/*
file:
{
  fieldname: 'avatar',
  originalname: '20251030_011857.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '1764862322974-461340383-20251030_011857.jpg',
  path: 'uploads\\1764862322974-461340383-20251030_011857.jpg',
  size: 441202
}

*/
