"use client";
import React, { useState, useEffect, useContext } from "react";
import type { TabsProps } from "antd";
import { Tabs } from "antd";

import "@/components/settings/setting.css";
import UserProfile from "../UserProfile/userprofile";
import SettingTeamList from "../SettingTeamList/SettingTeamList";
import { UserContext } from "@/app/layout";

// Component for Settings
const SettingForm = () => {
  const { tabKey } = useContext(UserContext);
  const [admin, setAdmin] = useState<boolean>(false);

  // Tabs Items for settings
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Profile",
      children: <UserProfile />,
    },
    {
      key: "2",
      label: "Team",
      children: <SettingTeamList />,
    },
  ];

  const filteredItems = admin
    ? items
    : items.filter((item) => item.key !== "2");

  // Check if user is Admin or not
  useEffect(() => {
    const checkAdmin =
      typeof window !== "undefined" && window.localStorage.getItem("isAdmin");
    if (checkAdmin === "admin" || checkAdmin === "superAdmin") {
      setAdmin(true);
    }
  }, []);
  return (
    <div>
      <div className="tab-tag">
        <h2>Settings</h2>
        <Tabs defaultActiveKey={tabKey}>
          {filteredItems.map((item) => (
            <Tabs.TabPane key={item.key} tab={item.label}>
              {item.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingForm;
