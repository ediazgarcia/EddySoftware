type ContentData = Record<string, unknown>;

function isContentData(value: unknown): value is ContentData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readContent(value: unknown, name: string): ContentData {
  if (!isContentData(value)) {
    throw new Error(`Expected ${name} Markdown frontmatter to be an object.`);
  }

  return value;
}

function readString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected ${name} Markdown value to be a string.`);
  }

  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMarkup(
  markup: string,
  sectionData: unknown,
  siteData: unknown,
  projectData?: unknown,
  base = '/',
) {
  const section = readContent(sectionData, 'section');
  const site = readContent(siteData, 'site');
  const copy = readContent(section.copy, 'section copy');
  const projects = projectData ? readContent(projectData, 'projects').projects : undefined;

  const markupWithBasePaths = markup.replace(
    /(href|src)="\/(assets|privacidad)\//g,
    (_match, attribute: string, path: string) => `${attribute}="${base}${path}/`,
  );
  const markupWithQuoteAnchors = markupWithBasePaths.replaceAll('href="#contacto"', 'href="#cotiza-tu-proyecto"');
  const renderedMarkup = markupWithQuoteAnchors.replace(
    /__COPY_([a-z0-9-]+)__|__SITE_(EMAIL|COPYRIGHT|TITLE)__|__PROJECT_(\d+)_(LABEL|TITLE|CARD_DESCRIPTION|DESCRIPTION|COLOR|DEMO|GITHUB|TAG_(\d+))__/g,
    (placeholder, copyKey: string | undefined, siteKey: string | undefined, projectIndex: string | undefined, projectField: string | undefined, tagIndex: string | undefined) => {
      if (copyKey) {
        return escapeHtml(readString(copy[copyKey], `copy.${copyKey}`));
      }

      if (siteKey) {
        const key = siteKey === 'EMAIL' ? 'email' : siteKey === 'TITLE' ? 'title' : 'copyright';
        return escapeHtml(readString(site[key], key));
      }

      const index = Number(projectIndex);
      if (!Array.isArray(projects) || !Number.isInteger(index) || index >= projects.length) {
        throw new Error(`Missing project data for template placeholder ${placeholder}.`);
      }

      const project = readContent(projects[index], `projects[${index}]`);
      let field = projectField?.toLowerCase() ?? '';
      if (projectField === 'CARD_DESCRIPTION') field = 'cardDescription';
      if (projectField === 'TAG_' + tagIndex) field = 'tags';
      const tags = project.tags;
      if (field === 'tags' && !Array.isArray(tags)) {
        throw new Error(`Expected projects[${index}].tags to be an array.`);
      }
      const value = field === 'tags' ? tags[Number(tagIndex)] : project[field];

      return escapeHtml(readString(value, `projects[${index}].${field}`));
    },
  );

  const unresolved = renderedMarkup.match(/__(?:COPY_|SITE_|PROJECT_)[A-Z0-9_-]+__/);
  if (unresolved) {
    throw new Error(`Unresolved site content placeholder: ${unresolved[0]}.`);
  }

  return renderedMarkup;
}
