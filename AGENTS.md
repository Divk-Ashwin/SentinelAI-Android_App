# Architecture rules
- No login gate: app is fully usable local-first; phone OTP (`phone-otp` edge fn via Twilio Verify + magic-link token_hash) is only for opt-in online backup at `/backup` — SMS costs money and reading SMS needs no account.
- ChatContext actions are useCallback-stable and value is memoized — unstable functions previously caused effect render loops.
- App shell is a fixed `100dvh` flex column; pages use `h-full` and scroll internally so bottom nav/FAB never scroll away.
- Blocked numbers and starred conversations sync to Cloud via `useCloudSync`; messages themselves stay on-device.
