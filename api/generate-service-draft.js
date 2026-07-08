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

  const { serviceName, sources } = request.body || {};
  if (!serviceName || !sources) {
    return response.status(400).json({
      error: "Se requiere serviceName y sources."
    });
  }

  try {
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
                text: "Eres un asistente para administradores de CercaRed. Genera borradores de servicios sociales en espanol claro, basados solo en fuentes provistas. Si falta un dato, marca 'Por verificar'. No inventes requisitos, costos ni canales."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Servicio: ${serviceName}\n\nFuentes o notas oficiales:\n${sources}\n\nDevuelve un borrador con: descripcion, entidad, requisitos, documentos, pasos, canales, costo, alcance y advertencias de verificacion.`
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

    const draft = payload.output_text
      || payload.output?.flatMap((item) => item.content || [])
        .map((content) => content.text)
        .filter(Boolean)
        .join("\n")
      || "";

    return response.status(200).json({ draft });
  } catch (error) {
    return response.status(500).json({
      error: "Error interno al generar el borrador."
    });
  }
}
