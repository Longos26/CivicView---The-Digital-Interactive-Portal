import express from 'express';

import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  searchServices
} from '../controllers/service.controller.js';

const router = express.Router();

router.get('/search', searchServices);

router.get('/', getServices);
router.post('/', createService);
router.get('/:id', getService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;