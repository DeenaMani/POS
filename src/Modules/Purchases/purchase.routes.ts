const express = require('express');
import purchaseRoute from './Purchases/purchase.routes';
import purchasePaymentsRoutes from '../Purchases/PurchasePayments/purchase.payments.routes';
const purchaseRoutes = express.Router();

purchaseRoutes.use('/', purchaseRoute);

purchaseRoutes.use('/payments', purchasePaymentsRoutes);

export default purchaseRoutes;