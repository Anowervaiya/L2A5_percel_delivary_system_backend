// routes/dashboard.routes.ts
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interfaces';
import { dashboardController } from './dashboard.controller';

const router = express.Router();

// =============  SENDER DASHBOARD ROUTES =============

router.get(
  '/sender/stats',
  checkAuth(Role.SENDER),
  dashboardController.getSenderStats
);

router.get(
  '/sender/parcels',
  checkAuth(Role.SENDER, Role.RECEIVER, Role.ADMIN),
  dashboardController.getSenderParcels
);


// ============= RECEIVER DASHBOARD ROUTES =============
// Receiver dashboard stats
router.get(
  '/receiver/stats',
  checkAuth(Role.RECEIVER),
  dashboardController.getReceiverStats
);

// Get incoming parcels with filters
router.get(
  '/receiver/parcels',
  checkAuth(Role.RECEIVER),
  dashboardController.getReceiverParcels
);

// ============= ADMIN DASHBOARD ROUTES =============
// Admin overview stats
router.get(
  '/admin/overview',
  checkAuth(Role.ADMIN),
  dashboardController.getAdminOverview
);

// Parcel trends over time
router.get(
  '/admin/trends',
  checkAuth(Role.ADMIN),
  dashboardController.getParcelTrends
);

// District-wise distribution
router.get(
  '/admin/districts',
  checkAuth(Role.ADMIN),
  dashboardController.getDistrictDistribution
);

// Revenue growth data
router.get(
  '/admin/revenue',
  checkAuth(Role.ADMIN),
  dashboardController.getRevenueGrowth
);

// System performance metrics
router.get(
  '/admin/metrics',
  checkAuth(Role.ADMIN),
  dashboardController.getSystemMetrics
);

export const dashboardRoute = router;