// src/routes/clients.js
const router = require('express').Router();
const c = require('../controllers/clientController');

router.get('/',                               c.getAll);
router.get('/:id',                            c.getById);
router.get('/:id/detail',                     c.getDetail);
router.post('/',                              c.create);
router.put('/:id',                            c.update);
router.patch('/:id/status',                   c.setStatus);
router.post('/:clientId/trainer/:trainerId',  c.assignTrainer);

module.exports = router;
