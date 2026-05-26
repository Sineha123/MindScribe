import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const generateDocx = async (title, htmlContent) => {
  // Simple HTML to DOCX conversion (can be improved with specialized libraries)
  // For now, we'll strip tags and create a basic document
  const plainText = htmlContent.replace(/<[^>]*>?/gm, '');
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun(plainText),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
};

export const generatePdf = async (htmlContent) => {
  throw new Error("Backend PDF export is deprecated. Please use client-side PDF export instead.");
};
