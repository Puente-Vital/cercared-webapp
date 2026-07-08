const MAX_URLS = 4;
const MAX_SOURCE_CHARS = 18000;
const MIN_EXTRACTED_TEXT_LENGTH = 120;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "Falta configurar OPENAI_API_KEY en Vercel."
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

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: [
                  "Eres un asistente para administradores de CercaRed.",
                  "Crea un borrador de servicio social basado solo en las fuentes entregadas.",
                  "No inventes requisitos, costos, canales ni enlaces. Si falta un dato, escribe 'Por verificar'.",
                  "Si las fuentes incluyen enlaces leidos, usa esos textos como fuente principal.",
                  "Extrae recursos utiles oficiales cuando existan, como consultas de afiliacion, formularios, cronogramas o paginas informativas.",
                  "Crea un checklist breve con acciones concretas que el ciudadano pueda marcar antes de iniciar el tramite.",
                  "Responde solo JSON valido, sin markdown."
                ].join(" ")
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
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
                  "\"checklist\":[{\"title\":\"\",\"description\":\"\"}]",
                  "}",
                  "",
                  "Enlaces enviados por el administrador:",
                  urls.length ? urls.join("\n") : "No se enviaron enlaces.",
                  "",
                  "Texto extraido y notas:",
                  context
                ].join("\n")
              }
            ]
          }
        ]
      })
    });

    const payload = await openaiResponse.json();
    if (!openaiResponse.ok) {
      return response.status(openaiResponse.status).json({
        error: payload.error?.message || "OpenAI no pudo generar el borrador."
      });
    }

    const text = payload.output_text
      || payload.output?.flatMap((item) => item.content || [])
        .map((content) => content.text)
        .filter(Boolean)
        .join("\n")
      || "";
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const service = JSON.parse(jsonText);

    return response.status(200).json({ service, warnings: failedPages });
  } catch (error) {
    return response.status(500).json({
      error: "No se pudo convertir la respuesta de IA en un servicio editable."
    });
  }
}
