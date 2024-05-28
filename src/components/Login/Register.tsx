"use client";
import React, { useContext, useState } from "react";
import { Button, Form, Input, Modal, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";

import "./register.css";
import logo from "../../../public/assets/Login_header.png";
import "./login.css";
import { loginRoute } from "@/utils/apiRoute";
import { PopupError } from "@/utils/messagePopup";
import { UserContext } from "@/app/layout";
import { REGISTER } from "../Constants/registerCommon";
import { register, verify } from "./constant";

const Register = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { setForgotEmail, setVerified } = useContext(UserContext);

  // register api
  const onFinish = async (values: any) => {
    // Req Data
    const registerData = {
      email: values?.Email,
      firstname: values?.FirstName,
      lastname: values?.LastName,
      password: values?.Password,
    };
    setForgotEmail(values?.Email);
    setLoading(true);
    try {
      const response = await axios.post(loginRoute.register, registerData);
      if (response?.status === 201) {
        message.success(response?.data?.message);
        setModalOpen(true);
      } else {
        message.error(response?.data?.message);
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error(PopupError.tryAgain);
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleVerifyClick = () => {
    setVerified(true);
    router.push("/verify-user");
    setModalOpen(false);
  };
  const customCloseIcon = (
    <div onClick={handleModalClose}>
      <Image
        src="assets/close-circle.svg"
        alt="Close Icon"
        width={26}
        height={26}
        style={{ width: "26px", height: "26px", cursor: "pointer !important" }}
      />
    </div>
  );

  return (
    <>
      <div className="login-container">
        <div className="login-leftPart"></div>
        <div className="login-section">
          <div className="login-menu">
            <Form
              name="basic"
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <div className="header-image">
                <Image src={logo} alt="" width={73} height={41} />
              </div>
              <h2>
                {`${register.H2}`} <br />
                {`${register.h2}`}
              </h2>
              <Form.Item
                name={REGISTER.FIRSTNAME.NAME}
                rules={[
                  {
                    required: true,
                    message: REGISTER.FIRSTNAME.MESSAGE,
                  },
                ]}
              >
                <Input
                  className="input-sections"
                  placeholder={REGISTER.FIRSTNAME.PLACEHOLDER}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name={REGISTER.LASTNAME.NAME}
                rules={[
                  {
                    required: true,
                    message: REGISTER.LASTNAME.MESSAGE,
                  },
                ]}
              >
                <Input
                  className="input-sections"
                  placeholder={REGISTER.LASTNAME.PLACEHOLDER}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name={REGISTER.EMAIL.NAME}
                rules={[
                  {
                    required: true,
                    message: REGISTER.EMAIL.MESSAGE,
                  },
                ]}
              >
                <Input
                  className="input-sections"
                  placeholder={REGISTER.EMAIL.PLACEHOLDER}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name={REGISTER.PASSWORD.NAME}
                rules={[
                  {
                    required: true,
                    message: REGISTER.PASSWORD.MESSAGE,
                  },
                ]}
              >
                <Input.Password
                  className="input-sections"
                  placeholder={REGISTER.PASSWORD.PLACEHOLDER}
                  size="large"
                  style={{ textAlign: "center" }}
                />
              </Form.Item>
              <Form.Item>
                <div className="login-button">
                  <Button htmlType="submit" size="large">
                    {REGISTER.SUBMIT.TYPE}{" "}
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
              </Form.Item>
              <p className="forgot-password">
                {`${register.p}`}{" "}
                <Link
                  href="/"
                  style={{ color: "#fd8205" }}
                  className="link-login"
                >
                  {`${register.link}`}
                </Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
      {/* verify modal */}
      <Modal
        title="Verify your email to sign up"
        open={modalOpen}
        className="verify-modal"
        centered
        closeIcon={customCloseIcon}
        width={688}
        footer={false}
      >
        <div>
          <div className="verifyModal-text">
            <span>
              {`${verify.span1}`}
              {`${verify.span2}`}
              <span style={{ color: "#fd8205" }}> {`${verify.span3}`}</span>
              and
              <span style={{ color: "#fd8205" }}> {`${verify.span4}`}</span>
            </span>
          </div>
          <div className="verifyModal-btn-section">
            <Button
              key="continue"
              className="modal-verify-btn"
              type="primary"
              onClick={handleVerifyClick}
            >
              {`${verify.button}`}
            </Button>
          </div>

          <div className="verifyModal-bottom-text">
            <span>{`${verify.span5}`}</span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Register;
