"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Modal, Table, message, Checkbox, Spin } from "antd";
import Image from "next/image";
import axios from "axios";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import Icon from "@ant-design/icons";

import "./SettingTeamList.css";
import "../DashboardTable/table.css";
import filterIcon from "../../../public/assets/dashboard/filter.svg";
import LeftArrow from "../../assets/images/LeftArrow";
import PencilIcon from "../../assets/images/PencilIcon";
import EditTeam from "./EditTeam";
import InviteTeam from "./InviteTeam";
import { UserContext } from "@/app/layout";
import { settingRoute } from "@/utils/apiRoute";
import { ClientPopup, listTeam } from "@/utils/messagePopup";

const { Column } = Table;

interface DataType {
  isActive: any;
  Lastname: string;
  Firstname: string;
  TemplateId: any;
  id: string | number;
  key: string | number;
  TemplateName: string;
  Path: string;
  name: string;
  activeSince: string;
  status: string;
  member: string;
  username: string;
  Role: string;
}
const itemFilter2 = ["Active", "Suspended"];

// Team Detail Component
const TeamDetail = () => {
  const [checkedList, setCheckedList] = useState(itemFilter2);
  const [dataSources, setDataSources] = useState<any>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [memberData, setMemberData] = useState(null);

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    setEditOpen(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setEditOpen(false);
  };

  const CheckboxGroup = Checkbox.Group;

  const onChangeBox = async (list: any) => {
    setLoading(true);

    try {
      const formData = new FormData();
      const statusValue = list.length > 0 ? list.join(",") : "all";
      const team_id: any = teamId;
      formData.append("status", String(statusValue));
      formData.append("teamId", team_id);
      // Assuming you have an API endpoint for fetching data based on status
      const response = await axios.post(settingRoute.memberStatus, formData);
      // Update the data with the response data
      setDataSources(response.data.teamDetails);
    } catch (error) {
      console.error(error);
      message.error(ClientPopup.tableErr);
    }
    setCheckedList(list);
    setLoading(false);
    setCheckedList(list);
  };

  const onCheckAllChange = (e: any) => {
    setCheckedList(e.target.checked ? itemFilter2 : []);
  };

  // List team member data for [ Edit ]
  const handleDataList = async (id: any) => {
    try {
      const data: any = Number(id);
      const formData = new FormData();
      formData.append("userId", data);
      const res = await axios.post(settingRoute.memberData, formData);
      setEditOpen(true);
      setMemberData(res?.data?.user);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (teamId) {
      handleTeamNameClick(teamId);
    }
  }, [teamId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const id: any = url.pathname.split("/").pop();
    setTeamId(id);
  }, []);

  // Getting team member list data from server
  const handleTeamNameClick = async (teamId: any) => {
    setLoading(true);
    try {
      const team_id: any = Number(teamId);
      const formData = new FormData();
      formData.append("teamId", team_id);
      const response: any = await axios.post(
        settingRoute.listTeamData,
        formData
      );
      setDataSources(response.data.teamDetails);
    } catch (error) {
      message.error(listTeam.teamData);
    }
    setLoading(false);
  };

  // Fetch the updated member list data
  const handleEditSuccess = async () => {
    // handleTeamNameClick fetches the member list data
    await handleTeamNameClick(teamId);
  };

  const { setTabKey } = useContext(UserContext);

  return (
    <>
      <div className="team-detail-wrapper">
        <div className="breadcrum-header">
          <div className="breadcrumb">
            <Link href={"/settings"} onClick={() => setTabKey("2")}>
              {" "}
              <Icon component={LeftArrow} />{" "}
            </Link>
            <span className="title">{dataSources?.teamName}</span>
          </div>
          <div className="btn-wapper">
            <Button onClick={() => setInviteOpen(true)}>Invite Member</Button>
          </div>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={dataSources?.members}
            pagination={false}
            rowKey={(record) => record?.id}
          >
            <Column
              title="Name"
              dataIndex="Firstname"
              key="Firstname"
              className="team-name"
              render={(_, record: DataType) => (
                <div className="preview-link-color-table-details">
                  <span>{`${record?.Firstname} ${record?.Lastname}`}</span>
                </div>
              )}
            />
            <Column
              title="User Name"
              key="username"
              className="team-name"
              render={(_, record: DataType) => <div>{record?.username}</div>}
            />
            <Column
              title="Status"
              dataIndex="isActive"
              key="status"
              className="status"
              render={(isActive: boolean) => (
                <div className={isActive ? "active" : "suspended"}>
                  {isActive ? "Active" : "Suspended"}
                </div>
              )}
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
              onFilter={(value: any, record: DataType) => {
                // Assuming 'value' is 'Active' or 'Suspended'
                return record.status === value;
              }}
              filterIcon={
                <div className="templateFilter-icon">
                  <Image src={filterIcon} alt="images-filter" />
                </div>
              }
            />
            <Column
              title="Role"
              dataIndex="Role"
              key="role"
              className="role"
              render={(_, record: DataType) => <div>{record?.Role}</div>}
            />
            <Column
              title="Action"
              key=""
              className=""
              render={(_, record: DataType) => (
                <div
                  onClick={() => {
                    handleDataList(record?.id);
                  }}
                >
                  <Icon component={PencilIcon} />
                </div>
              )}
            />
          </Table>
        )}
      </div>
      <Modal
        centered
        title="Edit Member"
        open={editOpen}
        onOk={handleOk}
        closeIcon={false}
        width={841}
        className="edit-team-wrapper"
        footer={""}
      >
        <EditTeam
          setOpen={setEditOpen}
          memberData={memberData}
          onEditSuccess={handleEditSuccess}
        />
      </Modal>
      <Modal
        centered
        title="Invite Member"
        open={inviteOpen}
        onOk={handleOk}
        closeIcon={false}
        width={841}
        className="edit-team-wrapper"
        footer={""}
      >
        <InviteTeam setOpen={setInviteOpen} onEditSuccess={handleEditSuccess} />
      </Modal>
    </>
  );
};

export default TeamDetail;
