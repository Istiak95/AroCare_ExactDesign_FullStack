CREATE DATABASE IF NOT EXISTS arocare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE arocare;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(32) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(32) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS lab_bookings (
  id VARCHAR(32) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS doctor_bookings (
  id VARCHAR(32) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(32) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3)
    NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

INSERT INTO orders (id, payload)
VALUES (
  'AC-1042',
  JSON_OBJECT(
    'id', 'AC-1042',
    'status', 'Out for delivery',
    'eta', 'Today, 4:00–7:00 PM',
    'createdAt', '2026-08-01T06:00:00.000Z',
    'total', 1230,
    'payment', 'cod',
    'address', JSON_OBJECT(
      'name', 'Demo Customer',
      'phone', '01700000000',
      'address', 'Dhanmondi, Dhaka'
    ),
    'items', JSON_ARRAY(),
    'timeline', JSON_ARRAY(
      'Order confirmed',
      'Pharmacist reviewed',
      'Packed',
      'Out for delivery'
    )
  )
)
ON DUPLICATE KEY UPDATE
  payload = VALUES(payload);