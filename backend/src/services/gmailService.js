const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oAuth2Client,
});

function encodeMessage(message) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail({ to, from, subject, text, html }) {
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString(
    "base64"
  )}?=`;

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    "Content-Type: multipart/alternative; boundary=\"boundary123\"",
    "",
    "--boundary123",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
    "",
    "--boundary123",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    "",
    "--boundary123--",
  ].join("\r\n");

  const raw = encodeMessage(message);

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return response.data;
}

module.exports = {
  sendEmail,
};