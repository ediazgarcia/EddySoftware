# Eddy Software

Sitio web de Eddy Software reconstruido con Astro. El diseño original, sus
animaciones y el detalle interactivo de los proyectos se conservan; los textos,
datos del sitio y fichas de proyectos se editan en archivos Markdown.

## Desarrollo

En PowerShell, usa `npm.cmd` si la política de ejecución bloquea `npm`:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

## Estructura

```text
src/
  components/
    sections/          Componentes Astro de cada sección
    AppLogic.astro     Conecta las fichas Markdown con el dialogo de proyectos
    SectionMarkup.astro Renderiza cada seccion con sus textos
    SiteFrame.astro    Conserva el marco visual del sitio
  content/
    sections/          Contenido editable en Markdown
    markup/            Estructura visual original, separada por seccion
  layouts/             Documento HTML y recursos globales
  lib/                 Renderizado seguro del contenido Markdown
  pages/               Rutas de Astro
  scripts/             Interacciones del sitio
  styles/              Estilos globales
public/assets/         Imagen, fuentes y bibliotecas locales
```

## Editar contenido

- `src/content/sections/site.md`: título, descripción SEO, correo y aviso legal.
- `hero.md`, `about.md`, `services.md`, `courses.md`, `technologies.md` y `footer.md`:
  textos de cada parte del sitio, dentro del bloque `copy`.
- `courses.md`: programas editables de los cursos; cada uno contiene unidades y
  temas con sus descripciones.
- `quote-wizard.md`: preguntas y opciones para solicitar un proyecto. El
  formulario no estima precios; prepara una solicitud para WhatsApp con la
  descripción, el alcance y las funcionalidades que el visitante agregue.
- `projects.md`: contenido de la sección de proyectos. La lista está vacía
  hasta que haya proyectos completos para publicar.
- `privacy-policy.md`: texto de la política que aparece en `/privacidad/`.

El valor a la derecha de cada clave en `copy` reemplaza el texto correspondiente
del diseño. Edita esos valores, no los nombres de clave. Para cambiar la
estructura o el aspecto, modifica el componente de
`src/components/sections/` correspondiente o su fragmento de
`src/content/markup/`.
