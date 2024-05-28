import OpenAI from "openai";
import {
  getExperience,
  get_Projects_prompt,
  get_ProvisionalSummary_prompt,
  get_aiDetails_prompt,
  get_aiEducation_prompt,
  get_aiLanguages_prompt,
  get_aiSkills_prompt,
} from "./prompt";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//  RawData = Extract Raw Data from Resume

// Get Experience from OpenAi
export const extract_Exp_ContentOpenAi = async (RawData: string) => {
  const prompt = getExperience(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  return completion.choices[0].message.content;
};

// Get skills from OpenAi
export const extract_Skills_OpenAi = async (RawData: string) => {
  const prompt = get_aiSkills_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  return completion.choices[0].message.content;
};

// Get languages from openAI
export const extractLanguagesOpenAi = async (RawData: string) => {
  const prompt = get_aiLanguages_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  return completion.choices[0].message.content;
};

// Get education details from openai
export const extractEducationOpenAi = async (RawData: string) => {
  const prompt = get_aiEducation_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });
  return completion.choices[0].message.content;
};

// Get general information from openai
export const extractDetailsOpenAi = async (RawData: string) => {
  const prompt = get_aiDetails_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });
  const details = completion.choices[0].message.content?.replace(/\[|\]/g, "");
  console.log("details", details);
  return details;
};

// Get project information from openai
export const extractProjectOpenAi = async (RawData: string) => {
  const prompt = get_Projects_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });
  return completion.choices[0].message.content;
};

// Get professional summary from openai
export const extractProvisionalSummary = async (RawData: string) => {
  const prompt = get_ProvisionalSummary_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  return completion.choices[0].message.content;
};

// Get education details from openai
export const extract_profQualificationsOpenAi = async (RawData: string) => {
  const prompt = get_aiEducation_prompt(RawData);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "assistant",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0,
  });
  return completion.choices[0].message.content;
};
