# Apertura 2026 — Simulador Liga MX

Manual de funcionamiento, mantenimiento y entrega a otro editor o asistente.

Este proyecto es un sitio estático hecho con HTML, CSS y JavaScript. Puedes editar sus archivos en tu computadora y publicarlos en un alojamiento estático. **La aplicación no necesita créditos de IA, una API de pago, claves, una base de datos ni una instalación de dependencias para funcionar.** El editor o servicio que elijas para modificarla puede tener sus propias condiciones.

La identidad personal utilizada en la aplicación es **@theFamousJL**. Es un simulador independiente, no un producto oficial de la Liga MX.

## 1. Empezar a modificarla

1. Descomprime el ZIP en una carpeta.
2. Abre esa carpeta completa en tu editor de código.
3. Guarda una copia antes de hacer cambios.
4. Edita los archivos según el mapa de la sección siguiente.
5. Abre una vista previa con un servidor local.
6. Comprueba la página, los escenarios, WhatIF y las exportaciones.
7. Sube los archivos actualizados al mismo repositorio o alojamiento.

No hay un paso de compilación, `npm install` ni un proyecto de React que instalar. El código fuente que editas es el mismo que se publica.

### Vista previa local

Si ya tienes Python disponible, abre una terminal **dentro de la carpeta que contiene `index.html`** y ejecuta:

```sh
python3 -m http.server 8765
```

En Windows, si corresponde a tu instalación:

```sh
py -m http.server 8765
```

Después abre `http://localhost:8765/`. Para detener el servidor pulsa Ctrl+C en la terminal.

También puedes usar un servidor de vista previa integrado en tu editor. Si el puerto 8765 está ocupado, utiliza otro, por ejemplo 8766.

Abrir `index.html` directamente permite consultar el simulador, pero algunos navegadores restringen el almacenamiento o la exportación de imágenes bajo `file://`. Para probar todo, utiliza HTTP local o la web publicada.

## 2. Mapa de archivos

| Archivo | Responsabilidad | Modificar cuando quieras… |
| --- | --- | --- |
| `index.html` | Estructura de la pantalla, textos, botones, diálogos y carga de scripts | Cambiar títulos, ejemplos, etiquetas o agregar controles |
| `style.css` | Colores, tamaños, distribución, adaptación móvil y focos parpadeantes | Cambiar el aspecto del portal |
| `data.js` | Datos que carga realmente el navegador: `window.DATA` | Actualizar la información deportiva que usa la app |
| `data.json` | Copia legible de los mismos datos | Revisar, transformar o mantener los datos sin editar JavaScript |
| `engine.js` | Función de cálculo y desempates `calculate()` | Cambiar cómo se calcula la tabla |
| `app.js` | Estado del simulador, jornadas, marcadores, tabla, WhatIF y guardado | Cambiar la interacción de la página |
| `scenarios.js` | Cuatro combinaciones precalculadas: `window.SCENARIOS` | Cambiar las opciones de clasificación de Tigres |
| `share.js` | Compartir PNG, JSON y enlaces; nombre y atribución | Cambiar exportaciones, cintilla o formato de enlaces |
| `fuentes.html` | Procedencia, fecha de corte y explicación de los datos | Actualizar fuentes o límites de la simulación |
| `assets/avatar.png` | Avatar de @theFamousJL | Cambiar el icono del encabezado y de las imágenes exportadas |
| `assets/ID.png` | Escudo del club identificado por ese número | Reemplazar un escudo |
| `.nojekyll` | Archivo vacío para la publicación estática en GitHub Pages | Normalmente no se modifica |
| `README.md` | Este manual | Documentar cambios futuros |

Los archivos `.DS_Store`, si aparecen en tu computadora, son metadatos de macOS; no forman parte de la aplicación.

### Orden de carga

Los scripts se cargan con `defer`, en este orden:

```text
data.js → scenarios.js → engine.js → app.js → share.js
```

El orden importa. `app.js` necesita `DATA`, `SCENARIOS` y `calculate`. `share.js` utiliza variables y funciones declaradas en `app.js`.

