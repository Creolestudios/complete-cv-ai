"use client";
import React, { useContext, useEffect, useState } from "react";
import { Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdOutlineDashboard } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { RiHome6Line, RiLogoutBoxRLine } from "react-icons/ri";
import axios from "axios";

import "@/components/Navbar/navbar.css";
import logo from "../../../public/assets/Login_header.png";
import { UserContext } from "@/app/layout";
import { loginRoute } from "@/utils/apiRoute";
import { auth } from "@/utils/messagePopup";
import { header } from "./constant";

type Name = string | null | boolean;
const Navbar = () => {
  const router = useRouter();
  const [userNames, setUserNames] = useState("Username");
  const { userName, setUserName } = useContext(UserContext);
  const firstName: Name =
    typeof window !== "undefined" && window.localStorage.getItem("firstname");
  const lastName: Name =
    typeof window !== "undefined" && window.localStorage.getItem("lastname");

  const fullName: Name = `${firstName}${lastName}`;

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

  // set username for navbar
  useEffect(() => {
    setUserName(fullName);
    const userNameInfo =
      typeof window !== "undefined" && window.localStorage.getItem("username");
    if (userNameInfo) {
      setUserNames(userNameInfo);
    }
  }, []);

  const userRole =
    typeof window !== "undefined" && window.localStorage.getItem("isAdmin");

  // Dropdown menu
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a className="user-name">
          <span>{userNames}</span>
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <Link href="/home" className="nav-dashboard">
          <RiHome6Line size={20} />
          &nbsp; {`${header.link1}`}
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link href="/dashboard" className="nav-dashboard">
          <MdOutlineDashboard size={20} />
          &nbsp;{`${header.link2}`}
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link href="/settings" className="nav-settings">
          <IoSettingsOutline size={20} />
          &nbsp; {`${header.link3}`}
        </Link>
      ),
    },
    {
      key: "5",
      label: (
        <Link href="/" className="nav-logout" onClick={handleLogout}>
          <RiLogoutBoxRLine size={19} />
          &nbsp;{`${header.link4}`}
        </Link>
      ),
    },
  ];
  if (userRole === "superAdmin") {
    const superadminItem = {
      key: "6",
      label: (
        <Link href="/admin/dashboard" className="nav-dashboard">
          <MdOutlineDashboard size={20} />
          &nbsp;{`${header.link5}`}
        </Link>
      ),
    };

    // Insert the superadmin item at index 2 (after My Dashboard)
    items.splice(3, 0, superadminItem);
  }

  return (
    <div className="nav-main">
      <div className="nav-section">
        <div className="header-image">
          <Image src={logo} alt="" width={73} height={41} />
        </div>

        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="nav-dropdown1"
          arrow
        >
          <div className="nav-userLogo">
            <span className="userlogo-text">{userName}</span>
          </div>
        </Dropdown>
      </div>
      <div className="nav-text">
        <h5>
          {`${header.p1}`} <br />
          {`${header.p2}`}
        </h5>
      </div>
      <div className="nav-rectangle">
        <div className="rectangle rectangle1"></div>
        <div className="rectangle rectangle2"></div>
        <div className="rectangle rectangle3"></div>
      </div>
    </div>
  );
};

export default Navbar;
