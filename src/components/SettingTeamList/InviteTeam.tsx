import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Form, Input, Select, Checkbox, message, Spin } from "antd";
import Icon, { LoadingOutlined } from "@ant-design/icons";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

import DownArrowSvg from "../../assets/images/DownArrow";
import "./SettingTeamList.css";
import "../UserProfile/userprofile.css";
import { settingRoute } from "@/utils/apiRoute";
import { CREATE } from "./constant";

// Invite Team Component
const InviteTeam = ({ setOpen, onEditSuccess }: any) => {
  const [phoneValue, setPhoneValue] = useState<any>(null);
  const [isPhoneValid, setPhoneValid] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  const onFinish = async (value: any) => {
    setLoading(true);
    const requestData = {
      teamId: Number(teamId),
      username: value.userName || "",
      email: value.email || "",
      Firstname: value.firstName || "",
      Lastname: value.lastName || "",
      mobile: value.mobile || "",
      Role: value.role || "",
      status: isSuspended ? "suspended" : "active",
    };
    // Send request to server for inviter member
    try {
      const response = await axios.post(settingRoute.inviteMember, requestData);
      if (response.status === 201) {
        message.success(response.data.message);
        setLoading(false);
        setOpen(false);
        onEditSuccess();
        form.resetFields();
      } else {
        message.error(response.data.message);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        message.error(error.response.data.message);
      }
      setLoading(false);
    }
  };

  // Get team id from url
  useEffect(() => {
    const url = new URL(window.location.href);
    const id: any = url.pathname.split("/").pop();
    setTeamId(id);
  }, []);

  return (
    <div className="create-team-wrapper edit-team-member">
      <Form form={form} onFinish={onFinish}>
        <div className="invite-member">
          <div className="team-member">
            <div className="member-wrapper">
              <Form.Item
                label={CREATE.FIRST_NAME.LABEL}
                name={CREATE.FIRST_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={CREATE.LAST_NAME.LABEL}
                name={CREATE.LAST_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={CREATE.USER_NAME.LABEL}
                name={CREATE.USER_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={CREATE.MOBILE.LABEL}
                name={CREATE.MOBILE.NAME}
                className="country-code"
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
              <Form.Item label={CREATE.EMAIL.LABEL} name={CREATE.EMAIL.NAME}>
                <Input />
              </Form.Item>
              <Form.Item label={CREATE.ROLE.LABEL} name={CREATE.ROLE.NAME}>
                <Select
                  // defaultValue='admin'
                  onChange={handleChange}
                  suffixIcon={<Icon component={DownArrowSvg} />}
                  // disabled
                  options={[
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <Form.Item className="footer-form">
          <Checkbox onChange={(e) => setIsSuspended(e.target.checked)}>
            Suspend
          </Checkbox>
          <span></span>
          <div className="btn-wrapper">
            <Button className="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button htmlType="submit">
              Invite
              {loading && (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                />
              )}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default InviteTeam;