No son módulos ES ni componentes independientes. Si conviertes los scripts a `type="module"`, tendrás que crear las importaciones y exportaciones correspondientes. No basta con cambiar el atributo del HTML.

Los sufijos como `?v=7` en las rutas de CSS y JavaScript sirven para renovar la caché. El archivo real sigue llamándose `style.css` o `app.js`. Aumenta ese número al publicar cambios si el navegador sigue mostrando una versión anterior.

## 3. Alcance de los datos

La versión entregada contiene una **fotografía fija al 22 de octubre de 2026** del Apertura 2026:

- 18 clubes.
- 153 partidos de fase regular.
- 115 partidos disputados al corte.
- 38 partidos por simular: 36 de las jornadas 14–17 y dos pendientes de la jornada 7.
- América–Tijuana: 28/10/2026.
- Querétaro–Monterrey: 14/11/2026.

**No hay actualización automática, scraping en el navegador ni conexión en vivo con LigaMX.net.** Cambiar la fecha del pie de página no actualiza la tabla ni los resultados.

La fuente deportiva utilizada durante la preparación fue exclusivamente LigaMX.net y sus recursos oficiales. Los enlaces están en `fuentes.html`. Los escudos se incluyeron como archivos locales. El avatar es un recurso proporcionado por el propietario.

Los horarios se conservan como se obtuvieron del listado oficial; la app no convierte zonas horarias. La función `dateText()` utiliza UTC para formatear el día sin que se desplace por la zona del dispositivo.

## 4. Modelo de datos

### Objeto principal

```js
window.DATA = {
  cutoff: '22 oct 2026',
  teams: [/* clubes */],
  fixtures: [/* partidos */]
};
```

### Club

Ejemplo real del archivo incluido:

```json
{
  "id": 1,
  "name": "América",
  "rank": 1,
  "pj": 12,
  "pg": 8,
  "pe": 3,
  "pp": 1,
  "gf": 32,
  "gc": 16,
  "pts": 27,
  "awayGF": 21
}
```

| Campo | Significado |
| --- | --- |
| `id` | Identificador del club; también identifica su escudo |
| `name` | Nombre del club en los datos |
| `rank` | Posición oficial de partida |
| `pj`, `pg`, `pe`, `pp` | Partidos jugados, ganados, empatados y perdidos |
| `gf`, `gc` | Goles a favor y en contra |
| `pts` | Puntos oficiales de partida |
| `awayGF` | Goles a favor como visitante |

Los nombres cortos mostrados en pantalla están en el objeto `short` de `app.js`; cambiar solo `name` en los datos no cambia esos rótulos.

### Partido

Ejemplo real de un partido disputado:

```json
{
  "id": 154958,
  "round": 1,
  "home": 29,
  "away": 14257,
  "hg": 2,
  "ag": 1,
  "date": "16/7/2026",
  "time": "19:00",
  "status": "Marcador Final"
}
```

- `home` y `away` contienen IDs de clubes.
- `hg` y `ag` contienen goles local y visitante.
- Un partido pendiente tiene **ambos goles en `null`**.
- Un 0–0 es un resultado completo, no un partido pendiente.
- La app distingue pendientes mediante `hg === null`, no mediante el texto `status`.
- `date` debe usar día/mes/año; `time`, un texto de hora compatible con el orden del listado.
- Los IDs de partidos deben ser únicos y mantenerse estables para no romper simulaciones compartidas.

### IDs de los clubes incluidos

| ID | Club | ID | Club |
| --- | --- | --- | --- |
| 1 | América | 7 | Guadalajara |
| 12566 | Cruz Azul | 17 | Toluca |
| 9 | León | 10445 | Atlas |
| 14 | Monterrey | 13668 | Querétaro |
| 14102 | Santos | 5 | Tijuana |
| 18 | Pumas | 11220 | San Luis |
| 11550 | Puebla | 16 | Tigres |
| 14257 | Atlante | 11 | Pachuca |
| 29 | Necaxa | 11790 | FC Juárez |

### Mantener sincronizados `data.json` y `data.js`

**La página no lee `data.json`: carga `data.js`.** Si editas el JSON, regenera el JavaScript desde la carpeta del proyecto:

