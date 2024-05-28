import fs from "fs/promises";
import pdfParse from "pdf-parse";

export async function parsePDF(filePath: any) {
  try {
    // Read the PDF file into a buffer
    const bufferData = await fs.readFile(filePath);
    // console.log(filePath)

    // Use pdf-parse to extract text content from the PDF
    const pdfData = await pdfParse(bufferData);
    const pdfText = pdfData.text;

    // Further processing with the extracted text can be done here

    return pdfText; // Return the extracted text or perform additional processing
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw error;
  }
}
