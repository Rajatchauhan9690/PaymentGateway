import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import dotenv from "dotenv"; // Optional, if using .env file

dotenv.config(); // Load environment variables

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Required to parse JSON body

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Payment Backend!");
});

app.post("/orders", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    if (!payment) {
      return res.status(500).json("Error at razorpay loading payment");
    }
    res.json({
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("failed to fetch payment details");
  }
});

app.listen(port, () => {
  console.log(`Payment Backend is running on http://localhost:${port}`);
});
