import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { ScanController } from '../controllers/scan.controller';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

const contactController = new ContactController();
const scanController = new ScanController();
const paymentController = new PaymentController();

// Contact routes
router.post('/contact', contactController.sendEmail);

// Scan routes
router.post('/scan-free', scanController.scanFree);
router.post('/scan-premium', scanController.scanPremium);

// Payment routes
router.post('/create-checkout-session', paymentController.createCheckoutSession);

export default router;