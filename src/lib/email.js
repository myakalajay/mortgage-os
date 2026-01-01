/**
 * @file src/lib/email.js
 * @description Email Notification Service (Resend Integration with Mock Fallback)
 */

import { Resend } from 'resend';

// Initialize Resend only if the key exists
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendEmail({ to, subject, html }) {
  // --- 1. MOCK FALLBACK (If no API Key) ---
  if (!resend) {
    console.log('--------------------------------------------------');
    console.log('📧 MOCK EMAIL (No RESEND_API_KEY detected)');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--------------------------------------------------');
    return true;
  }

  // --- 2. REAL SENDING LOGIC ---
  try {
    // NOTE: On the Resend Free Tier without a custom domain, 
    // you can only send emails TO the address you signed up with.
    // In Production with a verified domain, 'to' works for everyone.
    
    // Safety check for testing: 
    // If you haven't verified a domain, you might want to hardcode your personal email here 
    // or set a TEST_EMAIL env var to avoid "403 Forbidden" errors from Resend.
    const recipient = to; 

    const data = await resend.emails.send({
      from: 'MortgageOS <onboarding@resend.dev>', // Default testing sender provided by Resend
      to: recipient,
      subject: subject,
      html: html,
    });
    
    console.log('📧 Real Email Sent via Resend. ID:', data.data?.id || 'Sent');
    return true;
  } catch (error) {
    console.error('❌ Email Failed:', error);
    // Return false but don't crash the application flow
    return false;
  }
}

export function getStatusEmailTemplate(firstName, newStatus) {
  const statusMap = {
    PROCESSING: 'We have begun processing your file.',
    UNDERWRITING: 'Your loan is now being reviewed by an underwriter.',
    APPROVED_CONDITIONAL: 'Great news! Your loan is conditionally approved.',
    CLEAR_TO_CLOSE: 'Congratulations! We are ready to schedule your closing.',
    CLOSED: 'Your loan has been funded. Welcome home!',
    REJECTED: 'An update regarding your application decision is available.'
  };

  const message = statusMap[newStatus] || 'There has been an update to your application.';

  // Determine the link based on environment
  const dashboardLink = process.env.NODE_ENV === 'production' 
    ? 'https://mortgage-os.vercel.app/dashboard/borrower' 
    : 'http://localhost:3000/dashboard/borrower';

  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Hello ${firstName},</h2>
      <p>There has been a status update on your mortgage application.</p>
      <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <strong>New Status: ${newStatus.replace('_', ' ')}</strong>
        <p>${message}</p>
      </div>
      <p>Please log in to your dashboard to view details or upload any required documents.</p>
      <div style="margin-top: 20px;">
        <a href="${dashboardLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
      </div>
      <p style="font-size: 12px; color: #888; margin-top: 30px;">
        This is an automated notification from MortgageOS.
      </p>
    </div>
  `;
}