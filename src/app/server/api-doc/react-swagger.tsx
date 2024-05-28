"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const DynamicSwaggerUi = dynamic(() => import("swagger-ui-react"), {
  ssr: false, // Ensure that this component is not rendered on the server side
});

type Props = {
  spec: Record<string, any>;
};
// Main Component for Swagger API docs
function ReactSwagger({ spec }: Props) {
  const [renderSwagger, setRenderSwagger] = useState(false);

  useEffect(() => {
    setRenderSwagger(true); // Set to true when the component mounts
  }, []);

  return renderSwagger ? <DynamicSwaggerUi spec={spec} /> : null;
}

export default ReactSwagger;
