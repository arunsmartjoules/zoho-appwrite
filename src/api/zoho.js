import axios from "axios";
import { refreshAccessToken } from "../util/zohoAuth.js";

export async function getRecords(reportName, criteria) {
  try {
    const accessToken = await refreshAccessToken();
    const response = await axios.get(
      `https://www.zohoapis.in/creator/v2.1/data/smartjoules/smart-joules-app/report/${reportName}?max_records=1000&criteria=${encodeURIComponent(
        criteria
      )}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error getting record:",
      error.response?.data || error.message
    );
    return { error: error.response?.data || error.message };
  }
}
