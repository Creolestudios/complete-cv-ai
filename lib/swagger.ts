import { createSwaggerSpec } from "next-swagger-doc";
import yaml from "js-yaml";
import fs from "fs";

export const getApiDocs = async () => {
  // Load YAML files for Backend API Documentation
  const loginDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/auth.yaml", "utf8")
  );
  const registerDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/register.yaml", "utf8")
  );
  const uploadDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/upload.yaml", "utf8")
  );
  const convertDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/convert.yaml", "utf8")
  );
  const candidateCvDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/candidateFile.yaml", "utf8")
  );
  const dashboardDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/dashboard.yaml", "utf8")
  );
  const settingDocument: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/setting.yaml", "utf8")
  );
  const adminDoc: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/admin.yaml", "utf8")
  );
  const adminDashboardDoc: any = yaml.load(
    fs.readFileSync("src/utils/apiDocs/adminDashboard.yaml", "utf8")
  );
  // Create Swagger Specification
  const spec = createSwaggerSpec({
    apiFolder: "src/app/server/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: " Backend Documentation",
        description:
          " Backend API Documentation for Developers  &&  For access Admin protected routes, please login with admin or super admin credentials and provide token in Authorize ",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000/",
          description: "Local server",
        },
        {
          url: "https://-cv.vercel.app/",
          description: "Live server",
        },
      ],
      // Add the paths from the YAML files to connect route
      paths: {
        ...loginDocument.paths,
        ...registerDocument.paths,
        ...uploadDocument.paths,
        ...convertDocument.paths,
        ...candidateCvDocument.paths,
        ...dashboardDocument.paths,
        ...settingDocument.paths,
        ...adminDoc.paths,
        ...adminDashboardDoc.paths,
      },

      // Add the tags from the YAML files
      tags: [
        {
          name: "Auth",
          description: "Operations related to user login and registration",
        },
        {
          name: "Upload & Convert",
          description: "Operations related to File upload & conversion",
        },
        {
          name: "Preview",
          description: "Related to file preview page",
        },
        {
          name: "Dashboard",
          description: "Dashboard table with some Actions",
        },
        {
          name: "Settings",
          description: "Setting page for user and admin",
        },
        {
          name: "Admin",
          description: "Operations related to Admin and Team",
        },
        {
          name: "Team",
          description: "Operations related to Team",
        },
        {
          name: "Admin Dashboard",
          description: "Admin Dashboard table with some Actions",
        },
        {
          name: "Time Tracking",
          description: "Operations related to Time Tracking of user",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
