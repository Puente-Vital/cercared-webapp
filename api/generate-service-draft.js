const MAX_URLS = 4;
const MAX_SOURCE_CHARS = 18000;
const MIN_EXTRACTED_TEXT_LENGTH = 120;
const MAX_CUSTOM_SECTIONS = 3;
const MAX_CUSTOM_ITEMS = 8;
const MAX_SELECT_OPTIONS = 6;

function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function toSafeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (isPrivateHostname(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractUrls(value) {
  return Array.from(
    new Set(String(value || "").match(/https?:\/\/[^\s<>"']+/g) || []),
  )
    .map((url) => url.replace(/[),.;]+$/g, ""))
    .map(toSafeUrl)
    .filter(Boolean)
    .slice(0, MAX_URLS);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractModelText(messageContent) {
  if (typeof messageContent === "string") return messageContent;
  if (!Array.isArray(messageContent)) return "";

  return messageContent
    .map((item) => {
      if (typeof item === "string") return item;
      if (item?.type === "text" && typeof item.text === "string") return item.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function slugifySectionId(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "seccion";
}

function sanitizeCustomSections(customSections = []) {
  if (!Array.isArray(customSections)) return [];

  return customSections
    .map((section, index) => {
      const title = String(section?.title || "").trim().slice(0, 40);
      const kind = ["text", "items", "resources", "select"].includes(section?.kind)
        ? section.kind
        : "text";
      const baseSection = {
        id: slugifySectionId(section?.id || title || `seccion-${index + 1}`),
        title: title || `Sección ${index + 1}`,
        kind,
        showInSimple: section?.showInSimple !== false,
      };

      if (kind === "text") {
        return {
          ...baseSection,
          content: String(section?.content || "").trim(),
        };
      }

      if (kind === "select") {
        const options = Array.isArray(section?.options)
          ? section.options.map((option) => String(option || "").trim()).filter(Boolean).slice(0, MAX_SELECT_OPTIONS)
          : [];
        const value = String(section?.value || options[0] || "").trim();
        return { ...baseSection, options, value };
      }

      const items = Array.isArray(section?.items)
        ? section.items
          .map((item) => ({
            title: String(item?.title || "").trim(),
            description: String(item?.description || "").trim(),
            ...(kind === "resources"
              ? {
                  url: String(item?.url || "").trim(),
                  type: String(item?.type || "otro").trim() || "otro",
                }
              : {}),
          }))
          .filter((item) => item.title && (kind === "resources" ? item.url : item.description))
          .slice(0, MAX_CUSTOM_ITEMS)
        : [];

      return { ...baseSection, items };
    })
    .filter((section) => {
      if (section.kind === "text") return Boolean(section.content);
      if (section.kind === "select") return section.options.length > 0;
      return section.items.length > 0;
    })
    .slice(0, MAX_CUSTOM_SECTIONS);
}

async function fetchUrlText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent": "CercaRedAdmin/1.0 (+https://cercared.app)",
      },
      signal: controller.signal,
    });

    if (!pageResponse.ok) {
      return {
        ok: false,
        url,
        text: "",
        error: `No se pudo leer ${url} (${pageResponse.status}).`,
      };
    }

    const contentType = pageResponse.headers.get("content-type") || "";
    const rawText = await pageResponse.text();
    const text = contentType.includes("text/html") ? stripHtml(rawText) : rawText;

    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      return {
        ok: false,
        url,
        text: "",
        error: `El enlace ${url} no tiene suficiente texto legible.`,
      };
    }

    return {
      ok: true,
      url,
      text: text.slice(0, 5000),
    };
  } catch {
    return {
      ok: false,
      url,
      text: "",
      error: `No se pudo leer ${url}.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildSourceContext(sources) {
  const urls = extractUrls(sources);
  const notesWithoutUrls = String(sources || "")
    .replace(/https?:\/\/[^\s<>"']+/g, "")
    .trim();
  const fetchedPages = await Promise.all(urls.map(fetchUrlText));
  const readablePages = fetchedPages.filter((page) => page.ok && page.text);
  const failedPages = fetchedPages.filter((page) => !page.ok).map((page) => page.error);

  const context = [
    notesWithoutUrls ? `Notas del administrador:\n${notesWithoutUrls}` : "",
    readablePages
      .map((page) => `Fuente leida: ${page.url}\n${page.text}`)
      .join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_SOURCE_CHARS);

  return {
    context,
    urls,
    failedPages,
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Metodo no permitido." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "Falta configurar GEMINI_API_KEY en Vercel."
    });
  }

  const { sources } = request.body || {};
  if (!sources || typeof sources !== "string" || sources.trim().length < 8) {
    return response.status(400).json({
      error: "Pega enlaces oficiales, notas verificadas o ambos para generar el servicio."
    });
  }

  try {
    const { context, urls, failedPages } = await buildSourceContext(sources);

    if (!context) {
      return response.status(422).json({
        error: "No se pudo leer texto desde los enlaces. Pega notas oficiales adicionales o prueba con otro enlace."
      });
    }

    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "Eres un asistente para administradores de CercaRed.",
              "Crea un borrador de servicio social basado solo en las fuentes entregadas.",
              "No inventes requisitos, costos, canales ni enlaces. Si falta un dato, escribe 'Por verificar'.",
              "Si las fuentes incluyen enlaces leidos, usa esos textos como fuente principal.",
              "Extrae recursos utiles oficiales cuando existan, como consultas de afiliacion, formularios, cronogramas o paginas informativas.",
              "Crea un checklist breve con acciones concretas que el ciudadano pueda marcar antes de iniciar el tramite.",
              "Responde solo JSON valido, sin markdown."
            ].join(" ")
          },
          {
            role: "user",
            content: [
              "Genera un JSON con esta forma exacta:",
              "{",
              "\"name\":\"\",",
              "\"entity\":\"\",",
              "\"category\":\"Social|Salud|Educación|Vivienda|Adulto mayor\",",
              "\"description\":\"\",",
              "\"shortDescription\":\"\",",
              "\"district\":\"Nacional\",",
              "\"modality\":\"Presencial|Virtual|Mixta\",",
              "\"attention\":\"\",",
              "\"scope\":\"\",",
              "\"cost\":\"\",",
              "\"officialUrl\":\"\",",
              "\"requirements\":[{\"title\":\"\",\"description\":\"\"}],",
              "\"documents\":[{\"title\":\"\",\"description\":\"\"}],",
              "\"steps\":[{\"title\":\"\",\"description\":\"\"}],",
              "\"channels\":[{\"title\":\"\",\"description\":\"\"}],",
              "\"resources\":[{\"title\":\"\",\"description\":\"\",\"url\":\"\",\"type\":\"consulta|información|formulario|cronograma|ubicación|otro\"}],",
              "\"checklist\":[{\"title\":\"\",\"description\":\"\"}],",
              "\"customSections\":[",
              "  {\"title\":\"Beneficios\",\"kind\":\"items\",\"showInSimple\":true,\"items\":[{\"title\":\"\",\"description\":\"\"}]}",
              "]",
              "}",
              "",
              "Reglas para customSections:",
              "- Maximo 3 secciones extra.",
              "- Usa solo kind: text, items, resources, select.",
              "- No repitas requisitos, documentos, pasos, canales, recursos o checklist en customSections.",
              "- title debe ser corto y claro.",
              "- Para text usa { title, kind, showInSimple, content }.",
              "- Para items usa { title, kind, showInSimple, items:[{title,description}] }.",
              "- Para resources usa { title, kind, showInSimple, items:[{title,description,url,type}] }.",
              "- Para select usa { title, kind, showInSimple, options:[...], value:\"\" }.",
              "- Si no hace falta una seccion extra, devuelve customSections vacio.",
              "",
              "Enlaces enviados por el administrador:",
              urls.length ? urls.join("\n") : "No se enviaron enlaces.",
              "",
              "Texto extraido y notas:",
              context
            ].join("\n")
          }
        ]
      })
    });

    const payload = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return response.status(geminiResponse.status).json({
        error: payload.error?.message || "Gemini no pudo generar el borrador."
      });
    }

    const text = extractModelText(payload.choices?.[0]?.message?.content);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const service = JSON.parse(jsonText);
    service.customSections = sanitizeCustomSections(service.customSections);

    return response.status(200).json({ service, warnings: failedPages });
  } catch (error) {
    return response.status(500).json({
      error: "No se pudo convertir la respuesta de Gemini en un servicio editable."
    });
  }
}
