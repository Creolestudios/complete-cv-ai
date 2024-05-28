"use client";
import React, { useState } from "react";

import CandidateCv from "./Candidate/CandidateCv";
import Converted from "./Converted/Converted";
import "./mainPreview.css";
import PreviewHeader from "./PreviewHeader/PreviewHeader";
import { PdfViewerProvider } from "./context/PdfViewerContext";
import UploadedCvTab from "./UploadedCvTab/UploadedCvTab";

//  Main Component for Preview page
const MainPreview = () => {
  const [activeCvKey, setActiveCvKey] = useState<string>("1");
  const [collapseDrawer, setCollapseDrawer] = useState<boolean>(false);

  return (
    <PdfViewerProvider>
      <PreviewHeader />
      <div className="preview-container">
        <div className={`cv-tab ${collapseDrawer ? "collapse" : ""}`}>
          <UploadedCvTab
            setActiveCvKey={setActiveCvKey}
            setCollapseDrawer={setCollapseDrawer}
          />
        </div>
        <div className="candidateCv-section">
          <CandidateCv activeCvKey={activeCvKey} />
        </div>
        <div className="convert-section">
          <Converted activeCvKey={activeCvKey} />
        </div>
      </div>
    </PdfViewerProvider>
  );
};

export default MainPreview;
