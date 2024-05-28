"use client";
import React from "react";
import Cookies from "js-cookie";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";

import "./login.css";
import LOGIN from "@/components/Constants/loginCommon";
import logo from "../../../public/assets/Login_header.png";
import { loginRoute } from "@/utils/apiRoute";
import { ClientPopup, PopupError } from "@/utils/messagePopup";
import { login } from "./constant";

const Login = () => {
  const router = useRouter();

  // LOGIN API
  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(loginRoute.auth, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data } = response;
      if (data.isLoggedIn) {
        const { token, user } = data;
        // Store the JWT token in a session cookie
        if (user.isActive === true) {
          Cookies.set("isLoggedIn", token);
          window.localStorage.setItem("userId", user.id);
          sessionStorage.setItem("loginToken", token);
          const { Firstname, Lastname, username } = user;
          window.localStorage.setItem("isAdmin", user.Role);
          window.localStorage.setItem("username", username);
          window.localStorage.setItem("email", user.email);
          window.localStorage.setItem("firstname", Firstname.charAt(0));
          window.localStorage.setItem("lastname", Lastname.charAt(0));
          message.info(ClientPopup.welcome(Firstname));
          if (user.Role === "superAdmin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/home");
          }
        } else {
          message.info(PopupError.suspended);
        }
      } else {
        message.error(data.message || PopupError.InvalidUser);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // Handle 401 Unauthorized error
        message.error(error?.response?.data?.message || PopupError.InvalidUser);
      } else {
        // Handle other errors
        console.error("Error caught:", error);
        message.error(PopupError.authError);
      }
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
              {`${login.H2}`} <br />
              {`${login.h2}`}
            </h2>
            <Form.Item
              name={LOGIN.EMAIL.NAME}
              rules={[
                {
                  required: true,
                  message: LOGIN.EMAIL.MESSAGE,
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                className="input-sections"
                placeholder={LOGIN.EMAIL.PLACEHOLDER}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name={LOGIN.PASSWORD.NAME}
              rules={[
                {
                  required: true,
                  message: LOGIN.PASSWORD.MESSAGE,
                },
              ]}
            >
              <Input.Password
                className="input-sections"
                placeholder={LOGIN.PASSWORD.PLACEHOLDER}
                size="large"
                style={{ textAlign: "center" }}
              />
            </Form.Item>

            <Link href="/forgot-password" className="forgot-password">
              <div className="forgot-password">{`${login.div}`}</div>
            </Link>

            <Form.Item>
              <div className="login-button">
                <Button htmlType="submit" size="large">
                  {LOGIN.SUBMIT.TYPE}
                </Button>
              </div>
            </Form.Item>
            <p className="forgot-password">
              {`${login.p1}`}{" "}
              <Link
                href="/register"
                style={{ color: "#fd8205" }}
                className="link-login"
              >
                {`${login.p2}`}
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
