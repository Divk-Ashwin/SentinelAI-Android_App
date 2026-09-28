# Architecture rules
- Phone login: `phone-otp` edge function uses Twilio Verify via connector gateway, then issues a magic-link token_hash the client exchanges with `verifyOtp` — avoids needing SMS config in auth settings.
- ChatContext actions are useCallback-stable and value is memoized — unstable functions previously caused effect render loops.
- App shell is a fixed `100dvh` flex column; pages use `h-full` and scroll internally so bottom nav/FAB never scroll away.
- Blocked numbers and starred conversations sync to Cloud via `useCloudSync`; messages themselves stay on-device.
