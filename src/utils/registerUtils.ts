import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";

export const utils = {
  generateJWTToken,
  getBaseURL,
  hashPassword,
  generateRandomSymbol,
  isValidEmail,
  generateJWTTokenWithEmail,
  generateRandomPassword,
};

// Function to generate JWT token with userId and email
function generateJWTToken(userId: number, email: string) {
  return jwt.sign(
    { userId, email },
    process.env.NEXT_PUBLIC_JWT_SECRET as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}
// Function to generate JWT token with only email
function generateJWTTokenWithEmail(email: string) {
  return jwt.sign({ email }, process.env.NEXT_PUBLIC_JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
// Function to get base URL
function getBaseURL() {
  if (process.env.NODE_ENV === "production") {
    return process.env.PRODUCTION_BASE_URL;
  } else {
    return process.env.LOCAL_BASE_URL;
  }
}

// Function to hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Function to generate random symbol for username
function generateRandomSymbol() {
  const symbols = ["@", "#", "$", "*"];
  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex];
}

// Function to validate email address using regular expression
function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return pattern.test(email);
}
// Function to generate random password
function generateRandomPassword(length = 8) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
