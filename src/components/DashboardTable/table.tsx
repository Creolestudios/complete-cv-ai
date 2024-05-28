"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  DatePicker,
  Modal,
  Space,
  Table,
  message,
  RadioChangeEvent,
  Radio,
  Tooltip,
  TableColumnsType,
} from "antd";
import { Pagination } from "antd";
import { Input } from "antd";
const { Search } = Input;
import axios from "axios";
const { Column } = Table;
import Image from "next/image";
import { TableRowSelection } from "antd/es/table/interface";
import Link from "next/link";
import Icon from "@ant-design/icons/lib/components/Icon";

import "@/components/DashboardTable/table.css";
import calendarIcon from "../../../public/assets/dashboard/calendar.svg";
import { apiRoute } from "@/utils/apiRoute";
import { Popup, PopupError } from "@/utils/messagePopup";
import DownloadIcon from "@/assets/images/DownloadIcon";
import DownIcon from "@/assets/images/DownIcon";
import CopyIcon from "@/assets/images/CopyIcon";
import UpArrow from "@/assets/images/UpArrow";
import deleteSvg from "@/assets/images/deleteSvg";

interface DataType {
  Files: any;
  TemplateId: any;
  id: string | number;
  Title: string;
  TemplateName: string;
  LastSaved: string;
  Path: string;
  ZipURL: string;
  UserURL: string;
  URL: string;
  ProjectName: string;
}
interface ExpandedDataType {
  key: React.Key;
  date: string;
  name: string;
  upgradeNum: string;
}
type CustomExpandable<DataType> = {
  expandedRowRender?: (record: DataType) => React.ReactNode;
  expandIcon?: (props: {
    expanded: boolean;
    onExpand: (record: DataType, event: React.MouseEvent<HTMLElement>) => void;
    record: DataType;
  }) => React.ReactNode;
};
const getLocalTemplateID = (templateName: string) => {
  // Define your reverse mapping here
  const reverseTemplateNameMap: { [key: string]: string } = {
    "International Original": "1",
    "International Banking": "2",
    Mainland: "3",
    Staffing: "4",
  };

  return reverseTemplateNameMap[templateName] || 1;
};

