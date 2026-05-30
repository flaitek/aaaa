// src/controllers/clientController.js
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const clientService = require('../services/clientService');

// ── Правила валидации ───────────────────────────────────────────────────────

const createRules = [
  body('surname').notEmpty().withMessage('Фамилия обязательна'),
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('birthday')
    .notEmpty().withMessage('Дата рождения обязательна')
    .isISO8601().withMessage('Дата рождения должна быть в формате YYYY-MM-DD'),
  body('phone')
    .notEmpty().withMessage('Телефон обязателен')
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Некорректный формат телефона'),
  body('email')
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Некорректный формат email'),
  body('trainer_id')
    .optional({ nullable: true })
    .isUUID().withMessage('trainer_id должен быть UUID'),
];

const updateRules = [
  param('id').isUUID().withMessage('id должен быть UUID'),
  body('surname').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
  body('name').optional().notEmpty().withMessage('Имя не может быть пустым'),
  body('birthday')
    .optional()
    .isISO8601().withMessage('Дата рождения должна быть в формате YYYY-MM-DD'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Некорректный формат телефона'),
  body('email')
    .optional()
    .isEmail().withMessage('Некорректный формат email'),
  body('trainer_id')
    .optional({ nullable: true })
    .isUUID().withMessage('trainer_id должен быть UUID'),
];

const idRule = [param('id').isUUID().withMessage('id должен быть UUID')];

const statusRule = [
  ...idRule,
  body('is_active').isBoolean().withMessage('is_active должен быть boolean'),
];

const assignTrainerRule = [
  param('clientId').isUUID().withMessage('clientId должен быть UUID'),
  param('trainerId').isUUID().withMessage('trainerId должен быть UUID'),
];

// ── Хендлеры ────────────────────────────────────────────────────────────────

function getAll(req, res, next) {
  try {
    res.json(clientService.getAllClients());
  } catch (e) { next(e); }
}

function getById(req, res, next) {
  try {
    res.json(clientService.getClientById(req.params.id));
  } catch (e) { next(e); }
}

function getDetail(req, res, next) {
  try {
    res.json(clientService.getClientDetail(req.params.id));
  } catch (e) { next(e); }
}

function create(req, res, next) {
  try {
    const client = clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (e) { next(e); }
}

function update(req, res, next) {
  try {
    res.json(clientService.updateClient(req.params.id, req.body));
  } catch (e) { next(e); }
}

function setStatus(req, res, next) {
  try {
    res.json(clientService.setClientStatus(req.params.id, req.body.is_active));
  } catch (e) { next(e); }
}

function assignTrainer(req, res, next) {
  try {
    res.json(clientService.assignTrainer(req.params.clientId, req.params.trainerId));
  } catch (e) { next(e); }
}

module.exports = {
  getAll,
  getById: [...idRule, validate, getById],
  getDetail: [...idRule, validate, getDetail],
  create: [...createRules, validate, create],
  update: [...updateRules, validate, update],
  setStatus: [...statusRule, validate, setStatus],
  assignTrainer: [...assignTrainerRule, validate, assignTrainer],
};
