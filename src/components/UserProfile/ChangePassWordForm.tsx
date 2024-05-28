import React from "react";
import { Button, Form, Input, message } from "antd";
import axios from "axios";

import { settingRoute } from "@/utils/apiRoute";
import { Popup } from "@/utils/messagePopup";
import { PASS } from "./constant";

// Change Password Component
const ChangePassWordForm = ({ setVisible }: any) => {
  const [form] = Form.useForm();

  const onFinish = async (value: any) => {
    const userID = Number(window.localStorage.getItem("userId"));
    try {
      const response: any = await axios
        .put(settingRoute.passwordChange, {
          id: userID,
          ...value,
        })
        .then((res) => res?.data);

      if (response.error) {
        message.error(response.error);
      } else {
        message.success(Popup.passwordChange);
        setVisible(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name={PASS.OLD_PASSWORD.NAME}
          label={PASS.OLD_PASSWORD.LABEL}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name={PASS.NEW_PASSWORD.NAME}
          label={PASS.NEW_PASSWORD.LABEL}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name={PASS.CONFIRM_PASSWORD.NAME}
          label={PASS.CONFIRM_PASSWORD.LABEL}
          rules={[
            { required: true, message: "do not match password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue(PASS.NEW_PASSWORD.NAME) === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <div className="btn-wrapper">
            <Button className="cancel" onClick={() => setVisible(false)}>
              Cancel
            </Button>
            <Button htmlType="submit">Change Password</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassWordForm;
