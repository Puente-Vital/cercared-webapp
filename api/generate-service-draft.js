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
  if (!sources || typeof sources !== "string") {
    return response.status(400).json({
      error: "Pega fuentes oficiales o notas verificadas para generar el servicio."
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
                text: [
                  "Eres un asistente para administradores de CercaRed.",
                  "Crea un borrador de servicio social basado solo en las fuentes entregadas.",
                  "No inventes requisitos, costos, canales ni enlaces. Si falta un dato, escribe 'Por verificar'.",
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
                  "\"channels\":[{\"title\":\"\",\"description\":\"\"}]",
                  "}",
                  "",
                  "Fuentes o notas:",
                  sources
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

    return response.status(200).json({ service });
  } catch (error) {
    return response.status(500).json({
      error: "No se pudo convertir la respuesta de IA en un servicio editable."
    });
  }
}
