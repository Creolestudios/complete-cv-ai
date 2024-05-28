// 'use server';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { createWriteStream } from "fs";

export async function saveFile(file: Blob, extension: string): Promise<string> {
  const relativeUploadDir = `/uploads`;
  // const uploadDir = join(process.cwd(), "public", relativeUploadDir);
  const uploadDir = join('/tmp', relativeUploadDir);

  await mkdir(uploadDir, { recursive: true });

  const tempFileName = `tempfile-${Date.now()}.${extension}`;
  const tempFilePath = join(uploadDir, tempFileName);

  const writableStream = createWriteStream(tempFilePath);
  const reader = file.stream().getReader();

  await new Promise<void>((resolve, reject) => {
    function process({ done, value }: { done: boolean; value?: Uint8Array }) {
      if (done) {
        writableStream.end();
        resolve();
        return;
      }

      writableStream.write(value);
      reader.read().then(process);
    }

    reader.read().then(process);
  });

  return tempFileName;
}


