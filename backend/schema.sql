CREATE DATABASE IF NOT EXISTS arocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arocare;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(190) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','agent','admin','pharmacist') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(190) NOT NULL,
  generic_name VARCHAR(190),
  category VARCHAR(80),
  brand VARCHAR(120),
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  prescription_required BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_code VARCHAR(20) UNIQUE NOT NULL,
  user_id BIGINT,
  status VARCHAR(60) DEFAULT 'confirmed',
  total DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(40),
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE prescriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  file_url VARCHAR(500) NOT NULL,
  review_status VARCHAR(40) DEFAULT 'pending',
  pharmacist_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE support_conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  status ENUM('bot','waiting_agent','agent','closed') DEFAULT 'bot',
  language VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
