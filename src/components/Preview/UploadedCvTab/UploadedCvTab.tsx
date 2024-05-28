import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Popover,
  Progress,
  Spin,
  Tabs,
  UploadProps,
  message,
} from "antd";
import axios from "axios";
import Image from "next/image";
import Dragger from "antd/es/upload/Dragger";
import { useRouter } from "next/navigation";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { MoreOutlined } from "@ant-design/icons";

import "./uploadedcvtab.css";
import penIcon from "../../../../public/assets/pen.svg";
import deleteIcon from "../../../../public/assets/Delete.svg";
import UploadIcon from "../../../../public/assets/Upload_svg.svg";
import Arrow from "../../../../public/assets/dashboard/filter.svg";
import uploadIcon from "../../../../public/assets/preview/document-upload.svg";
import { homeRoute, previewRoute } from "@/utils/apiRoute";
import { Popup, PopupError } from "@/utils/messagePopup";
import { usePdfViewer } from "../context/PdfViewerContext";

function UploadedCvTab({ setActiveCvKey, setCollapseDrawer }: any) {
  const router = useRouter();
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const { setShowPdf } = usePdfViewer();
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState("1");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [projectNameChange, setProjectNameChange] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [editableContent, setEditableContent] = useState("Project_");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [fileName, setFileName] = useState<any>([]);
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null); // Cancelling upload file api
  const [cancelConvertTokenSource, setCancelConvertTokenSource] =
    useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "active" | "success" | "normal" | "exception" | undefined
  >("active");
  const [previewStatus, setPreviewStatus] = useState<
    "active" | "success" | "normal" | "exception" | undefined
  >("active");
  const [pdfUrl, setPdfUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<any>({});
  const [intervalState, setIntervalState]: any = useState({});
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState("Upload");
  const [uploadProgress, setUploadProgress] = useState<any>({});
  const [isConvertButtonDisabled, setIsConvertButtonDisabled] =
    useState<boolean>(true);
  const [preview, setPreviewBtn] = useState<boolean>(false);
  const [uploadFileServer, setUploadFileServer] = useState("");
  const [previewFileServer, setPreviewFileServer] = useState<any>();
  const [selectedCardId, setSelectedCardId] = useState<any>(null);
  const [items, setItems] = useState<any>([]);
  const [fieldId, setFileIds] = useState<any>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [disabledUploadBtn, setDisabledUploadBtn] = useState<boolean>(false);
  const userId: any = Number(
    typeof window !== "undefined" && window.localStorage.getItem("userId")
  );
  // Interval for progressbar
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function openRenameCvPopup() {
    setModalOpen(true);
    setItems((prevItems: any) => {
      const selectedItem = prevItems.find(
        (item: any) => item.key === activeKey
      );
      if (!selectedItem) return prevItems;

      // Splitting the file name and extension
      const parts = selectedItem.label.split(".");
      const fileName = parts.slice(0, -1).join("."); // Joining all parts except the last one (extension)

      setProjectNameChange(fileName);

      return prevItems; // Returning the previous state to avoid unnecessary updates
    });
  }

  const content = (
    <div className="popup-content">
      <p className="rename-cv" prefix="" onClick={openRenameCvPopup}>
        <span className="icons">
          <Image src={penIcon} alt="Rename" />
        </span>{" "}
        Rename
      </p>
      <p className="delete-cv" onClick={() => setDeleteModalOpen(true)}>
        <span className="icons">
          <Image src={deleteIcon} alt="Delete" />
        </span>{" "}
        Delete
      </p>
    </div>
  );

  function onChangeKey(key: any) {
    console.log("onchange", key);
    setActiveKey(key);
    setActiveCvKey(key);
  }

  // handle cv name save
  const handleNameSave = () => {
    if (projectNameChange.length === 0) {
      setError("This field is required.");
    } else if (projectNameChange.includes(".")) {
      setError("File name cannot contain '.' character.");
    } else {
      const getItemToUpdate: any =
        typeof window !== undefined && localStorage.getItem("file_id");
      // Parse the string to JavaScript array
      const itemsToUpdate = JSON.parse(getItemToUpdate);

      // Update the file_name of the object at the specified index
      const activeKeyIndex = parseInt(activeKey) - 1;

      const updatedItems: any = items.map((item: any) => {
        if (item.key === activeKey) {
          // Split the label into file name and extension parts
          const parts = item.label.split(".");
          const extension = parts.pop(); // Remove the last part (extension)
          const updatedLabel = projectNameChange + "." + extension; // Concatenate the updated file name with the original extension
          const updatedFile = {
            ...item,
            label: updatedLabel,
          };
          itemsToUpdate[activeKeyIndex].file_name = updatedLabel;

          // Stringify the updated array and set it back to localStorage
          localStorage.setItem("file_id", JSON.stringify(itemsToUpdate));

          return updatedFile;
        } else {
          return item;
        }
      });

      setItems(updatedItems);
      setModalOpen(false);
      setError("");
    }
  };
  const handlePreviewPage = () => {
    router.push("/preview");
    setShowPreview(false);
  };
  const handleSecondModalClose = () => {
    setPreviewBtn(false);
    setShowPreview(false);
  };

  const handleModalClose = () => {
    setPreviewOpen(false);
    setFileName([]);
  };

  // handle delete cv
  const handleCvDelete = () => {
    // get file name from localStorage according to activeKey
    const activeKeyIndex = parseInt(activeKey) - 1;
    console.log("activeKeyIndex", activeKeyIndex);
    console.log("activeKey", activeKey);
    const getFileId: any =
      typeof window !== undefined && localStorage.getItem("file_id");
    // Parse the string to JavaScript array
    const getFileIdJSON = JSON.parse(getFileId);
    console.log("get file json", getFileIdJSON.length);
    const fileId = getFileIdJSON[activeKeyIndex]?.file_id;

    const body: any = {
      user_id: userId,
      file_id: fileId,
    };

    try {
      axios.delete(previewRoute.deleteCv, { data: body }).then((res) => {
        message.success(Popup.fileDelete);
      });
      const deleteCv = items.filter((item: any) => item.key !== activeKey);
      getFileIdJSON.splice(activeKeyIndex, 1);
      localStorage.setItem("file_id", JSON.stringify(getFileIdJSON));
      console.log("updated", getFileIdJSON);
      setItems(deleteCv);
      router.refresh();
      setActiveCvKey("1");
      setActiveKey("1");

      if (getFileIdJSON.length === 0) {
        router.push("/home");
      }
    } catch (error) {
      message.error(PopupError.tryAgain);
    }
    setDeleteModalOpen(false);
  };

  // Convert progressbar
  const startConvertProgress = (id: any) => {
    const interval = setInterval(() => {
      setPreviewProgress((prevValue: any) => {
        const newVal = prevValue?.[id] + Math.floor(Math.random() * 4) + 1;
        return { ...prevValue, [id]: newVal >= 95 ? 95 : newVal };
      });
    }, 2000);

    setIntervalState((prev: any) => ({
      ...prev,
      [id]: interval,
    }));
  };

  /// Convert Blob Data API
  const handleUpload = async () => {
    if (!isButtonClicked && isFileUploaded) {
      setShowPreview(true);
      setUploadModalVisible(true);
      setIsButtonClicked(true);

      // get file id from localStorage
      const storedFilesJson = window.localStorage.getItem("file_id");
      const storedFiles = storedFilesJson ? JSON.parse(storedFilesJson) : [];

      const storedData = window.localStorage.getItem("SelectedCardID");
      const selectedCardId = storedData
        ? JSON.parse(storedData).selectedCardID
        : null;

      const formDataArray = storedFiles.map((file: any) => {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("filenamePrefix", selectedCardId);
        formData.append("file_id", file.file_id);
        formData.append("file_name", file?.file_name);
        return { formData, file_id: file.file_id, file_name: file?.file_name };
      });
      // Set initial progress value for each file
      storedFiles.forEach((file: any) => {
        setPreviewProgress((prevProgress: any) => ({
          ...prevProgress,
          [file.file_name]: 0,
        }));
      });

      const cancelToken = axios.CancelToken;
      const source = cancelToken.source();
      setCancelTokenSource(source);

      // Send all requests simultaneously
      const requests = formDataArray.map(
        ({ formData, file_id, file_name }: any) =>
          axios.post(homeRoute.ConvertBlobData, formData, {
            //convertData
            onUploadProgress: (progressEvent) => {
              startConvertProgress(file_name);
            },
            cancelToken: source.token,
          })
      );

      try {
        const responses = await Promise.all(requests);

        responses.map((response, index) => {
          const file_id = response?.data?.fileId;
          const file_name = response?.data?.file_name;
          setPreviewFileServer(file_name);
          setFileName((prevFileName: any) => {
            const updatedFileName = [...prevFileName];
            const index = updatedFileName.findIndex(
              (item) => item.name === file_name
            );
            if (index !== -1) {
              updatedFileName[index] = {
                ...updatedFileName[index],
                file_id: file_id,
              };
            }
            return updatedFileName;
          });
        });
        message.success(Popup.convertSuccess);
        router.push("/preview");
        setFileName([]);
        setUploadModalVisible(false);
        setIsButtonClicked(false);
        setShowPreview(false);
      } catch (error) {
        // message.error('Something went wrong!')
        console.error("Error during converting file:", error);
        // setPreviewStatus('exception');
      }
    } else {
      setShowProgress(false);
      setPreviewStatus("exception");
      message.error(PopupError.Internal);
    }
  };

  // before upload file handler
  const beforeUploadHandler = (file: any) => {
    const allowedFileTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const isValidFileType = allowedFileTypes.includes(file.type);
    if (!isValidFileType) {
      message.error(PopupError.validFile);
    }
    return isValidFileType;
  };

  // progress for upload file
  const startProgress = (id: any) => {
    const interval = setInterval(() => {
      setUploadProgress((prevValue: any) => {
        const newVal = prevValue?.[id] + Math.floor(Math.random() * 4) + 1;
        return { ...prevValue, [id]: newVal >= 95 ? 95 : newVal };
      });
    }, 2000);

    setIntervalState((prev: any) => ({
      ...prev,
      [id]: interval,
    }));
  };

  // candidate file preview
  const handlePreview = async (fileName: any) => {
    setPreviewOpen(true);
    setLoading(true);
    try {
      // Retrieve the files from local storage
      const storedFilesJson = window.localStorage.getItem("file_id");
      const storedFiles = storedFilesJson ? JSON.parse(storedFilesJson) : [];
      // Find the file_id corresponding to the provided fileName
      const file: any = storedFiles.find(
        (file: any) => file.file_name === fileName
      );
      if (!file) {
        console.error("File not found in local storage");
        return;
      }

      // Extract the file_id
      const fileId = file.file_id;

      // Create form data and append required data
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("file_id", fileId);

      // Api request for getting the generated pdf url
      const response = await axios.post(homeRoute.PreviewCv, formData);
      setPdfUrl(response.data.result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error handling preview:", error);
      message.error(PopupError.candidateFileErr);
    }
  };

  useEffect(() => {
    if (preview) {
      Object.values(intervalState).forEach((interval: any) =>
        clearInterval(interval)
      );
      setIntervalState({});
      setPreviewProgress({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  /// upload file api
  const customRequestHandler = async (file: any) => {
    const storedData = window.localStorage.getItem("SelectedCardID");
    const CardId = storedData ? JSON.parse(storedData).selectedCardID : null;
    setSelectedCardId(CardId);
    setShowProgress(true);

    const fileNameExists = fileName.some(
      (item: any) => item.name === file.name
    );
    if (fileNameExists) {
      message.error(`File ${file.name} already exists.`);
      return;
    }

    setFileName((prev: any) => [
      ...prev,
      {
        name: file?.name,
        progress: uploadProgress,
      },
    ]);

    // Set up cancellation token
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    setCancelTokenSource(source);
    try {
      const CandidateFile = window.localStorage.setItem(
        "CandidateFileName",
        file.name
      );
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);

      if (selectedCardId !== null) {
        formData.append("cardId", selectedCardId);
      }

      setUploadProgress((prevProgress: any) => ({
        ...prevProgress,
        [file?.name]: 0,
      }));

      const response = await axios.post(homeRoute.Upload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          startProgress(file?.name);
        },
        cancelToken: source.token,
      });

      // Extract file_id and file_name from the response
      const { file_id, file_name, isProgress } = response.data;

      setUploadFileServer(file_name);

      // Set the file_name and isProgress in fileName state
      setFileName((prevFileName: any) => {
        const updatedFileName = [...prevFileName];
        const index = updatedFileName.findIndex(
          (item) => item.name === file_name
        );

        if (index !== -1) {
          updatedFileName[index] = {
            ...updatedFileName[index],
            isProgress: isProgress,
          };
        }
        return updatedFileName;
      });

      // Update the state with the new file_id
      setFileIds((prevFileIds: any) => [...prevFileIds, file_id]);

      const storedFileIdsJson =
        typeof window !== "undefined" && window.localStorage.getItem("file_id");

      let storedFileIds: any = storedFileIdsJson
        ? JSON.parse(storedFileIdsJson)
        : [];
      const selectedCardIdObj = {
        file_id,
        file_name,
        selectedCardId: String(CardId),
      };
      storedFileIds.push(selectedCardIdObj);

      // If the number of stored file IDs exceeds 5, truncate the array to keep only the latest 5
      if (storedFileIds.length > 5) {
        storedFileIds = storedFileIds.slice(-5);
      }
      typeof window !== "undefined" &&
        window.localStorage.setItem("file_id", JSON.stringify(storedFileIds));

      setUploadProgress((prev: any) => {
        if (file.name === file_name) {
          return { ...prev, [file.name]: 100 };
        }
      });
      clearInterval(intervalState[file.name]);
      setIsFileUploaded(true);
      message.success(Popup.cvUploadSuccess);
      setUploadedFileName(file.name);
      setFilePreviewUrl(URL.createObjectURL(file));
      setModalContent(`Upload - ${selectedCardId} - ${file.file.name}`);
      setIsConvertButtonDisabled(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        message.error(PopupError.upload);
        // Handle cancellation or clean-up if needed
      } else {
        setShowProgress(false);
        setUploadStatus("exception");
        console.log("Error", error);
        setIsConvertButtonDisabled(true);
      }
    } finally {
      clearInterval(intervalState[file.name]);
      setShowProgress(false);
    }
  };

  const isAnyFileInProgress = Object.values(uploadProgress)
    .filter((progress: any) => !isNaN(progress))
    .some((progress) => progress !== 100);

  useEffect(() => {
    clearInterval(intervalState[uploadFileServer]);
    setUploadProgress((prevProgress: any) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[uploadFileServer];
      return updatedProgress;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFileServer]);

  useEffect(() => {
    clearInterval(intervalState[previewFileServer]);
    setPreviewProgress((prevProgress: any) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[previewFileServer];
      return updatedProgress;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewFileServer]);

  const combinedProps: UploadProps = {
    beforeUpload: beforeUploadHandler,
    onChange(info: any) {
      const { status } = info.file;
      if (status !== "uploading") {
        // console.log('this', info.file, info.filelist);
      }
      if (status === "done") {
        // message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        // message.error(`${info.file.name} file upload failed.`);
      }
    },
    multiple: false,
    maxCount: 3,
    accept: ".pdf,.docx,.doc",
  };

  // close icon for antd
  const customCloseIcon = (
    <div onClick={handleModalClose}>
      <Image
        src="assets/close-circle.svg"
        alt="Close Icon"
        width={26}
        height={26}
        style={{ width: "26px", height: "26px", cursor: "pointer !important" }}
      />
    </div>
  );

  useEffect(() => {
    if (fileName?.length >= 5) {
      setDisabledUploadBtn(true);
    } else {
      setDisabledUploadBtn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName?.length >= 5]);

  // Cancel upload progress bar
  const handleProgressbarClose2 = (id: any) => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Upload canceled by user");
    }

    const storedFilesJson =
      typeof window !== "undefined" && window.localStorage.getItem("file_id");
    const storedFiles = storedFilesJson ? JSON.parse(storedFilesJson) : [];
    const updatedStoredFiles = storedFiles.filter(
      (file: any) => file.file_name !== id
    );
    const updatedValues =
      typeof window !== "undefined" &&
      window.localStorage.setItem(
        "file_id",
        JSON.stringify(updatedStoredFiles)
      );

    // Remove the filename from the array
    setFileName((prevFileName: any) => {
      const updatedFileName = prevFileName.filter(
        (file: any) => file.name !== id
      );
      return updatedFileName;
    });

    // Remove the corresponding upload progress if it exists
    setUploadProgress((prevProgress: any) => {
      const { [id]: valueToRemove, ...rest } = prevProgress;
      return { ...rest };
    });

    setShowPreview(false);
  };

  // Cancel convert progress bar
  const handleConvertProgressbarClose = (id: any) => {
    const storedFilesJson =
      typeof window !== "undefined" && window.localStorage.getItem("file_id");
    const storedFiles = storedFilesJson ? JSON.parse(storedFilesJson) : [];
    const updatedStoredFiles = storedFiles.filter(
      (file: any) => file.file_name !== id
    );
    const updatedValues =
      typeof window !== "undefined" &&
      window.localStorage.setItem(
        "file_id",
        JSON.stringify(updatedStoredFiles)
      );

    setFileName((prevFileName: any) => {
      const updatedFileName = prevFileName.filter(
        (file: any) => file.name !== id
      );
      if (updatedFileName.length === 0) {
        setShowPreview(false);
        if (cancelTokenSource) {
          cancelTokenSource.cancel("Upload canceled by user");
        }
      }
      return updatedFileName;
    });

    setPreviewProgress((prevProgress: any) => {
      const { [id]: valueToRemove, ...rest } = prevProgress;
      return { ...rest };
    });
  };

  useEffect(() => {
    const fileIds: any =
      typeof window !== "undefined" && localStorage.getItem("file_id");
    const fileIdArray = fileIds ? JSON.parse(fileIds) : [];

    const newItems = fileIdArray?.map((item: any, index: any) => ({
      label: item?.file_name,
      key: (index + 1).toString(),
      icon:
        activeKey === (index + 1).toString() ? (
          <Popover
            placement="bottom"
            title=""
            trigger="click"
            content={content}
            className="rename-delete-cv-popover"
          >
            <MoreOutlined />{" "}
          </Popover>
        ) : (
          <span></span>
        ),
    }));

    setItems(newItems);
    setShowPdf(true);
  }, [activeKey]);

  useEffect(() => {
    if (!showProgress) {
      const fileIds: any =
        typeof window !== "undefined" && localStorage.getItem("file_id");
      const fileIdArray = fileIds ? JSON.parse(fileIds) : [];

      const newItems = fileIdArray?.map((item: any, index: any) => ({
        label: item?.file_name,
        key: (index + 1).toString(),
        icon:
          activeKey === (index + 1).toString() ? (
            <Popover
              placement="bottom"
              title=""
              trigger="click"
              content={content}
              className="rename-delete-cv-popover"
            >
              <MoreOutlined />{" "}
            </Popover>
          ) : (
            <span></span>
          ),
      }));

      setItems(newItems);
    }
  }, [uploadFileServer]);

  return (
    <>
      <div className="vertical-tabs">
        <Tabs
          defaultActiveKey="0"
          tabPosition="left"
          style={
            {
              // height: 859,
              //   width: 214,
            }
          }
          onChange={onChangeKey}
          items={items}
          moreIcon
          activeKey={activeKey}
        />

        {/* ................Edit cv name modal..................... */}
        <Modal
          title="Rename Candidate's CV"
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
            maxLength={30}
            onChange={(e) => setProjectNameChange(e.target.value)}
          />

          {error && <p className="error-class">{error}</p>}
        </Modal>

        {/* ................Delete modal..................... */}
        <Modal
          title="Delete Candidate's CV"
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
              onClick={handleCvDelete}
            >
              Delete
            </Button>,
          ]}
          className="delete-project-modal"
        >
          <p className="delete-text">
            This action will delete Candidate’s CV and  CV. Do you want to
            continue?
          </p>
        </Modal>

        {/*........... Upload cv button functionality................... */}
        <div className="upload-cv-btn">
          <Button
            disabled={items.length >= 5 && true}
            onClick={() => {
              setUploadModalVisible(true);
              setShowProgress(false);
            }}
          >
            {" "}
            <span className="upload-icon">
              <Image src={UploadIcon} alt="upload icon" />
            </span>{" "}
            Upload CV
          </Button>
        </div>

        <div>
          <Modal
            centered
            title={showPreview ? "Converting..." : "Upload Your CV"}
            open={uploadModalVisible}
            // onCancel={showPreview ? handleModalClose : null}
            className="template-modal"
            closeIcon={
              showPreview ? null : (
                <div
                  onClick={() => {
                    setFileName([]);
                    setShowPreview(false);
                    clearInterval(intervalRef.current as NodeJS.Timeout);
                    intervalRef.current = null;
                    // setModalVisible(false);
                    setUploadModalVisible(false);

                    if (cancelTokenSource) {
                      cancelTokenSource.cancel("Upload canceled by user");
                    }
                  }}
                >
                  <Image
                    src="assets/close-circle.svg"
                    alt="Close Icon"
                    width={26}
                    height={26}
                    style={{
                      width: "26px",
                      height: "26px",
                      cursor: "pointer !important",
                    }}
                  />
                </div>
              )
            }
            width={fileName ? 1010 : 610}
            style={{ height: showPreview ? "250px" : "" }}
            footer={
              showPreview
                ? null // Don't show any footer for showPreview
                : [
                    <Button
                      key="upload"
                      type="primary"
                      onClick={handleUpload}
                      className="modal-btn-continue"
                      disabled={
                        !isFileUploaded ||
                        isAnyFileInProgress ||
                        fileName.length === 0
                      }
                    >
                      Convert
                    </Button>,
                  ]
            }
          >
            {showPreview ? (
              <>
                {fileName?.map((file: any, index: any) => {
                  return (
                    <div className="file-details" key={index}>
                      <div className="file-name">{file?.name}</div>
                      <Progress
                        percent={previewProgress[file?.name]}
                        status={previewStatus}
                        strokeColor={"#335DF3"}
                      />
                      <div
                        onClick={() => handleConvertProgressbarClose(file.name)}
                      >
                        <Image
                          src={"assets/close-circle.svg"}
                          alt="close"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <Dragger
                  {...combinedProps}
                  customRequest={({ file, onSuccess, onError }) => {
                    if (customRequestHandler) {
                      customRequestHandler(file)
                        .then(() => {
                          setIsFileUploaded(true);
                          onSuccess?.({});
                        })
                        .catch((err) => {
                          console.error(err);
                          onError?.(err);
                        });
                    }
                  }}
                  showUploadList={false}
                  disabled={fileName?.length + items.length >= 5}
                >
                  <p className="ant-upload-drag-icon">
                    <Image src={uploadIcon} alt="upload-icon" />
                  </p>
                  <p className="ant-upload-text">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload up to 5 documents.
                    Strictly
                    <br />
                    prohibited from uploading company data or other banned
                    files.
                  </p>
                </Dragger>

                {/* upload file name and progress bar */}

                {fileName?.map((file: any, index: any) => {
                  return (
                    <div className="file-details" key={index}>
                      <div className="file-name">{file?.name}</div>

                      {file.isProgress ? (
                        // If isProgress is true, show preview button
                        <div className="btn-wrapper">
                          <Button
                            className="preview"
                            onClick={() => handlePreview(file.name)}
                          >
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleProgressbarClose2(file.name)}
                          >
                            <Image
                              src={"assets/close-circle.svg"}
                              alt="close"
                              width={20}
                              height={20}
                            />
                          </Button>
                        </div>
                      ) : (
                        // If isProgress is false, show progress bar
                        <div className="progress">
                          <Progress
                            percent={uploadProgress[file?.name]}
                            // showInfo={false}
                            // status={uploadStatus}
                            strokeColor={"#335DF3"}
                          />
                          <div
                            onClick={() => handleProgressbarClose2(file.name)}
                          >
                            <Image
                              src={"assets/close-circle.svg"}
                              alt="close"
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </Modal>
          {/* Preview Modal */}
          <Modal
            title=""
            open={previewOpen}
            onCancel={() => setPreviewOpen(false)}
            closeIcon={
              <div onClick={() => setPreviewOpen(false)}>
                <Image
                  src="assets/close-circle.svg"
                  alt="Close Icon"
                  width={26}
                  height={26}
                  style={{
                    width: "26px",
                    height: "26px",
                    cursor: "pointer !important",
                  }}
                />
              </div>
            }
            width={730}
            className="preview-modal"
            footer={""}
          >
            {/* DocViewer for show File after upload  */}
            <div className="doc-viewer">
              {loading ? (
                <>
                  <Spin />
                </>
              ) : (
                <DocViewer
                  config={{
                    header: {
                      disableHeader: true,
                      disableFileName: true,
                      retainURLParams: true,
                    },
                    pdfVerticalScrollByDefault: true,
                    pdfZoom: {
                      defaultZoom: 1,
                      zoomJump: 0.1,
                    },
                  }}
                  documents={[
                    {
                      uri: pdfUrl,
                    },
                  ]}
                  pluginRenderers={DocViewerRenderers}
                />
              )}
            </div>
          </Modal>
          {/* Preview Modal for route after Converting progress */}
          <Modal
            centered
            title="Conversion Completed!"
            open={preview}
            onCancel={handleSecondModalClose}
            closeIcon={customCloseIcon}
            width={564}
            footer={[
              <Button
                type="default"
                className="modal-btn-cancel"
                key="cancel"
                onClick={handleSecondModalClose}
              >
                Cancel
              </Button>,
              <Button
                key="continue"
                className="modal-btn-continue"
                type="primary"
                onClick={handlePreviewPage}
              >
                Preview
              </Button>,
            ]}
          >
            <div>
              <div className="modal-preview-main">
                <p className="preview-modalText">
                  Click “Continue” to preview the successfully converted CV{" "}
                  <br />
                  Click “Cancel” to cancel the action{" "}
                </p>
              </div>
              <div className="preview-Name-success">
                {fileName.map((file: any, index: any) => (
                  <div className="file-details" key={index}>
                    <div className="file-name">{file?.name}</div>
                    {file.isProgress ? (
                      <p className="preview-status">Success</p>
                    ) : (
                      <p className="preview-status">Pending</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Modal>
          <Modal
            centered
            title="Maximum of files exceeded"
            open={disabledUploadBtn}
            onCancel={handleSecondModalClose}
            closeIcon={false}
            width={434}
            footer={[
              <Button
                key="continue"
                className="modal-btn-gotIt"
                type="primary"
                onClick={() => setDisabledUploadBtn(false)}
              >
                Got it
              </Button>,
            ]}
          >
            <div>
              <div className="modal-preview-main">
                <p className="preview-modal-warn-Text">
                  You can upload up to 5 documents only.
                </p>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <div className="close-drawer-btn">
        <Button
          onClick={() => {
            setCollapseDrawer((prev: any) => !prev); // Toggles the state
          }}
        >
          <Image src={Arrow} alt="arrow-btn" />
        </Button>
      </div>
    </>
  );
}

export default UploadedCvTab;
