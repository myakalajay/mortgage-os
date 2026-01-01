/**
 * @file src/pages/api/v1/documents/upload.js
 * @description Handle Document Uploads
 */

import { prisma } from '@/lib/prisma';
import { createApiHandler } from '@/lib/api-handler';
import { parseForm } from '@/lib/file-storage';

// Next.js Config: Disable body parser so 'formidable' can handle the stream
export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadHandler(req, res) {
  if (req.method !== 'POST') return; // handled by wrapper usually

  // 1. Parse the incoming file
  const { fields, files } = await parseForm(req);
  
  // 'file' is the key we will use in the frontend FormData
  const uploadedFile = files.file?.[0]; 
  const loanId = fields.loanId?.[0];
  const docType = fields.docType?.[0] || 'GENERAL';

  if (!uploadedFile) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }

  // 2. Construct the Public URL
  // In Prod, this would be an S3 URL. Locally, it's a relative path.
  const fileUrl = `/uploads/${uploadedFile.newFilename}`;

  // 3. Save Metadata to DB
  const doc = await prisma.document.create({
    data: {
      userId: req.user.userId,
      loanId: loanId,
      name: uploadedFile.originalFilename,
      type: docType,
      url: fileUrl,
      status: 'PENDING'
    }
  });

  // 4. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: req.user.userId,
      action: 'DOCUMENT_UPLOAD',
      metadata: { docId: doc.id, name: doc.name }
    }
  });

  return res.status(201).json({ success: true, data: doc });
}

export default createApiHandler(uploadHandler, {
  allowedMethods: ['POST'],
  role: 'BORROWER', // Admin/Lender override handled by middleware logic
});