import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  categories,
  products,
  labTests,
  doctors,
} from "./data.js";

import {
  getChatReply,
  getGeminiStatus,
  createSupportTicket,
} from "./chatbot.js";

import { dbPing } from "./db.js";

import {
  createDoctorBooking,
  createLabBooking,
  createOrder,
  createPrescription,
  getDoctorBookings,
  getLabBookings,
  getOrderById,
  getOrders,
  getPrescriptions,
  getStoreSnapshot,
  getSupportTickets,
  updateOrderStatus,
} from "./storage.js";

dotenv.config();

const app = express();

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "arocare-uploads")
  : path.join(__dirname, "../uploads");

fs.mkdirSync(uploadDir, {
  recursive: true,
});

const allowedFileTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const upload = multer({
  dest: uploadDir,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, callback) {
    if (!allowedFileTypes.has(file.mimetype)) {
      return callback(
        new Error(
          "Only JPG, PNG, WEBP and PDF files are allowed."
        )
      );
    }

    callback(null, true);
  },
});

function normalizeOrigin(origin = "") {
  return String(origin)
    .trim()
    .replace(/\/$/, "");
}

const configuredOrigins = String(
  process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin =
        normalizeOrigin(origin);

      const localDevelopment =
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(
          cleanOrigin
        );

      if (
        configuredOrigins.includes(cleanOrigin) ||
        localDevelopment
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked origin: ${cleanOrigin}`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  "/uploads",
  express.static(uploadDir)
);

/*
  Async route wrapper
  Express 4-এ async error error-handler-এ পাঠাবে।
*/
function route(handler) {
  return function wrappedRoute(
    req,
    res,
    next
  ) {
    Promise.resolve(
      handler(req, res, next)
    ).catch(next);
  };
}

/* Root */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "AroCare API",
    message: "AroCare backend is running",

    endpoints: {
      health: "/health",
      products: "/api/products",
      chatbotStatus: "/api/chat/status",
      orders: "/api/orders",
    },
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/favicon.png", (req, res) => {
  res.status(204).end();
});

/* Health */

app.get(
  "/health",
  route(async (req, res) => {
    let databaseReady = false;
    let databaseError = null;

    try {
      databaseReady = await dbPing();
    } catch (error) {
      databaseError = String(
        error?.message ||
          "Database connection failed."
      ).slice(0, 200);
    }

    res.json({
      status: "ok",
      app: "AroCare API",

      databaseConfigured: Boolean(
        process.env.DATABASE_URL
      ),

      databaseReady,
      databaseError,

      chatbot: process.env.GEMINI_API_KEY
        ? "Gemini + local fallback"
        : "local fallback",

      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY
      ),

      geminiModel:
        process.env.GEMINI_MODEL ||
        "auto-detect",
    });
  })
);

/* Chatbot */

app.get(
  "/api/chat/status",
  route(async (req, res) => {
    const status =
      await getGeminiStatus({
        apiKey:
          process.env.GEMINI_API_KEY,
        model:
          process.env.GEMINI_MODEL || "",
      });

    res.json(status);
  })
);

app.post(
  "/api/chat",
  route(async (req, res) => {
    const message = String(
      req.body.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const reply = await getChatReply(
      {
        message,
        history: Array.isArray(
          req.body.history
        )
          ? req.body.history
          : [],
      },
      {
        apiKey:
          process.env.GEMINI_API_KEY,
        model:
          process.env.GEMINI_MODEL || "",
      }
    );

    res.json(reply);
  })
);

app.post(
  "/api/support-tickets",
  route(async (req, res) => {
    const { name, phone, issue } =
      req.body || {};

    if (!name || !phone || !issue) {
      return res.status(400).json({
        message:
          "Name, phone and issue are required",
      });
    }

    const ticket =
      await createSupportTicket(
        req.body
      );

    res.status(201).json(ticket);
  })
);

/* Categories and products */

app.get(
  "/api/categories",
  (req, res) => {
    res.json(categories);
  }
);

app.get(
  "/api/products",
  (req, res) => {
    const searchQuery = String(
      req.query.q || ""
    ).toLowerCase();

    const category = String(
      req.query.category || "all"
    );

    const filteredProducts =
      products.filter((product) => {
        const matchesCategory =
          category === "all" ||
          product.category === category;

        const searchText = [
          product.name,
          product.generic,
          product.brand,
          product.tagline,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchQuery ||
          searchText.includes(
            searchQuery
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      });

    res.json(filteredProducts);
  }
);

app.get(
  "/api/products/:id",
  (req, res) => {
    const product = products.find(
      (item) =>
        item.id ===
        Number(req.params.id)
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  }
);

/* Lab tests */

app.get(
  "/api/lab-tests",
  (req, res) => {
    res.json(labTests);
  }
);

app.get(
  "/api/lab-bookings",
  route(async (req, res) => {
    res.json(
      await getLabBookings()
    );
  })
);

app.post(
  "/api/lab-bookings",
  route(async (req, res) => {
    const booking =
      await createLabBooking(
        req.body || {}
      );

    res.status(201).json(booking);
  })
);

/* Doctors */

app.get(
  "/api/doctors",
  (req, res) => {
    res.json(doctors);
  }
);

app.get(
  "/api/doctor-bookings",
  route(async (req, res) => {
    res.json(
      await getDoctorBookings()
    );
  })
);

app.post(
  "/api/doctor-bookings",
  route(async (req, res) => {
    const booking =
      await createDoctorBooking(
        req.body || {}
      );

    res.status(201).json(booking);
  })
);

/* Orders */

app.get(
  "/api/orders",
  route(async (req, res) => {
    const orders =
      await getOrders();

    res.json(orders);
  })
);

app.get(
  "/api/orders/:id",
  route(async (req, res) => {
    const order =
      await getOrderById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  })
);

app.post(
  "/api/orders",
  route(async (req, res) => {
    /*
      User যেন body থেকে নিজের order ID
      দিতে না পারে, তাই id বাদ দিচ্ছি।
    */
    const {
      id: ignoredId,
      ...orderPayload
    } = req.body || {};

    const order =
      await createOrder(
        orderPayload
      );

    res.status(201).json(order);
  })
);

/* Prescriptions */

app.get(
  "/api/prescriptions",
  route(async (req, res) => {
    res.json(
      await getPrescriptions()
    );
  })
);

app.post(
  "/api/prescriptions",
  upload.single("prescription"),
  route(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Please attach a JPG, PNG, WEBP or PDF under 5 MB",
      });
    }

    const prescription =
      await createPrescription({
        originalName:
          req.file.originalname,

        fileName:
          req.file.filename,

        fileUrl:
          `/uploads/${req.file.filename}`,

        mimeType:
          req.file.mimetype,

        patientName:
          req.body.patientName || "",

        phone:
          req.body.phone || "",
      });

    res
      .status(201)
      .json(prescription);
  })
);

/* Admin dashboard */

app.get(
  "/api/admin/metrics",
  route(async (req, res) => {
    const store =
      await getStoreSnapshot();

    const revenue =
      store.orders.reduce(
        (total, order) =>
          total +
          Number(order.total || 0),
        0
      );

    res.json({
      revenue:
        revenue + 483250,

      orders:
        store.orders.length + 1280,

      customers:
        store.users.length + 8940,

      prescriptions:
        store.prescriptions.length +
        176,

      pendingSupport:
        store.supportTickets.filter(
          (ticket) =>
            ticket.status === "Open"
        ).length,

      labBookings:
        store.labBookings.length,

      doctorBookings:
        store.doctorBookings.length,

      lowStock:
        products.filter(
          (product) =>
            product.stock < 20
        ).length,

      recentOrders:
        store.orders.slice(0, 5),

      supportTickets:
        store.supportTickets.slice(
          0,
          5
        ),
    });
  })
);

app.get(
  "/api/admin/orders",
  route(async (req, res) => {
    res.json(
      await getOrders()
    );
  })
);

app.get(
  "/api/admin/products",
  (req, res) => {
    res.json(products);
  }
);

app.get(
  "/api/admin/prescriptions",
  route(async (req, res) => {
    res.json(
      await getPrescriptions()
    );
  })
);

app.get(
  "/api/admin/lab-bookings",
  route(async (req, res) => {
    res.json(
      await getLabBookings()
    );
  })
);

app.get(
  "/api/admin/doctor-bookings",
  route(async (req, res) => {
    res.json(
      await getDoctorBookings()
    );
  })
);

app.get(
  "/api/admin/support-tickets",
  route(async (req, res) => {
    res.json(
      await getSupportTickets()
    );
  })
);

app.patch(
  "/api/admin/orders/:id",
  route(async (req, res) => {
    const allowedStatuses = [
      "Order confirmed",
      "Pharmacist reviewed",
      "Packed",
      "Out for delivery",
      "Delivered",
      "Cancelled",
    ];

    const status = String(
      req.body.status || ""
    );

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }

    const updatedOrder =
      await updateOrderStatus(
        req.params.id,
        status
      );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(updatedOrder);
  })
);

/* Error handler */

app.use(
  (error, req, res, next) => {
    console.error(error);

    if (
      error?.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        message:
          "File must be under 5 MB",
      });
    }

    if (
      error?.message?.includes(
        "Only JPG, PNG, WEBP and PDF"
      )
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error?.message?.startsWith(
        "CORS blocked origin"
      )
    ) {
      return res.status(403).json({
        message:
          "This frontend origin is not allowed.",
      });
    }

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
);

export default app;