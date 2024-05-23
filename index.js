import { databaseSheetImport, logsSheetImport } from "./constants.js";
import { google } from "googleapis";
import axios from "axios";

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Declaring the constants
const databaseSheet = databaseSheetImport;
const logsSheet = logsSheetImport;

// Declaring the lets
let placementReadSheet;
let adminSheetRead;
let candidateTitle;
let candidatePhone;
let candidateEmail;
let candidateCV;
let matchesSheetRead;
let vacancyId;
let candidateId;
let vacancySheetRead;
let stopper;
let vacancyIdFromVacancySheet;
let apiKey;
let candidatesSheetRead;
let stopperCandidates;
let candidateFirstName;
let candidateLastName;
let curlData;
let curlDataJSON;
let matchArrayCT;
let rangeString;
let matchId;
let recruiterEmail;

async function writeToSheet(values, range, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth });
  const valueInputOption = "USER_ENTERED";
  const resource = { values };
  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });
    return res;
  } catch (error) {
    console.log("Error on writing to Sheet. (TEXT DIOGO)", error);
  }
}

async function readFromSheet(range, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth });
  const valueRenderOption = "FORMATTED_VALUE";
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption,
    });
    return res;
  } catch (error) {
    console.log(
      "Error in Read from Sheets (Likely rate limited. TEXT DIOGO)",
      error
    ); // Throws error when reading doesn't return code 200 OK but DOESN'T stop execution
  }
}

(async () => {
  console.log("Started");
  adminSheetRead = await readFromSheet("Admin Export", databaseSheet);
  while (adminSheetRead == undefined) {
    //Makes it so that even if the caller is rate limited it won't stop execution. It will just console.log error and try again.
    console.log(
      "Rate is limited, waiting 10s before retrying. (Text Diogo, this shouldn't happen)"
    );
    sleep(10000);
    adminSheetRead = await readFromSheet("Admin Export", databaseSheet);
  }
  const matchCt = adminSheetRead.data.values[1][6];
  let i = matchCt - 1;
  console.log("Match Count: " + i);
  while (true) {
    try {
      sleep(10000); // Sleeps for 10 seconds to avoid rate limiting even in the cases where there are always new matches
      matchesSheetRead = await readFromSheet("Matches Export", databaseSheet);
      matchArrayCT = matchesSheetRead.data.values.length;
      if (matchArrayCT == i) {
        continue;
      } else {
        matchId = matchesSheetRead.data.values[i][4];
        vacancyId = matchesSheetRead.data.values[i][3];
        candidateId = matchesSheetRead.data.values[i][1];
        vacancySheetRead = await readFromSheet(
          "Vacancies Export",
          databaseSheet
        );
        let j = 1;
        stopper = true;
        while (stopper) {
          vacancyIdFromVacancySheet = vacancySheetRead.data.values[j][1];
          apiKey = vacancySheetRead.data.values[j][4];
          recruiterEmail = vacancySheetRead.data.values[j][5];
          vacancyIdFromVacancySheet == vacancyId ? (stopper = false) : j++;
        }

        if (apiKey == undefined || recruiterEmail == undefined) {
          i++;
          continue;
        }

        candidatesSheetRead = await readFromSheet(
          "Candidates Export",
          databaseSheet
        );
        let k = 1;
        stopperCandidates = false;
        while (!stopperCandidates) {
          let candidateIdFromVacancySheet =
            candidatesSheetRead.data.values[k][3];
          if (candidateIdFromVacancySheet == candidateId) {
            candidateFirstName = candidatesSheetRead.data.values[k][1];
            candidateLastName = candidatesSheetRead.data.values[k][2];
            candidateTitle = candidatesSheetRead.data.values[k][4];
            candidatePhone = candidatesSheetRead.data.values[k][5];
            candidateEmail = candidatesSheetRead.data.values[k][6];
            candidateCV = candidatesSheetRead.data.values[k][7];
            stopperCandidates = true;
          }
          k++;
        }
        candidatePhone != undefined
          ? (candidatePhone = candidatePhone.replace(/\s+/g, ""))
          : (candidatePhone = candidatePhone);
        candidateLastName != typeof String
          ? (candidateLastName = ".")
          : (candidateLastName = candidateLastName);
        candidateTitle == undefined
          ? (candidateTitle = null)
          : (candidateTitle = candidateTitle);
        candidateCV == undefined
          ? (candidateCV = null)
          : (candidateCV = candidateCV);
        candidatePhone == undefined
          ? (candidatePhone = null)
          : (candidatePhone = candidatePhone);
        if (
          candidateEmail == undefined
            ? (candidateEmail = null)
            : (candidateEmail = candidateEmail)
        );
        curlData = {
          first_name: candidateFirstName,
          last_name: candidateLastName,
          external_id: candidateId,
          title: candidateTitle,
          resume: candidateCV,
          phone_numbers: [
            {
              phone_number: candidatePhone,
              type: "mobile",
            },
          ],
          emails: [
            {
              email: candidateEmail,
              type: "other",
            },
          ],
        };
        if (!candidateEmail.includes("@") ? delete curlData.emails : null);

        placementReadSheet = await readFromSheet("Sheet1", logsSheet);
        const placement = placementReadSheet.data.values[1][7];
        curlDataJSON = JSON.stringify(curlData);
        curlDataFunction(
          curlDataJSON,
          placement,
          apiKey,
          recruiterEmail,
          matchId
        );
        i++;
      }
    } catch (error) {
      console.log(
        // In case execution is stopped for some reason (usually internet down, api down or reading undefined) it will catch the error and retry for the same match again
        "Rate Limited. Or URL Curled is unavailable. Or Diogo messed something up and didn't notice... Waiting before retrying & text Diogo.",
        error
      );
      sleep(60000);
      i--;
    }
  }
})();

function sleep(ms) {
  const start = new Date().getTime();
  while (new Date().getTime() < start + ms);
}

function curlDataFunction(data, placement, apiKey, recruiterEmail, matchId) {
  const headers = {
    Authorization: "Basic " + btoa(apiKey + ":"),
    "Content-Type": "application/json",
    "On-Behalf-Of": recruiterEmail,
  };
  const url = "https://api.greenhouse.io/v1/partner/candidates";
  axios
    .post(url, data, { headers: headers })
    .then((response) => {
      sendToSheet(
        placement,
        "200",
        matchId,
        response.data.profile_url,
        response.data.id,
        apiKey,
        recruiterEmail
      );
    })
    .catch((error) => {
      sendToSheet(
        placement,
        error.response.status,
        matchId,
        "ERROR",
        "ERROR",
        apiKey,
        recruiterEmail
      );
    });
}

function sendToSheet(
  placement,
  status,
  matchId,
  profile_url,
  candidateId,
  apiKey,
  recruiterEmail
) {
  const date = "=EPOCHTODATE(" + String(Date.now()) + ", 2)";
  placement++;
  const values = [
    [date, status, matchId, profile_url, candidateId, apiKey, recruiterEmail],
  ];
  rangeString = "Sheet1!A" + placement + ":G" + placement;
  writeToSheet(values, rangeString, logsSheet);
  writeToSheet([[String(placement)]], "Sheet1!H2:H2", logsSheet);
}
