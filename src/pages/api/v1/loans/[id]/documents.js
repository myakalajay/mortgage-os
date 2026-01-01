import { IncomingForm } from 'formidable';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';
import { supabase } from '@/lib/supabase'; // <--- NEW IMPORT

// Disable Next.js body parsing so formidable can handle the file stream
export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadHandler(req, res) {
  const { id } = req.query;

  // 1. Parse the incoming file
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  const file = data.files.file?.[0] || data.files.file;
  if (!file) throw new Error('No file uploaded');

  // 2. Read file from the temporary path
  const fileContent = fs.readFileSync(file.filepath);
  
  // 3. Generate a unique path: loanID / timestamp-filename
  const fileName = `${id}/${Date.now()}-${file.originalFilename}`;

  // 4. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('documents') // The bucket name you created
    .upload(fileName, fileContent, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase Upload Error:', uploadError);
    throw new Error('Upload failed');
  }

  // 5. Get the Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('documents')
    .getPublicUrl(fileName);

  // 6. Save Metadata to Database
  const doc = await prisma.loanDocument.create({
    data: {
      loanId: id,
      name: file.originalFilename,
      url: publicUrl, // <--- Now pointing to Supabase, not localhost
      type: file.mimetype,
    }
  });

  // 7. Log it
  await prisma.auditLog.create({
    data: {
      userId: req.user.userId,
      action: 'DOCUMENT_UPLOAD',
      metadata: { loanId: id, fileName: file.originalFilename }
    }
  });

  return res.status(201).json({ success: true, data: doc });
}

export default createApiHandler(uploadHandler, {
  allowedMethods: ['POST'],
  role: 'BORROWER', // Implicitly allows Lenders/Admins too usually, or check roles
});