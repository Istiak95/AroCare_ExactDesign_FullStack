import assert from "node:assert/strict";
import { getChatReply } from "../backend/src/chatbot.js";

const guide = await getChatReply({ message: "amar ma jeno easily AroCare use korte pare, simple guideline dao", history: [] }, {});
assert.equal(guide.source, "local");
assert.equal(Boolean(guide.handoff), false);
assert.match(guide.reply, /Search bar|সহজে ব্যবহার/);
assert.doesNotMatch(guide.reply, /Vitamin C/);

const mixedOrder = await getChatReply({ message: "আমার order কোথায়?", history: [] }, {});
assert.equal(mixedOrder.source, "local");
assert.equal(Boolean(mixedOrder.handoff), false);
assert.match(mixedOrder.reply, /order ID প্রয়োজন/);
assert.doesNotMatch(mixedOrder.reply, /Out for delivery/);

const knownOrder = await getChatReply({ message: "AC-1042 কোথায়?", history: [] }, {});
assert.match(knownOrder.reply, /AC-1042/);
assert.match(knownOrder.reply, /Out for delivery/);

const product = await getChatReply({ message: "Vitamin C 500 er dam koto?", history: [] }, {});
assert.equal(product.product?.name, "Vitamin C 500");
assert.equal(product.product?.image, "/products/p4.png");
assert.match(product.reply, /৳180/);

const unknown = await getChatReply({ message: "completely unrelated open-ended prompt", history: [] }, {});
assert.equal(Boolean(unknown.handoff), false);

const human = await getChatReply({ message: "Human agent chai", history: [] }, {});
assert.equal(human.handoff, true);

console.log("Chatbot routing tests passed.");
