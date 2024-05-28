import Image from "next/image";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { Button, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";

import email from "@/assets/images/email.svg";
import logo from "../../../public/assets/Login_header.png";
import "./emailSuccess.css";
import { PopupError } from "@/utils/messagePopup";
import { loginRoute } from "@/utils/apiRoute";
import { emailSuccess } from "./constant";

// Email success component
const EmailSuccess = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  // If verified, redirect to home
  const handleStartedClick = () => {
    if (verified) {
      router.push("/");
    }
  };

  // Function for Verify email
  const checkVerify = async () => {
    setLoading(true);
    try {
      const jwtToken: any = new URL(window.location.href).searchParams.get(
        "jwt"
      );
      const decoded: any = jwt.decode(jwtToken);
      if (decoded) {
        console.log(decoded);
        const formData = new FormData();
        const verify: any = true;
        formData.append("email", decoded?.email);
        formData.append("verification", verify);
        const response = await axios.post(
          loginRoute.registrationVerify,
          formData
        );
        if (response.status === 200) {
          message.success(response.data.message);
          setVerified(true);
        }
      }
    } catch (error) {
      setLoading(false);
      message.error(PopupError.tryAgain);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVerify();
  }, []);

  return (
    <>
      {loading ? (
        <div className="email-success-container">
          <Spin size="large" />
        </div>
      ) : (
        <div className="email-success-container">
          <Image src={logo} alt="" width={73} height={41} />
          <Image src={email} alt="email" width={200} className="email-svg" />
          <>
            <h2>{`${emailSuccess.h2}`}</h2>
            <span className="verifyEmail-text">{`${emailSuccess.span}`}</span>
            <div className="verifyEmail-btn-section">
              <Button className="verifyEmail-btn" onClick={handleStartedClick}>
                {`${emailSuccess.Btn}`}
              </Button>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default EmailSuccess;