```sh
python3 - <<'PY'
import json
from pathlib import Path
p = Path('.')
data = json.loads((p / 'data.json').read_text(encoding='utf-8'))
(p / 'data.js').write_text(
    'window.DATA=' + json.dumps(data, ensure_ascii=False) + ';',
    encoding='utf-8'
)
PY
```

No agregues comentarios ni comas finales a `data.json`, porque dejaría de ser JSON válido.

## 5. Estado de la simulación

Las variables principales de `app.js` son:

| Variable | Contenido |
| --- | --- |
| `pending` | Partidos con `hg === null`, derivados al cargar el archivo |
| `scores` | Diccionario de marcadores simulados por ID de partido |
| `round` | Jornada visible: número o la cadena `'pending'` |
| `active` | Índice de escenario seleccionado; `-1` si no hay uno activo |
| `whatif` | Booleano que permite aplicar cambios a partidos disputados |
| `key` | Prefijo para guardar la simulación en el navegador |

Ejemplo de `scores`:

```js
scores = {
  '155051': [2, 1] // ejemplo hipotético: goles local, visitante
};
```

Un marcador se aplica cuando ambos campos contienen enteros entre 0 y 99. Un campo vacío no se interpreta como cero. En partidos futuros, los marcadores incompletos no se guardan ni suman puntos.

Al modificar un partido pasado hasta dejarlo igual que su resultado oficial, la entrada se elimina de `scores`: ya no hay una diferencia que simular.

### Funciones de interfaz

- `persist()`: guarda marcadores y modo WhatIF.
- `renderRounds()`: genera los botones de jornadas.
- `renderMatches()`: dibuja los partidos de la jornada seleccionada y hace visible su botón.
- `renderTable()`: recalcula la tabla, actualiza Tigres, progreso y estados.
- `refreshSignals()`: actualiza los focos de partidos y jornadas.
- `dateText()`: formatea las fechas para mostrarlas.

Los marcadores utilizan un único manejador de eventos en `#fixtures`. Esa delegación permite regenerar las tarjetas sin registrar un evento independiente para cada campo.

## 6. Cómo se calcula la tabla

La función principal está en `engine.js`:

```js
calculate(DATA, scores, whatif)
```

Devuelve una lista de clubes con sus estadísticas proyectadas. Copia la tabla de partida; no modifica `DATA.teams`.

### Modo normal

Parte de la tabla oficial incluida y agrega únicamente los partidos pendientes que tengan una simulación completa. Los cambios almacenados sobre partidos ya disputados se ignoran mientras WhatIF esté apagado.

Por cada partido simulado:

- Suma un partido jugado a cada club.
- Añade los goles a favor y en contra.
- Da tres puntos al ganador o uno a cada club si empatan.
- Actualiza ganados, empatados, perdidos y goles de visitante.

### Modo WhatIF

Cuando un partido disputado tiene un marcador alternativo:

1. Resta del registro de ambos clubes el resultado original.
2. Aplica el resultado hipotético.

De esta manera no duplica partidos ni puntos. El número de partidos jugados permanece igual al reemplazar un resultado pasado.

Ejemplo: sustituir una victoria de Necaxa 2–1 ante Atlante por una derrota 0–1 resta los tres puntos originales a Necaxa y suma tres a Atlante; también corrige los goles y las columnas de victorias y derrotas.

### Orden y desempates

La implementación usa:

1. Puntos.
2. Diferencia de goles (`gf - gc`).
3. Goles anotados.
4. Goles de visitante hasta la última jornada en la que los clubes del grupo empatado tienen igual número de visitas disputadas.

Si el empate continúa, **no inventa un ganador mediante Fair Play, cociente o sorteo**. Devuelve un intervalo de posiciones con:

```js
{ position: 6, positionMax: 7 }
```

La interfaz lo presenta como `6–7`. `rank` solo estabiliza el orden visual de clubes que siguen empatados; no resuelve deportivamente ese empate.

Los primeros ocho se señalan como zona de Liguilla. Si un rango atraviesa el límite de clasificación, no se presenta como clasificación asegurada.

No se proyectan tarjetas futuras ni sanciones administrativas. La validez del cálculo depende de que la tabla oficial de partida y los partidos originales sean coherentes entre sí.

