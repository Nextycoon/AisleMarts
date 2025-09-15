# AisleMarts — AI for Shopping
Smarter. Faster. Everywhere.

**Drop-in package** to realign the app to AI-first.

## Files
- `src/theme/theme.ts` — brand tokens
- `src/screens/Splash.tsx` — identity splash
- `src/screens/AvatarHome.tsx` — AI-first home (multimodal)
- `src/cards/CompareCard.tsx`, `src/cards/ConnectStoreCard.tsx` — SmartCards
- `api/openapi.yaml` — backend contracts
- `i18n/*.json` — EN/AR/TR/SW seeds
- `mocks/ai_intents.json` — sample response
- `tests/ai_cards.test.ts` — unit test skeleton

## Wire-in (Expo)
1. Add `Splash.tsx` as your initial route.
2. Set `AvatarHome` as the default tab.
3. Implement `POST /ai/intents` & render SmartCards by type.
4. Load `i18n/en.json` (and others) at app init based on `GET /localize/bootstrap`.

Generated: 2025-09-15T01:50:43.807465Z
