import {
  fetchDetailsBlob,
  fetchEducationBlob,
  fetchExperienceBlob,
  fetchLanguagesBlob,
  fetchLatestSkillBlob,
  fetchProfQualificationBlob,
  fetchProjectBlob,
  fetchSummaryBlob,
} from "@/components/server/helper/vercelBlob/listblobData";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import { Readable } from "stream";
import { put } from "@vercel/blob";
import { ServerError } from "@/utils/messagePopup";
import { ConvertResponse, UploadError } from "@/types/server/upload";
const ejs = require("ejs");
const fs = require("fs");

// Convert blob to pdf API
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const user_id = formData.get("user_id") as string;
    if (!user_id) {
      return NextResponse.json<UploadError>({
        errorMessage: "User ID is required",
      });
    }
    const filenamePrefix = formData.get("filenamePrefix") as string;
    if (!filenamePrefix) {
      return NextResponse.json<UploadError>({
        errorMessage: "Filename prefix is required",
      });
    }
    const fileId = formData.get("file_id") as string;
    if (!fileId) {
      return NextResponse.json<UploadError>({
        errorMessage: "File ID is required",
      });
    }
    const fileName = formData.get("file_name");
    if (!fileName) {
      return NextResponse.json<UploadError>({
        errorMessage: "File name is required",
      });
    }
    console.log("file Id:", fileId);
    // console.log("Selected template Id:", filenamePrefix);

    // --------------------------------template 1--------------------------
    if (filenamePrefix === "1") {
      console.log("International original resume template : 1");
      const skills = await fetchLatestSkillBlob(user_id, fileId);
      const details = await fetchDetailsBlob(user_id, fileId);
      const experience = await fetchExperienceBlob(user_id, fileId);
      const languages = await fetchLanguagesBlob(user_id, fileId);
      const projects = await fetchProjectBlob(user_id, fileId);
      const education = await fetchEducationBlob(user_id, fileId);
      const summary = await fetchSummaryBlob(user_id, fileId);
      const qualification = await fetchProfQualificationBlob(user_id, fileId);
      const imagePath = `${process.cwd()}/public/assets/header.png`;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // Dynamic data for generate resume files
      const dynamicData = {
        details,
        skills,
        experience,
        languages,
        projects,
        education,
        summary,
        qualification,
        imagePath: `data:image/png;base64,${base64Image}`,
      };
      // Generate pdf file with dynamic data
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          `https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar`
        ),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      const templatePath = path.join(
        process.cwd(),
        "public",
        "template",
        "_IO.ejs"
      );
      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const renderHtml = ejs.render(templateContent, { dynamicData });
      const page = await browser.newPage();
      await page.setContent(renderHtml);
      const ConvertPdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="text-align:center; width:100%;">
          <img src="${dynamicData.imagePath}" alt="Header" width="800px"/>
        </div>
      `,
        footerTemplate: `
        <div style="margin-top: 10px;" class='footer'>
          <p style="padding: 0px 40px 5px; text-align: justify; font-size:12px; border-bottom: 1px solid orangered; font-family: Arial, Helvetica, sans-serif;">This candidate has given express authority to be solely represented by  International. Written or verbal instructions to  International by the client to supply candidates will be deemed as acceptance by the client of  International’s Terms and Conditions.</p>
          <p style="padding: 0px 40px;color: #56585A;margin: 0px;font-size: 12px;"> Suite 610, 6/F, Ocean Centre, 5 Canton Road, Tsim Sha Tsui, Kowloon, Hong Kong \ T +852 3180 4988</p>
          <p style="padding: 5px 40px;color: orangered;margin: 0px;font-size: 12px;">www.-intl.com</p>
        </div>
      `,
        margin: {
          top: "40mm",
          bottom: "40mm",
        },
      });
      const pdfBuffer = ConvertPdf;
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);

      // Generate a unique blob name based on user and prefix
      const qualificationBlobName = `${user_id}/${fileId}/downloadedPdf.pdf`;
      // Store the PDF data in the blob
      const qualificationBlob = await put(qualificationBlobName, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
      });
      console.log(qualificationBlob);
      await browser.close();

      return NextResponse.json(
        {
          // dynamicData,
          qualificationBlob,
          fileId,
          isConvert: true,
          message: "The request has succeeded.",
          fileName,
        },
        { status: 200 }
      );
    }

    // --------------------------------template 2--------------------------
    if (filenamePrefix === "2") {
      console.log("International banking resume template : 2");
      const skills = await fetchLatestSkillBlob(user_id, fileId);
      const details = await fetchDetailsBlob(user_id, fileId);
      const experience = await fetchExperienceBlob(user_id, fileId);
      const languages = await fetchLanguagesBlob(user_id, fileId);
      const projects = await fetchProjectBlob(user_id, fileId);
      const education = await fetchEducationBlob(user_id, fileId);
      const summary = await fetchSummaryBlob(user_id, fileId);
      const qualification = await fetchProfQualificationBlob(user_id, fileId);

      const imagePath = `${process.cwd()}/public/assets/header.png`;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // Dynamic data for generate resume files
      const dynamicData = {
        details,
        skills,
        experience,
        languages,
        projects,
        education,
        summary,
        qualification,
        imagePath: `data:image/png;base64,${base64Image}`,
      };

      // Generate pdf file with dynamic data
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          `https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar`
        ),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      const templatePath = path.join(
        process.cwd(),
        "public",
        "template",
        "_IB.ejs"
      );

      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const renderHtml = ejs.render(templateContent, { dynamicData });
      const page = await browser.newPage();
      await page.setContent(renderHtml);

      // Generate pdf
      const ConvertPdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="text-align:center; width:100%;">
          <img src="${dynamicData.imagePath}" alt="Header" width="800px"/>
        </div>
      `,
        footerTemplate: `
        <div style="margin-top: 10px;" class='footer'>
          <p style="padding: 0px 40px 5px; text-align: justify; font-size:12px; border-bottom: 1px solid orangered; font-family: Arial, Helvetica, sans-serif;">This candidate has given express authority to be solely represented by  International. Written or verbal instructions to  International by the client to supply candidates will be deemed as acceptance by the client of  International’s Terms and Conditions.</p>
          <p style="padding: 0px 40px;color: #56585A;margin: 0px;font-size: 12px;"> Suite 610, 6/F, Ocean Centre, 5 Canton Road, Tsim Sha Tsui, Kowloon, Hong Kong \ T +852 3180 4988</p>
          <p style="padding: 5px 40px;color: orangered;margin: 0px;font-size: 12px;">www.-intl.com</p>
        </div>
      `,
        margin: {
          bottom: "40mm",
          top: "40mm",
        },
      });

      // Convert file to buffer
      const pdfBuffer = ConvertPdf;
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);

      // Generate a unique blob name based on user and prefix
      const qualificationBlobName = `${user_id}/${fileId}/downloadedPdf.pdf`;

      // Store the PDF data in the blob
      const qualificationBlob = await put(qualificationBlobName, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
      });
      console.log(qualificationBlob);
      await browser.close();

      console.log(`PDF generated successfully `);

      return NextResponse.json<ConvertResponse>(
        {
          // dynamicData,
          qualificationBlob,
          fileId,
          isConvert: true,
          message: "The request has succeeded.",
          fileName,
        },
        { status: 200 }
      );
    }

    // --------------------------------template 3--------------------------
    if (filenamePrefix === "3") {
      console.log("mainland resume template : 3");
      const skills = await fetchLatestSkillBlob(user_id, fileId);
      const details = await fetchDetailsBlob(user_id, fileId);
      const experience = await fetchExperienceBlob(user_id, fileId);
      const languages = await fetchLanguagesBlob(user_id, fileId);
      const projects = await fetchProjectBlob(user_id, fileId);
      const education = await fetchEducationBlob(user_id, fileId);
      const summary = await fetchSummaryBlob(user_id, fileId);
      const qualification = await fetchProfQualificationBlob(user_id, fileId);

      const imagePath = `${process.cwd()}/public/assets/header.png`;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // Dynamic data for generate resume files
      const dynamicData = {
        details,
        skills,
        experience,
        languages,
        projects,
        education,
        summary,
        qualification,
        imagePath: `data:image/png;base64,${base64Image}`,
      };

      // Generate pdf file with dynamic data
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          `https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar`
        ),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      const templatePath = path.join(
        process.cwd(),
        "public",
        "template",
        "_mainland.ejs"
      );

      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const renderHtml = ejs.render(templateContent, { dynamicData });
      const page = await browser.newPage();
      await page.setContent(renderHtml);

      console.log("-----downloaded------");

      const ConvertPdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="text-align:center; width:100%;">
          <img src="${dynamicData.imagePath}" alt="Header" width="800px"/>
        </div>
      `,
        footerTemplate: `
        <div style="margin-top: 10px;" class='footer'>
          <p style="padding: 0px 40px 5px; text-align: justify; font-size:12px; border-bottom: 1px solid orangered; font-family: Arial, Helvetica, sans-serif;">This candidate has given express authority to be solely represented by  International. Written or verbal instructions to  International by the client to supply candidates will be deemed as acceptance by the client of  International’s Terms and Conditions.</p>
          <p style="padding: 0px 40px;color: #56585A;margin: 0px;font-size: 12px;"> Suite 610, 6/F, Ocean Centre, 5 Canton Road, Tsim Sha Tsui, Kowloon, Hong Kong \ T +852 3180 4988</p>
          <p style="padding: 5px 40px;color: orangered;margin: 0px;font-size: 12px;">www.-intl.com</p>
        </div>
      `,
        margin: {
          top: "40mm",
          bottom: "40mm",
        },
      });

      console.log(ConvertPdf);

      const pdfBuffer = ConvertPdf;
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);

      // Generate a unique blob name based on user and prefix
      const qualificationBlobName = `${user_id}/${fileId}/downloadedPdf.pdf`;

      // Store the PDF data in the blob
      const qualificationBlob = await put(qualificationBlobName, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
      });
      console.log(qualificationBlob);

      console.log("PDF data stored successfully");

      await browser.close();

      console.log(`PDF generated successfully at`);

      return NextResponse.json<ConvertResponse>(
        {
          // dynamicData,
          qualificationBlob,
          fileId,
          isConvert: true,
          message: "The request has succeeded.",
          fileName,
        },
        { status: 200 }
      );
    }
    // --------------------------------template 4--------------------------
    if (filenamePrefix === "4") {
      console.log("Staffing resume template : 4");
      const details = await fetchDetailsBlob(user_id, fileId);
      const experience = await fetchExperienceBlob(user_id, fileId);
      const education = await fetchEducationBlob(user_id, fileId);
      const skills = await fetchLatestSkillBlob(user_id, fileId);

      const imagePath = `${process.cwd()}/public/assets/staffing-header.png`;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      const dynamicData = {
        details,
        skills,
        experience,
        education,
        imagePath: `data:image/png;base64,${base64Image}`,
      };
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          `https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar`
        ),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      const templatePath = path.join(
        process.cwd(),
        "public",
        "template",
        "_staffing.ejs"
      );

      const templateContent = fs.readFileSync(templatePath, "utf-8");
      const renderHtml = ejs.render(templateContent, { dynamicData });
      const page = await browser.newPage();
      await page.setContent(renderHtml);

      const ConvertPdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `
        <div style="margin-top: 10px;" class='footer'>
          <p style="padding: 0px 40px 5px; text-align: justify; font-size:12px; border-bottom: 1px solid rgb(66, 221, 52); font-family: Arial, Helvetica, sans-serif;">This candidate has given express authority to be solely represented by  International. Written or verbal instructions to  International by the client to supply candidates will be deemed as acceptance by the client of  International’s Terms and Conditions.</p>
          <p style="padding: 0px 40px;color: #4d4c4c;margin: 0px;font-size: 12px;"> Suite 610, 6/F, Ocean Centre, 5 Canton Road, Tsim Sha Tsui, Kowloon, Hong Kong \ T +852 3180 4988</p>
          <p style="padding: 5px 40px;color: rgb(66, 221, 52);margin: 0px;font-size: 12px;">www.-intl.com</p>
        </div>
      `,
        margin: {
          bottom: "40mm",
        },
      });

      const pdfBuffer = ConvertPdf;
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);

      // Generate a unique blob name based on user and prefix
      const qualificationBlobName = `${user_id}/${fileId}/downloadedPdf.pdf`;

      // Store the PDF data in the blob
      const qualificationBlob = await put(qualificationBlobName, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
      });
      console.log(qualificationBlob);
      await browser.close();

      console.log(`PDF generated successfully`);

      return NextResponse.json<ConvertResponse>(
        {
          // dynamicData,
          qualificationBlob,
          fileId,
          isConvert: true,
          message: "The request has succeeded.",
          fileName,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json<UploadError>(
      {
        errorMessage: ServerError.Internal,
        error,
      },
      { status: 500 }
    );
  }
}