## 7. WhatIF y selector de jornadas

Apagado: se muestran J14, J15, J16, J17 y Pendientes.

Encendido: se muestran J1–J17 y Pendientes. Las jornadas pasadas incluyen sus marcadores oficiales como valores iniciales editables. La pestaña Pendientes contiene los partidos anteriores a J14 que aún no se habían disputado.

Al desactivar WhatIF:

- Los cambios pasados siguen guardados, pero no afectan la tabla.
- Si se estaba viendo una jornada anterior a J14, se vuelve a J14.
- Los marcadores futuros siguen aplicándose.

### Corrección importante de adaptación móvil

Antes, las 17 jornadas podían ensanchar la página y recortar los partidos. La solución depende de **ambas** partes:

```css
.layout {
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
}
.layout > section { min-width: 0; }
#rounds {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
}
@media (max-width: 700px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
}
```

Además, al terminar `renderMatches()`, un `requestAnimationFrame()` ajusta `#rounds.scrollLeft` para mantener visible el botón activo. No se desplaza toda la página.

**No elimines `min-width: 0` ni sustituyas `minmax(0, …)` por columnas con mínimos implícitos sin probar WhatIF en móvil.** Ocultar el desbordamiento del `body` solo escondería el síntoma.

## 8. Focos y progreso

Los pequeños focos ámbar utilizan las clases `.signal`, `.match-signal` y `.round-signal`.

- Un partido pendiente muestra foco si no tiene dos marcadores completos.
- Una jornada muestra foco si contiene al menos un pendiente sin simular.
- La pestaña Pendientes tiene su propio foco.
- Al completar un marcador se apaga el foco del partido; al completar todos los pendientes de una jornada se apaga el suyo.
- En WhatIF, los partidos ya jugados no cuentan como pendientes obligatorios.
- El indicador `0 / 38` cuenta únicamente los 38 partidos pendientes originales, incluso con WhatIF activado.

La animación está definida en `@keyframes signal-pulse`. Se desactiva con `prefers-reduced-motion: reduce`, dejando un indicador fijo.

## 9. Escenarios de Tigres

`scenarios.js` define cuatro objetos con esta forma:

```js
window.SCENARIOS = [
  {
    label: '8º',
    target: 8,
    scores: { /* combinación completa de 38 resultados */ },
    points: 26
  }
];
```

Las cuatro opciones incluidas llevan a Tigres a 8.º, 7.º, 6.º y 8.º con otra combinación. En las cuatro, Tigres suma 26 puntos.

Son **ejemplos hipotéticos precalculados**, no pronósticos ni un buscador que se ejecute al pulsar el botón. La app no vuelve a buscar una combinación cuando cambian los datos de base.

Seleccionar un escenario reemplaza `scores`, desactiva WhatIF y recalcula la página. Editar después un marcador elimina el resaltado del escenario seleccionado.

Si actualizas los datos oficiales, debes recalcular y verificar estos cuatro objetos. Cambiar solo `target` o el texto del botón no cambia la posición real de Tigres.

Para verificar un escenario, calcula la tabla y comprueba que Tigres tiene tanto `position` como `positionMax` iguales a `target`.

## 10. Guardado local

Se usa `localStorage`. No existe una cuenta de usuario ni un servidor donde se guarden simulaciones.

Prefijo actual:

```text
liga-mx-2026-10-22-v1
```

| Clave | Guarda |
| --- | --- |
| El prefijo sin sufijo | Diccionario `scores` |
| `-whatif` | Modo WhatIF, como texto `true` o `false` |
| `-title-v2` | Nombre de la simulación |
| `-handle` | @ del autor de la simulación |
| `-url` | Dirección pública configurada al trabajar en local |

Los datos permanecen en ese navegador y origen. Cambiar de dispositivo, navegador, protocolo, dominio o puerto puede mostrar otro almacenamiento. Dos instalaciones bajo distintas rutas del mismo origen que usen las mismas claves pueden compartir y sobrescribir esos valores; cambia el prefijo si necesitas separarlas.

