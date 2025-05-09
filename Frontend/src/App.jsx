import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [response, setResponse] = useState("");
  const [responseState, setResponseState] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("Script load error.");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    const data = JSON.stringify({
      amount: amount * 100,
      currency: "INR",
    });

    try {
      const response = await axios.post("http://localhost:5000/orders", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      handleRazorpayScreen(response.data);
    } catch (error) {
      console.error("Order creation error:", error);
    }
  };

  const handleRazorpayScreen = async (orderData) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    const options = {
      key: "rzp_test_UQMuXGWySrLZz7",
      amount: orderData.amount,
      currency: "INR",
      name: "Rajat Chauhan",
      description: "Test Transaction",
      order_id: orderData.id,
      handler: function (response) {
        setResponse(response.razorpay_payment_id);
        // fetchPaymentDetails(response.razorpay_payment_id);
      },
      prefill: {
        name: "Rajat Chauhan",
        email: "chauhan@gmail.com",
      },

      remember_customer: false,
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: false,
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay using UPI",
              instruments: [{ method: "upi" }],
            },
          },
          sequence: ["upi"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const fetchPaymentDetails = (id) => {
    axios
      .get(`http://localhost:5000/payment/${id}`)
      .then((res) => {
        console.log("Payment details:", res.data);
        setResponseState(res.data);
      })
      .catch((error) => {
        console.error("Payment fetch error:", error);
      });
  };

  const paymentFetch = (e) => {
    e.preventDefault();
    if (paymentId.trim()) {
      fetchPaymentDetails(paymentId);
    }
  };

  return (
    <div className="App">
      <h1>Welcome to the Frontend</h1>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={createRazorpayOrder}>Pay Now</button>

      {response && (
        <p>
          <strong>Payment ID:</strong> {response}
        </p>
      )}

      <h1>This is the payment verification form</h1>

      <form onSubmit={paymentFetch}>
        <input
          type="text"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          placeholder="Enter Payment ID"
        />
        <button type="submit">Fetch Transaction</button>
      </form>

      {responseState && (
        <div>
          <h2>Transaction Details:</h2>
          {/* <pre>{JSON.stringify(responseState, null, 2)}</pre> */}
          <ul>
            <li>Amount: {responseState.amount / 100} Rs</li>
            <li>Currency: {responseState.currency}</li>
            <li>Status: {responseState.status}</li>
            <li>Method: {responseState.method}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
