import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";


dayjs.extend(utc);

const app = express();
const PORT = 3000;

// app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/carapi-lookup", async (req, res) => {
  const country_code = "UK";
  const lookup = req.query.lookup;
  const jwt = req.headers.authorization;

  try {
    const response = await fetch(
      `https://carapi.app/api/license-plate?country_code=${country_code}&lookup=${lookup}`,
      {
        headers: {
          Authorization: jwt,
          Accept: "application/json",
        },
      }
    );

    // console.log('Response status:', response);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch license plate data" });
  }
});

app.post("/carapi-auth", async (req, res) => {
  try {
    const response = await fetch("https://carapi.app/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_token: "655cd6a9-7622-41dc-8dea-082471de54fe",
        api_secret: "3db05edd87b6d2b73f70842b4aba0a59",
      }),
    });

    // console.log('Response status:', response);
    const jwt = await response.text();
    return res.status(200).json({ token: jwt });
  } catch (error) {
    console.error("Error authenticating with carapi:", error);
    res.status(500).json({ error: "Failed to authenticate with carapi" });
  }
});

app.get("/carapi-info", async (req, res) => {
  try {
    const data = "Hello word 123";
    const response = { status: 200 }; // Mock response for testing
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch license plate data" });
  }
});

const transporter = nodemailer.createTransport({
  host: "mail.parkclever.co.uk", // your SMTP host (check with hosting provider)
  port: 465, // 465 for SSL, 587 for TLS
  secure: true, // true if using port 465
  auth: {
    user: "support@parkclever.co.uk", // full email address
    pass: "Cassandra1103@", // email account password or app password
  },
  tls: {
    rejectUnauthorized: false
  }
});

function formatLocalTime(utcValue) {
  return dayjs.utc(utcValue).local().format("YYYY-MM-DD HH:mm");
}
app.post("/send-booking-email", async (req, res) => {
  const { bookingData, driverProfile, providerProfile } =
    req.body;
  try {
    // const startDate = new Date(
    //   bookingData.bookingForm.startTime
    // ).toLocaleDateString();
    // const endDate = new Date(
    //   bookingData.bookingForm.endTime
    // ).toLocaleDateString();
    const bookingDates = `${formatLocalTime(bookingData.bookingForm.startTime)} to ${formatLocalTime(bookingData.bookingForm.endTime)}`;



    // ---------------- Email Templates ----------------

    // Email to Provider
    const providerHtml = `
      <p>Hi ${providerProfile.first_name} ${providerProfile.last_name},</p>
      <p>Good news! You've received a new booking request for your listing <b>"${
        bookingData.space.title
      }"</b>.</p>
      <p><b>Booking Details:</b></p>
      <ul>
        <li>Guest Name: ${driverProfile.first_name} ${
      driverProfile.last_name
    }</li>
        <li>Guest Email: ${driverProfile.email}</li>
        <li>Guest Phone: ${driverProfile.phone}</li>
        <li>Booking Dates: ${bookingDates}</li>
      </ul>
      <p>Please review the booking details and prepare for the upcoming guest.</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best regards,<br/>Park Clever Team</p>
    `;

    // Email to Driver
    const driverHtml = `
      <p>Hi ${driverProfile.first_name} ${driverProfile.last_name},</p>
      <p>Thank you for your booking on Park Clever!</p>
      <p>Your booking has been confirmed.</p>
      <p><b>Booking Summary:</b></p>
      <ul>
        <li>Host: ${providerProfile.first_name} ${
      providerProfile.last_name
    }</li>
        <li>Host Email: ${providerProfile.email}</li>
        <li>Host Phone: ${providerProfile.phone}</li>
        <li>Host Address: ${bookingData.space.title}</li>
        <li>Dates: ${bookingDates}</li>
      </ul>
      <p>Enjoy your trip!</p>
      <p>Park Clever Team</p>
    `;

    // ---------------- Send Emails ----------------

    // To Provider
    await transporter.sendMail({
      from: '"Park Clever" <support@parkclever.co.uk>',
      to: providerProfile.email,
      subject: "You've received a new booking request!",
      html: providerHtml,
    });

    // To Driver
    await transporter.sendMail({
      from: '"Park Clever" <support@parkclever.co.uk>',
      to: driverProfile.email,
      subject: "Your booking has been confirmed!",
      html: driverHtml,
    });

    res.json({ success: true, message: "Emails sent" });

    console.log("✅ Emails sent successfully");
  } catch (err) {
    console.error("❌ Error sending email notifications:", err);
    res.status(500).json({ success: false, error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
