import PayOS from "@payos/node";
import { xorEncrypt } from "../../utils/XOREncrypt.js";

const payos = new PayOS(
  '596f2353-7de4-42b8-84ae-217713f717be',
  '41b0b93f-1fe2-4b40-81d8-96a22b2fee24',
  '0eed5dc90388324ce053997e49ba6765130e5eff3c661a9f595086847a4d1c17'
)

// const YOUR_DOMAIN = 'https://storyforest.online/payment';
const YOUR_DOMAIN = 'http://localhost:5173/payment';

export const createPaymentLink = async (req, res) => {
  const userid = req.user.id
  // Generate a unique orderCode using timestamp and random number
  const orderCode = Number(`${Date.now()}${Math.floor(10 + Math.random() * 90)}`); // Example: 16832012345671234
  const order = {
    orderCode: orderCode,
    amount: 10000,
    description: "Thanh toan don hang",
    items: [
      {
        name: "Không vip đời không nể",
        quantity: 1,
        price: 10000,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}/success?userid=${userid}`,
    cancelUrl: `${YOUR_DOMAIN}/cancel`,
  };
  const paymentLink = await payos.createPaymentLink(order);
  return res.json({ url: paymentLink.checkoutUrl });
}

export const createPaymentLinkWithOption = async (req, res) => {
  const userid = req.user.id
  const { duration, amount, name } = req.body
  const orderCode = Number(`${Date.now()}${Math.floor(10 + Math.random() * 90)}`); // Example: 16832012345671234
  const order = {
    orderCode: orderCode,
    amount: amount,
    description: "Thanh toan don hang",
    items: [
      {
        name: name,
        quantity: 1,
        price: amount,
      },
    ],
    returnUrl: `${YOUR_DOMAIN}/success?userid=${userid}&name=${name}&duration=${duration}$price=${amount}`,
    cancelUrl: `${YOUR_DOMAIN}/cancel`,
  };
  const paymentLink = await payos.createPaymentLink(order);
  return res.json({ url: paymentLink.checkoutUrl });
}

export const paymentCallback = async (req, res) => {
  console.log(req.body)
  return res.json()
}