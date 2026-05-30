// src/services/trainerService.js
const trainerRepo = require('../repositories/trainerRepository');
const clientRepo  = require('../repositories/clientRepository');

const VALID_STATUSES = ['WORKING', 'ON_LEAVE', 'NOT_WORKING'];

function getAllTrainers()       { return trainerRepo.findAll(); }

function getTrainerDetail(id) {
  const trainer = trainerRepo.findById(id);
  if (!trainer) throw { status: 404, message: `Тренер с id=${id} не найден` };
  const clients = clientRepo.findAll().filter(c => c.trainer_id === id);
  return { ...trainer, clients };
}

function createTrainer(data) {
  return trainerRepo.create({ status: 'WORKING', patronymic: null, ...data });
}

function updateTrainer(id, data) {
  if (!trainerRepo.findById(id)) throw { status: 404, message: `Тренер с id=${id} не найден` };
  return trainerRepo.update(id, data);
}

function setTrainerStatus(id, status) {
  if (!VALID_STATUSES.includes(status))
    throw { status: 400, message: `Недопустимый статус. Допустимые: ${VALID_STATUSES.join(', ')}` };
  if (!trainerRepo.findById(id)) throw { status: 404, message: `Тренер с id=${id} не найден` };
  return trainerRepo.update(id, { status });
}

module.exports = { getAllTrainers, getTrainerDetail, createTrainer, updateTrainer, setTrainerStatus, VALID_STATUSES };
