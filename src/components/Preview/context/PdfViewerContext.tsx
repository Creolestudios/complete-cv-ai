"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface PdfViewerContextProps {
  showPdf: boolean;
  editData: any;
  setEditData: any;
  loader: boolean;
  editing: boolean;
  saveLoading: boolean;
  setSaveLoading: Dispatch<SetStateAction<boolean>>;
  setEditing: Dispatch<SetStateAction<boolean>>;
  setLoader: Dispatch<SetStateAction<boolean>>;
  setShowPdf: Dispatch<SetStateAction<boolean>>;
}

const PdfViewerContext = createContext<PdfViewerContextProps | undefined>(
  undefined
);
// Context Provider for Preview page
export const PdfViewerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showPdf, setShowPdf] = useState<boolean>(true);
  const [editData, setEditData] = useState<any>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const value: PdfViewerContextProps = {
    showPdf,
    editing,
    setEditing,
    setShowPdf,
    saveLoading,
    setSaveLoading,
    editData,
    setEditData,
    loader,
    setLoader,
  };

  return (
    <PdfViewerContext.Provider value={value}>
      {children}
    </PdfViewerContext.Provider>
  );
};

export const usePdfViewer = (): PdfViewerContextProps => {
  const context = useContext(PdfViewerContext);
  if (!context) {
    throw new Error("usePdfViewer must be used within a PdfViewerProvider");
  }
  return context;
};
