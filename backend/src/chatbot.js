import { products, labTests, doctors, policies } from "./data.js";
import {
  getOrderById,
  createSupportTicketRecord,
} from "./storage.js";

const urgentPatterns = [
  /chest pain|বুকে ব্যথা|বুকের ব্যথা|buk(e|er)? betha/i,
  /can't breathe|cannot breathe|difficulty breathing|শ্বাসকষ্ট|শ্বাস কষ্ট|shash kosto/i,
  /unconscious|অজ্ঞান|oggan/i,
  /severe bleeding|heavy bleeding|রক্তপাত|rokto.*pat/i,
  /suicid|আত্মহত্যা|নিজেকে মেরে/i,
  /stroke|মুখ বেঁকে|এক পাশ অবশ/i,
];

const helloPattern = /^(hi|hello|hey|হাই|হ্যালো|সালাম|assalamu|আসসালামু)/i;
const handoffPattern = /\b(human|agent|representative|live support|customer care)\b|মানুষের সাথে|মানুষের সঙ্গে|কাস্টমার কেয়ার|হিউম্যান সাপোর্ট/i;
const orderIdPattern = /\bAC-\d{4,8}\b/i;
const orderIntentPattern = /(?:order|অর্ডার|ordar|odar).*(?:where|status|track|kothay|koi|kobe|কোথায়|কোথায়|স্ট্যাটাস|অবস্থা|কবে)|(?:where|status|track|kothay|koi|kobe|কোথায়|কোথায়|স্ট্যাটাস|অবস্থা|কবে).*(?:order|অর্ডার|ordar|odar)|delivery.*(?:kobe|কবে|where|কোথায়|কোথায়)/i;
const siteGuidePattern = /how.*(?:use|order)|how to use|website.*guide|new customer|সহজ.*(?:ধাপ|নিয়ম)|কিভাবে.*(?:ব্যবহার|অর্ডার)|কীভাবে.*(?:ব্যবহার|অর্ডার)|kivabe.*(?:use|order)|ki bhabe.*(?:use|order)|simple guideline|easy.*use|use korte pare/i;

