"use client";
import "./globals.css";
import StyledComponentsRegistry from "../lib/AntdRegistry";
import Header from "@/components/Header/Header";
import React, { createContext, useEffect, useState } from "react";
import Navbar from "@/components/Navbar/navbar";
import Cookies from "js-cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { useIdleTimer } from "react-idle-timer";
import { usePathname, useRouter } from "next/navigation";
import { Inter } from "next/font/google";

export const UserContext = createContext<any>("");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState<string | null>("");
  const [userloader, setUserloader] = useState<boolean>(false);
  const [tabKey, setTabKey] = useState<string>("1");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = usePathname();
  const router = useRouter();
  const [elapsed, setElapsed] = useState<number>(0);
  const [forgotEmail, setForgotEmail] = useState<string | null>("");
  const [isTabClosing, setIsTabClosing] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    document.title = " Cv";
    const currentFirstName: string | boolean | null =
      typeof window !== "undefined" && window.localStorage.getItem("firstname");
    const currentLastName: string | boolean | null =
      typeof window !== "undefined" && window.localStorage.getItem("lastname");
    setUserName(`${currentFirstName ?? ""}${currentLastName ?? ""}`);

    // Set isAdmin state based on the role
    const role: string | boolean | null =
      typeof window !== "undefined" && window.localStorage.getItem("isAdmin");
    if (role === "admin") {
      setIsAdmin(true);
    }

    const jwtToken: string | undefined = Cookies.get("isLoggedIn");
    if (jwtToken) {
      try {
        const decoded: any = jwt.decode(jwtToken);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const tokenExpired = expirationTime < currentTime;

        if (tokenExpired) {
          // Redirect to login page if token is expired
          router.push("/");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Redirect to login page if token cannot be decoded
        router.push("/");
      }
    } else {
      // router.push("/"); // Redirect to login page if token is not found
    }
  }, []);

  typeof window !== "undefined" &&
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      return (ev.returnValue = "Are you sure you want to close?");
    });
  if (typeof window !== "undefined") {
    window.onbeforeunload = function () {
      // Get your elapsed time and user ID here
      const time: any = elapsed;
      const userId: any =
        typeof window !== "undefined" && window.localStorage.getItem("userId");
      if (userId) {
        // Create a FormData object
        const formData = new FormData();
        formData.append("time", time);
        formData.append("userId", userId);

        // Send a POST request to your server
        fetch("/server/api/timespend", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => {
            console.error("Error:", error);
          });
        return "Do you really want to close?";
      }
    };
  }

  const { getElapsedTime } = useIdleTimer({
    // onAction,
    timeout: 10_000,
    throttle: 500,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.ceil(getElapsedTime() / 1000));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });
  const value = {
    userName,
    setUserName,
    userloader,
    setUserloader,
    setTabKey,
    tabKey,
    isAdmin,
    forgotEmail,
    setForgotEmail,
    setVerified,
    verified,
  };

  return (
    <html lang="en">
      <body>
        <UserContext.Provider value={value}>
          {location === "/home" ? (
            <Navbar />
          ) : location === "/" ||
            location === "/register" ||
            location === "/forgot-password" ||
            location === "/reset-password" ||
            location === "/verified" ||
            location === "/server/api-doc" ||
            location === "/verify-user" ? null : (
            <Header
              backgroundColor={location === "/preview" ? "" : "white"}
              headerImageBackgroundColor={
                location === "/preview" ? "" : "white"
              }
            />
          )}
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </UserContext.Provider>
      </body>
    </html>
  );
}
