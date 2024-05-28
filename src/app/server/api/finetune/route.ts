"use server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import fs from "fs";

// OPEN AI KEY
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(request: NextRequest) {
  try {
    // step:1) Upload file to openAI
    // const pathfile = path.join(
    //   process.cwd(),
    //   "src",
    //   "components",
    //   "server",
    //   "helper",
    //   "FineTunning",
    //   "data.jsonl"
    // );
    // console.log(pathfile);

    // const uploadFile = await openai.files.create({
    //   file: fs.createReadStream(pathfile),
    //   purpose: "fine-tune",
    // });
    // console.log("upload file :", uploadFile);

    // List of files uploaded to OpenAI
    const files = openai.files.list();
    console.log(files);

    // step:2) Train Your Own Model
    try {
      const fineTune = await openai.fineTuning.jobs.create({
        training_file: "ftjob-TbVFR4m8wVNEBcSNjzq82guj",
        model: "gpt-3.5-turbo",
      });
      console.log(fineTune);

      return NextResponse.json({ fineTune });
    } catch (error) {
      console.log(error);
    }

    // list of fine-tune models you trained so far
    const list = await openai.fineTuning.jobs.list();
    console.log(list);

    return NextResponse.json({
      // uploadFile,
      files,
      list,
      message: "success",
    });
  } catch (error) {
    console.log("Internal server error", error);
    return NextResponse.json({ message: "error" });
  }
}
// ftjob-pH1qhXvVQshHibYeJPo3ppFY --12:33
// ftjob-TbVFR4m8wVNEBcSNjzq82guj
