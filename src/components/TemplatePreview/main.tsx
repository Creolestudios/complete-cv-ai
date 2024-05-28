"use client";
import React, { createContext, useEffect, useState } from "react";
import Slide from "../TemplateSlide/slide";

export const UserNameContext = createContext<any>("");

/**
 * Main component that sets up the user name logo using local storage values.
 *
 */
const Main = () => {
  const [userNameLogo, setUserNameLogo] = useState<any>("");

  useEffect(() => {
    const currentFirstName: any = window.localStorage.getItem("firstname");
    const currentLastName: any = window.localStorage.getItem("lastname");
    setUserNameLogo(currentFirstName + currentLastName);
  }, []);
  return (
    <UserNameContext.Provider value={{ userNameLogo, setUserNameLogo }}>
      <Slide />
    </UserNameContext.Provider>
  );
};

export default Main;
