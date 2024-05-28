"use client";
import { useEffect, useState } from "react";
import { Dropdown, Spin, message } from "antd";
import Image from "next/image";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";

import "@/components/Preview/Converted/converted.css";
import DownArrow from "../../../../public/assets/preview/Downarrow.svg";
import { usePdfViewer } from "../context/PdfViewerContext";
import LoaderComponent from "@/components/loader/loaderComponent";
import { ClientPopup, PopupError } from "@/utils/messagePopup";
import Pen from "../../../../public/assets/preview/pen.svg";
import { homeRoute, previewRoute } from "@/utils/apiRoute";
import EditCandidateCvForm from "../Candidate/EditCandidateCvForm";

type ItemType = {
  key: string;
  label: JSX.Element;
};

// Component for Converted  File Preview
const Converted = ({ activeCvKey }: any) => {
  const [selectedItem, setSelectedItem] = useState<ItemType>();
  const [selectedCardId, setSelectedCardId] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonLoader, setButtonLoader] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);
  const [conversionCompleted, setConversionCompleted] =
    useState<boolean>(false);
  const [selectedDropdownKey, setSelectedDropdownKey] = useState<any>("");
  const sessionPdfUrl =
    typeof window !== "undefined" && sessionStorage.getItem("convertedCv");
  const [changeFlag, setChangeFlag] = useState<boolean>(true);
  const {
    showPdf,
    setShowPdf,
    setEditData,
    setLoader,
    setEditing,
    editing,
    saveLoading,
    setSaveLoading,
  } = usePdfViewer(); // Context provider

  // Items for Dropdown
  const items: ItemType[] = [
    {
      key: "1",
      label: (
        <div
          onClick={() => handleItemClick(items[0])}
          className={`dropdown-items ${
            selectedDropdownKey == "1" ? "active" : ""
          }`}
        >
          <Image
            src="/assets/-IO.jpg"
            alt="candidate"
            width={95}
            height={136}
          />
          <span className="template-image-text">International Original</span>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => handleItemClick(items[1])}
          className={`dropdown-items ${
            selectedDropdownKey == "2" ? "active" : ""
          }`}
        >
          <Image
            src="/assets/-IO.jpg"
            alt="candidate"
            width={95}
            height={136}
          />
          <span className="template-image-text">International Banking</span>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          onClick={() => handleItemClick(items[2])}
          className={`dropdown-items ${
            selectedDropdownKey == "3" ? "active" : ""
          }`}
        >
          <Image
            src="/assets/-IO.jpg"
            alt="candidate"
            width={95}
            height={136}
          />
          <span className="template-image-text">Mainland</span>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          onClick={() => handleItemClick(items[3])}
          className={`dropdown-items ${
            selectedDropdownKey == "4" ? "active" : ""
          }`}
        >
          <Image
            src="/assets/-S.jpg"
            alt="candidate"
            width={95}
            height={136}
          />
          <span className="template-image-text">Staffing</span>
        </div>
      ),
    },
  ];

  const userId: any = Number(
    typeof window !== "undefined" && window.localStorage.getItem("userId")
  );

  // Function for getting PDF file url
  const fetchData = async () => {
    try {
      setLoading(true);
      // Check if selectedCardId has a value
      const fileId =
        typeof window !== "undefined" && localStorage.getItem("file_id");
      const fileIdArray = fileId ? JSON.parse(fileId) : [];

      const specificElement = fileIdArray[activeCvKey - 1].file_id;

      if (selectedCardId) {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("filenamePrefix", selectedCardId);
        formData.append("file_id", specificElement);

        // Api request for get generated PDF url
        const response = await axios.post(homeRoute.ConvertedPdf, formData);
        setPdfUrl(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function for Converting PDF
  const ConvertData = async () => {
    setLoading(true);
    const fileId =
      typeof window !== "undefined" && localStorage.getItem("file_id");
    const fileIdArray = fileId ? JSON.parse(fileId) : [];

    // Access a particular element from the array (for example, element at index 0)
    const specificElement = fileIdArray[activeCvKey - 1]?.file_id;
    const specificElementName = fileIdArray[activeCvKey - 1]?.file_name;
    if (selectedCardId) {
      try {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("filenamePrefix", String(selectedCardId));
        formData.append("file_id", specificElement);
        formData.append("file_name", specificElementName);

        // API for Converting Template
        const response = await axios.post(homeRoute.ConvertBlobData, formData);

        if (response.status === 200) {
          setUpdate(!update);
          setConversionCompleted(true);
          setSaveLoading(false);
        }
      } catch (error: any) {
        // Handle errors;
        if (error.response.status === 500) {
          message.error(PopupError.convertErr);
        }
        console.error("Error in convertBlobData:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onInputHandler = (e: any) => {
    const newFileName = e.currentTarget.textContent;
    typeof window !== "undefined" &&
      window.localStorage.setItem("ConvertFileName", newFileName);
  };

  // Function for handle selectedCard
  const handleItemClick = (item: ItemType) => {
    const fileId =
      typeof window !== "undefined" && localStorage.getItem("file_id");
    const fileIdArray = fileId ? JSON.parse(fileId) : [];
    const specificElementName = fileIdArray[activeCvKey - 1]?.file_name;

    if (specificElementName) {
      fileIdArray[activeCvKey - 1].selectedCardId = item.key;

      typeof window !== "undefined" &&
        window.localStorage.setItem("file_id", JSON.stringify(fileIdArray));

      console.log("Selected card ID set in fileId localStorage:", item.key);
    } else {
      console.log(
        "Specific name not found. Cannot set item key in fileId localStorage."
      );
    }

    setSelectedItem(item);
    setSelectedCardId(item.key);

    const dataToStore = {
      selectedCardID: item.key,
    };
    typeof window !== "undefined" &&
      window.localStorage.setItem(
        "SelectedCardID",
        JSON.stringify(dataToStore)
      );
  };

  // Function for handle Edit Button
  const handleEditButtonClick = async () => {
    setButtonLoader(true);
    setShowPdf(false);
    setEditing(false);
    setLoader(true);
    setEditData("");
    const fileId =
      typeof window !== "undefined" && localStorage.getItem("file_id");
    const fileIdArray = fileId ? JSON.parse(fileId) : [];

    const specificFileId = fileIdArray[activeCvKey - 1].file_id;
    try {
      const formData = new FormData();
      formData.append("user_id", String(userId));
      formData.append("file_id", specificFileId);
      const response = await axios.post(previewRoute.dataList, formData);
      if (response.status === 200) {
        setEditData(response?.data);

        message.info(ClientPopup.DataFetched);
        setButtonLoader(false);
      }
    } catch (error) {
      console.log(error);
      message.error(PopupError.tryAgain);
      setButtonLoader(false);
    }
  };
  const handleDropdownItemClick = (e: any) => {
    setSelectedDropdownKey(e?.key);
  };

  const handleKeyDown = (event: any) => {
    // Prevent the default behavior for Enter and Space keys
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
    }
  };
  // fetchData when activeCv key changes
  useEffect(() => {
    fetchData();
    setSelectedItem(items[0]);
    setSelectedCardId("1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCvKey]);

  // useEffect call FetchData on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData =
        typeof window !== "undefined" &&
        window.localStorage.getItem("SelectedCardID");
      const parsedData = storedData ? JSON.parse(storedData) : null;
      setSelectedCardId(parsedData?.selectedCardID);

      const ItemSelect: any = items.filter((Item) =>
        Item.key == parsedData?.selectedCardID ? Item : ""
      );

      setSelectedItem(ItemSelect[0]);
    }

    if (sessionPdfUrl) {
      setLoading(true);
      setPdfUrl(sessionPdfUrl);
      setLoading(false);
      setChangeFlag(false);
    } else {
      fetchData();
    }
  }, []);

  // useEffect call convertData on selectedCardId change
  useEffect(() => {
    if (selectedCardId && changeFlag) {
      ConvertData();
    }
  }, [selectedCardId]);

  useEffect(() => {
    // Call fetchData when conversion is completed
    if (conversionCompleted) {
      fetchData();
      // Reset to false after calling fetchData
      setConversionCompleted(false);
    }
  }, [update, conversionCompleted]);

  // for trigger after uploading new file
  useEffect(() => {
    if (showPdf && !sessionPdfUrl) {
      fetchData();
    }
  }, [showPdf]);

  // check if edit resume is done or not
  useEffect(() => {
    if (editing) {
      setLoading(true);
      ConvertData(); // Call convertData when editing is true
      fetchData(); // Call fetchData for latest resume
      setEditing(false);
      setLoading(false);
    }
  }, [editing]);

  useEffect(() => {
    const storedData =
      typeof window !== "undefined" && window.localStorage.getItem("file_id");

    if (storedData) {
      const fileIdArray = JSON.parse(storedData);
      const selectedCardId = fileIdArray[activeCvKey - 1]?.selectedCardId;

      if (selectedCardId) {
        // Find the corresponding item based on the selectedCardId
        const selectedItem = items.find((item) => item.key === selectedCardId);

        // Set the selectedItem and selectedCardId
        setSelectedItem(selectedItem);
        setSelectedCardId(selectedCardId);
        setSelectedDropdownKey(selectedCardId);
      } else {
        const storedData =
          typeof window !== "undefined" &&
          window.localStorage.getItem("SelectedCardID");
        const selectedCardId = storedData
          ? JSON.parse(storedData).selectedCardID
          : null;
        console.log("SelectedCardId:::", String(selectedCardId));
        setSelectedDropdownKey(String(selectedCardId));
        setSelectedCardId(null);
        setSelectedDropdownKey("");
      }
    } else {
      // If fileId localStorage data is not found, reset the state
      setSelectedCardId(null);
      setSelectedDropdownKey("");
    }
  }, [activeCvKey]);

  return (
    <>
      <div className={`converted-main ${showPdf ? "" : "hide"}`}>
        <div className="Convert-name-section">
          <div
            onInput={onInputHandler}
            // contentEditable={true}
            onKeyDown={handleKeyDown}
          >
            {/* {editableContent} */}
            {showPdf ? " CV" : ""}
          </div>
          {showPdf ? (
            <div className="edit-cv-btn" onClick={handleEditButtonClick}>
              <Image src={Pen} alt="" />
              {buttonLoader ? (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              ) : (
                "Edit"
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="converted-text-select">
          <p className="template-text">Template</p>
          <div className="converted-select-main">
            <Dropdown
              menu={{ onClick: handleDropdownItemClick, items: items }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="converted-dropdown"
              className="converted-dropdown"
              arrow
            >
              <div className="converted-dropdown">
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                    height: "24px",
                    width: "160px",
                  }}
                >
                  {selectedItem?.label?.props?.children[1]} &nbsp;
                </span>
                <Image src={DownArrow} alt="" />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="converted-file-container">
        <div className="converted-file-section">
          {loading || saveLoading ? (
            <div className="convertData-loading">
              <LoaderComponent loading={loading} />
            </div>
          ) : showPdf ? (
            pdfUrl && (
              // For showing converted PDF
              <DocViewer
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                    retainURLParams: true,
                  },
                  pdfVerticalScrollByDefault: true,
                  pdfZoom: {
                    defaultZoom: 1.2,
                    zoomJump: 0.1,
                  },
                }}
                documents={[{ uri: pdfUrl }]}
                pluginRenderers={DocViewerRenderers}
              />
            )
          ) : (
            // <div
            //   style={{
            //     width: "100%",
            //     height: "100%",
            //     backgroundColor: "#ebe6e6",
            //   }}
            // ></div>
            <>
              <EditCandidateCvForm />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Converted;
