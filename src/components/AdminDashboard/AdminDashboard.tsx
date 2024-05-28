"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Dropdown,
  Modal,
  Pagination,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Spin,
  Table,
  message,
} from "antd";
import { Line, Bar } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJs } from "chart.js/auto";
import axios from "axios";
import Image from "next/image";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import "./admin.css";
import calendarIcon from "../../../public/assets/dashboard/calendar.svg";
import DownArrow from "../../../public/assets/preview/Downarrow.svg";
import UpArrow from "../../../public/assets/arrow-up-s-fill.svg";
import { adminRoute } from "@/utils/apiRoute";
import { ClientPopup, ServerError } from "@/utils/messagePopup";

interface DataType {
  id: string | number;
  name: string;
  role: string;
  team: string;
  cvConverted: string;
  timeSpent: string;
}
const { Column } = Table;

function AdminDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState(1);
  const [buttonName, setButtonName] = useState<string>("Weekly");
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageData, setCurrentPageData] = useState<Array<DataType>>([]);
  const [totalData, setTotalData] = useState<Array<DataType>>([]);
  const [chartDataset, setChartDataset] = useState<any>({});
  const [percentageData, setPercentageData] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lineGraphData, setLineGraphData] = useState<any>([]);

  const pageSize = 10;
  ChartJs.register(CategoryScale);

  // dropdown items
  const items = [
    {
      label: "All Teams",
      key: "1",
    },
  ];
  // radio dropdown ok functionality
  const handleOk = () => {
    switch (value) {
      case 1:
        setButtonName("Daily");
        filterDataByLastSaved("daily");
        break;
      case 2:
        setButtonName("Weekly");
        filterDataByLastSaved("weekly");

        break;
      case 3:
        setButtonName("Monthly");
        filterDataByLastSaved("monthly");
        break;
      default:
        setButtonName("Weekly");
        filterDataByLastSaved("all");
        break;
    }
    setIsModalOpen(false);
  };

  // handle dropdown click
  const handleMenuClick = (e: any) => {
    console.log("click", e);
  };

  // Close modal
  const handleCancel = () => {
    setValue(1);
    setButtonName("weekly");
    setIsModalOpen(false);
  };

  // Filter data by last saved
  const filterDataByLastSaved = async (days: any) => {
    try {
      const formData = new FormData();
      formData.append("timePeriod", days);
      const token = Cookies.get("isLoggedIn");
      const response = await axios.post(adminRoute.dateWise, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log("data date wise ", response.data);
        if (days === "daily") {
          setLineGraphData(response?.data?.dailyConversion);
        } else if (days === "weekly") {
          setLineGraphData(response?.data?.weeklyConversions);
        } else if (days === "monthly") {
          setLineGraphData(response?.data?.monthlyConversions);
        }
        if (response.data?.templateUsageObject?.length > 0) {
          setChartDataset(response?.data?.templateUsageObject);
        }
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // on radio change function
  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  // Fetch line graph data
  const LineGraphData = async () => {
    try {
      const token = Cookies.get("isLoggedIn");
      const response = await axios.get(adminRoute.lineGraph, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log(response?.data);
        setLineGraphData(response?.data?.teamCombinedDailyConversions);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching chart data:", error);
      }
    }
  };
  // Generate random color for graph
  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  let maxCount = 0;
  lineGraphData.forEach((team: any) => {
    const maxInTeam = Math.max(...team.cvConverted);
    if (maxInTeam > maxCount) {
      maxCount = maxInTeam;
    }
  });

  // Calculate the step size based on the maximum count
  const stepSize = Math.ceil(maxCount / 10); // Adjust 10 to change the number of steps
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"],
    datasets: lineGraphData.map((team: any) => ({
      label: team.teamName,
      data: team.cvConverted,
      backgroundColor: generateRandomColor(), // Random color for demonstration
      borderColor: generateRandomColor(), // Random color for demonstration
      borderWidth: 2,
      pointRadius: 0,
      borderJoinStyle: "round",
      tension: 0.4,
      spanGaps: true,
    })),
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true, // Display the title
        text: "Overview", // Set the title text
        // position: 'top', // Position the title at the top
        align: "start", // Align the title to the start (left) of the chart
        font: {
          weight: "bold", // Optionally, set font weight
          size: 16, // Optionally, set font size
        },
        padding: "10",
        color: "black",
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.8)",
          fontSize: 12,
          fontFamily: "Arial",
        },
      },
      y: {
        border: {
          width: 0,
        },

        grace: 0,
        min: 0,
        max: Math.ceil(maxCount / stepSize) * stepSize,
        ticks: {
          stepSize: stepSize,
          color: "rgba(0, 0, 0, 0.8)",
          fontSize: 12,
          fontFamily: "Arial", // Replaced with a static value
        },
      },
    },
  };

  // Data and options for bar graph
  const barOptions: any = {
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true, // Display the title
        text: "Template Converted", // Set the title text
        position: "top", // Position the title at the top
        align: "start", // Align the title to the start (left) of the chart
        font: {
          weight: "bold", // Optionally, set font weight
          size: 16, // Optionally, set font size
        },
        color: "black",
        padding: {
          top: 10, // Optionally, add padding to the top
          bottom: 10, // Optionally, add padding to the bottom
        },
      },
      layout: {
        padding: 50,
      },
      datalabels: {
        font: {
          weight: "bold",
        },
        align: "end",
        anchor: "end",
        formatter: function (value: any, context: any) {
          return context.chart.formattedData[context.dataIndex];
        },
      },
    },
  };
  const formattedData = ["01:00", "00:30", "01:11"];

  // Bar graph options
  let labels = [];
  let set = [];

  for (let key in chartDataset) {
    labels.push(key);
    set.push(chartDataset[key]);
    // backgroundColors.push("#FD8205"); // Add the color for each bar
  }
  const barData = {
    labels: labels,
    datasets: [
      {
        data: set, // Sample data for demonstration
        backgroundColor: ["#FD8205"], // Colors for bars
        datalabels: {
          formatter: function (value: any, context: any) {
            return formattedData[context.dataIndex];
          },
        },
      },
    ],
  };
  // Export CSV
  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(totalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, ".xlsx");
  };

  // Fetch chart data
  const chartData = async () => {
    try {
      const token = Cookies.get("isLoggedIn");
      const response = await axios.get(adminRoute.chartData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setChartDataset(response?.data?.templateUsageObject);
        setPercentageData(response?.data?.weeklyIncrease);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      message.error("Something went wrong");
    }
  };
  // Fetch table data
  const fetchTableData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("isLoggedIn");
      const response = await axios.get(adminRoute.dashboard, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setLoading(false);
        const DataList = response.data?.formattedUserList;
        setTableData(response?.data?.formattedUserList);
        setTotalData(DataList);
        setCurrentPageData(DataList.slice(0, pageSize));
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching table data:", error);
      message.error(error?.response?.data?.message || ServerError.Internal);
    }
  };

  // Fetch table data & chart data
  useEffect(() => {
    fetchTableData();
    chartData();
  }, []);

  // Set table data for current page
  useEffect(() => {
    setTableData(currentPageData);
  }, [currentPageData]);

  // Fetch line graph data once component mount
  useEffect(() => {
    LineGraphData();
  }, []);

  // Redirect to home page if user is not authorized
  useEffect(() => {
    const isSuperAdmin =
      typeof window !== "undefined" && localStorage.getItem("isAdmin");
    if (isSuperAdmin !== "superAdmin") {
      message.info(ClientPopup.Unauthorized);
      router.push("/home");
    }
  }, []);

  return (
    <div>
      <div className="name-tag">
        <span className="Dashboard-title">My Dashboard</span>
        <div className="dashboard-top">
          <Button
            type="primary"
            className={`date-btn-wrapper `}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <Image alt="" src={calendarIcon} className="calendar-icon" />
            <span className="calendar-text">{buttonName}</span>
          </Button>
          {/* ----------Date Modal---------- */}
          <Modal
            title="Select Date"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              // eslint-disable-next-line react/jsx-key
              <div className="calendar-footer">
                <Button type="default" onClick={handleCancel}>
                  Reset
                </Button>

                <Button type="default" onClick={handleOk}>
                  Done
                </Button>
              </div>,
            ]}
          >
            <Radio.Group onChange={onChange} value={value}>
              <Space direction="vertical">
                <Radio value={1}>Daily</Radio>
                <Radio value={2}>Weekly</Radio>
                <Radio value={3}>Monthly</Radio>
              </Space>
            </Radio.Group>
          </Modal>

          <div className="admin-teams-dropdown">
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
            >
              <div className="admin-dropdown">
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "24px",
                    height: "24px",
                    width: "160px",
                  }}
                >
                  {items[0].label} &nbsp;
                </span>
                <Image src={DownArrow} alt="" />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="admin-dashboard">
        {/* ----------------Performance %--------------- */}
        <Row className="admin-analysis-header">
          <Col className="left">
            <p className="performance-text">Performance</p>

            <div className="performance-rating">
              <Image src={UpArrow} alt="" />
              <p className="performance-percentage">{percentageData}</p>
              <p className="per-sign">%</p>
            </div>

            <div className="performance-text">
              <p>
                This section displays the aggregate performance of template
                conversions across all teams. It offers insights into the
                collective efficiency and effectiveness of our teams conversion
                efforts.
              </p>
            </div>
          </Col>
          {/* ----------------Line chart--------------- */}
          <Col className="right">
            <div className="performance-chart">
              <Line data={data} options={options} />
            </div>
          </Col>
        </Row>
      </div>
      {/* ----------------Bar chart--------------- */}
      <div className="chart-section">
        <Row className="chart-section-row">
          <Col span={12} className="chart-card">
            <div className="bar-charts ">
              <Bar options={barOptions} data={barData} />
            </div>
          </Col>
          <Col span={12} className="chart-card">
            <div className="bar-charts">
              <Bar options={barOptions} data={barData} />
            </div>
          </Col>
        </Row>
      </div>

      <div className="member-activity">
        <span className="member-activity-title">Member Activity</span>
        <Button className="export-csv-btn" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>
      {/* ----------------table--------------- */}
      <div className="dashboard-table">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={tableData}
            pagination={false}
            rowKey={(record) => record?.key}
          >
            <Column
              title="Name"
              key="Title"
              className="projectTitle"
              render={(record: DataType) => <span>{record?.name}</span>}
            />
            <Column
              title="Role"
              key="Title"
              className="projectTitle"
              render={(record: DataType) => <span>{record?.role}</span>}
            />
            <Column
              title="Team"
              dataIndex="teamName"
              key="team"
              className="lastSaved"
            />
            <Column
              title="#CV Converted"
              dataIndex="cvConverted"
              key="cvConverted"
              className="lastSaved"
            />
            <Column
              title="Time Spent"
              dataIndex="timeSpent"
              key="timeSpent"
              className="lastSaved"
            />
          </Table>
        )}
      </div>
      {/* ----------Pagination---------- */}
      <div className="dashtable-pagination">
        <Pagination
          current={currentPage}
          defaultCurrent={1}
          total={totalData?.length}
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
}

export default AdminDashboard;
