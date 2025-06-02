import express from 'express';

import { protect } from '../../middleware/authMiddleware.js';

import {
  createPaymentLink,
  createPaymentLinkWithOption,
  paymentCallback
} from '../../controllers/reader/payment.controller.js';

const paymentRouter = express.Router()

paymentRouter.post('/create-payment-link', protect, createPaymentLink)

paymentRouter.post('/create-payment-link-with-option', protect, createPaymentLinkWithOption)

paymentRouter.post('/payment-callback', paymentCallback)

export default paymentRouter