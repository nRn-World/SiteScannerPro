import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { ScanController } from '../controllers/scan.controller';
import { PaymentController } from '../controllers/payment.controller';
import { VipController } from '../controllers/vip.controller';
import { ReportShareController } from '../controllers/reportShare.controller';
import { requireLicense } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

const contactController = new ContactController();
const scanController = new ScanController();
const paymentController = new PaymentController();
const vipController = new VipController();
const reportShareController = new ReportShareController();

// FAS 1.4: rate limiting – snävare för gratisnivån.
const freeScanLimiter = rateLimit({ name: 'scan-free', max: 5, windowMs: 10 * 60 * 1000 });
const premiumScanLimiter = rateLimit({ name: 'scan-premium', max: 30, windowMs: 10 * 60 * 1000 });
const contactLimiter = rateLimit({ name: 'contact', max: 5, windowMs: 60 * 60 * 1000 });
const licenseLimiter = rateLimit({ name: 'license', max: 10, windowMs: 10 * 60 * 1000 });

// Contact routes
router.post('/contact', contactLimiter, contactController.sendEmail);

// Scan routes
router.post('/scan-free', freeScanLimiter, scanController.scanFree);
router.post('/scan-premium', premiumScanLimiter, requireLicense, scanController.scanPremium);

// Payment routes
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/verify-license', licenseLimiter, paymentController.verifyLicense);
router.post('/verify-session', licenseLimiter, paymentController.verifySession);
router.post('/dev-activate-pro', paymentController.activateLocalPro);

// VIP one-scan share links
router.post('/vip/create', vipController.create);
router.post('/vip/redeem', vipController.redeem);

// FAS 3.1/3.2/3.3: delade rapporter + delbar badge
router.post('/reports/share', licenseLimiter, reportShareController.createShare);
router.get('/reports/:token', rateLimit({ name: 'report-view', max: 60, windowMs: 10 * 60 * 1000 }), reportShareController.getShared);
router.get('/badge/:token.svg', rateLimit({ name: 'badge', max: 120, windowMs: 10 * 60 * 1000 }), reportShareController.badgeSvg);

export default router;
