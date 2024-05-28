export async function validateFile(file: Blob | null) {
  if (!file) {
    throw new Error("File blob is required.");
  }
}
