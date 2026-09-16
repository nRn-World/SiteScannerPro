import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { ScanController } from '../controllers/scan.controller';
import { PaymentController } from '../controllers/payment.controller';
import { VipController } from '../controllers/vip.controller';
import { requireLicense } from '../middleware/auth.middleware';

const router = Router();

const contactController = new ContactController();
const scanController = new ScanController();
const paymentController = new PaymentController();
const vipController = new VipController();

// Contact routes
router.post('/contact', contactController.sendEmail);

// Scan routes
router.post('/scan-free', scanController.scanFree);
router.post('/scan-premium', requireLicense, scanController.scanPremium);

// Payment routes
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/verify-license', paymentController.verifyLicense);
router.post('/verify-session', paymentController.verifySession);
router.post('/dev-activate-pro', paymentController.activateLocalPro);

// VIP one-scan share links
router.post('/vip/create', vipController.create);
router.post('/vip/redeem', vipController.redeem);

export default router;
