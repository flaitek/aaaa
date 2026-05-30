// src/repositories/trainerRepository.js
// In-memory store — в Отчёте 2 замените этот файл на реальную БД

const { randomUUID } = require('crypto');

const trainers = new Map();

// Seed-данные для удобства тестирования
[
  { surname: 'Петров',   name: 'Алексей', patronymic: 'Сергеевич', phone: '+79001112233', status: 'WORKING'     },
  { surname: 'Сидорова', name: 'Мария',   patronymic: null,         phone: '+79004445566', status: 'ON_LEAVE'   },
].forEach(t => {
  const id = randomUUID();
  trainers.set(id, { id, ...t });
});

function findAll()    { return Array.from(trainers.values()); }
function findById(id) { return trainers.get(id) ?? null; }

function create(data) {
  const trainer = { id: randomUUID(), ...data };
  trainers.set(trainer.id, trainer);
  return trainer;
}

function update(id, data) {
  const existing = trainers.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  trainers.set(id, updated);
  return updated;
}

module.exports = { findAll, findById, create, update };