const DashTable = () => {
  const itemFilter2 = [
    "International Banking",
    "International Original",
    "Mainland",
    "Staffing",
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [buttonName, setButtonName] = useState("Today");
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [totalData, setTotalData] = useState<Array<DataType>>([]);
  const [currentPageData, setCurrentPageData] = useState<Array<DataType>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [arrow, setArrow] = useState("Show");
  const [dataSource, setDataSource] = useState<any>([]);
  const pageSize = 10; // Set the desired number of items per page
  const [recordId, setRecordId] = useState<any>();

  const showModal = () => {
    setIsModalOpen(true);
  };

  // Handle ok button click functionality
  const handleOk = () => {
    switch (value) {
      case 1:
        setButtonName("Today");
        filterDataByLastSaved(1);
        break;
      case 2:
        setButtonName("Last 7 days");
        filterDataByLastSaved(7);
        break;
      case 3:
        setButtonName("Last 30 days");
        filterDataByLastSaved(30);
        break;
      case 4:
        setButtonName("Last 90 days");
        filterDataByLastSaved(90);
        break;
      case 5:
        setButtonName("Last 12 months");
        filterDataByLastSaved(365);
        break;
      case 6:
        setButtonName("Custom");

        filterDataByCustomLastSaved(selectedDateRange);
        break;
      default:
        setButtonName("This Week");
        break;
    }
    setIsModalOpen(false);
  };

  // Modal close
  const handleCancel = () => {
    setValue(1);
    setButtonName("Today");
    setDataSource(currentPageData);
    setIsModalOpen(false);
  };

  const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  // Download multiple Project zip
  const handleSelectDownload = async () => {
    const userId = Number(window.localStorage.getItem("userId"));
    const projectIds = selectedRowKeys.map(String); // Assuming selectedRowKeys contains the table IDs

    if (!userId || !projectIds || projectIds.length === 0) {
      console.error("Invalid userId or projectIds");
      return;
    }

    try {
      const response = await fetch(apiRoute.DownloadSelectedProject, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId.toString(), projectIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "An error occurred.";
        console.error("Server error:", errorMessage);
        message.error(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.url) {
        // If there's only one table ID selected, directly download the zip file using the provided zipURL
        const link = document.createElement("a");
        link.href = data.url;
        link.setAttribute("download", `FileName.zip`);

        // Append to the HTML body
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
      } else if (data.url && data.url) {
        // If multiple table IDs are selected, download the zip file as before
        const link = document.createElement("a");
        link.href = data.url;
        link.setAttribute("download", `FileName.zip`);

        // Append to the HTML body
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
      } else {
        console.error("Invalid response data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const itemFilter = [
    {
      text: "International Banking",
      value: "International banking",
    },
    {
      text: "International Original",
      value: "International original",
    },
    { text: "Mainland", value: "mainland" },
    { text: "Staffing", value: "staffing" },
  ];

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const filterDataByLastSaved = (days: number) => {
    // Calculate the date range
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filter the data based on the calculated date range
    const filteredData = currentPageData.filter((item: any) => {
      // Parse the LastSaved date string
      const lastSavedDate = new Date(item.Date);

      // Compare with the calculated date range
      return lastSavedDate >= startDate && lastSavedDate <= currentDate;
    });

    setDataSource(filteredData);
  };

  const filterDataByCustomLastSaved = (customDateRange: Date[]) => {
    // Extract start and end dates from the customDateRange array
    const startDate = customDateRange[0];
    const endDate = new Date(customDateRange[1]);
    endDate.setDate(endDate.getDate() + 1);

    // Filter the data based on the custom date range
    const filteredData = currentPageData.filter((item: any) => {
      const itemDate = new Date(item.Date);
      return itemDate >= startDate && itemDate <= endDate;
    });

    setDataSource(filteredData);
  };

  // Table DataList
  const fetchData = async () => {
    try {
      const userId: any = Number(window.localStorage.getItem("userId"));

      if (isNaN(userId)) {
        throw new Error("User ID is missing or invalid.");
      }

      const formData = new FormData();
      formData.append("userId", userId);

      const response = await fetch(apiRoute.GetProject, {
        method: "POST",
        body: formData,
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data: " + response.statusText);
      }

      const responseData = await response.json();
      console.log(responseData);

      if (response.status === 200) {
        const data = responseData.userDetails || [];
        console.log("data", data);
        setTotalData(data);
        setCurrentPageData(data.slice(0, pageSize));
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  // Download Project
  const handleDownload = async (id: any) => {
    const userId: any = window.localStorage.getItem("userId");
    try {
      const requestData = {
        user_id: userId,
        projectId: String(id),
      };
      const response = await axios.post(apiRoute.downloadProject, requestData);
      if (response.status === 200) {
        const url = response?.data?.zipUrl;
        console.log(url);
        const link: any = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `FileName.pdf`);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.log(error);
      message.error(PopupError.tryAgain);
    }
  };

  // Delete Project
  const handleDelete = async (id: string | number) => {
    try {
      const formData = new FormData();
      formData.append("projectId", String(id));
      setDeleteModalOpen(false);

      // Make a DELETE request using Axios with FormData
      const response = await axios.delete(apiRoute.DeleteProject, {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Set the content type for FormData
        },
      });

      if (response.status === 200) {
        // Handle successful deletion
        fetchData();
        message.success(Popup.deleteProject);
      } else {
        // Handle error
        console.error(
          "Error deleting record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.log("Error:", error);
      setDeleteModalOpen(false);
    }
  };

  // Delete Child node File
  const handleChildFileDelete = async (fileId: any) => {
    console.log(fileId);
    try {
      const formData = new FormData();
      formData.append("fileId", String(fileId));
      const response = await axios.delete(apiRoute.DeleteFile, {
        data: formData,
      });

      if (response.status === 200) {
        message.success(response.data?.message);
        fetchData();
      }
    } catch (error) {
      console.log(error);
      message.error(PopupError.tryAgain);
    }
  };

  // Download Child node File
  const handleChildDownloadFile = (url: any) => {
    console.log(url);
    const link: any = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FileName.pdf`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode.removeChild(link);
  };

  // Copy Project
  const handleCopySection = async (id: string | number) => {
    // console.log('TableId to copy',id)
    try {
      const userId: any = Number(window.localStorage.getItem("userId"));
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("projectId", String(id));

      const response = await axios.post(apiRoute.CopyProject, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set the content type for FormData
        },
      });

      if (response.status === 200) {
        fetchData();
        message.success(Popup.copyProject);
      }
    } catch (error) {
      message.error(PopupError.Internal);
    }
  };

  const handlePreviewClick = (record: DataType) => {
    // Initialize an array to hold file data
    const filesData: any = [];

    // Iterate over each file and extract its details
    record.Files.forEach((file: any) => {
      const fileData = {
        file_id: file.file_id,
        file_name: file.candidateFile_name,
        selectedCardId: getLocalTemplateID(file.templateId),
      };
      // Push the file data to the array
      filesData.push(fileData);
    });

    // Store the array in sessionStorage
    localStorage.setItem("file_id", JSON.stringify(filesData));
  };
  const mergedArrow = useMemo(() => {
    if (arrow === "Hide") {
      return false;
    }

    if (arrow === "Show") {
      return true;
    }

    return {
      pointAtCenter: true,
    };
  }, [arrow]);

  // Get data from server
  useEffect(() => {
    fetchData();
  }, []);

  // Update selected filters
  useEffect(() => {
    const updatedFilters = itemFilter.map((e) => e.value);
    setSelectedFilters(updatedFilters);
  }, []);

  // Set Data source
  useEffect(() => {
    setDataSource(currentPageData);
  }, [currentPageData]);

  useEffect(() => {
    const filterDataSource = currentPageData?.filter(
      (item: any) =>
        item?.LastSaved.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // item?.TemplateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.ProjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setDataSource(filterDataSource);
  }, [searchTerm]);

  // Expand Row function for Data table
  const expandedRowRender = (record: any) => {
    const columns: TableColumnsType<ExpandedDataType> = [
      {
        title: "CV Name",
        dataIndex: "candidateFile_name",
        key: "candidateFile_name",
        width: 600,
      },
      { title: "Template Name", dataIndex: "templateId", key: "templateId" },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        width: 150,
        render: (text: any, file: any) => (
          <Space size="middle">
            <Icon
              component={DownloadIcon}
              onClick={() => handleChildDownloadFile(file?.zipUrl)}
            />
            <Icon
              component={deleteSvg}
              onClick={() => handleChildFileDelete(file?.id)}
            />
          </Space>
        ),
      },
    ];
    return (
      <div className="expanded-row-table">
        <Table
          columns={columns}
          dataSource={record?.Files}
          pagination={false}
        />
      </div>
    );
  };

  // For Custom Expand Icon
  const customExpandIcon: any = ({ expanded, onExpand, record }: any) => {
    return expanded ? (
      <Icon component={UpArrow} onClick={(e) => onExpand(record, e)} />
    ) : (
      <Icon component={DownIcon} onClick={(e) => onExpand(record, e)} />
    );
  };

  return (
    <div>
      <div className="name-tag">
        <span className="Dashboard-title">My Dashboard</span>
        <div className="dashboard-top">
          <Input
            placeholder="Search Project"
            className="search-bar"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {selectedRowKeys.length > 0 ? (
            <Button
              type="primary"
              className={`date-btn-wrapper ${
                selectedRowKeys.length > 0 ? "download-btn" : ""
              }`}
              onClick={() => {
                handleSelectDownload();
              }}
            >
              <span className="calendar-text download">Download</span>
            </Button>
          ) : (
            <Button
              type="primary"
              className={`date-btn-wrapper ${
                selectedRowKeys.length > 0 ? "download-btn" : ""
              }`}
              onClick={() => {
                showModal();
              }}
            >
              <Image alt="" src={calendarIcon} className="calendar-icon" />
              <span className="calendar-text">{buttonName}</span>
            </Button>
          )}

          <Modal
            title="Select Date"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              // eslint-disable-next-line react/jsx-key
              <div className="calendar-footer">
                <Button
                  type="default"
                  style={{ border: "0" }}
                  onClick={handleCancel}
                >
                  Reset
                </Button>
                ,
                <Button
                  type="default"
                  style={{ border: "0" }}
                  onClick={handleOk}
                >
                  Done
                </Button>
              </div>,
            ]}
          >
            <Radio.Group onChange={onChange} value={value}>
              <Space direction="vertical">
                <Radio value={1}>Today</Radio>
                <Radio value={2}>Last 7 days</Radio>
                <Radio value={3}>Last 30 days</Radio>
                <Radio value={4}>Last 90 days</Radio>
                <Radio value={5}>Last 12 months</Radio>
                <Radio value={6}>
                  Custom
                  {value === 6 ? (
                    <div>
                      <DatePicker.RangePicker
                        value={selectedDateRange}
                        onChange={(dates) => setSelectedDateRange(dates)}
                      />
                    </div>
                  ) : null}
                </Radio>
              </Space>
            </Radio.Group>
          </Modal>
          {/* <Upload {...props}> */}
          {/* <Button
              onClick={handleDownloadCv}
              type='primary'
              style={{
                color: selectedRowKeys.length > 0 ? 'black' : 'white',
                backgroundColor:
                  selectedRowKeys.length > 0 ? '#F4F5F6' : '#FD8205',
                // width: '141px',
                height: '44px',
                boxShadow: 'none',
                cursor: 'pointer !important',
              }}
            >
              <span
                className='csv-button'
                style={{
                  cursor: 'pointer !important',
                  color:
                    selectedRowKeys.length > 0
                      ? 'black'
                      : 'var(--Neutral-1, #fcfcfd)',
                }}
              >
                Export to CSV
              </span>
            </Button> */}
          {/* </Upload> */}
        </div>
      </div>
      <div className="dashboard-table">
        <Table
          dataSource={dataSource}
          pagination={false}
          rowKey={(record) => record.id}
          rowSelection={rowSelection}
          expandable={{
            expandedRowRender,
            expandIcon: customExpandIcon,
          }}
        >
          <Column
            title="Project"
            key="Title"
            className="projectTitle"
            width={580}
            render={(record: DataType) => (
              <Link href={`/preview`} className="preview-link-color">
                <span onClick={() => handlePreviewClick(record)}>
                  {record?.ProjectName}
                </span>
              </Link>
            )}
          />
          <Column
            title="Last Saved"
            dataIndex="LastSaved"
            key="LastSaved"
            className="lastSaved"
          />
          <Column
            title="Actions"
            key="action"
            className="actions"
            render={(record: DataType) => (
              <Space>
                <div className="actions-buttons">
                  <div className="btn">
                    <Tooltip
                      placement="topRight"
                      title={"Copy Project"}
                      arrow={mergedArrow}
                    >
                      <span onClick={() => handleCopySection(record.id)}>
                        <Icon component={CopyIcon} />
                      </span>
                    </Tooltip>
                  </div>

                  <div className="btn">
                    <Tooltip
                      placement="topRight"
                      title={"Download Project"}
                      arrow={mergedArrow}
                    >
                      <span onClick={() => handleDownload(record?.id)}>
                        <Icon component={DownloadIcon} />
                      </span>
                    </Tooltip>
                  </div>
                  <div className="btn">
                    <Tooltip
                      placement="topRight"
                      title={"Delete Project"}
                      arrow={mergedArrow}
                    >
                      <Modal
                        title="Delete Project"
                        centered
                        open={deleteModalOpen}
                        onCancel={() => setDeleteModalOpen(false)}
                        footer={[
                          <Button
                            key="back"
                            onClick={() => setDeleteModalOpen(false)}
                          >
                            Keep
                          </Button>,
                          <Button
                            key="submit"
                            type="primary"
                            onClick={() => handleDelete(recordId)}
                          >
                            Delete
                          </Button>,
                        ]}
                        className="delete-project-modal"
                      >
                        <p className="delete-text">
                          This action will delete all the CVs uploaded.
                        </p>
                        <p className="delete-text">Do you want to continue?</p>
                      </Modal>
                      <Icon
                        component={deleteSvg}
                        onClick={() => {
                          setDeleteModalOpen(true);
                          setRecordId(record?.id);
                        }}
                      />{" "}
                    </Tooltip>
                  </div>
                </div>
              </Space>
            )}
          />
        </Table>
      </div>
      {/* ---------Pagination----------- */}
      <div className="dashtable-pagination">
        <Pagination
          current={currentPage}
          defaultCurrent={1}
          total={totalData.length}
          pageSize={pageSize}
          onChange={(page) => {
            setCurrentPage(page);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setCurrentPageData(totalData.slice(startIndex, endIndex));
          }}
          className="table-pagination"
        />
      </div>
    </div>
  );
};

export default DashTable;
