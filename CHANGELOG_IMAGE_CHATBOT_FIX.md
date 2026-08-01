# Image and chatbot fix

## Product images
- Added 18 unique local PNG product images.
- Added a placeholder image and `onError` fallback.
- Updated homepage categories, shop banner, product cards, cart/order data and product detail views from SVG to PNG.
- Added product image cards inside relevant chatbot answers.

## Chatbot
- Fixed accidental matching of the word `AroCare` to Vitamin C/Omega-3 products.
- Fixed mixed Bangla/English order intent detection.
- Prevented Gemini from guessing an order status without an explicit order ID.
- Human support now opens only after an explicit human-agent request.
- Added API/model status in the chat window.
- Added dynamic Gemini model discovery and model/source labels.
- Added local, useful answers when Gemini is unavailable instead of forcing handoff.

## Verification
Run:

```powershell
npm run verify
```
