import type { NextApiRequest, NextApiResponse } from "next";
import { API_CONFIG, DEFAULT_SUBSTITUTION_CONFIG } from "@/constants";

/**
 * API handler for fetching substitution data from WebUntis
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const myHeaders = new Headers();
    Object.entries(API_CONFIG.DEFAULT_HEADERS).forEach(([key, value]) => {
      myHeaders.append(key, value);
    });

    const requestBody = {
      ...DEFAULT_SUBSTITUTION_CONFIG,
      date: date,
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(requestBody),
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        `${API_CONFIG.WEBUNTIS_BASE_URL}?school=${API_CONFIG.SCHOOL_NAME}`,
        requestOptions
      );
      
      if (!response.ok) {
        console.error(`WebUntis API error: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ 
          error: `Failed to fetch data from WebUntis: ${response.statusText}` 
        });
      }
      
      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching substitution data:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler;
