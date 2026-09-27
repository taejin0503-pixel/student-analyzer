export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  const { system, content, maxTokens = 8192 } = req.body;
  const MODEL = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const contents = [];
  if (system) {
    contents.push({ role: "user", parts: [{ text: `[시스템 지침]\n${system}` }] });
    contents.push({ role: "model", parts: [{ text: "확인했습니다. 지시사항에 따라 답변하겠습니다." }] });
  }

  if (Array.isArray(content)) {
    content.forEach(item => {
      if (item.type === "text") {
        contents.push({ role: "user", parts: [{ text: item.text }] });
      }
    });
  }

  try {
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.2
        }
      })
    });

    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json({ 
        error: errData.error?.message || `Gemini API 오류 (${apiRes.status})` 
      });
    }

    const data = await apiRes.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ result: replyText });

  } catch (error) {
    return res.status(500).json({ error: error.message || '서버 통신 중 오류가 발생했습니다.' });
  }
}