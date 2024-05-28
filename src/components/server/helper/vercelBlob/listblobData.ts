"use server";
import { list } from "@vercel/blob";
import axios from "axios";

// Fetch skills url from vercel blob and data from that url using axios
export const fetchLatestSkillBlob = async (user_id: string, fileId: string) => {
  try {
    const skillBlobData = await list({ prefix: `${user_id}/${fileId}/skills` });
    // Check if blobs array is not empty
    if (skillBlobData.blobs.length > 0) {
      const sortedBlobs = skillBlobData.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });
      const latestSkillBlobUrl = sortedBlobs[0].url;
      // Make Axios GET request using the latest URL
      const response = await axios.get(latestSkillBlobUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for the specified prefix skills.");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch Details url from vercel blob and data from that url using axios
export const fetchDetailsBlob = async (user_id: string, fileId: string) => {
  try {
    const detailsBlobData = await list({
      prefix: `${user_id}/${fileId}/details`,
    });

    if (detailsBlobData.blobs.length > 0) {
      const sortedBlobs = detailsBlobData.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });
      const latestDetailsUrl = sortedBlobs[0].url;

      const response = await axios.get(latestDetailsUrl);

      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for the specified prefix details.");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch experience url from vercel blob and data from that url using axios
export const fetchExperienceBlob = async (user_id: string, fileId: string) => {
  try {
    const experienceBlob = await list({
      prefix: `${user_id}/${fileId}/experience`,
    });

    if (experienceBlob.blobs.length > 0) {
      const sortedBlobs = experienceBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestExpUrl = sortedBlobs[0].url;
      const response = await axios.get(latestExpUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }
      // console.log(result);
      return result;
    } else {
      console.log("No blobs found for the specified prefix experience");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch languages url from vercel blob and data from that url using axios
export const fetchLanguagesBlob = async (user_id: string, fileId: string) => {
  try {
    const languagesBlob = await list({
      prefix: `${user_id}/${fileId}/languages`,
    });

    if (languagesBlob.blobs.length > 0) {
      const sortedBlobs = languagesBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestLanguagesUrl = sortedBlobs[0].url;

      const response = await axios.get(latestLanguagesUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for the specified prefix languages");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch projects url from vercel blob and data from that url using axios
export const fetchProjectBlob = async (user_id: string, fileId: string) => {
  try {
    const projectsBlob = await list({
      prefix: `${user_id}/${fileId}/projects`,
    });

    if (projectsBlob.blobs.length > 0) {
      const sortedBlobs = projectsBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestProjectUrl = sortedBlobs[0].url;

      const response = await axios.get(latestProjectUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for the specified prefix projects");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch education url from vercel blob and data from that url using axios
export const fetchEducationBlob = async (user_id: string, fileId: string) => {
  try {
    const educationBlob = await list({
      prefix: `${user_id}/${fileId}/education`,
    });

    if (educationBlob.blobs.length > 0) {
      const sortedBlobs = educationBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestEducationUrl = sortedBlobs[0].url;

      const response = await axios.get(latestEducationUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for specified prefix education");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};
// Fetch summary url from vercel blob and data from that url using axios
export const fetchSummaryBlob = async (user_id: string, fileId: string) => {
  try {
    const summaryBlob = await list({ prefix: `${user_id}/${fileId}/summary` });

    if (summaryBlob.blobs.length > 0) {
      const sortedBlobs = summaryBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestSummaryUrl = sortedBlobs[0].url;

      const response = await axios.get(latestSummaryUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }
      return result;
    } else {
      console.log("No blobs found for specified prefix professional summary");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch professional Qualification url from vercel blob and data from that url using axios
export const fetchProfQualificationBlob = async (
  user_id: string,
  fileId: string
) => {
  try {
    const qualificationBlob = await list({
      prefix: `${user_id}/${fileId}/profQualification`,
    });

    if (qualificationBlob.blobs.length > 0) {
      const sortedBlobs = qualificationBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestQualificationUrl = sortedBlobs[0].url;

      const response = await axios.get(latestQualificationUrl);
      let result;
      if (typeof response.data === "string") {
        try {
          result = JSON.parse(response.data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        result = response.data;
      }

      return result;
    } else {
      console.log("No blobs found for specified prefix professional summary");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch converted file url from vercel blob and send return it
export const fetchDownloadedPdfBlob = async (
  user_id: string,
  fileId: string
) => {
  try {
    const DownloadedPdfBlob = await list({
      prefix: `${user_id}/${fileId}/downloadedPdf`,
    });

    if (DownloadedPdfBlob.blobs.length > 0) {
      const sortedBlobs = DownloadedPdfBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestPdfUrl = sortedBlobs[0].url;
      return latestPdfUrl;
    } else {
      console.log("No blobs found for specified prefix professional summary");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};

// Fetch candidate file url from vercel blob and send return it
export const fetchCandidatePdfBlob = async (
  user_id: string,
  fileId: string
) => {
  try {
    const candidatePdfBlob = await list({
      prefix: `${user_id}/${fileId}/CandidateFileCv`,
    });

    if (candidatePdfBlob.blobs.length > 0) {
      const sortedBlobs = candidatePdfBlob.blobs.sort((a, b) => {
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      });

      const latestPdfUrl = sortedBlobs[0].url;
      return latestPdfUrl;
    } else {
      console.log("No blobs found for specified prefix professional summary");
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error", error.message);
      return null;
    }
  }
};
