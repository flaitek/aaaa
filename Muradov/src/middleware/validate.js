// src/middleware/validate.js — ручная валидация без express-validator

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^\+?[0-9]{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

function isUUID(v)  { return typeof v === 'string' && UUID_RE.test(v); }
function isPhone(v) { return typeof v === 'string' && PHONE_RE.test(v); }
function isEmail(v) { return typeof v === 'string' && EMAIL_RE.test(v); }
function isDate(v)  { return typeof v === 'string' && DATE_RE.test(v) && !isNaN(Date.parse(v)); }

module.exports = { isUUID, isPhone, isEmail, isDate };
