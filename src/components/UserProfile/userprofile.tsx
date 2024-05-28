"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import "./userprofile.css";
import DownArrowSvg from "../../assets/images/DownArrow";
import ChangePassWordForm from "./ChangePassWordForm";
import { UserContext } from "@/app/layout";
import { settingRoute } from "@/utils/apiRoute";
import { USER } from "./constant";

function UserProfile() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState({});
  const [userFormData, setUserFormData] = useState<any>({});
  const [loader, setLoader] = useState<boolean>(false);
  const [phoneValue, setPhoneValue] = useState<any>(null);
  const [isPhoneValid, setPhoneValid] = useState<boolean>(false);
  const { setUserName, setUserloader } = useContext(UserContext);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onFinish = (value: any) => {
    const userID = Number(
      typeof window !== "undefined" && window.localStorage.getItem("userId")
    );
    console.log("onFinish", value);
    const { mobile, ...rest } = value;
    setFormData({ id: 1, mobile: phoneValue, ...rest });

    if (value.mobile.length > 0) {
      setPhoneValid(true);
      console.log("if");
    } else {
      console.log("else");
      setPhoneValid(false);
    }

    setLoader(true);
    axios
      .put(settingRoute.setting, { id: userID, mobile: phoneValue, ...rest })
      .then((res) => {
        if (res?.status === 200) {
          message.success(res?.data?.message);
          const { Firstname, Lastname, username } = res?.data?.user;
          let fullName = Firstname.charAt(0) + Lastname.charAt(0);
          typeof window !== "undefined" &&
            window.localStorage.setItem("firstname", Firstname.charAt(0));
          typeof window !== "undefined" &&
            window.localStorage.setItem("lastname", Lastname.charAt(0));
          typeof window !== "undefined" &&
            window.localStorage.setItem("username", username);
          setUserName(fullName);
        }
        setLoader(false);
        setUserloader(false);
      });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const getDataUserId = async () => {
    const userID: any = Number(window.localStorage.getItem("userId"));
    const formData = new FormData();
    formData.append("userId", userID);

    try {
      const response = await axios
        .post(settingRoute.settingList, formData)
        .then((res: any) => res.data);

      setUserFormData(response.user);
      if (response.user.mobile) {
        setPhoneValid(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      Firstname: userFormData?.Firstname,
      Lastname: userFormData?.Lastname,
      username: userFormData?.username,
      mobile: userFormData?.mobile,
      email: userFormData?.email,
      Role: userFormData?.Role,
    });
    setPhoneValue(userFormData?.mobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFormData]);

  // Get Data from user
  useEffect(() => {
    getDataUserId();
  }, []);

  return (
    <>
      <div className="form-main">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={USER.FIRST_NAME.LABEL}
            name={USER.FIRST_NAME.NAME}
            className=""
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input placeholder={USER.FIRST_NAME.PLACEHOLDER} />
          </Form.Item>
          <Form.Item
            label={USER.LAST_NAME.LABEL}
            name={USER.LAST_NAME.NAME}
            className=""
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input placeholder={USER.LAST_NAME.PLACEHOLDER} />
          </Form.Item>
          <Form.Item
            label={USER.USER_NAME.LABEL}
            name={USER.USER_NAME.NAME}
            className=""
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input placeholder={USER.USER_NAME.PLACEHOLDER} />
          </Form.Item>
          <Form.Item
            className="country-code"
            label={USER.MOBILE.LABEL}
            name={USER.MOBILE.NAME}
            rules={[
              {
                validator: () =>
                  isPhoneValid
                    ? Promise.resolve()
                    : Promise.reject("Please enter a valid mobile number"),
              },
            ]}
          >
            <PhoneInput
              country={"hk"}
              value={phoneValue}
              enableLongNumbers={true}
              onChange={(
                value: any,
                country: any,
                e: any,
                formattedValue: any
              ) => {
                setPhoneValue(formattedValue);
                // console.log("phone", value, country, e, formattedValue);
                const { format, dialCode } = country;

                if (
                  format?.length === formattedValue?.length &&
                  (value.startsWith(dialCode) || dialCode.startsWith(value))
                ) {
                  setPhoneValid(true);
                } else {
                  setPhoneValid(false);
                }
              }}
              searchPlaceholder="Search country"
              enableSearch={true}
              disableSearchIcon={true}
            />
          </Form.Item>
          <Form.Item
            label={USER.EMAIL.LABEL}
            name={USER.EMAIL.NAME}
            className=""
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input placeholder={USER.EMAIL.PLACEHOLDER} />
          </Form.Item>
          <Form.Item
            label={USER.ROLE.LABEL}
            name={USER.ROLE.NAME}
            className=""
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Select
              onChange={handleChange}
              suffixIcon={<Icon component={DownArrowSvg} />}
              disabled
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Super Admin" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Password" className="">
            <div className="change-password" onClick={() => setVisible(true)}>
              Change Password
            </div>
          </Form.Item>
          <Form.Item label="" className=""></Form.Item>
          <Form.Item>
            <Button htmlType="submit">
              Save
              {loader && (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              )}
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Modal
        centered
        title="Change Password"
        open={visible}
        onCancel={handleCancel}
        closeIcon={false}
        className="change-password-modal"
        width={585}
        footer={false}
      >
        <ChangePassWordForm setVisible={setVisible} />
      </Modal>
    </>
  );
}

export default UserProfile;
