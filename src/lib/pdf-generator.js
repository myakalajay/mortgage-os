/**
 * @file src/lib/pdf-generator.js
 * @description Generates a PDF summary of the Loan Application (Form 1003 Summary)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateLoanPDF(loan) {
  const doc = new jsPDF();
  const formData = loan.formData || {};
  
  // --- HEADER ---
  doc.setFontSize(20);
  doc.setTextColor(40, 55, 71); // Slate 900
  doc.text("Uniform Residential Loan Application", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`File ID: ${loan.id}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 33);
  doc.line(14, 38, 196, 38); // Horizontal Line

  // --- SECTION 1: BORROWER INFO ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("1. Borrower Information", 14, 48);

  const personal = formData.personal || {};
  autoTable(doc, {
    startY: 52,
    head: [['Field', 'Value']],
    body: [
      ['Name', `${loan.user.firstName} ${loan.user.lastName}`],
      ['Email', loan.user.email],
      ['Phone', personal.phone || '-'],
      ['Marital Status', personal.maritalStatus || '-'],
      ['Current Address', personal.currentAddress || '-'],
      ['Years at Address', personal.yearsAtAddress || '-'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // --- SECTION 2: LOAN & PROPERTY ---
  let finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("2. Property & Loan Info", 14, finalY);

  const property = formData.property || {};
  autoTable(doc, {
    startY: finalY + 4,
    head: [['Field', 'Value']],
    body: [
      ['Loan Type', loan.loanType],
      ['Estimated Value', `$${Number(loan.estimatedValue).toLocaleString()}`],
      ['Target Address', property.address || loan.propertyAddress || 'TBD'],
      ['State', loan.propertyState],
      ['Property Type', property.propertyType || '-'],
      ['Occupancy', property.occupancy || '-'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [39, 174, 96] }
  });

  // --- SECTION 3: INCOME & ASSETS ---
  finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("3. Financials", 14, finalY);

  const income = formData.income || {};
  const assets = formData.assets || {};

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Category', 'Details', 'Value']],
    body: [
      ['Employment', `${income.employerName || '-'} (${income.jobTitle || ''})`, `$${income.monthlyIncome || 0}/mo`],
      ['Assets', `${assets.bankName || '-'} (${assets.accountType || ''})`, `$${assets.balance || 0}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [142, 68, 173] }
  });

  // --- FOOTER ---
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("This document was generated electronically by MortgageOS.", 14, 280);

  // Return the raw blob
  return doc.output('blob');
}