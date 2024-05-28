import React, { useContext, useState } from "react";
import Image from "next/image";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin, message } from "antd";
import { UserContext } from "@/app/layout";
import axios from "axios";

import { loginRoute } from "@/utils/apiRoute";
import "./verifyEmail.css";
import logo from "../../../public/assets/Login_header.png";
import { ClientPopup, PopupError } from "@/utils/messagePopup";
import { verifyMail } from "./constant";

// Function for Resending email for reset password.

const VerifyEmail = () => {
  const { forgotEmail, verified } = useContext(UserContext); // get email from context
  const [loading, setLoading] = useState<boolean>(false);
  const [disableResend, setDisableResend] = useState<boolean>(false);

  // Function for Resending email for reset password
  const handleVerifyClick = async () => {
    setLoading(true);
    try {
      const response = await axios.post(loginRoute.verifyEmail, {
        email: forgotEmail,
      });
      if (response.status === 200) {
        message.success(response.data.message);
        setDisableResend(true);
        message.info(ClientPopup.WaitForMin);
        // Enable the button after 3 minutes to prevent user from spamming
        setTimeout(() => {
          setDisableResend(false);
        }, 3 * 60 * 1000);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(PopupError.tryAgain);
    }
  };

  // Function for resend email verification after registration
  const handleEmailverify = async () => {
    setLoading(true);
    try {
      const response = await axios.post(loginRoute.resendVerifyEmail, {
        email: forgotEmail,
      });
      if (response.status === 200) {
        message.success(response.data.message);
        setDisableResend(true);
        message.info(ClientPopup.WaitForMin);
        // Enable the button after 3 minutes to prevent user from spamming
        setTimeout(() => {
          setDisableResend(false);
        }, 3 * 60 * 1000);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error(PopupError.tryAgain);
      }
      message.error(PopupError.tryAgain);
    }
  };
  return (
    <div className="login-container">
      <div className="login-leftPart"></div>
      <div className="login-section">
        <div className="login-menu">
          <div className="header-image">
            <Image src={logo} alt="" width={73} height={41} />
            <h2>
              {`${verifyMail.h2}`} <br />
              {`${verifyMail.h21}`}
            </h2>
            <div className="verify-email-text">
              <span>
                {`${verifyMail.span}`}{" "}
                <span style={{ color: "black" }}>{forgotEmail}</span>
              </span>
              <br />
              <span>
                {`${verifyMail.span1}`}{" "}
                {verified ? "verification process" : "reset password process"}.
              </span>
            </div>
            <div className="verifyEmail-btn-section">
              <Button
                className="verifyEmail-btn"
                type="primary"
                onClick={verified ? handleEmailverify : handleVerifyClick}
                disabled={disableResend}
              >
                {`${verifyMail.btn}`}
                {loading && (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 24, color: "white" }}
                        spin
                      />
                    }
                  />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
