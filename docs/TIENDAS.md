# Cómo llevar el juego a tiendas

El juego es HTML5 + JavaScript sin dependencias, así que se puede empaquetar para cada tienda sin reescribirlo.

| Plataforma | Herramienta recomendada | Coste de la cuenta |
|---|---|---|
| Android (Google Play) | **Capacitor** (o TWA con Bubblewrap, a partir de la PWA) | 25 USD, pago único |
| iOS (App Store) | **Capacitor** (requiere un Mac con Xcode) | 99 USD/año (Apple Developer Program) |
| PC (Steam / itch.io) | **Electron** o **Tauri** | Steam: 100 USD por juego · itch.io: gratis |
| Web | GitHub Pages / itch.io (HTML5) | Gratis |

## itch.io (gratis, recomendado para empezar)

Cada compilación publica en *Releases → escritorio* dos archivos listos para itch.io:
`MarDeRecompensas-Web.zip` (se juega en el navegador) y `MarDeRecompensas-Windows.zip` (descarga para PC).

1. Crea una cuenta en https://itch.io y entra en **Dashboard → Create new project**.
2. Rellena **Title** (Mar de Recompensas), **Project URL** y una descripción corta.
3. **Kind of project: HTML**.
4. **Uploads → Upload files**: sube `MarDeRecompensas-Web.zip` y marca **"This file will be played in the browser"**.
   Sube también `MarDeRecompensas-Windows.zip` y márcalo como **Windows**.
5. **Embed options**: tamaño **1280 × 720**, activa **Mobile friendly** (orientación horizontal o vertical)
   y **Fullscreen button**. Desactiva "Automatically start on page load" si quieres un botón de "Run game".
6. **Pricing**: *No payments* (gratis) o *Donations*.
7. Añade capturas (3–5), imagen de portada (630 × 500), género *Action*, etiquetas
   (survivors, roguelite, pirates, bullet-heaven, pixel…).
8. **Visibility**: primero *Draft* para probarlo; cuando funcione, *Public*.

Para subir versiones nuevas: descarga de nuevo los `.zip` de *Releases → escritorio* y súbelos
reemplazando los anteriores (o automatízalo con `butler` y una API key de itch.io guardada como secreto
del repositorio).

## 1. Capacitor (Android e iOS con el mismo código)

```bash
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Mar de Recompensas" com.tunombre.mardesrecompensas --web-dir www
# copiar el juego a www/ (index.html, js/, sprites/, icons/, manifest.webmanifest)
npx cap add android
npx cap add ios          # solo en Mac
npx cap sync
npx cap open android     # abre Android Studio → Build → Generate Signed Bundle (.aab)
npx cap open ios         # abre Xcode → Product → Archive
```

Ajustes recomendados antes de publicar:

- **Fuentes sin internet:** descargar *Pirata One* y *Nunito* (licencia OFL) y servirlas desde `www/fonts/` en lugar de Google Fonts.
- **Pantalla:** bloquear orientación (horizontal o vertical) y ocultar la barra de estado (`@capacitor/status-bar`).
- **Guardado:** `localStorage` funciona dentro de Capacitor; para más seguridad, `@capacitor/preferences`.
- **Pausa:** el juego ya se pausa al perder el foco (llamadas, cambiar de app).
- **Iconos y splash:** `npx @capacitor/assets generate` a partir de un icono de 1024×1024.

## 2. Requisitos de las tiendas

- **Derechos sobre todo el contenido** (personajes, nombres, imágenes, música). Apple y Google retiran apps que usan personajes o marcas de terceros sin licencia, aunque sean gratis.
- Política de privacidad (una página web sencilla basta si el juego no recoge datos).
- Clasificación por edades (cuestionario IARC en Google Play, cuestionario en App Store Connect).
- Capturas de pantalla, descripción, icono 512×512 (Play) / 1024×1024 (App Store).
- Probar en dispositivos reales (rendimiento con muchos enemigos y control táctil).

## 3. Opciones para monetizar (opcional)

- Pago único en la tienda.
- Anuncios recompensados (por ejemplo, revivir o duplicar Berries) con AdMob (`@capacitor-community/admob`).
- Compras dentro de la app (piratas o aspectos cosméticos).
