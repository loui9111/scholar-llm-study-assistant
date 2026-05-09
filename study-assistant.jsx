import React, { useState } from 'react';

// ============================================================
// SCHOLAR — An LLM-Powered Study Assistant
// Selected Topics — Almaarefa University
// Powered by Claude (Anthropic API)
// ============================================================

const MODES = [
  { id: 'summary',    label: 'Summary',      hint: 'Structured overview' },
  { id: 'flashcards', label: 'Flashcards',   hint: 'Q & A pairs' },
  { id: 'quiz',       label: 'Quiz',         hint: 'Multiple choice' },
  { id: 'concepts',   label: 'Key Concepts', hint: 'Term definitions' },
];

const PROMPTS = {
  summary: (text) => `You are a study assistant. Read the following topic or text and return ONLY valid JSON (no markdown, no commentary) matching exactly this shape:
{
  "title": "short title",
  "overview": "2-3 sentence overview",
  "main_points": ["point 1", "point 2", "point 3", "point 4"],
  "key_takeaway": "the single most important insight"
}

TOPIC/TEXT:
${text}`,

  flashcards: (text) => `You are a study assistant. Create 6 high-quality study flashcards from the following topic or text. Return ONLY valid JSON (no markdown, no commentary) matching exactly this shape:
{
  "topic": "short topic name",
  "flashcards": [
    {"question": "...", "answer": "concise but complete answer"}
  ]
}

TOPIC/TEXT:
${text}`,

  quiz: (text) => `You are a study assistant. Create 5 multiple-choice quiz questions from the following topic or text. Return ONLY valid JSON (no markdown, no commentary) matching exactly this shape:
{
  "topic": "short topic name",
  "questions": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0,
      "explanation": "why this answer is correct"
    }
  ]
}

TOPIC/TEXT:
${text}`,

  concepts: (text) => `You are a study assistant. Extract 6 key concepts from the following topic or text. Return ONLY valid JSON (no markdown, no commentary) matching exactly this shape:
{
  "topic": "short topic name",
  "concepts": [
    {"term": "...", "definition": "concise definition", "example": "short concrete example"}
  ]
}

TOPIC/TEXT:
${text}`,
};

