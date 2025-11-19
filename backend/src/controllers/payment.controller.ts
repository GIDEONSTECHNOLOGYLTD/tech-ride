import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient, PaymentStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, rideId } = req.body;
    const userId = (req as any).user.userId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { rideId, userId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update payment status
        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: PaymentStatus.COMPLETED },
        });
        break;

      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
};

export const processWalletTopup = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = (req as any).user.userId;

    // Create payment intent for wallet topup
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId, type: 'wallet_topup' },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process wallet topup' });
  }
};