No se guardan la pestaña de jornada seleccionada ni el resaltado de un escenario. Al recargar se inicia la vista en J14.

**Reiniciar** vacía los marcadores y el escenario activo. No borra el nombre, el @, la URL pública ni apaga WhatIF.

El guardado falla silenciosamente en algunos contextos restringidos; no hay un aviso visible permanente en el portal. El texto de estado `#save-status` está oculto visualmente mediante `.sr-only`.

## 11. Menú Compartir

Tiene exactamente tres opciones: Imagen, JSON y Enlace.

### Nombre de la simulación

El campo de nombre está dentro del diálogo **Compartir → Imagen**, para mantener limpia la pantalla principal. Se guarda localmente y también se utiliza al exportar JSON y enlaces. Si está vacío, se usa `Mi simulación`.

Actualmente no hay un catálogo de varias simulaciones guardadas: hay una copia de trabajo por almacenamiento local.

### A. Imagen PNG

`renderShareImage()` en `share.js` dibuja una composición nueva con Canvas. **No es una captura del HTML.** Por ello, cambiar el CSS de la web no cambia automáticamente la imagen exportada.

Incluye:

- Avatar y encabezado Apertura 2026.
- Nombre, corte y cantidad de marcadores simulados.
- Tabla calculada.
- Los 38 partidos pendientes, tengan o no marcador.
- Con WhatIF activo, los partidos pasados que tengan un resultado modificado.
- Cintilla negra a morada con avatar, logo de X y `@theFamousJL`.
- A la derecha, `Simulado por @usuario` cuando se proporciona un @.

Los partidos exportados se ordenan por jornada y luego ID, no por fecha. Los pendientes de J7 aparecen al principio. La tabla se coloca a la izquierda y los partidos en dos columnas a la derecha.

La imagen mide 1600 píxeles de ancho. Su altura mínima es 1900 píxeles y crece cuando hay más partidos por incluir.

Elementos útiles para modificarla:

| Elemento | Buscar en `renderShareImage()` |
| --- | --- |
| Ancho y alto | `c.width`, `c.height`, `ribbonY` |
| Textos y fuentes | Helper `text()` y sus llamadas |
| Cajas y fondos | Helper `box()` |
| Avatar circular | `avatarAt()` |
| Escudos | `logo()` |
| Distribución de partidos | `perColumn`, `col`, `line`, `a`, `b` |
| Cintilla | `grad.addColorStop`, `ribbonY` |
| Firma del propietario | Texto `@theFamousJL` |
| Firma del visitante | `normalizedHandle()` y texto `Simulado por` |

La firma utiliza Arial en blanco con peso negrita y estilo cursiva (`italic bold`). El degradado actual va de `#030305` a `#642080`. El logo de X se dibuja como un `Path2D`.

El @ opcional admite hasta 15 letras, números o guiones bajos, con o sin `@` inicial. Se normaliza al exportar la imagen. No es un inicio de sesión ni una verificación de identidad de X.

Los recursos locales evitan depender de imágenes remotas para exportar. Si sustituyes los escudos por URLs de otro dominio, el navegador podría bloquear la exportación por restricciones de Canvas/CORS.

### B. JSON

`snapshot()` crea el objeto exportable. Ejemplo hipotético:

```json
{
  "version": 1,
  "tournament": "apertura-2026",
  "cutoff": "2026-10-22",
  "name": "Mi simulación",
  "whatif": false,
  "author": "@usuario",
  "scores": {
    "155051": [2, 1]
  }
}
```

No incluye toda la tabla oficial ni los escudos: contiene los cambios necesarios para reconstruir la simulación sobre la versión de datos del portal.

Con WhatIF apagado, no exporta modificaciones de partidos pasados aunque estén guardadas localmente. Con WhatIF encendido, sí las incluye.

**La versión actual exporta JSON, pero no tiene un botón para importar un archivo JSON.** Para agregarlo, crea un selector de archivo, valida el objeto y aplica el mismo proceso de restauración que utiliza `receiveLink()`. No asignas datos sin validarlos.

### C. Enlace único

Flujo para una persona que visita el sitio publicado:

```text
Compartir → Enlace → Copiar enlace → Enviar a un amigo
```

