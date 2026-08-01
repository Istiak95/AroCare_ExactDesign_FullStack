# AroCare validation report — image and chatbot repair

Validation performed before packaging:

## Product images

- Replaced generic SVG placeholders with 18 local PNG product packshots.
- Confirmed every product record points to an existing PNG file.
- Added `/products/placeholder.png` as an automatic image fallback.
- Added image fallback handling to product cards, category cards and product-detail gallery.
- Added a product preview card inside chatbot replies for recognised products.
- `npm run check:assets` passed for all 18 products.

## Chatbot routing

- A message containing only the website name `AroCare` no longer matches AroCare-branded Vitamin C or Omega-3 products.
- Mixed Bangla/English order questions such as `আমার order কোথায়?` now request an order ID instead of inventing a status.
- Exact IDs such as `AC-1042` still return the matching demo order.
- General site-use questions return clear steps instead of irrelevant product information.
- Unknown questions no longer open human support automatically.
- Human support opens only when the customer explicitly asks for a human/agent or presses the Human agent button.
- Product questions return structured product data so the chat can display an image, pack size and price.
- `npm run test:chatbot` passed.

## Gemini integration

- Added `/api/chat/status` for frontend connection status.
- Added Gemini model discovery through the API models endpoint.
- The backend selects an available text `generateContent` model, preferring the configured Flash model.
- The chatbot displays whether an answer came from Gemini, verified local rules, safety rules or fallback mode.
- Gemini failure no longer forces a human-support form.

## Syntax checks

- `node --check backend/src/server.js` passed.
- `node --check backend/src/chatbot.js` passed.
- `node --check backend/src/data.js` passed.
- `node --check backend/src/storage.js` passed.
- `npm run verify` passed.

The packaging environment could not download public npm dependencies from its configured registry, so a complete Vite build was not run here. `setup.bat` runs installation and the frontend build check on the user's computer.
