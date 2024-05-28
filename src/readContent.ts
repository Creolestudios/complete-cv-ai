// pdfUtils.ts
import fs from "fs";
import pdfParse from "pdf-parse";

export const readContent = async (filePath: string) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error reading PDF content: ${error.message}`);
    }
  }
};