No necesita cuenta de GitHub ni configurar una dirección. `openLink()` obtiene la URL de la página actual automáticamente.

Funcionamiento interno:

1. `snapshot()` recopila el estado.
2. `makeLink()` agrega un identificador aleatorio de ocho bytes representado en hexadecimal.
3. `encodeSimulation()` convierte el JSON a UTF-8 y Base64URL.
4. Se coloca en el fragmento de la URL: `#sim=...`.
5. `receiveLink()` lo lee al cargar la página o cambiar el fragmento.
6. `decodeSimulation()` valida versión, torneo, corte, tipos, IDs y goles.
7. Se restaura el estado y se guarda localmente, reemplazando la copia de trabajo previa.
8. `history.replaceState()` limpia el fragmento de la barra del navegador tras cargarlo.

El identificador hace diferentes las URLs de exportaciones sucesivas con una probabilidad de colisión despreciable; **no es un registro en una base de datos ni una garantía matemática de unicidad**.

El enlace transporta los datos completos. No es un enlace corto, no está cifrado y no sincroniza cambios posteriores. Quien tenga el enlace puede leer y modificar su copia. Para compartir una nueva versión, genera otro enlace.

La validación permite un fragmento de hasta 20 000 caracteres. Las apps de mensajería o navegadores pueden tener sus propios límites. WhatIF con muchos partidos modificados produce enlaces más largos.

En `localhost`, `127.0.0.1`, `[::1]` o `file://`, la app solicita la URL pública del portal. Esto es para desarrollo: un enlace a localhost no funciona en el teléfono de otra persona. La detección local no contempla todas las IP de redes privadas, por lo que no conviene compartir una URL de pruebas en una red doméstica.

En producción no aparece ese campo. No hay acortadores ni servicios externos de almacenamiento.

El enlace depende de que la página siga publicada y mantenga una versión compatible de los datos. Si cambias la tabla base sin versionar, enlaces antiguos podrían producir otra tabla aunque contengan los mismos marcadores.

## 12. Cambios visuales frecuentes

### Cambiar el encabezado

Edita el `<h1>` en `index.html`. Para cambiar también el título de la imagen exportada, modifica el texto correspondiente en `share.js`.

### Cambiar descripción y ejemplos WhatIF

En `index.html`, busca:

```text
whatif-control
whatif-examples
```

La descripción y los ejemplos están siempre visibles. En `style.css`, los tamaños y colores definitivos de ese bloque están cerca del final del archivo.

### Cambiar el avatar

Reemplaza `assets/avatar.png` conservando el nombre. El archivo actual ya está incluido; no necesitas tener acceso a la galería original. Usa preferentemente una imagen cuadrada con buen contraste a tamaño pequeño.

El portal y el PNG comparten el mismo archivo. El icono en pantalla usa CSS; la exportación hace un recorte circular en Canvas.

### Cambiar tonos y tamaños

El CSS tiene reglas iniciales y ajustes añadidos posteriormente. Cuando dos selectores tienen la misma especificidad, la regla posterior prevalece.

Busca:

- `header:before`: línea de acento superior.
- `.whatif-control`: bloque WhatIF.
- `.scenario.active`: escenario seleccionado.
- `.tigres-row`: fila de Tigres.
- `.signal` y `signal-pulse`: focos.
- `.layout`, `#rounds`: estructura y jornadas.
- `@media(max-width:700px)`: distribución móvil.
- `@media(max-width:900px)`: ajustes intermedios.

Si decides limpiar o reorganizar el CSS, conserva el resultado visual y la corrección del selector de jornadas. Evita añadir reglas duplicadas indefinidamente.

### Cambiar firma o redes

La firma del propietario está dibujada en `share.js`. La interfaz solo debe utilizar referencias personales a `@theFamousJL`. No hay integración con X para publicar automáticamente: la app descarga una imagen o copia un enlace.

## 13. Publicar y actualizar

El sitio se puede alojar como archivos estáticos. En la configuración de GitHub Pages utilizada para este proyecto:

