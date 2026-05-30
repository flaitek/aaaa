// src/routes/trainers.js
const router = require('express').Router();
const c = require('../controllers/trainerController');

router.get('/',            c.getAll);
router.get('/:id/detail',  c.getDetail);
router.post('/',           c.create);
router.put('/:id',         c.update);
router.patch('/:id/status', c.setStatus);

module.exports = router;
