// success messages
export const Popup = {
  cvUploadSuccess: "CV uploaded successfully!",
  convertSuccess: "Converted successfully!",
  fileDelete: "File Deleted Successfully.",
  cvUploadCancel: "CV upload cancelled!",
  passwordChange: "Password Changed successfully!",
  downloadProject: "Downloaded successfully",
  downloading: "Downloading ...",
  saving: "Saving...",
  saveProject: "Project saved to Dashboard!",
  deleteProject: "Project deleted successfully",
  copyProject: "Project copied successfully!",
  teamCreate: "Team created successfully!",
  emailSent: "Email sent successfully!",
  resentLinkSend: `Email verified and password reset link sent to your email`,
  verified: `Your account has been verified`,
  registerSuccess: `Registration successful`,
};

// Error messages
export const PopupError = {
  upload: `CV upload cancelled!`,
  Internal: "Internal server error !",
  validFile: "Please upload a docx or pdf file!",
  tryAgain: "Something went wrong. Please, try again!",
  candidateFileErr: "Something went wrong to preview candidate file",
  convertErr: "Error while converting the CV!",
  reqCancel: "Request canceled by user.",
  InvalidUser: "Invalid username or password. Please try again.",
  userNotFound: `Your email not found in our records, Please check your email or Register`,
  authError: "An unexpected client error occurred. Please try again later.",
  verificationNotFound: `Verification not found`,
  suspended:
    "Your account has been suspended. Please contact your administrator.",
  userExists: `User with this email already exists`,
  userNotVerified: `You are not verified. Please verify your email first to reset password`,
};

// Server error
export const ServerError = {
  Internal:
    "The server encountered an unexpected condition which prevented it from fulfilling the request.",
  Unauthorized: "Unauthorized to perform this action",
};
// Create team messages
export const admin = {
  alreadyIn: (userNamesWithTeam: any) =>
    `The following users are already associated with a team: ${userNamesWithTeam}`,
  duplicateEmails: (emails: any) =>
    `Users with the following emails already exist: ${[...emails].join(", ")}`,
  duplicateUsernames: (usernames: any) =>
    `Users with the following usernames already exist: ${[...usernames].join(
      ", "
    )}`,
  createUser: (email: any) => `Error creating user for email ${email}:`,
  InvalidData: "Invalid data , please check and try again",
  membersValid: "Members should be at least 2 !",
  successful: "Team created successfully",
  updated: "Profile updated successfully!",
  checkData: `Invalid,Please check request data !`,
  usernameInUse: "Username already in use ! Please try with different username",
};
// Team messages
export const listTeam = {
  notFound: "Team not found",
  NotCreate: "Error in creating team",
  deleteMember: "Error in deleting member",
  edit: "Error in editing team",
  teamData: "Error in fetching team data",
};

// Auth messages
export const auth = {
  verify: `Please verify your email first`,
  invalidPassword: `Invalid password`,
  loginSuccess: `Login successful`,
  invalidUsername: `Invalid username`,
  userNotFound: `User not found`,
  bothRequired: `Both username and password are required`,
  accountSuspended: `Your account has been suspended. Please contact your administrator.`,
  wentWrong: `Something went wrong. Please, try again!`,
};
// client side message popup
export const ClientPopup = {
  Unauthorized: "You are not authorized to view this page",
  welcome: (Firstname: string) => `Welcome back ${Firstname}!`,
  WaitForMin: "You can send the email again after few minutes.",
  DataFetched: `Data fetched successfully!`,
  tableErr: "Error in fetching table list",
};
export const EditCVs = {
  summary: `Executive Summary deleted successfully`,
  experience: `Experience deleted successfully`,
  education: `Education deleted successfully`,
  qualification: `Qualification deleted successfully`,
  project: `Project deleted successfully`,
  skill: `Skill deleted successfully`,
  language: `Language deleted successfully`,
};