1. Crea un repositorio público.
2. Sube el contenido descomprimido, incluida la carpeta `assets`.
3. Deja `index.html` en la raíz; no subas solo el ZIP ni una carpeta que lo envuelva.
4. En Settings → Pages, configura Deploy from a branch, rama `main`, carpeta `/ (root)`.
5. Guarda y espera a que la publicación termine.

La URL habitual es `https://USUARIO.github.io/REPOSITORIO/`. La interfaz de GitHub puede cambiar; si alguna opción difiere, consulta su documentación:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Para actualizar, sube los nuevos archivos a la misma ubicación. No necesitas que los visitantes conozcan GitHub. Verifica siempre desde la URL publicada, especialmente compartir enlaces y descargar imágenes.

Las rutas de recursos son relativas, para que funcionen cuando el portal se publica dentro de una ruta de repositorio. Evita convertir `assets/avatar.png` en `/assets/avatar.png`: esa barra inicial apuntaría a la raíz del dominio.

## 14. Actualizar torneo, fecha o resultados

Este proyecto está adaptado al Apertura 2026 y no es aún un motor genérico de competiciones. Para cambiar su corte o torneo debes revisar todo lo siguiente:

1. Tabla de los 18 clubes y partidos en `data.json`.
2. Regenerar `data.js`.
3. Confirmar que los resultados ya contados en la tabla coinciden con los partidos marcados como disputados.
4. Mantener IDs coherentes o crear una nueva versión incompatible explícita.
5. Recalcular y verificar `scenarios.js`.
6. Cambiar el prefijo `key` para no aplicar marcadores guardados de otro corte.
7. Cambiar `tournament`, `cutoff` y, si corresponde, `version` en `snapshot()` y `decodeSimulation()`.
8. Revisar la jornada inicial 14, la lista normal `[14,15,16,17]`, el límite 17 y la condición de pendientes anteriores a 14.
9. Revisar los IDs especiales de Tigres (`16`) y el objeto `short`.
10. Actualizar fechas, títulos y fuentes en HTML y en el dibujo de Canvas.
11. Confirmar que el reglamento aplicable mantiene los criterios de desempate y clasificación.
12. Probar marcadores y enlaces después del cambio.

No mezcles estadísticas de un corte con partidos de otro. Para conservar enlaces antiguos, una opción es mantener cada corte en una carpeta o versión distinta del sitio.

## 15. Verificaciones antes de publicar

### Lista manual

- La tabla sin simulación coincide con la base incluida.
- Un triunfo suma 3 puntos; un empate suma 1 a cada equipo.
- Un 0–0 cuenta como simulación completa.
- Un marcador con un campo vacío no suma puntos.
- Ningún marcador acepta negativos, decimales ni valores mayores de 99.
- Las cuatro opciones colocan a Tigres en 8, 7, 6 y 8, sin rango ambiguo.
- Activar WhatIF mantiene visible la jornada activa.
- Se pueden seleccionar J1, J14, J17 y Pendientes.
- Editar un partido pasado reemplaza su resultado sin aumentar PJ.
- Apagar WhatIF vuelve a utilizar los resultados oficiales pasados.
- Recargar conserva marcadores y WhatIF.
- Los focos se apagan al completar partidos y jornadas.
- La página no tiene desplazamiento horizontal global en móvil.
- Los dos equipos y ambos campos de cada partido quedan visibles.
- Exportar una imagen muestra todos los pendientes y los pasados alterados pertinentes.
- La cintilla contiene avatar, X, @theFamousJL y la atribución opcional.
- El JSON contiene los marcadores y el modo correctos.
- Abrir un enlace en otro navegador recupera exactamente su estado.
- En el sitio público, Compartir → Enlace no pide datos de GitHub.

### Comprobación del motor con Node.js, si lo tienes instalado

El motor también exporta `calculate` mediante CommonJS. Puedes ejecutar esto desde la carpeta del proyecto, sin instalar paquetes:

