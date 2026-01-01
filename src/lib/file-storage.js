/**
 * @file src/lib/file-storage.js
 * @description Local file storage handler (Mocks S3 for Dev)
 */

import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parser is required for file uploads
  },
};

export async function parseForm(req) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB Limit
    filename: (name, ext, part, form) => {
      // Create unique filename: timestamp-originalName
      return `${Date.now()}-${part.originalFilename.replace(/\s/g, '_')}`;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}