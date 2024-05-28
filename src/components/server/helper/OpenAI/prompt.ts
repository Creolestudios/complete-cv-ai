//  RawData = Extract Raw Data from Resume
//  Work Experience Prompt
export const getExperience = (RawData: string) => {
  return `
   
    Act as resume analyst and get experience section from this given resume - ${RawData}.

    give me only experience and not title for that 
   
    strictly give in below given format and don't give additional text
    [
      {
        "title" : title_of_experience_1,
        "company":company_name_of_experience_1,
        "date" : date_of_experience_1,
        "description" : description_of_experience_1
      },
      {
        "title" : title_of_experience_2,
        "company":company_name_of_experience_2,
        "date" : date_of_experience_2,
        "description" : description_of_experience_2
      },
    ]
    in above format for description field , give description separated by ';' 
    if any of field not present in resume then simply write "NO field present" for that field in that resume
    
    
    `;
};

// Skills Prompt
export const get_aiSkills_prompt = (RawData: string) => {
  return `

 Act as resume analyst and get skills list from this given resume under the skill sections - ${RawData}.
  Give skills separated by comma "," as below given format.strictly give in array 
  Ensure that the skills are extracted the same as provided resume data  

 strictly give in below given JSON format:- 

 [  skill,skill,skill,...]
 
 `;
};

// Languages Prompt
export const get_aiLanguages_prompt = (RawData: string) => {
  return `
    Act as resume analyst and get languages section from this given resume - ${RawData}.
    give me only languages section and not title for that 

    do not consider programming languages in languages section

    strictly give in below given format and don't give additional text
    [
      {
        "language" : "name_of_language",
        "fluency" :  "fluency_of_language"
      },
      {
        "language" : "name_of_language",
        "fluency" :  "fluency_of_language"
      }
    ]
    if any of field not present in resume then simply write "NO field present" for that field in that resume.
   `;
};

// Education Prompt
export const get_aiEducation_prompt = (RawData: string) => {
  return `
    act as resume analyst and get education section form give resume -  ${RawData}.

    give me education section only and not title for that.

    if not education section is found then simply say "no section found" 

    strictly give in below given format and don't give additional text

    [
      {
        "title" : "course_of_education",
        "date" : "date_of_eduation",
        "college" : "college/institute_name",
        "marks" : "cgpa/percentage/cpi"
      },
     {
        "title" : "course_of_education",
        "date" : "date_of_eduation",
        "college" : "college/institute_name",
        "marks" : "cgpa/percentage/cpi"
      }
    ]

    do not generate any random response for any of above fields other than given resume 

    if no field is present in any above title,date,college,marks in given resume simply say "NO field present"

    
    `;
};

// Details Prompt
export const get_aiDetails_prompt = (RawData: string) => {
  return `

  Act as resume analyst and get email , phone or contact number , and address from this given resume - ${RawData}.
  give me only email,phone and address and not title for that .
  based on given resume generate designation of candidate based on his overall professional experience 
 
  if any of field not present in resume then simply write "NO field present" for that field in that resume

  strictly give in below given format and don't give additional text
 
  [
    {
      "name" : name_from_resume,
      "email" : email_from_resume,
      "phone" : phone_from_resume,
      "gender" : gender_from_resume,
      "nationality" : nationality_from_resume
      "address" : address_from_resume,
      "designation" : designation_based_on_resume,
      "latestSalary":latest_salary,
      "expectedSalary" : expected_salary,
      "noticePeriod" : notice_period
    }
  ]
  designation should not exceed more than 5 words 
 `;
};

// Projects Prompt
export const get_Projects_prompt = (RawData: string) => {
  return `
  
  Act as resume analyst and get Projects details from this given resume - ${RawData}.

  give me Project title and description for that .
  
  strictly give in below given format and don't give additional text
   
    [
      {
        "title" : title_of_project_1,
        "date" : date_of_project_1,
        "description" : description_of_project_1
      },
      {
        "title" : title_of_project_2,
        "date" : date_of_project_2,
        "description" : description_of_project_2
      }
    ]

    in above format for description field , give description separated by ';' 
    if any of field not present in resume then simply write "NO field present" for that field in that resume
  `;
};

// Professional Summary Prompt
export const get_ProvisionalSummary_prompt = (RawData: string) => {
  return `
  
  Act as resume analyst and get Professional summary information from this give resume - ${RawData}.
  or if professional summary is not provided , generate according to the resume .

  strictly give in below json format :

  [
    {
    "summary": "Working Registration Form & Google Sheet API;Fully Responsive;Notes can be add, 
      Edit, Delete And Notes Data Will Be Saved Even If You Refresh The Page"
    }
  ]
   
  but give me in short format not long format
  `;
};

// Professional Qualification Prompt
export const get_prof_qualification_prompt = (RawData: string) => {
  return `
    act as resume analyst and get professional qualification section form give resume -  ${RawData}.
    give me professional qualification section only and not title for that. 
    if not professional qualification section is found then simply say "no section found" 
    strictly give in below given json format strictly : 
    [
      {
        "title" : "course_of_education",
        "date" : "date_of_eduation",
        "college" : "college/institute_name",
        "marks" : "cgpa/percentage/cpi"
      },
     {
        "title" : "course_of_education",
        "date" : "date_of_eduation",
        "college" : "college/institute_name",
        "marks" : "cgpa/percentage/cpi"
      }
    ]

    do not generate any random response for any of above fields other than given resume 
    if no field is present in any above title,date,college,marks in given resume simply say "NO field present"
    `;
};

export const extractone = (RawData: string) => {
  return `
  Act as resume analyst and get email , phone or contact number , and address from this given resume - ${RawData}.
  give me only email,phone and address and not title for that .
  based on given resume generate designation of candidate based on his overall professional experience 
 
  strictly give in below given JSON format :- 
 
  [
    {
      "name" : name_from_resume,
      "email" : email_from_resume,
      "phone" : phone_from_resume,
      "gender" : gender_from_resume,
      "nationality" : nationality_from_resume
      "address" : address_from_resume,
      "latestSalary":latest_salary,
      "designation" : designation_based_on_resume,
      "expectedSalary" : expected_salary,
      "noticePeriod" : notice_period
    }
  ]
  designation should not exceed more than 5 words 
  if any of field not present in resume then simply write "NO field present" for that field in that resume

  `;
};
