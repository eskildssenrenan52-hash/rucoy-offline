# Rucoy Offline - Vite + React + Capacitor

App SPA pronto para gerar APK Android via Android Studio.

## Rodar no navegador
```bash
npm install
npm run dev
```

## Build web
```bash
npm run build
# gera ./dist com index.html
```

## Android Studio (gerar APK)
Pré-requisitos: Android Studio + JDK 17.

```bash
npm install
npm run build              # gera dist/
npx cap add android        # primeira vez apenas
npx cap sync android
npx cap open android       # abre o Android Studio
```

Dentro do Android Studio: Build > Build Bundle(s) / APK(s) > Build APK.
