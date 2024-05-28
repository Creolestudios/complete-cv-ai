"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Spin, Tooltip, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import Icon from "@ant-design/icons";

import "@/components/Preview/PreviewHeader/previewHeader.css";
import { previewRoute } from "@/utils/apiRoute";
import { Popup, PopupError } from "@/utils/messagePopup";
import SaveIcon from "@/assets/images/SaveIcon";

const PreviewHeader = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState("Project_");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [projectNameChange, setProjectNameChange] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [error, setError] = useState("");

  //Download project zip
  const handleDownloadFile = async () => {
    try {
      setLoading(true);
      // Check if selectedCardId has a value
      try {
        const projectName =
          (typeof window !== "undefined" &&
            window.localStorage.getItem("ProjectName")) ||
          "Project_";
        const fileId =
          typeof window !== "undefined" && localStorage.getItem("file_id");
        const fileIdArray = fileId ? JSON.parse(fileId) : [];
        const userId: any = Number(
          typeof window !== "undefined" && window.localStorage.getItem("userId")
        );

        const requestData = {
          user_id: String(userId),
          projectName: projectName,
          files: fileIdArray.map((file: any) => ({
            file_id: file.file_id,
            candidate_name: file.file_name,
          })),
        };

        message.info(Popup.downloading);
        // Api request for get generated pdf url
        const response = await axios.post(
          previewRoute.downloadZip,
          requestData
        );
        const pdfURL = response.data.data.url;
        const link = document.createElement("a");
        link.href = pdfURL;
        link.click();
        message.success(Popup.downloadProject);
      } catch {
        console.log("selectedCardId is null or empty, skipping request");
      }
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
    } finally {
      setLoading(false);
    }
  };

  //Save to dashboard
  const handleSaveFile = async () => {
    try {
      const storedProjectName =
        typeof window !== "undefined" &&
        window.localStorage.getItem("ProjectName");
      const projectNameToSave = storedProjectName || "Project ";
      const userId: any = String(
        typeof window !== "undefined" && window.localStorage.getItem("userId")
      );
      const fileId =
        typeof window !== "undefined" && localStorage.getItem("file_id");
      const fileIdArray = fileId ? JSON.parse(fileId) : [];

      const data = {
        user_id: userId,
        projectName: projectNameToSave,
        files: [
          ...fileIdArray.map((file: any) => ({
            file_id: file.file_id,
            candidateFile_name: file.file_name,
            templateId: file.selectedCardId,
          })),
        ],
      };
      message.success(Popup.saving);
      const response = await axios.post(previewRoute.saveFile, data);
      if (response.status === 200) {
        message.success(Popup.saveProject);
      } else {
        message.error(PopupError.tryAgain);
      }
      // Additional logic after saving, if needed...
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleNameSave = () => {
    if (projectNameChange.length === 0) {
      setError("This field is required.");
    } else {
      typeof window !== "undefined" &&
        window.localStorage.setItem("ProjectName", projectNameChange);
      setEditableContent(projectNameChange);
      setModalOpen(false);
      setError("");
    }
  };

  // Delete project from preview page
  const handleProjectDelete = async () => {
    setLoading(true);
    try {
      const userId: any = Number(
        typeof window !== "undefined" && window.localStorage.getItem("userId")
      );
      const fileId =
        typeof window !== "undefined" && localStorage.getItem("file_id");
      const fileIdArray = fileId ? JSON.parse(fileId) : [];
      const requestData = {
        user_id: String(userId),
        file_ids: fileIdArray.map((file: any) => ({
          file_ids: file.file_id,
        })),
      };
      console.log("requestData-----------", requestData);
      const response = await axios
        .delete(previewRoute.deleteProject, {
          data: requestData,
        })
        .then((res) => {
          message.info(Popup.deleteProject);
          setLoading(false);
        });
      console.log(response);
    } catch (error) {
      console.error("Internal server error", error);
    }

    localStorage.removeItem("file_id");
    setDeleteModalOpen(false);
    router.push("/home");
  };

  useEffect(() => {
    const storedContent =
      typeof window !== "undefined" &&
      window.localStorage.getItem("ProjectName");
    setEditableContent(storedContent || "Project_");
    setProjectNameChange(storedContent || "Project_");
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <>
      {/* <Header /> */}
      {loading && (
        <div>
          <Spin fullscreen tip="Downloading..." size="large" />
        </div>
      )}
      <div className="candidate-filename">
        <div className="projectName-section">
          <div className="projectName-text">{editableContent}</div>

          <Modal
            title="Rename Project"
            centered
            open={modalOpen}
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            footer={[
              <Button key="back" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleNameSave}
              >
                Save
              </Button>,
            ]}
            className="edit-name-modal"
          >
            <Input
              type="text"
              value={projectNameChange}
              maxLength={30} //Project name length
              onChange={(e) => setProjectNameChange(e.target.value)}
            />

            {error && <p className="error-class">{error}</p>}
          </Modal>
          <div className="edit-btn-pen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              onClick={() => {
                setModalOpen(true);
                setError("");
                setProjectNameChange(editableContent);
              }}
              style={{ cursor: "pointer" }}
            >
              <path
                d="M8.6 4.57206L11.428 7.40072L4.828 14.0001H2V11.1714L8.6 4.57139V4.57206ZM9.54267 3.62939L10.9567 2.21472C11.0817 2.08974 11.2512 2.01953 11.428 2.01953C11.6048 2.01953 11.7743 2.08974 11.8993 2.21472L13.7853 4.10072C13.9103 4.22574 13.9805 4.39528 13.9805 4.57206C13.9805 4.74883 13.9103 4.91837 13.7853 5.04339L12.3707 6.45739L9.54267 3.62939Z"
                fill="#141416"
              />
            </svg>
          </div>
        </div>

        <div className="header-buttons">
          <Tooltip title="Download Project">
            <span onClick={handleDownloadFile}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 19H21V21H3V19ZM13 13.172L19.071 7.1L20.485 8.514L12 17L3.515 8.515L4.929 7.1L11 13.17V2H13V13.172Z"
                  fill="black"
                />
              </svg>
            </span>
          </Tooltip>
          <Tooltip title="Save to Dashboard">
            <span>
              <Icon component={SaveIcon} onClick={handleSaveFile} />
            </span>
          </Tooltip>

          <Tooltip title="Delete Project">
            <span onClick={() => setDeleteModalOpen(true)}>
              <svg
                // Delete button
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                {" "}
                <path
                  d="M7 4V2H17V4H22V6H20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"
                  fill="black"
                />
              </svg>
            </span>
          </Tooltip>
          <Modal
            title="Delete Project"
            centered
            open={deleteModalOpen}
            onOk={() => setDeleteModalOpen(false)}
            onCancel={() => setDeleteModalOpen(false)}
            footer={[
              <Button key="back" onClick={() => setDeleteModalOpen(false)}>
                Keep
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleProjectDelete}
              >
                {loading ? "" : "Delete"}
              </Button>,
            ]}
            className="delete-project-modal"
          >
            <p className="delete-text">
              This action will delete all the CVs uploaded.
            </p>
            <p className="delete-text">Do you want to continue?</p>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default PreviewHeader;
