import express from 'express';
import { generateDocx, generatePdf } from '../services/export.service.js';

const router = express.Router();

router.post('/docx', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const buffer = await generateDocx(title, content);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.docx`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post('/pdf', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const buffer = await generatePdf(content);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
