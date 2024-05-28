"use client";
import React, { useContext, useEffect, useState } from "react";
import { Dropdown, MenuProps, message } from "antd";
import { MdOutlineDashboard } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { RiHome6Line, RiLogoutBoxRLine } from "react-icons/ri";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import "./header.css";
import logo from "../../../public/assets/Login_header.png";
import { UserContext } from "@/app/layout";
import { loginRoute } from "@/utils/apiRoute";
import { auth } from "@/utils/messagePopup";
import { header } from "../Navbar/constant";

// Header component
const Header = ({ backgroundColor, headerImageBackgroundColor }: any) => {
  const router = useRouter();

  const { userName, setUserName, userloader } = useContext(UserContext);
  const [userRoles, setUserRoles] = useState<string | boolean | null>("");
  const [name, setName] = useState(
    typeof window !== "undefined" && window.localStorage.getItem("username")
  );
  const [firstName, setFirstName] = useState<string | boolean | null>(
    typeof window !== "undefined" && window.localStorage.getItem("firstname")
  );
  const [lastName, setLastName] = useState<string | boolean | null>(
    typeof window !== "undefined" && window.localStorage.getItem("lastname")
  );

  // Logout API
  const handleLogout = async () => {
    try {
      const response = await axios.get(loginRoute.logout);
      if (response.status === 200) {
        typeof window !== "undefined" && window.localStorage.clear();
        sessionStorage.removeItem("loginToken");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      message.error(auth.wentWrong);
    }
  };
  // Dropdown menu
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <a className="header-user-name">{name}</a>,
    },
    {
      key: "2",
      label: (
        <Link href="/home" className="header-dashboard">
          <RiHome6Line size={20} />
          &nbsp;{`${header.link1}`}
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link href="/dashboard" className="header-dashboard">
          <MdOutlineDashboard size={20} />
          &nbsp;{`${header.link2}`}
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link href="/settings" className="header-settings">
          <IoSettingsOutline size={20} />
          &nbsp;{`${header.link3}`}
        </Link>
      ),
    },
    {
      key: "5",
      label: (
        <Link href="/" className="header-logout" onClick={handleLogout}>
          <RiLogoutBoxRLine size={19} />
          &nbsp;{`${header.link4}`}
        </Link>
      ),
    },
  ];
  if (userRoles === "superAdmin") {
    const superadminItem = {
      key: "6",
      label: (
        <Link href="/admin/dashboard" className="header-dashboard">
          <MdOutlineDashboard size={20} />
          &nbsp;{`${header.link5}`}
        </Link>
      ),
    };

    // Insert the superadmin item at index 2 (after My Dashboard)
    items.splice(3, 0, superadminItem);
  }

  // set Username once login
  useEffect(() => {
    setUserName(`${firstName}${lastName}`);
  }, []);

  useEffect(() => {
    let currentName =
      typeof window !== "undefined" && window.localStorage.getItem("username");
    if (currentName !== name) {
      setName(currentName);
    }
    const userRole =
      typeof window !== "undefined" && window.localStorage.getItem("isAdmin");
    console.log(userRole);
    setUserRoles(userRole);
  }, [userloader]);

  return (
    <div className="header-main" style={{ backgroundColor }}>
      <div
        className="headerImage"
        style={{ backgroundColor: headerImageBackgroundColor }}
      >
        <Link href={"/home"}>
          <Image src={logo} alt="header-img" width={73} height={41} />
        </Link>
      </div>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement="bottomRight"
        overlayClassName="header-dropdown"
        arrow
      >
        <div className="header-userLogo">
          <span className="header-usertext">{userName}</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default Header;
