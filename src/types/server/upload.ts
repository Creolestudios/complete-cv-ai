import { PutBlobResult } from "@vercel/blob";
import shortUUID from "short-uuid";

export interface UploadResponse {
  file_id: shortUUID.SUUID;
  tempFileName: string;
  file_name: any;
  isProgress: boolean;
  message: string;
}
export interface UploadError {
  errorMessage?: string;
  error?: string | any;
}
export interface ConvertResponse {
  qualificationBlob: PutBlobResult;
  fileId: string;
  isConvert: boolean;
  message: string;
  fileName: FormDataEntryValue;
}
export interface CandidateResponse {
  result: string | null;
}
