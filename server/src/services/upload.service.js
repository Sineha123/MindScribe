import mammoth from 'mammoth';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const processPdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

export const processDocx = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

export const processTxt = async (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

export const extractContent = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return await processPdf(file.path);
    case 'docx':
      return await processDocx(file.path);
    case 'txt':
      return await processTxt(file.path);
    default:
      throw new Error('Unsupported file format');
  }
};
