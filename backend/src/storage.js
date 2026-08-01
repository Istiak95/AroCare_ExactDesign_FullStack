import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "../data-store.json");
const initial = {
  orders: [{
    id: "AC-1042",
    status: "Out for delivery",
    eta: "Today, 4:00–7:00 PM",
    createdAt: "2026-08-01T06:00:00.000Z",
    total: 1230,
    payment: "cod",
    address: { name: "Demo Customer", phone: "01700000000", address: "Dhanmondi, Dhaka" },
    items: [{ id: 1, name: "Napa 500 mg", qty: 2, price: 20, image: "/products/p1.png", unit: "10 tablets" }],
    timeline: ["Order confirmed", "Pharmacist reviewed", "Packed", "Out for delivery"]
  }],
  prescriptions: [],
  labBookings: [],
  doctorBookings: [],
  supportTickets: [],
  users: []
};

function ensure() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2));
}

export function readStore() {
  ensure();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ...structuredClone(initial), ...parsed };
  } catch {
    return structuredClone(initial);
  }
}

export function writeStore(store) {
  fs.writeFileSync(file, JSON.stringify(store, null, 2));
  return store;
}

export function updateStore(mutator) {
  const store = readStore();
  const result = mutator(store);
  writeStore(store);
  return result;
}
