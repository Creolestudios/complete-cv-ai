import React, { useEffect, useState } from "react";
import { message } from "antd";
import axios from "axios";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import "@/components/Preview/Candidate/candidateCv.css";
import { usePdfViewer } from "../context/PdfViewerContext";
import { homeRoute } from "@/utils/apiRoute";
import { PopupError } from "@/utils/messagePopup";

// Component for Candidate CV Preview
const CandidateCv = ({ activeCvKey }: any) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const { showPdf, setShowPdf } = usePdfViewer();
  const userId: any = Number(
    typeof window !== "undefined" && window.localStorage.getItem("userId")
  );

  // Function for fetching candidate PDF URL
  const fetchData = async () => {
    try {
      setLoading(true);
      const fileId =
        typeof window !== "undefined" && localStorage.getItem("file_id");
      const fileIdArray = fileId ? JSON.parse(fileId) : [];
      const specificElement = fileIdArray[activeCvKey - 1].file_id;

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("file_id", specificElement);

      const response = await axios.post(homeRoute.PreviewCv, formData);
      setPdfUrl(response.data.result);
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
      message.error(PopupError.Internal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCvKey]);

  return (
    <>
      {/* {showPdf && ( */}
      <div className="candidateCv-main">
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
          Candidate CV
        </span>
      </div>
      {/* )} */}

      <div className="candidate-file-container">
        <div className="candidate-file-section">
          {loading ? (
            // loading
            <div>{/* <Loader loading={loading}/> */}</div>
          ) : (
            // Candidate file
            pdfUrl && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateCv;
