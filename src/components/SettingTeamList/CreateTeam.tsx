"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select, Checkbox, message, Spin } from "antd";
import Icon, { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import Cookies from "js-cookie";

import DownArrowSvg from "../../assets/images/DownArrow";
import PlusIcon from "../../assets/images/PlusIcon";
import DeleteIcon from "../../assets/images/DeleteIcon";
import { settingRoute } from "@/utils/apiRoute";
import { Popup, listTeam } from "@/utils/messagePopup";
import { CREATE } from "./constant";

// Create team component
const CreateTeam = ({
  setTemp,
  setOpen,
  editableField,
  setOpenTeam,
  teamData,
  setTeamData,
}: {
  setTemp?: any;
  setOpen?: any;
  editableField?: any;
  setOpenTeam?: any;
  teamData?: any;
  setTeamData?: any;
}) => {
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [isPhoneValid, setPhoneValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [buttonLoader, setButtonLoader] = useState<boolean>(false);
  const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<boolean>(false);
  const [isTeamSuspended, setIsTeamSuspended] = useState<boolean>(false);
  const [members, setMembers] = useState<any>([
    {
      member: 1,
    },
  ]);

  const [form] = Form.useForm();

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onFinish = async (value: any) => {
    if (editableField) {
      console.log("values for edit true only ", value);
      const members = [];
      let i = 0;
      while (value[`userName${i}`] !== undefined) {
        members.push({
          username: value[`userName${i}`] || "",
          email: value[`email${i}`] || "",
          Firstname: value[`firstName${i}`] || "",
          Lastname: value[`lastName${i}`] || "",
          mobile: value[`mobile${i}`] || "",
          Role: value[`role${i}`] || "",
        });
        i++;
      }

      const requestData = {
        teamId: teamData?.id,
        teamName: value.teamName,
        teamDescription: value.description,
        status: isSuspended ? "Suspended" : "Active",
        members: members,
      };
      try {
        setTemp(true);
        const response = await axios.post(settingRoute.editTeam, requestData);
        if (response.status === 200) {
          message.success(response.data.message);
          setOpenTeam(false);
          setTemp(false);
        }
        setTemp(false);
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // If there's an error response with a message, log it
          console.error("Error in creating team:", error.response.data.message);
          message.error(error.response.data.message);
        } else {
          // If there's no error message in the response, log a generic error message
          console.error("Error in creating team:", error.message);
          message.error(listTeam.NotCreate);
        }
      }
    } else {
      const members = [];
      let i = 0;
      while (value[`userName${i}`] !== undefined) {
        members.push({
          username: value[`userName${i}`] || "",
          email: value[`email${i}`] || "",
          Firstname: value[`firstName${i}`] || "",
          Lastname: value[`lastName${i}`] || "",
          mobile: value[`mobile${i}`] || "",
          Role: value[`role${i}`] || "",
        });
        i++;
      }

      const requestData = {
        teamName: value.teamName,
        teamDescription: value.description,
        status: isSuspended ? "Suspended" : "Active",
        members: members,
      };

      // Now you can send the requestData to the server
      try {
        setButtonLoader(true);
        setTemp(true);
        const token = Cookies.get("isLoggedIn");
        const response = await axios.post(
          settingRoute.teamCreate,
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 201) {
          message.success(Popup.teamCreate);
          setOpen(false);
          form.resetFields();
        }
        setButtonLoader(false);
        setTemp(false);
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // If there's an error response with a message, log it
          console.error("Error in creating team:", error.response.data.message);
          message.error(error.response.data.message);
        } else {
          // If there's no error message in the response, log a generic error message
          console.error("Error in creating team:", error.message);
          message.error(listTeam.NotCreate);
        }
        setButtonLoader(false);
      }
    }
  };

  const handleAddMember = () => {
    const newMemberId = members.length + 1;
    const isDuplicate = members.some(
      (member: any) => member.member === newMemberId
    );

    if (!isDuplicate) {
      // Add the new member
      setMembers([...members, { member: newMemberId }]);
    } else {
      setMembers([...members, { member: newMemberId + 1 }]);
    }
  };
  const handleDeleteMember = async (memberId: any) => {
    if (editableField) {
      setDeleteLoader(true);
      const requestData = {
        teamId: teamData?.id,
        userId: memberId,
      };
      try {
        const response = await axios.post(
          settingRoute.removeMember,
          requestData
        );
        if (response.status === 200) {
          message.success(response.data.message);
          try {
            const id: any = Number(teamData?.id);
            const formData = new FormData();
            formData.append("teamId", id);
            const res = await axios.post(settingRoute.listTeamData, formData);
            setTeamData(res?.data?.teamDetails);
            setTeamMembers(true);
            setDeleteLoader(false);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error: any) {
        console.log(error);
        message.error(listTeam.deleteMember);
      }
    } else {
      // -----create team -------
      const filteredMember = members?.filter(
        (val: any) => val?.member !== memberId
      );
      setMembers(filteredMember);

      if (members?.some((val: any) => val?.member === memberId)) {
        form.setFieldsValue({
          [`userName${memberId}`]: undefined,
          [`email${memberId}`]: undefined,
          [`firstName${memberId}`]: undefined,
          [`lastName${memberId}`]: undefined,
          [`mobile${memberId}`]: undefined,
          [`role${memberId}`]: undefined,
        });
      }
    }
  };
  const handleCreateTeam = () => {
    if (editableField) {
      setOpenTeam(true);
    } else {
      setOpen(true);
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  console.log(isTeamSuspended);
  useEffect(() => {
    setLoading(true);
    if (editableField && teamData) {
      // check team status
      if (teamData?.status === "Suspended") {
        setIsTeamSuspended(true);
      } else {
        setIsTeamSuspended(false);
      }
      // Set form values based on teamData
      form.setFieldsValue({
        teamName: teamData.teamName,
        description: teamData.description,
        status: teamData.status === "Suspended",
        // Loop through team members and set their values
        ...(teamData.members &&
          teamData.members.reduce((acc: any, member: any, index: number) => {
            acc[`firstName${index}`] = member.Firstname;
            acc[`lastName${index}`] = member.Lastname;
            acc[`userName${index}`] = member.username;
            acc[`mobile${index}`] = member.mobile;
            acc[`email${index}`] = member.email;
            acc[`role${index}`] = member.Role;
            return acc;
          }, {})),
      });
      setLoading(false);
    }
  }, [editableField, teamData, teamMembers]);

  // loader
  if (loading && editableField) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spin />
      </div>
    );
  } else {
    return (
      <div className="create-team-wrapper">
        <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <div className="create-team-header">
            <Form.Item
              label={CREATE.TEAM_NAME.LABEL}
              name={CREATE.TEAM_NAME.NAME}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={CREATE.DESCRIPTION.LABEL}
              name={CREATE.DESCRIPTION.NAME}
            >
              <Input />
            </Form.Item>
          </div>
          <div className="invite-member">
            <div className="title">Invite Member</div>
            {editableField
              ? teamData?.members?.map((val: any, index: any) => {
                  return (
                    <div className="team-member" key={index}>
                      <div className="header">
                        <span>Member {index + 1}</span>
                        {deleteLoader ? (
                          <Spin />
                        ) : (
                          <span onClick={() => handleDeleteMember(val?.id)}>
                            <Icon component={DeleteIcon} />
                          </span>
                        )}
                      </div>
                      <div className="member-wrapper">
                        <Form.Item
                          label={CREATE.FIRST_NAME.LABEL}
                          name={CREATE.FIRST_NAME.NAME + index}
                        >
                          <Input value={val?.firstName} />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.LAST_NAME.LABEL}
                          name={CREATE.LAST_NAME.NAME + index}
                        >
                          <Input value={val?.lastName} />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.USER_NAME.LABEL}
                          name={CREATE.USER_NAME.NAME + index}
                        >
                          <Input value={val?.userName} />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.MOBILE.LABEL}
                          name={CREATE.MOBILE.NAME + index}
                          className="country-code"
                        >
                          <PhoneInput
                            // autoFormat={false}
                            // localization={es}
                            // regions={['america', 'europe', 'asia', 'oceania', 'africa']}
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
                                (value.startsWith(dialCode) ||
                                  dialCode.startsWith(value))
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
                          label={CREATE.EMAIL.LABEL}
                          name={CREATE.EMAIL.NAME + index}
                        >
                          <Input disabled value={val?.email} />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.ROLE.LABEL}
                          name={CREATE.ROLE.NAME + index}
                        >
                          <Select
                            // defaultValue='admin'
                            value={val?.role}
                            onChange={handleChange}
                            suffixIcon={<Icon component={DownArrowSvg} />}
                            // disabled
                            options={[
                              { value: "user", label: "User" },
                              { value: "admin", label: "Admin" },
                              // { value: "superadmin", label: "Super Admin" },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                })
              : members?.map((val: any, index: any) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <div className="team-member" key={index}>
                      <div className="header">
                        <span>Member {index + 1}</span>
                        <span
                          onClick={() =>
                            members.length > 1 &&
                            handleDeleteMember(val?.member)
                          }
                        >
                          <Icon component={DeleteIcon} />
                        </span>
                      </div>
                      <div className="member-wrapper">
                        <Form.Item
                          label={CREATE.FIRST_NAME.LABEL}
                          name={CREATE.FIRST_NAME.NAME + index}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.LAST_NAME.LABEL}
                          name={CREATE.LAST_NAME.NAME + index}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.USER_NAME.LABEL}
                          name={CREATE.USER_NAME.NAME + index}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.MOBILE.LABEL}
                          name={CREATE.MOBILE.NAME + index}
                          className="country-code"
                        >
                          <PhoneInput
                            // autoFormat={false}
                            // localization={es}
                            // regions={['america', 'europe', 'asia', 'oceania', 'africa']}
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
                                (value.startsWith(dialCode) ||
                                  dialCode.startsWith(value))
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
                          label={CREATE.EMAIL.LABEL}
                          name={CREATE.EMAIL.NAME + index}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={CREATE.ROLE.LABEL}
                          name={CREATE.ROLE.NAME + index}
                        >
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
                  );
                })}
            {!editableField && (
              <div className="add-member" onClick={handleAddMember}>
                <Icon component={PlusIcon} /> Add
              </div>
            )}
          </div>
          <Form.Item className="footer-form" name={"suspend"}>
            <Checkbox
              onChange={(e) => {
                setIsSuspended(e.target.checked);
                setIsTeamSuspended(e.target.checked);
              }}
              checked={isTeamSuspended}
            >
              Suspend
            </Checkbox>
            <div className="btn-wrapper">
              <Button
                className="cancel"
                onClick={() => {
                  if (editableField) {
                    setOpenTeam(false);
                  } else {
                    setOpen(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button htmlType="submit" onClick={handleCreateTeam}>
                {editableField ? "Save" : "Create Team"}
                {buttonLoader && (
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
    );
  }
};

export default CreateTeam;