export default function StudyAssistant() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('summary');
  const [result, setResult] = useState(null);
  const [resultMode, setResultMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedCards, setRevealedCards] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});

  const palette = {
    bg:      '#f1ebdd',
    surface: '#faf6ec',
    ink:     '#1a1612',
    muted:   '#6b5d4a',
    accent:  '#7a2d3a',
    border:  '#d8ccb2',
    soft:    '#e8dec8',
  };

  const fontDisplay = "'Fraunces', 'Iowan Old Style', Georgia, serif";
  const fontBody    = "'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  const fontMono    = "'JetBrains Mono', ui-monospace, monospace";

  const handleGenerate = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter a topic or paste some text first.');
      return;
    }
    if (trimmed.length < 10) {
      setError('Please provide a bit more context (at least 10 characters).');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setRevealedCards({});
    setQuizAnswers({});

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: PROMPTS[mode](trimmed) }],
        })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const text = data.content
        .map(block => (block.type === 'text' ? block.text : ''))
        .filter(Boolean)
        .join('\n');

      // Strip code fences if model wraps response
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);

      setResult(parsed);
      setResultMode(mode);
    } catch (err) {
      console.error(err);
      setError('Could not parse a response. Try again, or rephrase the input. (Responsible AI: errors are surfaced rather than hidden.)');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Result Renderers ----------

  const renderSummary = (r) => (
    <div>
      <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted, textTransform: 'uppercase', marginBottom: 8 }}>
        Topic
      </div>
      <h3 style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 500, color: palette.ink, margin: 0, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
        {r.title}
      </h3>
      <p style={{ fontFamily: fontBody, fontSize: 16, lineHeight: 1.6, color: palette.ink, marginTop: 16, marginBottom: 24 }}>
        {r.overview}
      </p>

      <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 20, marginTop: 20 }}>
        <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted, textTransform: 'uppercase', marginBottom: 14 }}>
          Main points
        </div>
        <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
          {r.main_points.map((point, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'baseline' }}>
              <span style={{ fontFamily: fontDisplay, fontStyle: 'italic', color: palette.accent, fontSize: 18, fontWeight: 500, minWidth: 22 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontFamily: fontBody, fontSize: 15, lineHeight: 1.55, color: palette.ink }}>
                {point}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 28, padding: '20px 22px', background: palette.soft, borderLeft: `3px solid ${palette.accent}` }}>
        <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', color: palette.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Key takeaway
        </div>
        <div style={{ fontFamily: fontDisplay, fontSize: 18, fontStyle: 'italic', color: palette.ink, lineHeight: 1.45 }}>
          “{r.key_takeaway}”
        </div>
      </div>
    </div>
  );

  const renderFlashcards = (r) => (
    <div>
      <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted, textTransform: 'uppercase', marginBottom: 8 }}>
        Flashcards · {r.topic}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
        {r.flashcards.map((card, i) => {
          const revealed = revealedCards[i];
          return (
            <button
              key={i}
              onClick={() => setRevealedCards(p => ({ ...p, [i]: !p[i] }))}
              style={{
                background: revealed ? palette.ink : palette.surface,
                color:      revealed ? palette.surface : palette.ink,
                border: `1px solid ${palette.border}`,
                padding: '20px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: 140,
                transition: 'all 0.25s ease',
                fontFamily: fontBody,
                fontSize: 14,
                lineHeight: 1.5,
                position: 'relative',
              }}
            >
              <div style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 10 }}>
                {revealed ? 'Answer' : `Card ${String(i + 1).padStart(2, '0')}`}
              </div>
              <div style={{ fontFamily: revealed ? fontBody : fontDisplay, fontSize: revealed ? 14 : 17, lineHeight: 1.45, fontWeight: revealed ? 400 : 500 }}>
                {revealed ? card.answer : card.question}
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: fontMono, fontSize: 9, opacity: 0.45 }}>
                {revealed ? '↺ flip' : 'tap →'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderQuiz = (r) => (
    <div>
      <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted, textTransform: 'uppercase', marginBottom: 8 }}>
        Quiz · {r.topic}
      </div>
      <div style={{ marginTop: 16 }}>
        {r.questions.map((q, qi) => {
          const picked = quizAnswers[qi];
          const answered = picked !== undefined;
          return (
            <div key={qi} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: qi < r.questions.length - 1 ? `1px dashed ${palette.border}` : 'none' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontFamily: fontDisplay, fontStyle: 'italic', color: palette.accent, fontSize: 18, fontWeight: 500 }}>
                  Q{qi + 1}.
                </span>
                <span style={{ fontFamily: fontDisplay, fontSize: 18, color: palette.ink, lineHeight: 1.4 }}>
                  {q.question}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 32 }}>
                {q.options.map((opt, oi) => {
                  const isPicked  = picked === oi;
                  const isCorrect = oi === q.correct_index;
                  let bg = palette.surface, color = palette.ink, border = palette.border;
                  if (answered && isCorrect) { bg = '#e8f0e4'; border = '#7a9970'; color = '#2d4a26'; }
                  else if (answered && isPicked && !isCorrect) { bg = '#f0e1e1'; border = palette.accent; color = palette.accent; }
                  return (
                    <button
                      key={oi}
                      onClick={() => !answered && setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                      disabled={answered}
                      style={{
                        background: bg, color, border: `1px solid ${border}`,
                        padding: '10px 14px', textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                        fontFamily: fontBody, fontSize: 14, lineHeight: 1.4,
                        display: 'flex', alignItems: 'baseline', gap: 12,
                      }}
                    >
                      <span style={{ fontFamily: fontMono, fontSize: 11, opacity: 0.6 }}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div style={{ marginTop: 12, marginLeft: 32, padding: '10px 14px', background: palette.soft, fontFamily: fontBody, fontSize: 13, lineHeight: 1.5, color: palette.muted, borderLeft: `2px solid ${palette.accent}` }}>
                  <span style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.accent }}>Why · </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderConcepts = (r) => (
    <div>
      <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted, textTransform: 'uppercase', marginBottom: 8 }}>
        Concepts · {r.topic}
      </div>
      <div style={{ marginTop: 18 }}>
        {r.concepts.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, padding: '18px 0', borderTop: i === 0 ? `1px solid ${palette.border}` : 'none', borderBottom: `1px solid ${palette.border}` }}>
            <div>
              <div style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 500, color: palette.accent, lineHeight: 1.25, fontStyle: 'italic' }}>
                {c.term}
              </div>
              <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', color: palette.muted, textTransform: 'uppercase', marginTop: 4 }}>
                {String(i + 1).padStart(2, '0')} / {String(r.concepts.length).padStart(2, '0')}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: fontBody, fontSize: 15, lineHeight: 1.55, color: palette.ink, marginBottom: 8 }}>
                {c.definition}
              </div>
              <div style={{ fontFamily: fontBody, fontSize: 13, fontStyle: 'italic', color: palette.muted, lineHeight: 1.5 }}>
                <span style={{ fontFamily: fontMono, fontStyle: 'normal', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.accent }}>e.g. </span>
                {c.example}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    if (resultMode === 'summary')    return renderSummary(result);
    if (resultMode === 'flashcards') return renderFlashcards(result);
    if (resultMode === 'quiz')       return renderQuiz(result);
    if (resultMode === 'concepts')   return renderConcepts(result);
  };

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, color: palette.ink, fontFamily: fontBody, padding: '40px 24px 80px' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300..900;1,300..900&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />

      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${palette.border}`, paddingBottom: 28, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.25em', color: palette.muted, textTransform: 'uppercase' }}>
              Almaarefa University · Selected Topics
            </div>
            <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.15em', color: palette.muted }}>
              v1.0 · powered by Claude
            </div>
          </div>
          <h1 style={{ fontFamily: fontDisplay, fontSize: 64, fontWeight: 400, margin: '12px 0 6px', letterSpacing: '-0.03em', lineHeight: 1, fontVariationSettings: '"SOFT" 50, "WONK" 1' }}>
            Scholar<span style={{ color: palette.accent, fontStyle: 'italic' }}>.</span>
          </h1>
          <p style={{ fontFamily: fontDisplay, fontSize: 18, fontStyle: 'italic', fontWeight: 300, color: palette.muted, margin: 0, maxWidth: 560 }}>
            An LLM-powered study companion. Paste a topic, a paragraph, or your lecture notes — receive structured study materials in four formats.
          </p>
        </header>

        {/* Input */}
        <section style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontFamily: fontMono, fontSize: 11, letterSpacing: '0.2em', color: palette.muted, textTransform: 'uppercase', marginBottom: 10 }}>
            Your topic or text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Photosynthesis in C4 plants — or paste a paragraph from your textbook…"
            rows={5}
            style={{
              width: '100%', padding: 18,
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              fontFamily: fontBody, fontSize: 15, lineHeight: 1.6, color: palette.ink,
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = palette.accent}
            onBlur={(e) => e.target.style.borderColor = palette.border}
          />
        </section>

        {/* Mode tabs */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.2em', color: palette.muted, textTransform: 'uppercase', marginBottom: 10 }}>
            Output format
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
            {MODES.map(m => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    background: active ? palette.ink : palette.surface,
                    color:      active ? palette.surface : palette.ink,
                    border: `1px solid ${active ? palette.ink : palette.border}`,
                    padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                    fontFamily: fontBody, transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 500, marginBottom: 2 }}>
                    {m.label}
                  </div>
                  <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.1em', opacity: 0.65, textTransform: 'uppercase' }}>
                    {m.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Generate button */}
        <section style={{ marginBottom: 36 }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: palette.accent,
              color: '#fff',
              border: 'none',
              padding: '16px 28px',
              fontFamily: fontDisplay, fontSize: 17, fontWeight: 500, fontStyle: 'italic',
              cursor: loading ? 'wait' : 'pointer',
              letterSpacing: '0.01em',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading ? 'Consulting Claude…' : 'Generate study materials  →'}
          </button>
          {error && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: '#f0e1e1', border: `1px solid ${palette.accent}`, color: palette.accent, fontFamily: fontBody, fontSize: 14 }}>
              {error}
            </div>
          )}
        </section>

        {/* Result */}
        {(result || loading) && (
          <section style={{ background: palette.surface, padding: '36px 32px', border: `1px solid ${palette.border}`, marginBottom: 36, position: 'relative' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: palette.muted, fontFamily: fontMono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <div style={{ width: 8, height: 8, background: palette.accent, borderRadius: '50%', animation: 'pulse 1.2s infinite' }} />
                Generating structured response…
              </div>
            )}
            {result && renderResult()}
          </section>
        )}

        {/* Footer with responsible AI note */}
        <footer style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 24, fontFamily: fontMono, fontSize: 11, letterSpacing: '0.05em', color: palette.muted, lineHeight: 1.7 }}>
          <div style={{ marginBottom: 10, fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 14, color: palette.ink }}>
            Responsible AI notice
          </div>
          <div>
            Outputs are generated by an LLM (Claude · Sonnet 4) and may contain errors or omissions. Always verify important facts against authoritative sources before exams. No user input is stored. The model is invoked through the official Anthropic API; no API keys are exposed in client code.
          </div>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>© Selected Topics — CS &amp; IS Department</span>
            <span style={{ fontStyle: 'italic' }}>Built with React · Tailwind · Anthropic API</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
        textarea::placeholder { color: ${palette.muted}; opacity: 0.6; font-style: italic; }
        button:hover:not(:disabled) { filter: brightness(0.97); }
      `}</style>
    </div>
  );
}
