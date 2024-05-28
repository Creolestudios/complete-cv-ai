import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select, Checkbox, message } from "antd";
import axios from "axios";
import Icon from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import DownArrowSvg from "../../assets/images/DownArrow";
import "./SettingTeamList.css";
import "../UserProfile/userprofile.css";
import { settingRoute } from "@/utils/apiRoute";
import { EDIT } from "./constant";

// Edit Team Component
const EditTeam = ({
  setOpen,
  memberData,
  onEditSuccess,
}: {
  setOpen: any;
  memberData: any;
  onEditSuccess: any;
}) => {
  const [phoneValue, setPhoneValue] = useState<any>(null);
  const [isPhoneValid, setPhoneValid] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Populate form fields with memberData when it changes
    if (memberData) {
      if (memberData?.isActive === false) {
        setIsSuspended(true);
      } else {
        setIsSuspended(false);
      }
      form.setFieldsValue({
        Firstname: memberData.Firstname,
        Lastname: memberData.Lastname,
        username: memberData.username,
        mobile: memberData.mobile,
        email: memberData.email,
        role: memberData.Role,
      });
      setPhoneValue(memberData.mobile);
    }
  }, [memberData]);

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  // Edit member data from team
  const onFinish = async (value: any) => {
    const requestData = {
      id: memberData.id,
      username: value.username || "",
      email: value.email || "",
      Firstname: value.Firstname || "",
      Lastname: value.Lastname || "",
      mobile: value.mobile || "",
      Role: value.role || "",
      status: isSuspended ? "Suspended" : "Active",
    };
    // Send request to server for edit member
    try {
      const response = await axios.put(settingRoute.editMember, requestData);
      if (response.status === 200) {
        setOpen(false);
        message.success(response.data.message);
        onEditSuccess();
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response.data.message);
    }
  };

  return (
    <div className="create-team-wrapper edit-team-member">
      <Form form={form} onFinish={onFinish}>
        <div className="invite-member">
          <div className="team-member">
            <div className="member-wrapper">
              <Form.Item
                label={EDIT.FIRST_NAME.LABEL}
                name={EDIT.FIRST_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={EDIT.LAST_NAME.LABEL}
                name={EDIT.LAST_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={EDIT.USER_NAME.LABEL}
                name={EDIT.USER_NAME.NAME}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={EDIT.MOBILE.LABEL}
                name={EDIT.MOBILE.NAME}
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
              <Form.Item label={EDIT.EMAIL.LABEL} name={EDIT.EMAIL.NAME}>
                <Input disabled />
              </Form.Item>
              <Form.Item label={EDIT.ROLE.LABEL} name={EDIT.ROLE.NAME}>
                <Select
                  onChange={handleChange}
                  suffixIcon={<Icon component={DownArrowSvg} />}
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
          <Checkbox
            onChange={(e) => setIsSuspended(e.target.checked)}
            checked={isSuspended}
          >
            Suspend
          </Checkbox>
          <div className="btn-wrapper">
            <Button className="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button htmlType="submit">Save</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTeam;