function normalize(value = "") {
  return String(value).toLowerCase().replace(/[.,!?;:()[\]{}'"`~@#$%^&*_+=<>/\\|-]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenize(value = "") {
  return normalize(value).split(" ").filter((token) => token.length >= 2);
}
function languageHint(message) {
  if (/[\u0980-\u09FF]/.test(message)) return "Bangla";
  if (/\b(ami|amar|amr|kobe|kothay|koi|lagbe|chai|ase|ache|ki|kivabe|keno|dao|parbo)\b/i.test(message)) return "Banglish";
  return "English";
}
async function findOrder(message) {
  const id = message
    .match(orderIdPattern)?.[0]
    ?.toUpperCase();

  return id ? getOrderById(id) : null;
}
function findProduct(message) {
  const normalizedMessage = normalize(message);
  const messageTokens = new Set(tokenize(message));
  let best = null;
  let bestScore = 0;

  for (const product of products) {
    const name = normalize(product.name);
    const generic = normalize(product.generic);
    const brand = normalize(product.brand);
    let score = 0;

    if (name.length >= 4 && normalizedMessage.includes(name)) score += 12;
    if (generic.length >= 5 && normalizedMessage.includes(generic)) score += 10;

    const meaningfulTokens = [...new Set([...tokenize(product.name), ...tokenize(product.generic)])]
      .filter((token) => token.length >= 3 && !["tablet", "capsule", "cream", "device", "softgel", "syrup", "lotion"].includes(token));
    score += meaningfulTokens.filter((token) => messageTokens.has(token)).length * 3;

    // "AroCare" is the site name. It must not accidentally select AroCare-branded products.
    if (brand && brand !== "arocare" && brand.length >= 4 && normalizedMessage.includes(brand)) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }
  return bestScore >= 5 ? best : null;
}

function productPayload(product) {
  return {
    id: product.id,
    name: product.name,
    generic: product.generic,
    image: product.image,
    price: product.price,
    oldPrice: product.oldPrice,
    unit: product.unit,
    stock: product.stock,
    rx: product.rx,
  };
}

async function localReply(message) {
  const order = await findOrder(message);

  if (order) {
    return { reply: `আপনার Order ${order.id} বর্তমানে “${order.status}” অবস্থায় আছে। আনুমানিক delivery: ${order.eta}।`, orderId: order.id };
  }
  if (orderIdPattern.test(message) && !order) {
    return { reply: "এই order ID পাওয়া যায়নি। ID আবার মিলিয়ে লিখুন—যেমন AC-1042।" };
  }
  if (orderIntentPattern.test(message)) {
    return { reply: "আপনার order-এর সঠিক status দেখতে order ID প্রয়োজন। অনুগ্রহ করে AC-1042-এর মতো ID লিখুন, অথবা Track Order page-এ ID দিন।" };
  }
  if (siteGuidePattern.test(message)) {
    return {
      reply: "AroCare সহজে ব্যবহার করার নিয়ম:\n1) Search bar-এ medicine বা product-এর নাম লিখুন।\n2) Product খুলে price, stock ও prescription requirement দেখুন।\n3) Add to Cart চাপুন।\n4) Prescription-required হলে prescription upload করুন।\n5) Checkout-এ ঠিকানা ও payment method দিয়ে order confirm করুন।\n6) Track Order page-এ order ID দিয়ে status দেখুন।",
    };
  }

  if (!findProduct(message) && /arocare.*(?:ki|কি|what|about|সম্পর্কে)|(?:what|কি).*arocare/i.test(message)) {
    return { reply: "AroCare একটি demo online pharmacy ও healthcare website। এখানে medicine ও health product দেখা, cart ও checkout, prescription upload, order tracking, lab-test booking, doctor appointment, refill এবং customer support ব্যবহার করা যায়।" };
  }

  if (/delivery charge|delivery fee|ডেলিভারি চার্জ|delivery charge koto|free delivery/i.test(message)) return { reply: policies.delivery };
  if (/prescription|প্রেসক্রিপশন|presciption|upload rx|rx upload/i.test(message)) return { reply: policies.prescription };
  if (/return|refund|cancel|রিটার্ন|রিফান্ড|বাতিল/i.test(message)) return { reply: policies.return };
  if (/payment|bkash|nagad|card|পেমেন্ট|cash on delivery|cod/i.test(message)) return { reply: policies.payment };
  if (/lab|test|রক্ত পরীক্ষা|ল্যাব/i.test(message)) return { reply: `AroCare-এ ${labTests.length}টি demo test/package আছে। Lab Tests page থেকে test, date, time ও address দিয়ে home sample collection book করা যাবে।` };
  if (/doctor|consult|ডাক্তার|consultation/i.test(message)) return { reply: `Doctor Consultation page-এ ${doctors.length} জন demo specialist-এর fee ও slot দেখা যাবে। Booking submit করলে appointment ID তৈরি হবে। জরুরি অবস্থায় online slot-এর জন্য অপেক্ষা করবেন না।` };
  if (/refill|reorder|আবার অর্ডার|পুনরায়/i.test(message)) return { reply: "Account → Orders থেকে Refill/Reorder চাপলে আগের order-এর items cart-এ যোগ হবে।" };
  if (/medical record|record|report|রিপোর্ট|medical file/i.test(message)) return { reply: "Account → Medical Records-এ report বা prescription-এর নাম ও date save করা যায়।" };
  if (/wallet|arocash|reward|point/i.test(message)) return { reply: "Demo AroCash balance Account page-এ দেখা যায়।" };
  if (/refer|referral|invite|বন্ধু/i.test(message)) return { reply: "Account page থেকে referral code copy করা যাবে। Demo code: AROCARE50।" };

  const product = findProduct(message);
  if (product) {
    if (/price|দাম|koto|কত/i.test(message)) {
      return { reply: `${product.name}-এর বর্তমান demo price ৳${product.price}; আগের মূল্য ৳${product.oldPrice}। ${product.stock > 0 ? `${product.stock}টি stock দেখাচ্ছে।` : "বর্তমানে out of stock।"}`, product: productPayload(product) };
    }
    if (/prescription|rx|প্রেসক্রিপশন|lagbe/i.test(message)) {
      return { reply: product.rx ? `${product.name} prescription-required। Checkout-এর আগে prescription upload করে pharmacist review সম্পন্ন করতে হবে।` : `${product.name}-এর জন্য catalogue-এ prescription required দেখানো হয়নি। ব্যবহার নিয়ে সন্দেহ থাকলে pharmacist বা doctor-এর পরামর্শ নিন।`, product: productPayload(product) };
    }
    return { reply: `${product.name} (${product.generic}) — ${product.description} Demo price ৳${product.price}, pack: ${product.unit}, rating ${product.rating}/5। ${product.rx ? "এটি prescription-required।" : "Label অনুযায়ী ব্যবহার করুন।"}`, product: productPayload(product) };
  }

  if (helloPattern.test(message)) {
    return { reply: "স্বাগতম AroCare-এ! Product, order, prescription, delivery, payment, return, lab test, doctor booking, refill বা account নিয়ে বাংলা, English বা Banglish-এ প্রশ্ন করুন।" };
  }
  return null;
}

let modelCache = { key: "", at: 0, models: [] };

async function availableGeminiModels(apiKey) {
  if (modelCache.key === apiKey && Date.now() - modelCache.at < 10 * 60 * 1000 && modelCache.models.length) return modelCache.models;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100", {
    headers: { "x-goog-api-key": apiKey },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini model list ${response.status}: ${body.slice(0, 220)}`);
  }

  const data = await response.json();
  const models = (data.models || [])
    .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
    .map((model) => String(model.name || "").replace(/^models\//, ""))
    .filter((name) => name.includes("gemini"))
    .filter((name) => !/(image|vision|tts|audio|live|embedding|aqa)/i.test(name));

  modelCache = { key: apiKey, at: Date.now(), models };
  return models;
}

function rankModels(available, preferredModel = "") {
  const preferred = String(preferredModel).split(",").map((item) => item.trim().replace(/^models\//, "")).filter(Boolean);
  const score = (name) => {
    let value = 0;
    if (preferred.includes(name)) value += 1000;
    if (/flash/i.test(name)) value += 200;
    if (/3\.5|3-|3\./i.test(name)) value += 80;
    if (/2\.5/i.test(name)) value += 60;
    if (/preview/i.test(name)) value += 10;
    if (/lite/i.test(name)) value -= 5;
    return value;
  };
  return [...new Set([...preferred.filter((name) => available.includes(name)), ...available])]
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8);
}

async function geminiReply(message, history, apiKey, preferredModel) {
  const catalogue = products.map((p) => `${p.name}|${p.generic}|৳${p.price}|${p.stock > 0 ? "in stock" : "out"}|${p.rx ? "Rx" : "OTC"}`).join("\n");
  const serviceContext = `POLICIES
Delivery: ${policies.delivery}
Prescription: ${policies.prescription}
Return: ${policies.return}
Payment: ${policies.payment}
PRODUCTS
${catalogue}
LABS
${labTests.map((x) => `${x.name}|৳${x.price}|${x.report}`).join("\n")}
DOCTORS
${doctors.map((x) => `${x.name}|${x.specialty}|৳${x.fee}|${x.availability}`).join("\n")}`;

  const contents = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((item) => item && item.text)
    .map((item) => ({ role: item.role === "bot" ? "model" : "user", parts: [{ text: String(item.text) }] }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const available = await availableGeminiModels(apiKey);
  const models = rankModels(available, preferredModel);
  if (!models.length) throw new Error("No compatible Gemini text model is available for this API key.");

  let lastError = "Gemini request failed";
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `You are AroCare Support for a Bangladesh online pharmacy and healthcare website. Reply in the language and script used by the customer: Bangla, English, or natural Banglish. Be warm, concise, and practical. Answer website and service questions using only the supplied AroCare context. Never invent product prices, stock, order status, policies, diagnosis, dosage, or prescriptions. Never assume an order ID; when an order-specific question has no ID, ask for an ID like AC-1042. Do not recommend human support unless the user explicitly asks for a person or the issue genuinely requires private account access. For general website-use questions, give clear numbered steps. For emergency symptoms, tell the user to seek immediate local emergency or hospital help. Prices are in Bangladeshi taka.

AroCare context:
${serviceContext}`,
          }],
        },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
      if (text) return { text, model };
      lastError = `${model} returned an empty response`;
      continue;
    }

    const body = await response.text();
    lastError = `Gemini ${model} ${response.status}: ${body.slice(0, 220)}`;
    if (![400, 404].includes(response.status)) break;
  }
  throw new Error(lastError);
}

export async function getGeminiStatus(config = {}) {
  if (!config.apiKey) return { configured: false, ready: false, mode: "local", message: "GEMINI_API_KEY is not configured." };
  try {
    const available = await availableGeminiModels(config.apiKey);
    const ranked = rankModels(available, config.model);
    return {
      configured: true,
      ready: ranked.length > 0,
      mode: ranked.length ? "gemini" : "local",
      model: ranked[0] || null,
      availableModels: ranked.slice(0, 5),
      message: ranked.length ? "Gemini API is ready." : "No compatible text model was found.",
    };
  } catch (error) {
    return { configured: true, ready: false, mode: "local", message: error.message.slice(0, 240) };
  }
}

export async function getChatReply({ message, history = [] }, config = {}) {
  if (urgentPatterns.some((pattern) => pattern.test(message))) {
    return { reply: "আপনার কথায় জরুরি লক্ষণের সম্ভাবনা আছে। Chatbot-এর উপর নির্ভর না করে এখনই স্থানীয় জরুরি সেবা বা নিকটস্থ হাসপাতালের সাহায্য নিন।", urgent: true, handoff: false, source: "safety" };
  }
  if (handoffPattern.test(message)) {
    return { reply: "Human support request পাঠাতে নিচের ‘Talk to human agent’ বাটনে চাপুন এবং নাম ও phone number দিন।", handoff: true, source: "local" };
  }

  const deterministic = await localReply(message);
  if (deterministic) return { ...deterministic, source: "local", language: languageHint(message) };

  if (config.apiKey) {
    try {
      const result = await geminiReply(message, history, config.apiKey, config.model);
      return { reply: result.text, source: "gemini", model: result.model, language: languageHint(message) };
    } catch (error) {
      console.error(`[Gemini] ${error.message}`);
    }
  }

  const language = languageHint(message);
  const reply = language === "English"
    ? "I could not use the AI service for this question. Please rephrase it with a little more detail. I can still help with products, orders, prescriptions, delivery, payments, returns, lab tests, doctor bookings, refills, and accounts."
    : language === "Banglish"
      ? "AI service ei question-er answer dite pareni. Ektu detail diye abar likhun. Product, order, prescription, delivery, payment, return, lab, doctor, refill ba account niye ami help korte parbo."
      : "AI service এই প্রশ্নের উত্তর দিতে পারেনি। একটু বিস্তারিতভাবে আবার লিখুন। Product, order, prescription, delivery, payment, return, lab, doctor, refill বা account বিষয়ে আমি সাহায্য করতে পারি।";
  return { reply, handoff: false, source: "fallback", language };
}

export async function createSupportTicket(payload) {
  return createSupportTicketRecord(payload);
}
