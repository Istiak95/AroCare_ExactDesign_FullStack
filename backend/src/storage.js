import { getDb } from "./db.js";

const ALLOWED_TABLES = new Set([
  "orders",
  "prescriptions",
  "lab_bookings",
  "doctor_bookings",
  "support_tickets",
  "users",
]);

function assertTable(table) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Unsupported table: ${table}`);
  }
}

function parsePayload(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Invalid JSON payload received from TiDB.");
  }
}

async function listRecords(table) {
  assertTable(table);

  const rows = await getDb().execute(
    `SELECT payload
     FROM ${table}
     ORDER BY created_at DESC`
  );

  return rows
    .map((row) => parsePayload(row.payload))
    .filter(Boolean);
}

async function getRecord(table, id) {
  assertTable(table);

  const rows = await getDb().execute(
    `SELECT payload
     FROM ${table}
     WHERE id = ?
     LIMIT 1`,
    [String(id)]
  );

  if (!rows.length) {
    return null;
  }

  return parsePayload(rows[0].payload);
}

async function insertRecord(table, record) {
  assertTable(table);

  if (!record?.id) {
    throw new Error(`Record id is required for ${table}.`);
  }

  await getDb().execute(
    `INSERT INTO ${table} (id, payload)
     VALUES (?, ?)`,
    [
      String(record.id),
      JSON.stringify(record),
    ]
  );

  return record;
}

async function updateRecord(table, id, updater) {
  const current = await getRecord(table, id);

  if (!current) {
    return null;
  }

  const updated = await updater(
    structuredClone(current)
  );

  if (!updated) {
    return null;
  }

  await getDb().execute(
    `UPDATE ${table}
     SET payload = ?,
         updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [
      JSON.stringify(updated),
      String(id),
    ]
  );

  return updated;
}

function createId(prefix, digits = 8) {
  return `${prefix}-${Date.now()
    .toString()
    .slice(-digits)}`;
}

/* Orders */

export function getOrders() {
  return listRecords("orders");
}

export function getOrderById(id) {
  return getRecord(
    "orders",
    String(id).toUpperCase()
  );
}

export async function createOrder(payload = {}) {
  let orderId;
  let existing;

  do {
    orderId = `AC-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    existing = await getOrderById(orderId);
  } while (existing);

  const order = {
    id: orderId,
    status: "Order confirmed",
    eta: "Within 1–3 working days",
    timeline: ["Order confirmed"],
    createdAt: new Date().toISOString(),
    ...payload,
  };

  return insertRecord("orders", order);
}

export function updateOrderStatus(id, status) {
  return updateRecord(
    "orders",
    String(id).toUpperCase(),
    (order) => {
      order.status = status;

      order.timeline = Array.isArray(order.timeline)
        ? order.timeline
        : [];

      if (
        status !== "Cancelled" &&
        !order.timeline.includes(status)
      ) {
        order.timeline.push(status);
      }

      order.updatedAt = new Date().toISOString();

      return order;
    }
  );
}

/* Prescriptions */

export function getPrescriptions() {
  return listRecords("prescriptions");
}

export async function createPrescription(
  payload = {}
) {
  const prescription = {
    id: createId("RX", 6),
    status: "Submitted for pharmacist review",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  return insertRecord(
    "prescriptions",
    prescription
  );
}

/* Lab bookings */

export function getLabBookings() {
  return listRecords("lab_bookings");
}

export async function createLabBooking(
  payload = {}
) {
  const booking = {
    id: createId("LAB", 6),
    status: "Collection requested",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  return insertRecord(
    "lab_bookings",
    booking
  );
}

/* Doctor bookings */

export function getDoctorBookings() {
  return listRecords("doctor_bookings");
}

export async function createDoctorBooking(
  payload = {}
) {
  const booking = {
    id: createId("DOC", 6),
    status: "Appointment requested",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  return insertRecord(
    "doctor_bookings",
    booking
  );
}

/* Support tickets */

export function getSupportTickets() {
  return listRecords("support_tickets");
}

export async function createSupportTicketRecord(
  payload = {}
) {
  const ticket = {
    id: createId("SUP", 7),
    status: "Open",
    createdAt: new Date().toISOString(),
    ...payload,
  };

  return insertRecord(
    "support_tickets",
    ticket
  );
}

/* Users */

export function getUsers() {
  return listRecords("users");
}

/* Admin dashboard snapshot */

export async function getStoreSnapshot() {
  const [
    orders,
    prescriptions,
    labBookings,
    doctorBookings,
    supportTickets,
    users,
  ] = await Promise.all([
    getOrders(),
    getPrescriptions(),
    getLabBookings(),
    getDoctorBookings(),
    getSupportTickets(),
    getUsers(),
  ]);

  return {
    orders,
    prescriptions,
    labBookings,
    doctorBookings,
    supportTickets,
    users,
  };
}