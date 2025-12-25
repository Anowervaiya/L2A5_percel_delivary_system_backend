"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PercelRout = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interfaces_1 = require("../user/user.interfaces");
const percel_controller_1 = require("./percel.controller");
const router = (0, express_1.Router)();
// Existing routes
router.get('/my-parcel', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.RECEIVER, user_interfaces_1.Role.SENDER), percel_controller_1.ParcelController.myParcel);
router.get('/all-parcel', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), percel_controller_1.ParcelController.allParcel);
router.post('/create-parcel', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.SENDER), percel_controller_1.ParcelController.createParcel);
router.get('/filterByStatus', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), percel_controller_1.ParcelController.finterParcelByStatus);
router.get('/track/:trackingId', (0, checkAuth_1.checkAuth)(...Object.values(user_interfaces_1.Role)), percel_controller_1.ParcelController.ParcelByTrackingId);
router.patch('/cancel/:id', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.SENDER), percel_controller_1.ParcelController.cancelParcel);
router.patch('/confirm/:id', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.RECEIVER, user_interfaces_1.Role.SENDER), percel_controller_1.ParcelController.confirmParcel);
router.patch('/status', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), percel_controller_1.ParcelController.changeParcelStatus);
router.delete('/delete/:id', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), percel_controller_1.ParcelController.deleteParcel);
exports.PercelRout = router;
