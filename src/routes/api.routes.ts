import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { ScanController } from '../controllers/scan.controller';
import { PaymentController } from '../controllers/payment.controller';
import { VipController } from '../controllers/vip.controller';
import { ReportShareController } from '../controllers/reportShare.controller';
import { ComparisonController } from '../controllers/comparison.controller';
import { AccountController } from '../controllers/account.controller';
import { MonitorController } from '../controllers/monitor.controller';
import { requireLicense } from '../middleware/auth.middleware';
import { attachUser, requireUser } from '../middleware/session.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

const contactController = new ContactController();
const scanController = new ScanController();
const paymentController = new PaymentController();
const vipController = new VipController();
const reportShareController = new ReportShareController();
const comparisonController = new ComparisonController();
const accountController = new AccountController();
const monitorController = new MonitorController();

// FAS 1.4: rate limiting – snävare för gratisnivån.
const freeScanLimiter = rateLimit({ name: 'scan-free', max: 5, windowMs: 10 * 60 * 1000 });
const premiumScanLimiter = rateLimit({ name: 'scan-premium', max: 30, windowMs: 10 * 60 * 1000 });
const contactLimiter = rateLimit({ name: 'contact', max: 5, windowMs: 60 * 60 * 1000 });
const licenseLimiter = rateLimit({ name: 'license', max: 10, windowMs: 10 * 60 * 1000 });
const reportViewLimiter = rateLimit({ name: 'report-view', max: 60, windowMs: 10 * 60 * 1000 });
const reportAssetLimiter = rateLimit({ name: 'report-asset', max: 180, windowMs: 10 * 60 * 1000 });
const reportShareLimiter = rateLimit({ name: 'report-share', max: 30, windowMs: 10 * 60 * 1000 });
const compareLimiter = rateLimit({ name: 'compare', max: 8, windowMs: 10 * 60 * 1000 });
const authLimiter = rateLimit({ name: 'auth', max: 20, windowMs: 15 * 60 * 1000 });
const registerLimiter = rateLimit({ name: 'register', max: 5, windowMs: 60 * 60 * 1000 });
const monitorWriteLimiter = rateLimit({ name: 'monitor-write', max: 20, windowMs: 60 * 60 * 1000 });
const monitorCheckLimiter = rateLimit({ name: 'monitor-check', max: 6, windowMs: 10 * 60 * 1000 });

// Attach the optional account session to every API request. Routes that need
// an account add requireUser explicitly.
router.use(attachUser);

// Account routes
router.post('/auth/register', registerLimiter, accountController.register);
router.post('/auth/login', authLimiter, accountController.login);
router.post('/auth/logout', authLimiter, accountController.logout);
router.get('/auth/me', accountController.me);

// Monitoring routes (per-account, owner-scoped in the store)
router.get('/monitors', requireUser, monitorController.list);
router.post('/monitors', requireUser, monitorWriteLimiter, monitorController.create);
router.patch('/monitors/:id', requireUser, monitorWriteLimiter, monitorController.update);
router.delete('/monitors/:id', requireUser, monitorWriteLimiter, monitorController.remove);
router.post('/monitors/:id/check', requireUser, monitorCheckLimiter, monitorController.check);

// Contact routes
router.post('/contact', contactLimiter, contactController.sendEmail);

// Scan routes
router.post('/scan-free', freeScanLimiter, scanController.scanFree);
router.post('/scan-premium', premiumScanLimiter, requireLicense, scanController.scanPremium);

// Pro-only competitor comparison (base + up to two competitors).
router.post('/compare', compareLimiter, requireLicense, comparisonController.compare);
router.get('/comparisons/:id', reportViewLimiter, comparisonController.getComparison);

// Payment routes
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/verify-license', licenseLimiter, paymentController.verifyLicense);
router.post('/verify-session', licenseLimiter, paymentController.verifySession);
router.post('/dev-activate-pro', paymentController.activateLocalPro);

// VIP one-scan share links
router.post('/vip/create', vipController.create);
router.post('/vip/redeem', vipController.redeem);

// FAS 3.1/3.2/3.3: sparade rapporter, permalänkar och delbar badge
router.post('/reports/:id/share', reportShareLimiter, reportShareController.createShare);
router.get('/reports/:id/assets/:file', reportAssetLimiter, reportShareController.getAsset);
router.get('/reports/:id', reportViewLimiter, reportShareController.getReport);
// Legacy signed-token endpoint for links issued before saved reports.
router.get('/reports/shared/:token', reportViewLimiter, reportShareController.getShared);
router.get('/badge/:token.svg', rateLimit({ name: 'badge', max: 120, windowMs: 10 * 60 * 1000 }), reportShareController.badgeSvg);

export default router;
