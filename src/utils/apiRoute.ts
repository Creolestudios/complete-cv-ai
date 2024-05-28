// Dashboard route
export const apiRoute = {
  DashTableData: `server/api/getsavedcv`,
  DeleteProject: `/server/api/deletesavedProject`,
  CopyProject: `/server/api/copyfile`,
  DownloadSelectedProject: `server/api/selectedProjectdown`,
  GetProject: `/server/api/getProjectList`,
  DeleteFile: `/server/api/deleteFile`,
  downloadProject: `/server/api/downloadProject`,
};

// Home route
export const homeRoute = {
  Upload: `server/api/upload`,
  PreviewCv: `/server/api/candidateCv`,
  ConvertBlobData: `/server/api/convertBlobdata`,
  ConvertedPdf: `/server/api/pdf`,
};

// Login route
export const loginRoute = {
  auth: `server/api/auth`,
  register: `/server/api/UserRegistration`,
  verifyEmail: `/server/api/verifyEmail`,
  resendVerifyEmail: `/server/api/resendEmail`,
  resetPassword: `/server/api/resetPassword`,
  registrationVerify: `/server/api/userVerification`,
  logout: `/server/api/logout`,
};

// Preview route
export const previewRoute = {
  saveFile: `/server/api/saveProject`,
  downloadZip: `server/api/downloadzip`,
  deleteCv: `server/api/deletecv`,
  deleteProject: `server/api/deleteProject`,
  dataList: `/server/api/resumeDataList`,
  dataEdit: `/server/api/resumeDataEdit`,
};

// Setting route
export const settingRoute = {
  setting: `/server/api/settings`,
  settingList: `/server/api/settingList`,
  passwordChange: `/server/api/passwordChange`,
  teamList: `/server/api/admin-teamList`,
  listTeamData: `/server/api/admin-listTeamData`,
  teamCreate: `/server/api/admin-createTeam`,
  memberData: `/server/api/admin-memberData`,
  editMember: `/server/api/admin-editMember`,
  editTeam: `/server/api/admin-editTeam`,
  removeMember: `/server/api/admin-removeMember`,
  teamStatus: `/server/api/admin-statusTeamlist`,
  memberStatus: `/server/api/admin-memberStatusList`,
  teamNameSearch: `/server/api/admin-search`,
  inviteMember: `/server/api/admin-inviteMember`,
};

// Admin dashboard
export const adminRoute = {
  dashboard: `/server/api/adminDashTableList`,
  chartData: `/server/api/adminTemplateData`,
  dateWise: `/server/api/adminTemplateDataDatewise`,
  lineGraph: `/server/api/adminLineGraph`,
};
