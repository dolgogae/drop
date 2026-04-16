# Android Emulator Localhost Troubleshooting

## Symptom

Frontend shows a server connection failure while using the Android emulator, even though the backend is running on `localhost:8080`.

## Cause

Inside the Android emulator, `localhost` points to the emulator itself, not the host machine.

In this project, the app was using:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

That only works if port forwarding is set up from the emulator to the host.

## Fix

Run:

```bash
adb reverse tcp:8080 tcp:8080
```

Then confirm:

```bash
adb reverse --list
```

You should see:

```bash
tcp:8080 tcp:8080
```

## Why this fixed it

`adb reverse` forwards the emulator's `localhost:8080` to the host machine's `localhost:8080`, so the app can reach the backend running on your machine.

## When to do this again

If the emulator, adb session, or app environment is restarted, the reverse mapping may disappear. If server connection errors come back, run the same `adb reverse` command again.
