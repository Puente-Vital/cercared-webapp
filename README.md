# CercaRed — Web App

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

Aplicación web del catálogo de **CercaRed**, la plataforma que ayuda a las personas a encontrar información clara y verificada sobre servicios sociales del Estado. Desde aquí el usuario puede buscar servicios por palabra clave, filtrar por categoría, distrito y modalidad, revisar requisitos, documentos y pasos de acceso, consultar los canales oficiales de atención, y guardar o compartir cada servicio. Es un proyecto estático (HTML, CSS y JavaScript puro), sin frameworks ni dependencias de build.

Esta es la aplicación a la que enlaza el [landing page de CercaRed](https://github.com/) a través del botón "Buscar servicios".

## Funcionalidades

- **Catálogo de servicios**: tarjetas con la información principal de cada servicio y acciones rápidas.
- **Búsqueda por palabra clave**: filtra el catálogo en tiempo real usando las palabras asociadas a cada servicio.
- **Filtros**: por categoría, distrito y modalidad, con acción "Limpiar filtros".
- **Detalle del servicio**: descripción completa, requisitos, documentos necesarios, pasos numerados, procedimiento disponible y panel con los datos del servicio (entidad, categoría, atención, ámbito y costo).
- **Canales de atención**: oficina, plataforma en línea, WhatsApp o línea telefónica, con enlace al canal oficial.
- **Guardar servicios**: el usuario puede guardar servicios para consultarlos después en la sección "Guardados".
- **Compartir**: cada servicio puede compartirse por WhatsApp, X, Facebook, Telegram, correo o copiando el enlace.
- **Cuenta de usuario**: registro, inicio de sesión, perfil y preferencias.
- **Modo simple**: vista accesible con textos más grandes y menos elementos visuales.
- **Diseño responsive**: se adapta a computadora, tablet y celular, con criterios de accesibilidad WCAG AA.

## Categorías disponibles

El catálogo organiza los servicios en las siguientes categorías:

- Adulto mayor
- Educación
- Salud
- Social
- Vivienda

## Tecnologías

- HTML5
- CSS3
- JavaScript (ES6, sin frameworks)
- Vercel (despliegue)

## Cómo usar

1. Clona el proyecto:

   ```bash
   git clone https://github.com/topional/cercared-webapp.git
   ```

2. Abre `index.html` en tu navegador, o usa una extensión tipo **Live Server** en VS Code para servirlo localmente.

> No necesita instalación ni servidor: es un sitio estático.

**Versión desplegada:** <https://cercared-webapp-nybi.vercel.app/>

## Estructura del proyecto

```
cercared-webapp/
├── index.html          # Catálogo de servicios (página principal)
├── detail.html         # Detalle de un servicio
├── saved.html          # Servicios guardados
├── profile.html        # Perfil del usuario
├── auth.html           # Inicio de sesión y registro
├── css/                # Hojas de estilo (una por sección)
│   ├── base.css
│   ├── navbar.css
│   ├── catalog.css
│   ├── detail.css
│   ├── share.css
│   ├── saved.css
│   ├── profile.css
│   ├── auth.css
│   └── footer.css
├── js/                 # Lógica de la aplicación
│   ├── services.js     # Datos de todos los servicios (catálogo)
│   ├── catalog.js      # Render, búsqueda y filtros del catálogo
│   ├── detail.js       # Render de la página de detalle
│   ├── share.js        # Lógica del botón "Compartir"
│   ├── saved.js        # Guardar / quitar servicios
│   ├── saved-page.js   # Render de la página de guardados
│   ├── auth.js         # Autenticación de usuario
│   ├── profile.js      # Perfil del usuario
│   ├── navbar.js       # Navegación y modo simple
│   └── footer.js       # Pie de página
├── assets/             # Imágenes e íconos
│   ├── images/
│   └── icons/
└── README.md
```

## Cómo agregar un nuevo servicio

Todos los servicios del catálogo se definen en `js/services.js`. Para agregar uno nuevo, añade un objeto al array siguiendo este esquema:

```javascript
{
  id: "identificador-unico",          // usado en la URL del detalle y al compartir
  name: "Nombre del servicio",
  entity: "Entidad responsable",
  shortEntity: "SIGLA",
  category: "Social",                  // debe coincidir con una categoría del filtro
  description: "Descripción completa...",
  shortDescription: "Resumen para la tarjeta del catálogo.",
  keywords: ["palabra", "clave"],      // habilitan la búsqueda
  district: "Nacional",                // debe coincidir con una opción del filtro
  modality: "Presencial",              // Presencial, Virtual o Mixta
  attention: "Presencial / Online",
  scope: "Nacional",
  cost: "Gratuito",
  officialUrl: "https://...",
  requirements: [{ title: "...", description: "..." }],
  documents: [{ title: "...", description: "..." }],
  steps: [{ title: "...", description: "...", highlight: true }],
  procedures: [{ value: "...", label: "..." }],
  channels: [{ title: "...", description: "..." }]
}
```

Con solo agregar el objeto, el servicio aparece automáticamente en el catálogo, en el buscador, en su página de detalle y en la opción de compartir.

## Autores

|Código    |Integrante                          |
|----------|------------------------------------|
|U202413604|Cueto Ninaja, Ronal Sebastian       |
|U20231H075|Rivera Calderón, Alvaro Jerry       |
|U202322704|Alarcon Castellanos, Ericks Santiago|
|U20241A112|Donayre Salas, Julio Gabriel        |
|U20211G718|Gálvez Menéndez, Joaquín Alonso     |

-----

**Curso:** 1ACC0237 — IHC y Programación Web · **Universidad Peruana de Ciencias Aplicadas (UPC)** · Período 2026-01
