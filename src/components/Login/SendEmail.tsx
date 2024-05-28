"use client";
import React, { useContext, useState } from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";

import { UserContext } from "@/app/layout";
import logo from "../../../public/assets/Login_header.png";
import { loginRoute } from "@/utils/apiRoute";
import "./sendEmail.css";
import { SendMail } from "./constant";

// Send email
const SendEmail = () => {
  const router = useRouter();
  const { setForgotEmail } = useContext(UserContext); // get email for context
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post(loginRoute.verifyEmail, {
        email: values.email,
      });
      message.success(response.data.message); // Display success message from server response
      setForgotEmail(values.email);
      router.push("/verify-user");
    } catch (error: any) {
      // Display error message from server response or handle other errors
      const errorMessage = error.response?.data?.message || "An error occurred";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  return (
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
              {`${SendMail.h2}`}
              <br />
              {`${SendMail.H1}`}
            </h2>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "This field is required.",
                },
              ]}
            >
              <Input
                className="input-sections"
                placeholder="Tuan@Sapahk.ai"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <div className="login-button">
                <Button htmlType="submit" size="large">
                  {`${SendMail.btn}`}{" "}
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
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SendEmail;
