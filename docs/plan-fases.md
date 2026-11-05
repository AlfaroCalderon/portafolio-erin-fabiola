# Plan por fases — cambios de "IDEAS PÁGINA WEB ERIN-porta.docx"

Cada fase se entrega y se revisa antes de empezar la siguiente.

| Fase | Contenido | Estado |
|------|-----------|--------|
| F1 | Limpieza (reglas, cuadrícula, X/Y, todo lo de Ctrl Z) · tipografía Outfit Light en todo (sin serif tipo Bodoni) · menú: Acerca de mí, Proyectos, CV, Creemos juntos · texto lateral blanco sobre el fondo vino | hecha |
| F2 | Pantalla de carga morada con "anastomosis" en ASCII (colores de las guardas) · mensaje de bienvenida de Erin · luego empieza el recorrido | hecha |
| F3 | Puntero: espiral que, sobre texto o imágenes, se abre como flor de conacaste (ref. eszterbial.com) | hecha |
| F4 | Árbol conacaste (copa en sombrilla, raíces tabulares; imágenes de referencia del docx) · movimiento de elementos tipo "goonies never say die" | hecha |
| F5 | "Árbol del agradecimiento": caen bolitas y forman un árbol · mensaje "Construyamos juntos, deja tu semilla" · semillas guardadas solo en el navegador del visitante (localStorage) · la postal se elimina y el árbol del agradecimiento ocupa su lugar | hecha |

## Decisiones
- Semillas: solo en el navegador de cada visitante, para una experiencia cercana y personal.
- Los títulos pesados pasan a Outfit Light; la jerarquía se marca con tamaño, no con peso.
- El deshacer con teclado (Ctrl/Cmd+Z) sigue funcionando por dentro para el índice; solo se quitó todo lo visible.

## Decidido
- La postal se sustituye por el árbol del agradecimiento (F5).

## Correcciones tras F5
- La frase "Donde las ramas vuelven a unirse" se escribe cuando termina la bienvenida (antes se escribía detrás de ella).
- Tarjetas de las ramas: caben completas en pantallas de 640 a 900 px de alto; sin scroll interno (en móvil el scroll ya no se queda atrapado).
- Se quitó la banda "ANASTOMOSIS :)" que se movía en el footer.
- Bienvenida en móvil: la palabra ANASTOMOSIS se mide por su forma real y se escala y centra para caber (antes se cortaba en pantallas estrechas).
- Se conserva la firma "att: Erin Figueroa" en el cierre.

## Decisiones confirmadas
- La bienvenida sale en cada visita.
- Las tarjetas móviles se quedan compactas (sin descripción larga ni categoría).

## Interacciones añadidas
- Semillas: siempre una flor (se descartó la idea de que crecieran por etapas). Nombre y frase opcionales; al pasar el puntero sobre una flor aparece su cartel.
- Rastro de pétalos al mover el puntero (solo con mouse).
- Modo noche con luciérnagas: botón de luna abajo a la izquierda, se recuerda la elección.
- Sección "Escríbeme" (¿Hablamos?) en el cierre, con banda rosa clara y carta inclinada para distinguirse: abre el correo del visitante con el mensaje para erin.figueroa@ujmd.edu.sv, y opcionalmente cuántas semillas dejó.
