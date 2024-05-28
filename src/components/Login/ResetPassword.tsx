"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Spin, message } from "antd";
import Image from "next/image";
import jwt from "jsonwebtoken";
import axios from "axios";

import ResetSuccess from "./ResetSuccess";
import logo from "../../../public/assets/Login_header.png";
import "./resetPassword.css";
import { loginRoute } from "@/utils/apiRoute";
import { resetPass } from "./constant";

const ResetPassword = () => {
  const [resetPassword, setResetPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);

  // reset password api
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const jwtToken: any = new URL(window.location.href).searchParams.get(
        "jwt"
      );
      const decoded: any = jwt.decode(jwtToken);
      const response = await axios.put(loginRoute.resetPassword, {
        email: decoded.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      message.success(response.data.message);
      setResetPassword(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  // Extract email from jwt through url
  useEffect(() => {
    const url = new URL(window.location.href);
    const jwtToken: any = url.searchParams.get("jwt");
    const decoded: any = jwt.decode(jwtToken);
    setEmail(decoded?.email);
  }, []);

  return (
    <>
      {resetPassword ? (
        <ResetSuccess />
      ) : (
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
                <h2> {`${resetPass.h2}`}</h2>
                <p className="reset-description">{`${resetPass.p}`}</p>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "This field is required.",
                    },
                    {
                      min: 8, // Minimum password length
                      message: "Password must be at least 8 characters long",
                    },
                  ]}
                >
                  <Input.Password
                    className="input-sections"
                    placeholder="Enter your new password"
                    size="large"
                    style={{ textAlign: "center" }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "do not match password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The new password that you entered do not match!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    className="input-sections"
                    placeholder="Enter your confirm password"
                    size="large"
                    style={{ textAlign: "center" }}
                  />
                </Form.Item>
                <Form.Item>
                  <div className="login-button">
                    {loading ? (
                      <Spin />
                    ) : (
                      <Button htmlType="submit" size="large">
                        {`${resetPass.btn}`}
                      </Button>
                    )}
                  </div>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
