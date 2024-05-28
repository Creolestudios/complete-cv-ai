import React, { useEffect, useRef, useState } from "react";
import Icon from "@ant-design/icons/lib/components/Icon";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Spin,
  Tooltip,
  message,
} from "antd";
import Image from "next/image";
import TextArea from "antd/es/input/TextArea";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

import "./editcandidatecv.css";
import PlusIcon from "../../../../public/assets/Plus.svg";
import DeleteIcon from "../../../assets/images/DeleteIcon";
import Redo from "../../../../public/assets/redo.svg";
import Undo from "../../../../public/assets/undo.svg";
import { usePdfViewer } from "../context/PdfViewerContext";
import deleteSvg from "@/assets/images/deleteSvg";
import { previewRoute } from "@/utils/apiRoute";
import { EditCVs } from "@/utils/messagePopup";
import {
  DETAILS,
  EDUCATION,
  EXE_SUMMARY,
  EXPERIENCE,
  LANGUAGES,
  PROJECT,
  QUALIFICATION,
  SKILLS,
} from "./constant";

// Function to parse the date string
function parseDate(dateString: string): { startDate: string; endDate: string } {
  let startDate = "";
  let endDate = "";

  // Check if dateString is defined and includes " – " (en dash)
  if (dateString?.includes(" – ")) {
    // If yes, split the dateString by " – " and then by " - "
    const [datePart1, datePart2] = dateString
      .split(" – ")
      .flatMap((date) => date.split(" - ")); // Split at both en dash and hyphen
    // Trim the parts and assign them to startDate and endDate
    startDate = datePart1 ? datePart1.trim() : "";
    endDate = datePart2 ? datePart2.trim() : "";
  }
  // If the dateString does not include " – ", check if it includes "-"
  else if (dateString?.includes("-")) {
    // If yes, split the dateString by "-"
    const [datePart1, datePart2] = dateString.split("-");
    // Trim the parts and assign them to startDate and endDate
    startDate = datePart1 ? datePart1.trim() : "";
    // Check if the second part is defined and not "present" (case-insensitive)
    endDate = datePart2
      ? datePart2.trim().toLowerCase() === "present"
        ? "Present" // If yes, set endDate to "Present"
        : datePart2.trim() // If no, trim the part and set it as endDate
      : ""; // If datePart2 is undefined or null, set endDate to an empty string
  }

  return { startDate, endDate };
}

