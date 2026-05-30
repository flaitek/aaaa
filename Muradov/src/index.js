// src/index.js  —  Fitness Center REST API (zero dependencies, pure Node.js http)
'use strict';

const http = require('http');
const { isUUID, isPhone, isEmail, isDate } = require('./middleware/validate');
const clientSvc  = require('./services/clientService');
const trainerSvc = require('./services/trainerService');

const PORT = process.env.PORT || 3000;

// ── Helpers ─────────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject({ status: 400, message: 'Тело запроса должно быть валидным JSON' }); }
    });
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function err400(res, details) {
  send(res, 400, { error: 'Ошибка валидации', details });
}

// ── Validators ───────────────────────────────────────────────────────────────

function validateClientCreate(b) {
  const errs = [];
  if (!b.surname || typeof b.surname !== 'string' || !b.surname.trim())
    errs.push({ field: 'surname', message: 'Фамилия обязательна' });
  if (!b.name || typeof b.name !== 'string' || !b.name.trim())
    errs.push({ field: 'name', message: 'Имя обязательно' });
  if (!b.birthday)
    errs.push({ field: 'birthday', message: 'Дата рождения обязательна' });
  else if (!isDate(b.birthday))
    errs.push({ field: 'birthday', message: 'Дата рождения должна быть в формате YYYY-MM-DD' });
  if (!b.phone)
    errs.push({ field: 'phone', message: 'Телефон обязателен' });
  else if (!isPhone(b.phone))
    errs.push({ field: 'phone', message: 'Некорректный формат телефона' });
  if (!b.email)
    errs.push({ field: 'email', message: 'Email обязателен' });
  else if (!isEmail(b.email))
    errs.push({ field: 'email', message: 'Некорректный формат email' });
  if (b.trainer_id != null && !isUUID(b.trainer_id))
    errs.push({ field: 'trainer_id', message: 'trainer_id должен быть UUID' });
  return errs;
}

function validateClientUpdate(b) {
  const errs = [];
  if ('surname' in b && (!b.surname || !b.surname.trim()))
    errs.push({ field: 'surname', message: 'Фамилия не может быть пустой' });
  if ('name' in b && (!b.name || !b.name.trim()))
    errs.push({ field: 'name', message: 'Имя не может быть пустым' });
  if ('birthday' in b && !isDate(b.birthday))
    errs.push({ field: 'birthday', message: 'Дата рождения должна быть в формате YYYY-MM-DD' });
  if ('phone' in b && !isPhone(b.phone))
    errs.push({ field: 'phone', message: 'Некорректный формат телефона' });
  if ('email' in b && !isEmail(b.email))
    errs.push({ field: 'email', message: 'Некорректный формат email' });
  if ('trainer_id' in b && b.trainer_id != null && !isUUID(b.trainer_id))
    errs.push({ field: 'trainer_id', message: 'trainer_id должен быть UUID' });
  return errs;
}

function validateTrainerCreate(b) {
  const errs = [];
  if (!b.surname || !b.surname.trim())
    errs.push({ field: 'surname', message: 'Фамилия обязательна' });
  if (!b.name || !b.name.trim())
    errs.push({ field: 'name', message: 'Имя обязательно' });
  if (!b.phone)
    errs.push({ field: 'phone', message: 'Телефон обязателен' });
  else if (!isPhone(b.phone))
    errs.push({ field: 'phone', message: 'Некорректный формат телефона' });
  if ('status' in b && !trainerSvc.VALID_STATUSES.includes(b.status))
    errs.push({ field: 'status', message: `Статус должен быть одним из: ${trainerSvc.VALID_STATUSES.join(', ')}` });
  return errs;
}

function validateTrainerUpdate(b) {
  const errs = [];
  if ('surname' in b && (!b.surname || !b.surname.trim()))
    errs.push({ field: 'surname', message: 'Фамилия не может быть пустой' });
  if ('name' in b && (!b.name || !b.name.trim()))
    errs.push({ field: 'name', message: 'Имя не может быть пустым' });
  if ('phone' in b && !isPhone(b.phone))
    errs.push({ field: 'phone', message: 'Некорректный формат телефона' });
  if ('status' in b && !trainerSvc.VALID_STATUSES.includes(b.status))
    errs.push({ field: 'status', message: `Статус должен быть одним из: ${trainerSvc.VALID_STATUSES.join(', ')}` });
  return errs;
}

// ── Router ───────────────────────────────────────────────────────────────────

const UUID_SEG = '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';

