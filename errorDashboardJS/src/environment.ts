import dotenv from "dotenv";
dotenv.config();

export const baseUrl = process.env.BASE_URL || "http://localhost:8080";
