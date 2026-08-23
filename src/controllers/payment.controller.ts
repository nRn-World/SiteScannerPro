import { Request, Response } from 'express';
import Stripe from 'stripe';

export class PaymentController {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51TEQF0HmQGUZ65cyNyAEqs8QrGDfarrdAgcw4ZeiJ9k1I6qDiaGbfhpDkw3K0Qq5S1dBJ1Nxw3ra0Z4obTds8hdA00NmpZk9dh';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia' as any, // Using a recent API version
    });
  }

  public async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const PORT = process.env.PORT || 3000;
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'sek',
              product_data: {
                name: 'SiteScanner Pro - Premium (Livstid)',
                description: 'Obegränsade analyser, djupgående säkerhetsrapporter och prioriterad AI.',
              },
              unit_amount: 49900, // 499.00 SEK
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}?success=true`,
        cancel_url: `${appUrl}?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}