// src/services/clientService.js
const clientRepo  = require('../repositories/clientRepository');
const trainerRepo = require('../repositories/trainerRepository');

function getAllClients()  { return clientRepo.findAll(); }

function getClientById(id) {
  const c = clientRepo.findById(id);
  if (!c) throw { status: 404, message: `Клиент с id=${id} не найден` };
  return c;
}

function getClientDetail(id) {
  const client = clientRepo.findById(id);
  if (!client) throw { status: 404, message: `Клиент с id=${id} не найден` };
  let trainer = null;
  if (client.trainer_id) {
    const t = trainerRepo.findById(client.trainer_id);
    if (t) trainer = { id: t.id, surname: t.surname, name: t.name, patronymic: t.patronymic, status: t.status };
  }
  const { trainer_id, ...rest } = client;
  return { ...rest, trainer };
}

function createClient(data) {
  if (data.trainer_id && !trainerRepo.findById(data.trainer_id))
    throw { status: 404, message: `Тренер с id=${data.trainer_id} не найден` };
  return clientRepo.create(data);
}

function updateClient(id, data) {
  if (!clientRepo.findById(id)) throw { status: 404, message: `Клиент с id=${id} не найден` };
  if (data.trainer_id && !trainerRepo.findById(data.trainer_id))
    throw { status: 404, message: `Тренер с id=${data.trainer_id} не найден` };
  return clientRepo.update(id, data);
}

function setClientStatus(id, is_active) {
  if (!clientRepo.findById(id)) throw { status: 404, message: `Клиент с id=${id} не найден` };
  return clientRepo.update(id, { is_active });
}

function assignTrainer(clientId, trainerId) {
  if (!clientRepo.findById(clientId))  throw { status: 404, message: `Клиент с id=${clientId} не найден` };
  if (!trainerRepo.findById(trainerId)) throw { status: 404, message: `Тренер с id=${trainerId} не найден` };
  return clientRepo.update(clientId, { trainer_id: trainerId });
}

module.exports = { getAllClients, getClientById, getClientDetail, createClient, updateClient, setClientStatus, assignTrainer };
