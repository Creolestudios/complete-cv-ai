import { put } from "@vercel/blob";

export async function storeBlob(user_id: any, data: any, blobName: any) {
  const blob = await put(blobName, JSON.stringify(data), {
    access: "public",
    contentType: "text/plain",
  });

  return blob;
}
