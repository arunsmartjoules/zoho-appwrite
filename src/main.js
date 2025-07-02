import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { getRecords } from "../src/api/zoho.js";
import dayjs from "dayjs";
import { databases } from "../src/api/appwriteClient.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pushToAppWrite = async () => {
  try {
    const today = dayjs(new Date()).format("DD-MMM-YYYY");
    const response = await getRecords(
      "All_Maintenance_Scheduler_Task_List",
      `(Schedule_Date == '${today}')`
    );
    if (response.code !== 3000) {
      console.log("Zoho API Error", response);
      return;
    }
    for (const record of response.data) {
      const payload = {
        task: record.Task_Name,
        field_type: record.Field_Type.zc_display_value,
        remarks: record.Remarks,
        site_id: parseInt(record.Site),
        flag: record.Flags_For_Review == true ? true : false,
        image_mandatory: record.Image_Mandatory == true ? true : false,
        maintenance_scheduler_id: record.Maintenance_Scheduler_ID?.ID,
        maintenance_master_id: record.Maintenance_Master,
        title: record["Maintenance_Scheduler_ID.Title"],
        progress: record["Maintenance_Scheduler_ID.Progress"],
        schedule_date: record.Schedule_Date,
        area: record.Area,
        status: record.Status,
        response: record.Response_Value,
      };
      try {
        const doc = await databases.createDocument(
          "sjpl_zoho",
          "685e6053002f1a36dc63",
          record.ID.toString(),
          payload
        );
        console.log("✅ Created:", doc.$id);
      } catch (error) {
        console.log("Error creating document", error.message);
      }
    }
  } catch (error) {
    console.error("Error in pushToAppWrite", error.message);
  }
};

export default async function (req) {
  try {
    await pushToAppWrite();
    return {
      statusCode: 200,
      body: JSON.stringify({ execution: "success" }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ execution: "failed", error: error.message }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
}
