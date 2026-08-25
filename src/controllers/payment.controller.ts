import { Request, Response } from 'express';
import { getStripeClient } from '../services/stripe.service';
import { LicenseService } from '../services/license.service';

const PRICE_AMOUNT = 9900; // 99.00 SEK

export class PaymentController {
  private licenseService: LicenseService;

  constructor() {
    this.licenseService = new LicenseService();
  }

  // Arrow-egenskaper krävs - Express anropar handlern utan klasskontext
  public createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const stripe = getStripeClient();
      const PORT = process.env.PORT || 3000;
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'sek',
              product_data: {
                name: 'SiteScanner Pro - Premium (Livstid)',
                description: 'Obegränsade analyser, kompletta kodlösningar för alla hittade fel och snabbare skanningar.',
              },
              unit_amount: PRICE_AMOUNT,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Verifierar en Stripe-checkout direkt mot Stripes API. Vid genomförd
   * betalning utfärdas en licens-token som sparas på servern.
   */
  public verifySession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;

      if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
        res.status(400).json({ error: 'Ogiltigt sessions-ID.' });
        return;
      }

      const existing = this.licenseService.find(sessionId);
      if (existing) {
        res.json({ licensed: true, token: existing.sessionId, createdAt: existing.createdAt });
        return;
      }

      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        res.status(402).json({ error: 'Betalningen är inte slutförd.' });
        return;
      }

      const license = this.licenseService.create(session.id, {
        amountTotal: session.amount_total ?? undefined,
        currency: session.currency ?? undefined
      });

      res.json({ licensed: true, token: license.sessionId, createdAt: license.createdAt });
    } catch (error: any) {
      console.error('Verify session error:', error);
      const notFound =
        error?.code === 'resource_missing' ||
        error?.statusCode === 404 ||
        error?.raw?.statusCode === 404 ||
        error?.type === 'StripeInvalidRequestError';
      res.status(notFound ? 400 : 500).json({
        error: notFound ? 'Köp-sessionen kunde inte hittas.' : 'Kunde inte verifiera betalningen.'
      });
    }
  };
}
