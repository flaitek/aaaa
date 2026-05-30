// src/controllers/trainerController.js
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const trainerService = require('../services/trainerService');

// ── Правила валидации ───────────────────────────────────────────────────────

const VALID_STATUSES = ['WORKING', 'ON_LEAVE', 'NOT_WORKING'];

const createRules = [
  body('surname').notEmpty().withMessage('Фамилия обязательна'),
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('phone')
    .notEmpty().withMessage('Телефон обязателен')
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Некорректный формат телефона'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Статус должен быть одним из: ${VALID_STATUSES.join(', ')}`),
];

const updateRules = [
  param('id').isUUID().withMessage('id должен быть UUID'),
  body('surname').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
  body('name').optional().notEmpty().withMessage('Имя не может быть пустым'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Некорректный формат телефона'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Статус должен быть одним из: ${VALID_STATUSES.join(', ')}`),
];

const idRule = [param('id').isUUID().withMessage('id должен быть UUID')];

const statusRule = [
  ...idRule,
  body('status')
    .notEmpty().withMessage('Статус обязателен')
    .isIn(VALID_STATUSES).withMessage(`Статус должен быть одним из: ${VALID_STATUSES.join(', ')}`),
];

// ── Хендлеры ────────────────────────────────────────────────────────────────

function getAll(req, res, next) {
  try {
    res.json(trainerService.getAllTrainers());
  } catch (e) { next(e); }
}

function getDetail(req, res, next) {
  try {
    res.json(trainerService.getTrainerDetail(req.params.id));
  } catch (e) { next(e); }
}

function create(req, res, next) {
  try {
    const trainer = trainerService.createTrainer(req.body);
    res.status(201).json(trainer);
  } catch (e) { next(e); }
}

function update(req, res, next) {
  try {
    res.json(trainerService.updateTrainer(req.params.id, req.body));
  } catch (e) { next(e); }
}

function setStatus(req, res, next) {
  try {
    res.json(trainerService.setTrainerStatus(req.params.id, req.body.status));
  } catch (e) { next(e); }
}

module.exports = {
  getAll,
  getDetail: [...idRule, validate, getDetail],
  create: [...createRules, validate, create],
  update: [...updateRules, validate, update],
  setStatus: [...statusRule, validate, setStatus],
};
