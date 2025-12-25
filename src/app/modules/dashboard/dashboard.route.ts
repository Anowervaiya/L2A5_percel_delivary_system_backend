// routes/receiverDashboard.routes.ts
import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interfaces';
import { dashboardController } from './dashboard.controller';


const router = express.Router();

// Receiver dashboard stats
router.get(
  '/receiver/stats',
  checkAuth(Role.RECEIVER), // Both can receive parcels
   dashboardController.getReceiverStats
);

// Get incoming parcels with filters
router.get(
  '/receiver/parcels',
  checkAuth(Role.RECEIVER), // Both can receive parcels
  dashboardController.getReceiverParcels
);

export  const 

dashboardRout = router;