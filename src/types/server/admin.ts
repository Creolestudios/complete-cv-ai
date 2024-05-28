export interface Error {
  message?: string;
  error?: string | any;
  errorMessage?: string;
}
export interface Response {
  message?: string;
  data?: any;
}
export interface teamCombinedDailyConversionsResponse {
  teamName: string | any;
  cvConverted: any[];
}
export interface VerifyResponse {
  success: boolean;
  message: string;
}
export interface TimeSpend {
  success: boolean;
  newTime: any;
  existingTime: number;
}
export interface SettingsType {
  id?: number;
  teamId: number;
  username: string;
  email: string;
  Firstname: string;
  Lastname: string;
  mobile: string;
  Role: string;
  isActive?: boolean;
  status?: string;
}