```sh
node - <<'JS'
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const { calculate } = require('./engine.js');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('scenarios.js', 'utf8'), context);

assert.equal(data.teams.length, 18);
assert.equal(data.fixtures.length, 153);
assert.equal(data.fixtures.filter(f => f.hg === null).length, 38);
assert.equal(new Set(data.fixtures.map(f => f.id)).size, 153);

for (const t of calculate(data)) {
  assert.equal(t.position, t.rank);
  assert.equal(t.pj, t.pg + t.pe + t.pp);
  assert.equal(t.pts, 3 * t.pg + t.pe);
}

for (const scenario of context.window.SCENARIOS) {
  const table = calculate(data, scenario.scores);
  const tigres = table.find(t => t.id === 16);
  assert.equal(tigres.position, scenario.target);
  assert.equal(tigres.positionMax, scenario.target);
  assert.ok(table.every(t => t.pj === 17));
}

// Si todos los partidos se convierten hipotéticamente en 0–0,
// todos los clubes deben tener 17 PJ, 17 PE y 17 puntos.
const allDraws = Object.fromEntries(
  data.fixtures.map(f => [f.id, [0, 0]])
);
for (const t of calculate(data, allDraws, true)) {
  assert.equal(t.pj, 17);
  assert.equal(t.pe, 17);
  assert.equal(t.pts, 17);
  assert.equal(t.gf, 0);
  assert.equal(t.gc, 0);
}
console.log('Comprobaciones correctas');
JS
```

Los números de este ejemplo son específicos del corte incluido. Si cambias el torneo o la fecha, adapta las comprobaciones.

## 16. Limitaciones y puntos de atención

- Datos estáticos, sin actualización en vivo.
- Un solo estado de trabajo local; no hay historial, cuentas ni sincronización entre dispositivos.
- Abrir un enlace sustituye la simulación local activa.
- Solo hay exportación JSON, no importación de archivos por la interfaz.
- Los enlaces contienen datos codificados, no cifrados ni almacenados en servidor.
- Los desempates que necesitan Fair Play/cociente/sorteo se muestran sin resolver.
- Las simulaciones no contemplan futuras sanciones administrativas.
- La imagen exportada tiene su propio diseño en Canvas, independiente del CSS.
- El código presupone APIs de navegadores modernos: `structuredClone`, `Array.at`, `TextEncoder`, `TextDecoder`, `dialog`, Canvas `roundRect` y `Path2D`.
- No se ha certificado compatibilidad con todos los modelos físicos de iPhone o Android; revisa los navegadores que quieras soportar.
- El código está compacto, con algunas líneas largas. Puedes formatearlo antes de modificarlo, pero comprueba que no se cambie su comportamiento.
- `calculate()` espera datos coherentes y marcadores válidos. La interfaz y el lector de enlaces validan entradas, pero no debe considerarse una API blindada para objetos arbitrarios de terceros.
- La validación estricta del @ se aplica al exportar PNG; JSON y enlaces guardan el texto del campo y el lector del enlace valida tipo y longitud. No constituye verificación de identidad.
- La recepción de un enlace no válido informa mediante un estado visualmente oculto. Puede mejorarse mostrando un aviso discreto si se desea.

## 17. Qué entregar a otro editor o asistente

Entrega **la carpeta completa del proyecto o el ZIP actualizado**, no solo este README. El manual explica la aplicación, pero los datos, imágenes y código están en sus archivos respectivos.

Puedes acompañarlo con esta instrucción:

> Trabaja sobre esta aplicación estática existente. Lee README.md y los archivos antes de modificarla. Mantén HTML, CSS y JavaScript sin dependencias salvo que el cambio solicitado las necesite. Conserva los datos deportivos y sus fuentes; no inventes resultados oficiales. No rompas los enlaces compartidos, el cálculo WhatIF ni la contención del selector de jornadas en móvil. Mantén el estilo sobrio, el avatar y la firma @theFamousJL. Implementa únicamente los cambios que te indique, prueba la vista móvil y las exportaciones, y entrega la carpeta lista para publicar y un ZIP con index.html en la raíz.

Para describir un cambio, especifica qué parte quieres modificar, cómo debe verse o comportarse y qué debe permanecer igual. Para errores visuales, adjunta una captura e indica si WhatIF estaba activo.

---

Documentación preparada a partir de la implementación entregada. Fecha de los datos deportivos: **22 de octubre de 2026**. Este manual no actualiza esos datos.
