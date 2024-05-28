"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Progress, Spin, Upload, message } from "antd";
import Image from "next/image";
import Modal from "antd/es/modal/Modal";
import { useRouter } from "next/navigation";
const { Meta } = Card;
const { Dragger } = Upload;
import type { MenuProps, UploadProps } from "antd";
import axios from "axios";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { BsFillPencilFill } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import Link from "next/link";

import cardData from "../Constants/TempData";
import "@/components/TemplateSlide/slide.css";
import uploadIcon from "../../../public/assets/preview/document-upload.svg";
import { homeRoute } from "@/utils/apiRoute";
import { Popup, PopupError, ServerError } from "@/utils/messagePopup";

type CardData = {
  id: number;
  role: string;
  description: string;
  image: string;
};
// Component for Template Slide
const Slide = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState("Upload");
  const [selectedCardId, setSelectedCardId] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [isButtonClicked, setIsButtonClicked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const cardsPerPage = 4;
  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<any>({});
  const [previewProgress, setPreviewProgress] = useState<any>({});
  const [fileName, setFileName] = useState<any>([]);
  const [fieldId, setFileIds] = useState<any>([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [intervalState, setIntervalState]: any = useState({});
  const [isConvertButtonDisabled, setIsConvertButtonDisabled] =
    useState<boolean>(true);
  const [uploadStatus, setUploadStatus] = useState<
    "active" | "success" | "normal" | "exception" | undefined
  >("active");
  const [previewStatus, setPreviewStatus] = useState<
    "active" | "success" | "normal" | "exception" | undefined
  >("active");
  const [preview, setPreviewBtn] = useState<boolean>(false);
  const [uploadFileServer, setUploadFileServer] = useState("");
  const [previewFileServer, setPreviewFileServer] = useState<any>();
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null); // Cancelling upload file api
  const [cancelConvertTokenSource, setCancelConvertTokenSource] =
    useState<any>(null);

  const [disabledUploadBtn, setDisabledUploadBtn] = useState<boolean>(false);

  const userId: any = Number(
    typeof window !== "undefined" && window.localStorage.getItem("userId")
  );
  // Interval for progressbar
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardHover = (content: any) => {
    setModalContent(content);
  };

  const handleCardLeave = () => {
    setModalContent("");
  };

  const handleButtonClick = (cardId: any) => {
    handleCardClick(cardId);
  };

  const handleModalClose = () => {
    setPreviewOpen(false);
    setFileName([]);
  };

  const handleCardClick = (cardId: any) => {
    const clickedCard = cardData.find((card) => card.id === cardId);
    const storedData = window.localStorage.getItem("SelectedCardID");
    const existingData = storedData ? JSON.parse(storedData) : {};
    const updatedData = {
      ...existingData,
      selectedCardID: cardId,
    };
    const updatedDataString = JSON.stringify(updatedData);
    window.localStorage.setItem("SelectedCardID", updatedDataString);
    setSelectedCard(clickedCard || null);
    setSelectedCardId(cardId);
    setModalVisible(true);
    setShowProgress(false);
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
      setModalVisible(true);
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
            onUploadProgress: (progressEvent) => {
              startConvertProgress(file_name); // Access file_id from the mapped object
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
        setPreviewBtn(true);
        setModalVisible(false);
        setIsButtonClicked(false);
      } catch (error) {
        console.error("Error during converting file:", error);
        setPreviewStatus("exception");
        setShowProgress(false);
        message.error(PopupError.tryAgain);
        setModalVisible(false);
        setIsButtonClicked(false);
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

  // -------------------UPLOAD FILE API----------------------------
  const customRequestHandler = async (file: any) => {
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
      if (response.status === 500) {
        message.error(PopupError.tryAgain);
      }
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
        selectedCardId: selectedCardId.toString(),
      };
      storedFileIds.push(selectedCardIdObj);
      // storedFileIds.push({ file_id,file_name });
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
        console.log("Error in api upload ");
        message.error(Popup.cvUploadCancel);
        // Handle cancellation or clean-up if needed
      } else {
        setShowProgress(false);
        setUploadStatus("exception");
        console.log("Error", error);
        // message.error(ServerError.Internal);
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

  // Dropdown items for copy
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Link href="" className="sl-duplicate">
          <HiOutlineDocumentDuplicate size={20} />
          Duplicate
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link href="" className="sl-rename">
          <BsFillPencilFill size={16} />
          Rename
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link href="/" style={{ color: "red" }} className="sl-delete">
          <RiDeleteBin6Line size={20} />
          Delete
        </Link>
      ),
    },
  ];
  // const slicedCardData = Array.isArray(cardData) ? cardData.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage) : [];

  const handlePreviewPage = () => {
    router.push("/preview");
    setShowPreview(false);
  };
  const handleSecondModalClose = () => {
    setPreviewBtn(false);
    setShowPreview(false);
  };

  // Cancel convert progress bar
  const handleConvertProgressbarClose = (id: any) => {
    if (cancelConvertTokenSource) {
      cancelConvertTokenSource.cancel("Upload canceled by user");
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
      console.error("Error handling preview:", error);
      message.error(PopupError.candidateFileErr);
      setLoading(false);
    }
  };

  useEffect(() => {
    const wordViewerStatusBar = document.getElementById("WordViewerStatusBar");
    if (wordViewerStatusBar) {
      wordViewerStatusBar.style.display = "none";
    }
  });

  // clear file_id from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("file_id");
      window.localStorage.removeItem("ProjectName");
    }
  }, []);

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

  return (
    <>
      <div className="loading-spin">{loading && <span></span>}</div>
      <div className="-container">
        <p className="-temp"> Templates</p>
        <span className="-subtitle">
          Select a Template and start custom your CV
        </span>
      </div>
      <div className="slide-container">
        {cardData
          .slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)
          .map((card) => (
            <Card
              key={card.id}
              bordered={false}
              style={{
                backgroundColor: "#F4F5F6",
                border:
                  modalContent === card.role
                    ? "2px solid orange"
                    : "2px solid transparent",
              }}
              cover={
                <div
                  className="card-container"
                  onMouseEnter={() => {
                    setIsHovered(true);
                    handleCardHover(card.role);
                  }}
                  onMouseLeave={() => {
                    setIsHovered(false);
                    handleCardLeave();
                  }}
                  onTouchStart={() => {
                    setIsHovered(true);
                    handleCardHover(card.role);
                  }}
                  onTouchEnd={() => {
                    setIsHovered(false);
                    handleCardLeave();
                  }}
                  onClick={() => handleCardClick(card.id)}
                >
                  {modalContent === card.role && (
                    <div className="button-container">
                      <Button
                        className="Hover-button"
                        type="default"
                        size="large"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleButtonClick(card.id);
                          sessionStorage.clear();
                        }}
                      >
                        Upload CV
                      </Button>
                    </div>
                  )}
                  <Image
                    alt="example"
                    src={card.image}
                    width={272}
                    height={331}
                  />
                </div>
              }
            >
              <div className="card-bottom">
                <p
                  style={{
                    color: "black",
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                    margin: 0,
                    padding: "8px",
                  }}
                >
                  {card.role}
                </p>
                {/* <p onClick={handleCopyClick}><CgCopy size={20}/></p> */}
                {/* <p>
                  <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    overlayClassName="slide-dropdown2"
                    arrow>
                    <BsThreeDotsVertical size={20} />
                  </Dropdown>
                </p> */}
              </div>
            </Card>
          ))}
      </div>
      <div>
        <Modal
          centered
          title={showPreview ? "Converting..." : "Upload Your CV"}
          open={modalVisible}
          className="template-modal"
          closeIcon={
            showPreview ? null : (
              <div
                onClick={() => {
                  setFileName([]);
                  setShowPreview(false);
                  clearInterval(intervalRef.current as NodeJS.Timeout);
                  intervalRef.current = null;
                  setModalVisible(false);

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
                disabled={fileName?.length >= 5}
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
                  prohibited from uploading company data or other banned files.
                </p>
              </Dragger>

              {/* -----------------upload file name and progress bar--------------- */}

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
                        <div onClick={() => handleProgressbarClose2(file.name)}>
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
        {/* ----------------Preview Modal---------------- */}
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
          // height={'auto'}
          className="preview-modal"
          footer={""}
        >
          {/* DocViewer for show File after upload  */}
          <div className="doc-viewer">
            {loading ? (
              <Spin />
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
                Click “Preview” to preview the successfully converted CV <br />
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
      <div className="pagination"></div>
    </>
  );
};

export default Slide;
