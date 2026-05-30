// src/repositories/clientRepository.js
// In-memory store — в Отчёте 2 замените этот файл на реальную БД

const { randomUUID } = require('crypto');

const clients = new Map();

function findAll()    { return Array.from(clients.values()); }
function findById(id) { return clients.get(id) ?? null; }

function create(data) {
  const client = { id: randomUUID(), is_active: true, trainer_id: null, patronymic: null, ...data };
  clients.set(client.id, client);
  return client;
}

function update(id, data) {
  const existing = clients.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  clients.set(id, updated);
  return updated;
}

module.exports = { findAll, findById, create, update };
