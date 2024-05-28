"use client";
import React, { useState } from "react";
import { Input, Button, Modal } from "antd";
import axios from "axios";

import "./SettingTeamList.css";
import TeamTable from "./TeamTable";
import "../DashboardTable/table.css";
import CreateTeam from "./CreateTeam";
import { settingRoute } from "@/utils/apiRoute";

// Component for Setting Team List
const SettingTeamList = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [temp, setTemp] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    setOpen(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setOpen(false);
  };

  const handleButtonClick = () => {
    setOpen(true);
  };

  // Search Function for Team List
  const handleSearch = async (value: string) => {
    try {
      const formData = new FormData();
      formData.append("query", value);

      const response = await axios.post(settingRoute.teamNameSearch, formData);
      setFilteredData(response.data.teamList);
    } catch (error) {
      console.error("Error searching teams:", error);
    }
  };

  return (
    <div>
      <div className="dashboard-top">
        <Input
          placeholder="Search Team"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => {
            const { value } = e.target;
            setSearchTerm(value);
            // Call handleSearch immediately after updating the search term
            handleSearch(value);
          }}
        />
        <Button onClick={handleButtonClick}>Create Team</Button>
      </div>
      <TeamTable setTemp={setTemp} temp={temp} filteredData={filteredData} />
      <Modal
        title="Create Team"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={841}
        className="create-team-modal"
        footer={""}
      >
        <CreateTeam setOpen={setOpen} setTemp={setTemp} />
      </Modal>
    </div>
  );
};

export default SettingTeamList;
