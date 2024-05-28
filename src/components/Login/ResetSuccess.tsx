import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "antd";

import reset from "@/assets/images/reset.svg";
import logo from "../../../public/assets/Login_header.png";
import "./resetSuccess.css";
import { resetSuccess } from "./constant";

// Reset success component
const ResetSuccess = () => {
  const router = useRouter();

  // redirect to home
  const handleStartedClick = () => {
    router.push("/");
  };
  return (
    <div className="email-success-container">
      <Image src={logo} alt="" width={73} height={41} />
      <Image src={reset} alt="email" width={200} className="email-svg" />
      <h2>{`${resetSuccess.h2}`}</h2>
      <span className="verifyEmail-text">{`${resetSuccess.span}`}</span>
      <div className="verifyEmail-btn-section">
        <Button className="verifyEmail-btn" onClick={handleStartedClick}>
          {`${resetSuccess.btn}`}
        </Button>
      </div>
    </div>
  );
};

export default ResetSuccess;
