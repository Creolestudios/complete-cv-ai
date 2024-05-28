"use client";
import React, { createContext, useEffect, useState } from "react";
import SettingForm from "./settingform";
import "./setting.css";

export const UserContext = createContext<any>("");

// Main Component for Settings
const SettingsComp = () => {
  const [userName, setUserName] = useState<any>("");
  console.log(userName);

  // Function for setting user name
  useEffect(() => {
    const currentFirstName: any =
      typeof window !== "undefined" && window.localStorage.getItem("firstname");
    const currentLastName: any =
      typeof window !== "undefined" && window.localStorage.getItem("lastname");
    setUserName(currentFirstName + currentLastName);
  }, []);

  return <SettingForm />;
};

export default SettingsComp;