const routes = [
  // Clients
  { method: 'GET',   re: new RegExp(`^/api/clients$`),                                     handler: handleGetClients },
  { method: 'POST',  re: new RegExp(`^/api/clients$`),                                     handler: handleCreateClient },
  { method: 'GET',   re: new RegExp(`^/api/clients/${UUID_SEG}$`),                         handler: handleGetClient },
  { method: 'GET',   re: new RegExp(`^/api/clients/${UUID_SEG}/detail$`),                  handler: handleGetClientDetail },
  { method: 'PUT',   re: new RegExp(`^/api/clients/${UUID_SEG}$`),                         handler: handleUpdateClient },
  { method: 'PATCH', re: new RegExp(`^/api/clients/${UUID_SEG}/status$`),                  handler: handleSetClientStatus },
  { method: 'POST',  re: new RegExp(`^/api/clients/${UUID_SEG}/trainer/${UUID_SEG}$`),     handler: handleAssignTrainer },
  // Trainers
  { method: 'GET',   re: new RegExp(`^/api/trainers$`),                                    handler: handleGetTrainers },
  { method: 'POST',  re: new RegExp(`^/api/trainers$`),                                    handler: handleCreateTrainer },
  { method: 'GET',   re: new RegExp(`^/api/trainers/${UUID_SEG}/detail$`),                 handler: handleGetTrainerDetail },
  { method: 'PUT',   re: new RegExp(`^/api/trainers/${UUID_SEG}$`),                        handler: handleUpdateTrainer },
  { method: 'PATCH', re: new RegExp(`^/api/trainers/${UUID_SEG}/status$`),                 handler: handleSetTrainerStatus },
];

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleGetClients(req, res) {
  send(res, 200, clientSvc.getAllClients());
}

async function handleCreateClient(req, res) {
  const body = await readBody(req);
  const errs = validateClientCreate(body);
  if (errs.length) return err400(res, errs);
  const client = clientSvc.createClient(body);
  send(res, 201, client);
}

async function handleGetClient(req, res, params) {
  const client = clientSvc.getClientById(params[0]);
  send(res, 200, client);
}

async function handleGetClientDetail(req, res, params) {
  const detail = clientSvc.getClientDetail(params[0]);
  send(res, 200, detail);
}

async function handleUpdateClient(req, res, params) {
  const body = await readBody(req);
  const errs = validateClientUpdate(body);
  if (errs.length) return err400(res, errs);
  const client = clientSvc.updateClient(params[0], body);
  send(res, 200, client);
}

async function handleSetClientStatus(req, res, params) {
  const body = await readBody(req);
  if (typeof body.is_active !== 'boolean')
    return err400(res, [{ field: 'is_active', message: 'is_active должен быть boolean' }]);
  const client = clientSvc.setClientStatus(params[0], body.is_active);
  send(res, 200, client);
}

async function handleAssignTrainer(req, res, params) {
  const client = clientSvc.assignTrainer(params[0], params[1]);
  send(res, 200, client);
}

async function handleGetTrainers(req, res) {
  send(res, 200, trainerSvc.getAllTrainers());
}

async function handleCreateTrainer(req, res) {
  const body = await readBody(req);
  const errs = validateTrainerCreate(body);
  if (errs.length) return err400(res, errs);
  const trainer = trainerSvc.createTrainer(body);
  send(res, 201, trainer);
}

async function handleGetTrainerDetail(req, res, params) {
  const detail = trainerSvc.getTrainerDetail(params[0]);
  send(res, 200, detail);
}

async function handleUpdateTrainer(req, res, params) {
  const body = await readBody(req);
  const errs = validateTrainerUpdate(body);
  if (errs.length) return err400(res, errs);
  const trainer = trainerSvc.updateTrainer(params[0], body);
  send(res, 200, trainer);
}

async function handleSetTrainerStatus(req, res, params) {
  const body = await readBody(req);
  if (!body.status)
    return err400(res, [{ field: 'status', message: 'Статус обязателен' }]);
  if (!trainerSvc.VALID_STATUSES.includes(body.status))
    return err400(res, [{ field: 'status', message: `Статус должен быть одним из: ${trainerSvc.VALID_STATUSES.join(', ')}` }]);
  const trainer = trainerSvc.setTrainerStatus(params[0], body.status);
  send(res, 200, trainer);
}

// ── Main dispatch ─────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  for (const route of routes) {
    if (route.method !== req.method) continue;
    const m = url.match(route.re);
    if (!m) continue;

    try {
      await route.handler(req, res, m.slice(1));
    } catch (e) {
      if (e && e.status) {
        send(res, e.status, { error: e.message });
      } else {
        console.error(e);
        send(res, 500, { error: 'Внутренняя ошибка сервера' });
      }
    }
    return;
  }

  send(res, 404, { error: `Маршрут ${req.method} ${url} не найден` });
});

server.listen(PORT, () => {
  console.log(`✅  Fitness API запущен → http://localhost:${PORT}/api`);
  console.log('   Клиенты:  /api/clients');
  console.log('   Тренеры:  /api/trainers');
});

module.exports = server;