// Edit Candidate Cv Form Component
function EditCandidateCvForm() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteType, setDeleteType] = useState("");

  const {
    showPdf,
    setShowPdf,
    setEditData,
    editData,
    loader,
    setLoader,
    setEditing,
    setSaveLoading,
  } = usePdfViewer();
  const [Data, setData] = useState<any>(editData); // initially set editData
  const [workingExperience, setWorkingExperience] = useState([
    {
      workingExperience: 1,
    },
  ]);

  const [education, setEducation] = useState([
    {
      education: 1,
    },
  ]);
  const [professionalQualification, setProfessionalQualification] = useState([
    {
      professionalQualification: 1,
    },
  ]);
  const [project, setProject] = useState([
    {
      project: 1,
    },
  ]);
  const [language, setLanguage] = useState([
    {
      language: 1,
    },
  ]);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  useEffect(() => {
    // Only set Data from editData on initial render
      setData(editData);
  }, [editData]);

  useEffect(() => {
    const handleDataTransform = (Data: any) => {
      const listData: any = {
        // Add details data
        userName: Data.FileData?.details?.name || "NO field present",
        gender: Data.FileData?.details?.gender || "NO field present",
        nationality: Data.FileData?.details?.nationality || "NO field present",
        latestSalary: Data.FileData.details?.latestSalary || "NO field present",
        firstName:
          Data.FileData?.details?.name.split(" ")[0] || "NO field present",
        expectedSalary:
          Data.FileData?.details?.expectedSalary || "NO field present",
        noticePeriod:
          Data.FileData?.details?.noticePeriod || "NO field present",
          skillList: Data.FileData.skills.join(", "),
          executiveSummary: Data.FileData?.summary[0]?.summary,
          referenceNo: Data.FileData?.details?.referenceNo || "Not provided",
        };
      // Add languages data
      if (Data && Data.FileData && Data.FileData?.languages) {
        Data.FileData.languages.forEach(
          (language: { language: any; fluency: any }, index: number) => {
            listData[`Language-${index + 1}`] = language.language;
            listData[`fluency-${index + 1}`] = language.fluency;
          }
        );
      }
      setLanguage(Data?.FileData?.languages);
      // Add projects data
      if (Data && Data.FileData && Data.FileData.projects) {
        editData.FileData.projects.forEach(
          (
            project: { title: any; description: any; date: string },
            index: number
          ) => {
            listData[`projectName-${index + 1}`] = project.title;
            listData[`projectList-${index + 1}`] = project.description;
            const { startDate, endDate } = parseDate(project.date);
            listData[`projectStart-${index + 1}`] = startDate;
            listData[`projectEnd-${index + 1}`] = endDate;
          }
        );
      }
      setProject(Data?.FileData?.projects);

      // Add experience data
      if (Data && Data.FileData && Data.FileData.experience) {
        Data.FileData.experience.forEach(
          (
            exp: { title: any; company: any; description: any; date: string },
            index: number
          ) => {
            listData[`position-${index + 1}`] = exp.title;
            listData[`company-${index + 1}`] = exp.company;
            listData[`workingExperienceList-${index + 1}`] = exp.description;
            const { startDate, endDate } = parseDate(exp.date);
            listData[`workingStart-${index + 1}`] = startDate;
            listData[`workingEnd-${index + 1}`] = endDate;
          }
        );
      }
      setWorkingExperience(Data?.FileData?.experience);
      // Add education data
      if (Data && Data.FileData && Data.FileData.education) {
        Data.FileData.education.forEach(
          (edu: { title: any; college: any; date: any }, index: number) => {
            listData[`courseName-${index + 1}`] = edu.title;
            listData[`university-${index + 1}`] = edu.college;
            const { startDate, endDate } = parseDate(edu.date);
            listData[`educationStart-${index + 1}`] = startDate;
            listData[`educationEnd-${index + 1}`] = endDate;
          }
        );
      }
      setEducation(Data?.FileData?.education);
      if (Data && Data.FileData && Data.FileData.qualification) {
        Data.FileData.qualification.forEach(
          (edu: { title: any; college: any; date: any }, index: number) => {
            listData[`Q-courseName-${index + 1}`] = edu.title;
            listData[`Q-university-${index + 1}`] = edu.college;
            const { startDate, endDate } = parseDate(edu.date);
            listData[`Q-educationStart-${index + 1}`] = startDate;
            listData[`Q-educationEnd-${index + 1}`] = endDate;
          }
        );
      }
      setProfessionalQualification(Data?.FileData?.qualification);
      form.setFieldsValue(listData);
      setFormData(listData);
      setLoader(false);
    };
    if (Data) {
      handleDataTransform(Data);
    }
  }, [Data]);

  const onFinish = async (value: any) => {
    console.log(value);
    setLoader(false);

    const FileData: any = {
      details: {
        name: value.userName || "NO field present",
        referenceNo: value.referenceNo || "NO field present",
        email: "NO field present",
        phone: "NO field present",
        gender: value.gender || "NO field present",
        nationality: value.nationality || "NO field present",
        firstname: value.firstName || "NO field present",
        address: "NO field present",
        designation: value["position-1"] || "NO field present",
        latestSalary: value.latestSalary || "NO field present",
        expectedSalary: value.expectedSalary || "NO field present",
        noticePeriod: value.noticePeriod || "NO field present",
      },
      skills: value.skillList
        ? value.skillList.split(",").map((skill: any) => skill.trim())
        : [],
      experience: [],
      education: [],
      languages: [],
      projects: [],
      qualification: [],
      summary: value.executiveSummary
        ? [{ summary: value.executiveSummary }]
        : [],
    };
    // Determine maximum indices for each section
    const maxExperienceIndex = Math.max(
      ...Object.keys(value)
        .filter((key) => key.startsWith("position-"))
        .map((key) => Number(key.split("-")[1]))
    );
    const maxEducationIndex = Math.max(
      ...Object.keys(value)
        .filter((key) => key.startsWith("courseName-"))
        .map((key) => Number(key.split("-")[1]))
    );
    const maxQualificationIndex = Math.max(
      ...Object.keys(value)
        .filter((key) => key.startsWith("Q-courseName-"))
        .map((key) => Number(key.split("-")[1]))
    );
    const maxLanguageIndex = Math.max(
      ...Object.keys(value)
        .filter((key) => key.startsWith("Language-"))
        .map((key) => Number(key.split("-")[1]))
    );
    const maxProjectIndex = Math.max(
      ...Object.keys(value)
        .filter((key) => key.startsWith("projectName-"))
        .map((key) => Number(key.split("-")[1]))
    );

    for (
      let i = 1;
      i <= maxExperienceIndex ||
      i <= maxEducationIndex ||
      i <= maxLanguageIndex ||
      i <= maxQualificationIndex ||
      i <= maxProjectIndex;
      i++
    ) {
      // Add experience data
      if (value[`position-${i}`]) {
        FileData.experience.push({
          title: value[`position-${i}`] || "NO field present",
          company: value[`company-${i}`] || "NO field present",
          date: `${value[`workingStart-${i}`] || ""} – ${
            value[`workingEnd-${i}`] || ""
          }`,
          description:
            value[`workingExperienceList-${i}`] || "NO field present",
        });
      }

      // Add education data
      if (value[`courseName-${i}`]) {
        FileData.education.push({
          title: value[`courseName-${i}`] || "NO field present",
          date: `${value[`educationStart-${i}`] || ""} – ${
            value[`educationEnd-${i}`] || ""
          }`,
          college: value[`university-${i}`] || "NO field present",
          marks: "NO field present",
        });
      }

      // Add qualification data
      if (value[`Q-courseName-${i}`]) {
        FileData.qualification.push({
          title: value[`Q-courseName-${i}`] || "NO field present",
          date: `${value[`Q-educationStart-${i}`] || ""} – ${
            value[`Q-educationEnd-${i}`] || ""
          }`,
          college: value[`Q-university-${i}`] || "NO field present",
          marks: "NO field present",
        });
      }

      // Add languages data
      if (value[`Language-${i}`]) {
        FileData.languages.push({
          language: value[`Language-${i}`] || "NO field present",
          fluency: value[`fluency-${i}`] || "NO field present",
        });
      }

      // Add projects data
      if (value[`projectName-${i}`]) {
        FileData.projects.push({
          title: value[`projectName-${i}`] || "NO field present",
          description: value[`projectList-${i}`] || "NO field present",
          date: `${value[`projectStart-${i}`] || "NO field present"} – ${
            value[`projectEnd-${i}`] || "NO field present"
          }`,
        });
      }
    }
    const userID = String(
      typeof window !== "undefined" && window.localStorage.getItem("userId")
    );

    const requestData = {
      user_id: userID,
      file_id: editData?.fileId,
      FileData: FileData,
    };

    //  API call for edit resume data
    try {
      setLoading(true);
      setSaveLoading(true);
      const response = await axios.post(previewRoute.dataEdit, requestData);
      if (response.status === 200) {
        setShowPdf(true);
        setLoading(false);
        message.success(response.data?.message);
        setEditing(true);
      }
    } catch (error: any) {
      console.log(error);
      message.error(error.response.data.errorMessage);
      setLoading(false);
    }
  };
  // ------------ Add and Delete functions --------------
  // Add experience and Delete experience
  const handleAddExperience = () => {
    const newExperienceId = workingExperience.length + 1;
    const isDuplicate = workingExperience.some(
      (experience: any) => experience.experience === newExperienceId
    );

    if (!isDuplicate) {
      // If it's not a duplicate, add the member
      setWorkingExperience([
        ...workingExperience,
        { workingExperience: newExperienceId },
      ]);
      
    } else {
      console.log("section already exists");
      setWorkingExperience([
        ...workingExperience,
        { workingExperience: newExperienceId + 1 },
      ]);
    }
  };
  
  
  const handleDeleteExperience = (experienceId: number, title: string) => {
    console.log('id or title to delete',experienceId, title)
    const filteredExperience = workingExperience?.filter(
      (val: any) =>
        val?.workingExperience !== experienceId || val?.title !== title
    );
    // console.log('filtered Experience from state',filteredExperience)
    setWorkingExperience(filteredExperience);
    
      // Update the form fields' values instead of Data
  form.setFieldsValue({
    [`position-${experienceId}`]: '',
    [`company-${experienceId}`]: '',
    [`workingExperienceList-${experienceId}`]: '',
    [`workingStart-${experienceId}`]: '',
    [`workingEnd-${experienceId}`]: '',
  })

  };
  // console.log('Working experience state',workingExperience)

  // Add education and Delete education
  const handleAddEducation = () => {
    const newEducationId = education.length + 1;
    const isDuplicate = education.some(
      (education: any) => education.education === newEducationId
    );

    if (!isDuplicate) {
      // If it's not a duplicate, add the member
      setEducation([...education, { education: newEducationId }]);
    } else {
      console.log("Member already exists"); // Notify user or handle as required
      setEducation([...education, { education: newEducationId + 1 }]);
    }
  };

  const handleDeleteEducation = (educationId: number, title: string) => {
    const filteredEducation = education?.filter(
      (val: any) => val?.education !== educationId || val?.title !== title
    );
    setEducation(filteredEducation);
    form.setFieldsValue({
      [`courseName-${educationId}`]: '',
      [`university-${educationId}`]: '',
      [`educationStart-${educationId}`]: '',
      [`educationEnd-${educationId}`]: '', 
    })
  };

  // Add project and Delete project
  const handleAddProject = () => {
    const newProjectId = project.length + 1;
    const isDuplicate = project.some(
      (project: any) => project.project === newProjectId
    );

    if (!isDuplicate) {
      // If it's not a duplicate, add the member
      setProject([...project, { project: newProjectId }]);
    } else {
      // console.log("Member already exists"); // Notify user or handle as required
      setProject([...project, { project: newProjectId + 1 }]);
    }
  };

  const handleDeleteProject = (projectId: number, title: string) => {
    const filteredProject = project?.filter(
      (val: any) => val?.project !== projectId || val?.title !== title
    );
    setProject(filteredProject);
    form.setFieldsValue({
      [`projectName-${projectId}`]: '',
      [`projectList-${projectId}`]: '',
      [`role-${projectId}`]: '',
      [`projectStart-${projectId}`]: '',
      [`projectEnd-${projectId}`]: '',  
    })
  };

  // Add Qualification and Delete Qualification
  const handleAddQualification = () => {
    const newQualificationId = professionalQualification.length + 1;
    const isDuplicate = professionalQualification.some(
      (qualification: any) => qualification.qualification === newQualificationId
    );

    if (!isDuplicate) {
      // If it's not a duplicate, add the member
      setProfessionalQualification([
        ...professionalQualification,
        { professionalQualification: newQualificationId },
      ]);
    } else {
      // console.log("Member already exists"); // Notify user or handle as required
      setProfessionalQualification([
        ...professionalQualification,
        { professionalQualification: newQualificationId + 1 },
      ]);
    }
  };
  const handleDeleteQualification = (
    QualificationId: number,
    title: string
  ) => {
    const filteredQualification = professionalQualification?.filter(
      (val: any) =>
        val?.professionalQualification !== QualificationId ||
        val?.title !== title
    );
    setProfessionalQualification(filteredQualification);
    form.setFieldsValue({
      [`Q-courseName-${QualificationId}`]: '',
      [`Q-university-${QualificationId}`]: '',
      [`Q-educationStart-${QualificationId}`]: '',
      [`Q-educationEnd-${QualificationId}`]: '',
    })
  };

  //Add language and Delete language
  const handleAddLanguage = () => {
    const newLanguageId = language.length + 1;
    const isDuplicate = language.some(
      (language: any) => language.language === newLanguageId
    );

    if (!isDuplicate) {
      // If it's not a duplicate, add the member
      setLanguage([...language, { language: newLanguageId }]);
    } else {
      // console.log("Member already exists"); // Notify user or handle as required
      setLanguage([...language, { language: newLanguageId + 1 }]);
    }
  };

  const handleDeleteLanguage = (languageId: any) => {
    const filteredLanguage = language?.filter(
      (val: any) => val?.language !== languageId
    );
    setLanguage(filteredLanguage);
    form.setFieldsValue({
      [`Language-${languageId}`]: '',
      [`fluency-${languageId}`]: '',
    })
  };
  const handleCancel = () => {
    setVisible(false);
  };

  const handleOnchange = (e: any) => {
    // console.log(e.target.value);
  };

  // --------- Delete Functions for delete whole sections ----------
  const handleDeleteSummaryForm = () => {
    form.setFieldsValue({
      'executiveSummary': ''});
    message.success(EditCVs.summary);
  };

  const handleDeleteExperienceForm = () => {
    // Get the current number of experiences
    const numExperiences = workingExperience.length;

    // Create an object to hold the fields to reset
    const fieldsToReset:any = {};
  
    // Add the fields related to experiences to the object
    for (let i = 1; i <= numExperiences; i++) {
      fieldsToReset[`position-${i}`] = '';
      fieldsToReset[`company-${i}`] = '';
      fieldsToReset[`workingExperienceList-${i}`] = '';
      fieldsToReset[`workingStart-${i}`] = '';
      fieldsToReset[`workingEnd-${i}`] = '';
    }
  
    // Reset the form fields
    form.resetFields(Object.keys(fieldsToReset));
    setWorkingExperience([]);
    message.success(EditCVs.experience);
  };
  
  const handleDeleteEducationForm = () => {
    const numEducation = education.length;
    const fieldsToReset:any = {};
    for (let i = 1; i <= numEducation; i++) {
      fieldsToReset[`university-${i}`] = '';
      fieldsToReset[`courseName-${i}`] = '';
      fieldsToReset[`educationStart-${i}`] = '';
      fieldsToReset[`educationEnd-${i}`] = '';
    }
    form.resetFields(Object.keys(fieldsToReset));
    setEducation([]);
    message.success(EditCVs.education);
  };
  const handleDeleteProfessionalQualificationForm = () => {
    // form.resetFields();
    // setData({
    //   ...Data,
    //   FileData: {
    //     ...Data.FileData,
    //     qualification: [],
    //   },
    // });
    const numProfessionalQualification = professionalQualification.length;
    const fieldsToReset:any = {};
    for (let i = 1; i <= numProfessionalQualification; i++) {
      fieldsToReset[`Q-courseName-${i}`] = '';
      fieldsToReset[`Q-university-${i}`] = '';
      fieldsToReset[`Q-educationStart-${i}`] = '';
      fieldsToReset[`Q-educationEnd-${i}`] = '';
    }
    form.resetFields(Object.keys(fieldsToReset));
    setProfessionalQualification([]);
    message.success(EditCVs.qualification);
  };
  const handleDeleteProjectForm = () => {
 const numProject = project.length;
    const fieldsToReset:any = {};
    for (let i = 1; i <= numProject; i++) {
      fieldsToReset[`projectName-${i}`] = '';
      fieldsToReset[`role-${i}`] = '';
      fieldsToReset[`projectStart-${i}`] = '';
      fieldsToReset[`projectEnd-${i}`] = '';
      fieldsToReset[`projectList-${i}`] = '';

    }
    form.resetFields(Object.keys(fieldsToReset));
    setProject([]);
    // form.resetFields();
    // setData({
    //   ...Data,
    //   FileData: {
    //     ...Data.FileData,
    //     projects: [],
    //   },
    // });
    message.success(EditCVs.project);
  };
  const handleDeleteSkillForm = () => {
    form.setFieldsValue({ 'skillList': '' });

    message.success(EditCVs.skill);
  };
  const handleDeleteLanguageForm = () => {
    const numLanguage = language.length;
    const fieldsToReset:any = {};
    for (let i = 1; i <= numLanguage; i++) {
      fieldsToReset[`Language-${i}`] = '';
      fieldsToReset[`fluency-${i}`] = '';
    }
    form.resetFields(Object.keys(fieldsToReset));
    setLanguage([]);
    // form.resetFields();
    // setData({
    //   ...Data,
    //   FileData: {
    //     ...Data.FileData,
    //     languages: [],
    //   },
    // });
    message.success(EditCVs.language);
  };
  const deleteHandlers: any = {
    summary: handleDeleteSummaryForm,
    experience: handleDeleteExperienceForm,
    education: handleDeleteEducationForm,
    project: handleDeleteProjectForm,
    skill: handleDeleteSkillForm,
    language: handleDeleteLanguageForm,
    qualification: handleDeleteProfessionalQualificationForm,
  };

  // Delete Functions for delete whole sections
  const handleDelete = () => {
    const deleteFunction = deleteHandlers[deleteType];
    if (deleteFunction) {
      deleteFunction();
      setDeleteModalOpen(false);
    } else {
      console.error(`No delete handler found for value: `);
    }
    setDeleteType("");
  };

  // undo btn functionality
  const handleUndoButtonClick = () => {
    document.execCommand("undo", false, "");
  };

  // redo btn functionality
  const handleRedoButtonClick = () => {
    document.execCommand("redo", false, "");
  };

  // -------- Present and past date functions --------
  const handlePresentClick = (index: number) => {
    // Work experience present function
    if (form.getFieldValue(`workingEnd-${index}`) === "present") {
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.toLocaleString("default", {
        month: "long",
      })} ${currentDate.getFullYear()}`;
      form.setFieldsValue({
        [`workingEnd-${index}`]: currentMonthYear,
      });
      setFormData({
        ...formData,
        [`workingEnd-${index}`]: currentMonthYear,
      });
    } else {
      form.setFieldsValue({
        [`workingEnd-${index}`]: "present",
      });
      setFormData({
        ...formData,
        [`workingEnd-${index}`]: "present",
      });
    }
  };
  // Education present function
  const handlePresentClickEducation = (index: number) => {
    if (form.getFieldValue(`educationEnd-${index}`) === "present") {
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.toLocaleString("default", {
        month: "long",
      })} ${currentDate.getFullYear()}`;
      form.setFieldsValue({
        [`educationEnd-${index}`]: currentMonthYear,
      });
      setFormData({
        ...formData,
        [`educationEnd-${index}`]: currentMonthYear,
      });
    } else {
      form.setFieldsValue({
        [`educationEnd-${index}`]: "present",
      });
      setFormData({
        ...formData,
        [`educationEnd-${index}`]: "present",
      });
    }
  };

  // Qualification present function
  const handlePresentQualification = (index: number) => {
    if (form.getFieldValue(`Q-educationEnd-${index}`) === "present") {
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.toLocaleString("default", {
        month: "long",
      })} ${currentDate.getFullYear()}`;
      form.setFieldsValue({
        [`Q-educationEnd-${index}`]: currentMonthYear,
      });
      setFormData({
        ...formData,
        [`Q-educationEnd-${index}`]: currentMonthYear,
      });
    } else {
      form.setFieldsValue({
        [`Q-educationEnd-${index}`]: "present",
      });
      setFormData({
        ...formData,
        [`Q-educationEnd-${index}`]: "present",
      });
    }
  };

  // Project present function
  const handlePresentClickProject = (index: number) => {
    if (form.getFieldValue(`projectEnd-${index}`) === "present") {
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.toLocaleString("default", {
        month: "long",
      })} ${currentDate.getFullYear()}`;
      form.setFieldsValue({
        [`projectEnd-${index}`]: currentMonthYear,
      });
      setFormData({
        ...formData,
        [`projectEnd-${index}`]: currentMonthYear,
      });
    } else {
      form.setFieldsValue({
        [`projectEnd-${index}`]: "present",
      });
      setFormData({
        ...formData,
        [`projectEnd-${index}`]: "present",
      });
    }
  };

  return (
    <>
      {loader ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "420px",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="main-form-container"
          onChange={handleOnchange}
          // contentEditable={true}
        >
          <div className="edit-cv-main">
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "28px",
                marginLeft: "10px",
                marginTop: "8px",
                fontFamily: "General Sans",
              }}
            >
               CV
            </span>
            <div className="undo-redo-save-grp">
              <Tooltip title="Undo" placement="bottom">
                <Button className="undo-redo-btn">
                  <Image src={Undo} alt="" onClick={handleUndoButtonClick} />
                </Button>
              </Tooltip>
              <Tooltip title="Redo" placement="bottom">
                <Button
                  className="undo-redo-btn"
                  onClick={handleRedoButtonClick}
                >
                  <Image src={Redo} alt="" />
                </Button>
              </Tooltip>
              <Button className="save-cv-edit-btn" htmlType="submit">
                Save{" "}
                {loading && (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 24, color: "white" }}
                        spin
                      />
                    }
                  />
                )}
              </Button>
            </div>
          </div>
          <div className="edit-cv">
            <div className="edit-info-section">
              <div className="edit-cv-heading">
                <p className="edit-cv-heading-text">{`${DETAILS.P}`}</p>
              </div>
              <div className="edit-cv-form">
                <Form.Item
                  label={DETAILS.REF.LABEL}
                  name={DETAILS.REF.NAME}
                  className="w-50"
                >
                  <Input placeholder={DETAILS.REF.PLACEHOLDER} />
                </Form.Item>
                <Form.Item
                  label={DETAILS.NAME.LABEL}
                  name={DETAILS.NAME.NAME}
                  className="w-50 remove-mr"
                >
                  <Input placeholder={DETAILS.NAME.PLACEHOLDER} />
                </Form.Item>
                <Form.Item
                  label={DETAILS.GENDER.LABEL}
                  name={DETAILS.GENDER.NAME}
                  className="w-50"
                >
                  <Input placeholder={DETAILS.GENDER.PLACEHOLDER} />
                </Form.Item>

                <Form.Item
                  label={DETAILS.NATION.LABEL}
                  name={DETAILS.NATION.NAME}
                  className="w-50 remove-mr"
                >
                  <Input placeholder={DETAILS.NATION.PLACEHOLDER} />
                </Form.Item>
                <Form.Item
                  label={DETAILS.LATEST_SALARY.LABEL}
                  name={DETAILS.LATEST_SALARY.NAME}
                  className="w-50"
                >
                  <Input placeholder={DETAILS.LATEST_SALARY.PLACEHOLDER} />
                </Form.Item>

                <Form.Item
                  label={DETAILS.FIRST_NAME.LABEL}
                  name={DETAILS.FIRST_NAME.NAME}
                  className="w-50 remove-mr"
                >
                  <Input placeholder={DETAILS.FIRST_NAME.PLACEHOLDER} />
                </Form.Item>
                <Form.Item
                  label={DETAILS.EXPECT_SALARY.LABEL}
                  name={DETAILS.EXPECT_SALARY.NAME}
                  className="w-50"
                >
                  <Input placeholder={DETAILS.EXPECT_SALARY.PLACEHOLDER} />
                </Form.Item>

                <Form.Item
                  label={DETAILS.PERIOD.LABEL}
                  name={DETAILS.PERIOD.NAME}
                  className="w-50 remove-mr"
                >
                  <Input placeholder={DETAILS.PERIOD.PLACEHOLDER} />
                </Form.Item>
              </div>
            </div>
            {Data?.FileData?.summary && Data.FileData.summary.length !== 0 && (
              <div className="executive-summary-section">
                <div className="edit-cv-heading">
                  <div className="edit-cv-heading-child">
                    <p className="edit-cv-heading-text">{`${EXE_SUMMARY.P}`}</p>
                  </div>
                  <div>
                    <Tooltip title="Delete executive summary">
                      <Icon
                        component={deleteSvg}
                        // onClick={handleDeleteSummaryForm}
                        onClick={() => {
                          setDeleteType("summary");
                          setDeleteModalOpen(true);
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Form.Item
                    className="w-100"
                    name={EXE_SUMMARY.SUMMARY.NAME}
                    label={EXE_SUMMARY.SUMMARY.LABEL}
                  >
                    <TextArea
                      placeholder={EXE_SUMMARY.SUMMARY.PLACEHOLDER}
                      className="edit-cv-textarea"
                    />
                  </Form.Item>
                </div>
              </div>
            )}

            {/* ..............................Add Working Experience section .................................*/}

            {Data?.FileData?.experience &&
              Data.FileData.experience.length !== 0 && (
                <div className="working-experience-section">
                  <div className="edit-cv-heading ">
                    <div className="edit-cv-heading-child">
                      <p className="edit-cv-heading-text">{`${EXPERIENCE.P}`}</p>
                    </div>
                    <div>
                      <Tooltip title="Delete working experience">
                        <Icon
                          component={deleteSvg}
                          onClick={() => {
                            setDeleteType("experience");
                            setDeleteModalOpen(true);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {workingExperience?.map((val: any, index: any) => {
                    return (
                      <div key={index} className="working-experience-form">
                        <div className="working-ex-tag">
                          <div className="working-ex-tag-delete w-100">
                            <span>
                              {`${EXPERIENCE.P}`} {index + 1}
                            </span>
                            {index > 0 && (
                              <span
                                onClick={() =>
                                  workingExperience.length > 1 &&
                                  handleDeleteExperience(
                                    val?.workingExperience,
                                    val.title
                                  )
                                }
                                className="delete-icon"
                              >
                                <Icon component={DeleteIcon} />
                              </span>
                            )}
                          </div>

                          <Form.Item
                            label={EXPERIENCE.COMPANY.LABEL}
                            name={`${EXPERIENCE.COMPANY.NAME}-${index + 1}`}
                            className="w-50"
                          >
                            <Input
                              placeholder={EXPERIENCE.COMPANY.PLACEHOLDER}
                            />
                          </Form.Item>

                          <Form.Item
                            label={EXPERIENCE.POSITION.LABEL}
                            name={`${EXPERIENCE.POSITION.NAME}-${index + 1}`}
                            className="w-50 remove-mr"
                          >
                            <Input
                              placeholder={EXPERIENCE.POSITION.PLACEHOLDER}
                            />
                          </Form.Item>
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <Form.Item
                              label={EXPERIENCE.START.LABEL}
                              name={`${EXPERIENCE.START.NAME}-${index + 1}`}
                              className="w-50"
                            >
                              <Input
                                placeholder={EXPERIENCE.START.PLACEHOLDER}
                              />
                            </Form.Item>
                            <Form.Item
                              // className="w-100"
                              style={{
                                position: "absolute",
                                right: "0",
                                top: "-10px",
                              }}
                            >
                              <div className="end-date-checkbox">
                                <div className="present">
                                  Present
                                  <Checkbox
                                    checked={
                                      formData?.[
                                        `${EXPERIENCE.END.NAME}-${index + 1}`
                                      ]?.toLowerCase() === "present"
                                    }
                                    onChange={() =>
                                      handlePresentClick(index + 1)
                                    }
                                  ></Checkbox>
                                </div>
                              </div>
                            </Form.Item>

                            <Form.Item
                              label={EXPERIENCE.END.LABEL}
                              name={`${EXPERIENCE.END.NAME}-${index + 1}`}
                              className="w-50 remove-mr checkbox-wrapper"
                              style={{ position: "relative" }}
                            >
                              <Input placeholder={EXPERIENCE.END.PLACEHOLDER} />
                            </Form.Item>
                          </div>

                          <div className="w-100">
                            <Form.Item
                              className="w-100"
                              label={EXPERIENCE.DESCRIPTION.LABEL}
                              name={`${EXPERIENCE.DESCRIPTION.NAME}-${
                                index + 1
                              }`}
                            >
                              <TextArea
                                placeholder={EXPERIENCE.DESCRIPTION.PLACEHOLDER}
                                className="edit-cv-textarea"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="add-working-ex-btn">
                    <Button
                      className="add-custom-fields-btn working-ex-btn"
                      onClick={handleAddExperience}
                    >
                      <span className="plus-icon">
                        <Image src={PlusIcon} alt="Plus-icon" />
                      </span>
                      {`${EXPERIENCE.P1}`}
                    </Button>
                  </div>
                </div>
              )}

            {/* ..............................Add Education section .................................*/}
            {Data?.FileData?.education &&
              Data.FileData.education.length !== 0 && (
                <div className="working-experience-section">
                  <div className="edit-cv-heading">
                    <div className="edit-cv-heading-child">
                      <p className="edit-cv-heading-text">{EDUCATION.P}</p>
                    </div>
                    <div>
                      <Tooltip title="Delete Education">
                        <Icon
                          component={deleteSvg}
                          onClick={() => {
                            setDeleteType("education");
                            setDeleteModalOpen(true);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {education?.map((val: any, index: any) => {
                    return (
                      <div key={index} className="working-experience-form">
                        <div className="working-ex-tag">
                          <div className="working-ex-tag-delete w-100">
                            <span>
                              {`${EDUCATION.P}`} {index + 1}
                            </span>
                            {index > 0 && (
                              <span
                                onClick={() =>
                                  education.length > 1 &&
                                  handleDeleteEducation(
                                    val?.education,
                                    val?.title
                                  )
                                }
                                className="delete-icon"
                              >
                                <Icon component={DeleteIcon} />
                              </span>
                            )}
                          </div>

                          <Form.Item
                            label={EDUCATION.UNIVERSITY.LABEL}
                            name={`${EDUCATION.UNIVERSITY.NAME}-${index + 1}`}
                            className="w-50"
                          >
                            <Input
                              placeholder={EDUCATION.UNIVERSITY.PLACEHOLDER}
                            />
                          </Form.Item>

                          <Form.Item
                            label={EDUCATION.COURSE.LABEL}
                            name={`${EDUCATION.COURSE.NAME}-${index + 1}`}
                            className="w-50 remove-mr"
                          >
                            <Input placeholder={EDUCATION.COURSE.PLACEHOLDER} />
                          </Form.Item>
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <Form.Item
                              label={EDUCATION.START.LABEL}
                              name={`${EDUCATION.START.NAME}-${index + 1}`}
                              className="w-50"
                            >
                              <Input
                                placeholder={EDUCATION.START.PLACEHOLDER}
                              />
                            </Form.Item>
                            <Form.Item
                              style={{
                                position: "absolute",
                                right: "0",
                                top: "-10px",
                              }}
                            >
                              <div className="end-date-checkbox">
                                <div className="present">
                                  Present
                                  <Checkbox
                                    checked={
                                      formData[
                                        `${EDUCATION.END.NAME}-${index + 1}`
                                      ]?.toLowerCase() === "present"
                                    }
                                    onChange={() =>
                                      handlePresentClickEducation(index + 1)
                                    }
                                  ></Checkbox>
                                </div>
                              </div>
                            </Form.Item>
                            <Form.Item
                              label={EDUCATION.END.LABEL}
                              name={`${EDUCATION.END.NAME}-${index + 1}`}
                              className="w-50 remove-mr"
                              style={{ position: "relative" }}
                            >
                              <Input placeholder={EDUCATION.END.PLACEHOLDER} />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="add-working-ex-btn">
                    <Button
                      className="add-custom-fields-btn working-ex-btn"
                      onClick={handleAddEducation}
                    >
                      <span className="plus-icon">
                        <Image src={PlusIcon} alt="Plus-icon" />
                      </span>
                      {`${EDUCATION.P1}`}
                    </Button>
                  </div>
                </div>
              )}

            {/* ..............................Add Skills Section .................................*/}
            {Data?.FileData?.skills && Data.FileData.skills.length !== 0 && (
              <div className="working-experience-section">
                <div className="edit-cv-heading">
                  <div className="edit-cv-heading-child">
                    <p className="edit-cv-heading-text">{SKILLS.P}</p>
                  </div>
                  <div>
                    <Tooltip title="Delete Skill">
                      <Icon
                        component={deleteSvg}
                        onClick={() => {
                          setDeleteModalOpen(true);
                          setDeleteType("skill");
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="w-100">
                  <Form.Item
                    name={SKILLS.SKILL.NAME}
                    className="w-100"
                    label={SKILLS.SKILL.LABEL}
                  >
                    <TextArea
                      placeholder={SKILLS.SKILL.PLACEHOLDER}
                      className="edit-cv-textarea"
                    />
                  </Form.Item>
                </div>
              </div>
            )}
            {/* ----------------------Language Section---------------------- */}
            {Data?.FileData?.languages &&
              Data.FileData.languages.length !== 0 && (
                <div className="working-experience-section">
                  <div className="edit-cv-heading">
                    <div className="edit-cv-heading-child">
                      <p className="edit-cv-heading-text">{LANGUAGES.P}</p>
                    </div>
                    <div>
                      <Tooltip title="Delete Language">
                        <Icon
                          component={deleteSvg}
                          onClick={() => {
                            setDeleteModalOpen(true);
                            setDeleteType("language");
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {language.map((val: any, index: any) => {
                    return (
                      <>
                        {" "}
                        <div key={index} className="working-experience-form">
                          <div className="working-ex-tag">
                            <div className="working-ex-tag-delete w-100">
                              <span>
                                {`${LANGUAGES.P}`} {index + 1}
                              </span>
                              {index > 0 && (
                                <span
                                  onClick={() =>
                                    language.length > 1 &&
                                    handleDeleteLanguage(val?.language)
                                  }
                                  className="delete-icon"
                                >
                                  <Icon component={DeleteIcon} />
                                </span>
                              )}
                            </div>

                            <Form.Item
                              label={LANGUAGES.LANGUAGE.LABEL}
                              name={`${LANGUAGES.LANGUAGE.NAME}-${index + 1}`}
                              className="w-50"
                            >
                              <Input
                                placeholder={LANGUAGES.LANGUAGE.PLACEHOLDER}
                              />
                            </Form.Item>

                            <Form.Item
                              label={LANGUAGES.FLUENCY.LABEL}
                              name={`${LANGUAGES.FLUENCY.NAME}-${index + 1}`}
                              className="w-50 remove-mr"
                            >
                              <Input
                                placeholder={LANGUAGES.FLUENCY.PLACEHOLDER}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </>
                    );
                  })}
                  <div className="add-working-ex-btn">
                    <Button
                      className="add-custom-fields-btn working-ex-btn"
                      onClick={handleAddLanguage}
                    >
                      <span className="plus-icon">
                        <Image src={PlusIcon} alt="Plus-icon" />
                      </span>
                      {`${LANGUAGES.P1}`}
                    </Button>
                  </div>
                </div>
              )}
            {/* ----------------------Qualification Section---------------------- */}

            {Data?.FileData?.qualification &&
              Data.FileData.qualification.length !== 0 && (
                <div className="working-experience-section">
                  <div className="edit-cv-heading">
                    <div className="edit-cv-heading-child">
                      <p className="edit-cv-heading-text">
                        Professional Qualification
                      </p>
                    </div>
                    <div>
                      <Tooltip title="Delete Qualification">
                        <Icon
                          component={deleteSvg}
                          onClick={() => {
                            setDeleteType("qualification");
                            setDeleteModalOpen(true);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {professionalQualification?.map((val: any, index: any) => {
                    return (
                      <div key={index} className="working-experience-form">
                        <div className="working-ex-tag">
                          <div className="working-ex-tag-delete w-100">
                            <span>
                              {QUALIFICATION.P2} {index + 1}
                            </span>
                            {index > 0 && (
                              <span
                                onClick={() =>
                                  professionalQualification.length > 1 &&
                                  handleDeleteQualification(
                                    val?.professionalQualification,
                                    val?.title
                                  )
                                }
                                className="delete-icon"
                              >
                                <Icon component={DeleteIcon} />
                              </span>
                            )}
                          </div>

                          <Form.Item
                            label={QUALIFICATION.COLLEGE.LABEL}
                            name={`${QUALIFICATION.COLLEGE.NAME}-${index + 1}`}
                            className="w-50"
                          >
                            <Input
                              placeholder={QUALIFICATION.COLLEGE.PLACEHOLDER}
                            />
                          </Form.Item>

                          <Form.Item
                            label={QUALIFICATION.COURSE.LABEL}
                            name={`${QUALIFICATION.COURSE.NAME}-${index + 1}`}
                            className="w-50 remove-mr"
                          >
                            <Input
                              placeholder={QUALIFICATION.COURSE.PLACEHOLDER}
                            />
                          </Form.Item>
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <Form.Item
                              label={QUALIFICATION.START.LABEL}
                              name={`${QUALIFICATION.START.NAME}-${index + 1}`}
                              className="w-50"
                            >
                              <Input
                                placeholder={QUALIFICATION.START.PLACEHOLDER}
                              />
                            </Form.Item>
                            <Form.Item
                              style={{
                                position: "absolute",
                                right: "0",
                                top: "-10px",
                              }}
                            >
                              <div className="end-date-checkbox">
                                <div className="present">
                                  Present
                                  <Checkbox
                                    checked={
                                      formData[
                                        `${QUALIFICATION.END.NAME}-${index + 1}`
                                      ]?.toLowerCase() === "present"
                                    }
                                    onChange={() =>
                                      handlePresentQualification(index + 1)
                                    }
                                  ></Checkbox>
                                </div>
                              </div>
                            </Form.Item>
                            <Form.Item
                              label={QUALIFICATION.END.LABEL}
                              name={`${QUALIFICATION.END.NAME}-${index + 1}`}
                              className="w-50 remove-mr"
                              style={{ position: "relative" }}
                            >
                              <Input
                                placeholder={QUALIFICATION.END.PLACEHOLDER}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="add-working-ex-btn">
                    <Button
                      className="add-custom-fields-btn working-ex-btn"
                      onClick={handleAddQualification}
                    >
                      <span className="plus-icon">
                        <Image src={PlusIcon} alt="Plus-icon" />
                      </span>
                      {`${QUALIFICATION.P1}`}
                    </Button>
                  </div>
                </div>
              )}

            {/* ..............................Add Project section .................................*/}
            {Data?.FileData?.projects &&
              Data.FileData.projects.length !== 0 && (
                <div className="working-experience-section">
                  <div className="edit-cv-heading">
                    <div className="edit-cv-heading-child">
                      <p className="edit-cv-heading-text">{PROJECT.P}</p>
                    </div>
                    <div>
                      <Tooltip title="Delete Project">
                        <Icon
                          component={deleteSvg}
                          onClick={() => {
                            setDeleteModalOpen(true);
                            setDeleteType("project");
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {project.map((val: any, index: any) => {
                    return (
                      <div key={index} className="working-experience-form">
                        <div className="working-ex-tag">
                          <div className="working-ex-tag-delete w-100">
                            <span>
                              {PROJECT.P} {index + 1}
                            </span>
                            {index > 0 && (
                              <span
                                onClick={() =>
                                  project.length > 1 &&
                                  handleDeleteProject(val?.project, val?.title)
                                }
                                className="delete-icon"
                              >
                                <Icon component={DeleteIcon} />
                              </span>
                            )}
                          </div>

                          <Form.Item
                            label={PROJECT.PROJECT.LABEL}
                            name={`${PROJECT.PROJECT.NAME}-${index + 1}`}
                            className="w-50"
                          >
                            <Input placeholder={PROJECT.PROJECT.PLACEHOLDER} />
                          </Form.Item>

                          <Form.Item
                            label={PROJECT.ROLE.LABEL}
                            name={`${PROJECT.ROLE.NAME}-${index + 1}`}
                            className="w-50 remove-mr"
                          >
                            <Input placeholder={PROJECT.ROLE.PLACEHOLDER} />
                          </Form.Item>
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              flexWrap: "wrap",
                              width: "100%",
                            }}
                          >
                            <Form.Item
                              label={PROJECT.START.LABEL}
                              name={`${PROJECT.START.NAME}-${index + 1}`}
                              className="w-50"
                            >
                              <Input placeholder={PROJECT.START.PLACEHOLDER} />
                            </Form.Item>
                            <Form.Item
                              style={{
                                position: "absolute",
                                right: "0",
                                top: "-10px",
                              }}
                            >
                              <div className="end-date-checkbox">
                                <div className="present">
                                  Present
                                  <Checkbox
                                    checked={
                                      formData[
                                        `${PROJECT.END.NAME}-${index + 1}`
                                      ]?.toLowerCase() === "present"
                                    }
                                    onChange={() =>
                                      handlePresentClickProject(index + 1)
                                    }
                                  ></Checkbox>
                                </div>
                              </div>
                            </Form.Item>

                            <Form.Item
                              label={PROJECT.END.LABEL}
                              name={`${PROJECT.END.NAME}-${index + 1}`}
                              className="w-50 remove-mr"
                              style={{ position: "relative" }}
                            >
                              <Input placeholder={PROJECT.END.PLACEHOLDER} />
                            </Form.Item>
                          </div>

                          <div className="w-100">
                            <Form.Item
                              name={`${PROJECT.DESCRIPTION.NAME}-${index + 1}`}
                              className="w-100"
                              label={PROJECT.DESCRIPTION.LABEL}
                            >
                              <TextArea
                                placeholder={PROJECT.DESCRIPTION.PLACEHOLDER}
                                className="edit-cv-textarea"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="add-working-ex-btn">
                    <Button
                      className="add-custom-fields-btn working-ex-btn"
                      onClick={handleAddProject}
                    >
                      <span className="plus-icon">
                        <Image src={PlusIcon} alt="Plus-icon" />
                      </span>
                      {`${PROJECT.P1}`}
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </Form>
      )}

      {/* Delete Modal for delete section from form */}
      <Modal
        title={`Delete ${deleteType} details`}
        centered
        open={deleteModalOpen}
        onOk={() => setDeleteModalOpen(false)}
        onCancel={() => setDeleteModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setDeleteModalOpen(false)}>
            Keep
          </Button>,
          <Button key="submit" type="primary" onClick={handleDelete}>
            Delete
          </Button>,
        ]}
        className="delete-project-modal"
      >
        <p className="delete-text">
          This action will delete all {deleteType} details from this resume.
        </p>
        <p className="delete-text">Do you want to Delete ?</p>
      </Modal>
    </>
  );
}

export default EditCandidateCvForm;
