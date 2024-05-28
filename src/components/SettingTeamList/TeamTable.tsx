"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Table, message, Checkbox, Spin, Modal } from "antd";
import axios from "axios";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import Image from "next/image";
import Icon from "@ant-design/icons/lib/components/Icon";
import Cookies from "js-cookie";

import filterIcon from "../../../public/assets/dashboard/filter.svg";
import PencilIcon from "@/assets/images/PencilIcon";
import { settingRoute } from "@/utils/apiRoute";
import CreateTeam from "./CreateTeam";
import { ClientPopup, listTeam } from "@/utils/messagePopup";

const { Column } = Table;

interface DataType {
  memberCount: any;
  teamName: any;
  TemplateId: any;
  id: string | number;
  key: string | number;
  TemplateName: string;
  Path: string;
  name: string;
  activeSince: string;
  status: string;
  member: string;
}

const itemFilter2 = ["Active", "Suspended"];

const TeamTable = ({
  setTemp,
  temp,
  filteredData,
}: {
  setTemp: Function;
  temp: any;
  filteredData: any;
}) => {
  const [checkedList, setCheckedList] = useState(itemFilter2);
  const [openTeam, setOpenTeam] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [dataSources, setDataSources] = useState<any>([]);
  const [createTeamIndicate, setCreateTeamIndicate] = useState<boolean>(false);
  const [editableField, setEditableField] = useState<any>(false);
  const [teamData, setTeamData] = useState(null);

  const CheckboxGroup = Checkbox.Group;
  const teamList = async () => {
    const token = Cookies.get("isLoggedIn");
    setLoading(true);
    try {
      const response = await fetch(settingRoute.teamList, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });
      if (response.status === 200) {
        const responseData = await response.json();
        setDataSources(responseData?.teamList);
      }
    } catch (error: any) {
      message.error(error.response.data.message);
    }
    setLoading(false);
  };

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    setOpenTeam(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setOpenTeam(false);
  };

  const onChangeBox = async (list: any) => {
    console.log("list", list);

    setLoading(true);
    try {
      const formData = new FormData();
      const statusValue = list.length > 0 ? list.join(",") : "all";
      console.log("statusValue", statusValue);
      formData.append("status", String(statusValue));
      // Assuming you have an API endpoint for fetching data based on status
      const response = await axios.post(settingRoute.teamStatus, formData);
      // Update the data with the response data
      setDataSources(response.data.teamList);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error(ClientPopup.tableErr);
    }
    setCheckedList(list);
    setLoading(false);
  };

  const handleEditTeam = async (value: any) => {
    setOpenTeam(true);
    setEditableField(true);
    try {
      const id: any = Number(value);
      const formData = new FormData();
      formData.append("teamId", id);
      const response = await axios.post(settingRoute.listTeamData, formData);
      setTeamData(response?.data?.teamDetails);
    } catch (error) {
      console.log(error);
      message.error(listTeam.edit);
    }
  };

  useEffect(() => {
    teamList();
  }, [temp]);

  useEffect(() => {
    const updatedFilters = itemFilter2.map((e) => e);
    setSelectedFilters(updatedFilters);
    setCreateTeamIndicate(false);
  }, []);

  // Update dataSource with filtered data
  useEffect(() => {
    setDataSources(filteredData);
  }, [filteredData]);

  return (
    <div className="setting-table-wrapper">
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spin />
        </div>
      ) : (
        <Table
          dataSource={dataSources}
          pagination={false}
          rowKey={(record) => record?.id}
        >
          <Column
            title="Team Name"
            dataIndex="teamName"
            key="teamName"
            className="team-name"
            render={(_, record: DataType) => (
              <Link
                href={`/settings/team/${record?.id}`}
                className="preview-link-color-table-details"
              >
                <span>{record?.teamName}</span>
              </Link>
            )}
          />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            className="status"
            filterDropdown={
              <div className="filter-drop-wrapper">
                <div className="all">
                  <Checkbox
                    onChange={(e: CheckboxChangeEvent) => {
                      const list = e.target.checked ? itemFilter2 : [];
                      setCheckedList(list);
                      onChangeBox(list);
                    }}
                    checked={checkedList.length === itemFilter2.length}
                  >
                    All
                  </Checkbox>
                </div>
                <CheckboxGroup
                  options={itemFilter2}
                  value={checkedList}
                  onChange={onChangeBox}
                />
              </div>
            }
            filterIcon={
              <div className="templateFilter-icon">
                <Image src={filterIcon} alt="images-filter" />
              </div>
            }
          />
          <Column
            title="No of members"
            dataIndex="memberCount"
            key="member"
            className="member"
            render={(_, record: DataType) => <div>{record?.memberCount}</div>}
          />
          <Column
            title="Active since"
            key="activeSince"
            className="active-since"
            render={(_, record: DataType) => <div>{record?.activeSince}</div>}
          />
          <Column
            title="Action"
            key=""
            className=""
            render={(record: DataType) => (
              <div
                onClick={() => {
                  handleEditTeam(record?.id);
                }}
              >
                <Icon component={PencilIcon} />
              </div>
            )}
          />
        </Table>
      )}
      <Modal
        title={editableField ? "Edit Team" : "Create Team"}
        open={openTeam}
        onOk={handleOk}
        onCancel={handleCancel}
        width={841}
        className="create-team-modal"
        footer={""}
      >
        <CreateTeam
          setTemp={setTemp}
          editableField={editableField}
          setOpenTeam={setOpenTeam}
          teamData={teamData}
          setTeamData={setTeamData}
        />
      </Modal>
    </div>
  );
};

export default TeamTable;
