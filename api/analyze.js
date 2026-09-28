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

  // Gemini REST API 데이터 구조
  const bodyPayload = {};

  // 시스템 지침(System Instruction) 적용
  if (system) {
    bodyPayload.system_instruction = {
      parts: [{ text: system }]
    };
  }

  // 본문 요청 내용 처리
  if (Array.isArray(content)) {
    bodyPayload.contents = content;
  } else {
    bodyPayload.contents = [{ parts: [{ text: content }] }];
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
