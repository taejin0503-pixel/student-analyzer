// api/interview.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { studentData, history, difficulty = '중', count = 5 } = req.body;

  const prompt = `
[학생 생기부 분석 데이터]: ${JSON.stringify(studentData || {})}
[이전 대화 내역]: ${JSON.stringify(history || [])}

위 학생의 생기부 데이터를 바탕으로 [난이도: ${difficulty}] 수준의 면접 질문을 정확히 ${count}개 생성하세요.
질문은 긴장 완화(하) -> 서류 검증(중) -> 학술 개념/꼬리질문(상)의 5단계 면접 흐름을 반영해야 합니다.

응답은 반드시 아래 JSON 구조로만 반환하세요:
{
  "questions": [
    {"id": 1, "category": "서류검증", "question": "질문 내용..."},
    ...
  ]
}
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '너는 대입 면접관 AI다.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: '질문 생성 실패' });
  }
}
