"use client";
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./loaderComponent.css";

// Loading component
const LoaderComponent = ({ loading }: any) => (
  <div className={`loader-background ${loading ? "loading" : ""}`}>
    <div className="loader-container">
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 24,
            }}
            spin
          />
        }
      />
      <p className="loading-text">Fetching  CV…</p>
    </div>
  </div>
);

export default LoaderComponent;
