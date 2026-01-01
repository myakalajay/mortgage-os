/**
 * @file src/lib/email.js
 * @description Email Notification Service (Mock for Dev / Ready for SendGrid)
 */

export async function sendEmail({ to, subject, html }) {
  console.log('--------------------------------------------------');
  console.log('📧 EMAIL DISPATCHED');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('--------------------------------------------------');

  // --- PRODUCTION IMPLEMENTATION (Example with SendGrid) ---
  /*
  if (process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: 'noreply@mortgageos.com',
      subject,
      html,
    });
  }
  */
  
  return true;
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

  return `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Hello ${firstName},</h2>
      <p>There has been a status update on your mortgage application.</p>
      <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <strong>New Status: ${newStatus.replace('_', ' ')}</strong>
        <p>${message}</p>
      </div>
      <p>Please log in to your dashboard to view details or upload any required documents.</p>
      <a href="http://localhost:3000/dashboard/borrower" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;
}