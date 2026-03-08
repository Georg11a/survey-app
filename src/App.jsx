import { useState, useRef, useCallback, useMemo } from "react";

const CHARTS_PER_ROUND = 7;
const UNIQUE_ROUNDS = 4;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Round definitions — each round uses a different set of real chart images */
const baseRoundData = [
  {
    id: 1,
    label: "Bar Charts",
    charts: Array.from({ length: 7 }, (_, j) => ({
      id: `bar_${j + 1}`,
      label: `Chart ${String.fromCharCode(65 + j)}`,
      image: `${import.meta.env.BASE_URL}images/honest-bar-${j + 1}.png`,
    })),
  },
  {
    id: 2,
    label: "Line Charts",
    charts: Array.from({ length: 7 }, (_, j) => ({
      id: `line_${j + 1}`,
      label: `Chart ${String.fromCharCode(65 + j)}`,
      image: `${import.meta.env.BASE_URL}images/honest-line-${j + 1}.png`,
    })),
  },
  {
    id: 3,
    label: "Pie Charts",
    charts: Array.from({ length: 7 }, (_, j) => ({
      id: `pie_${j + 1}`,
      label: `Chart ${String.fromCharCode(65 + j)}`,
      image: `${import.meta.env.BASE_URL}images/honest-pie-${j + 1}.png`,
    })),
  },
  {
    id: 4,
    label: "Bubble Charts",
    charts: Array.from({ length: 7 }, (_, j) => ({
      id: `bubble_${j + 1}`,
      label: `Chart ${String.fromCharCode(65 + j)}`,
      image: `${import.meta.env.BASE_URL}images/honest-bubble-${j + 1}.png`,
    })),
  },
];

/* ─── Image modal ─── */
function ImageModal({ src, label, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, cursor: "pointer",
      padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, padding: 16,
        maxWidth: "90vw", maxHeight: "90vh", boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        cursor: "default", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#2d3748" }}>{label}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#f7f8fa", cursor: "pointer", fontSize: 18, color: "#718096",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        <img src={src} alt={label} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* ─── Drag-and-drop chart row with real images ─── */
function DragChartRow({ items, setItems, accentColor = "#2a8fc1" }) {
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [modalImg, setModalImg] = useState(null);

  const onDragStart = (e, idx) => { dragItem.current = idx; setDraggingIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnter = (idx) => { dragOver.current = idx; };
  const onDragEnd = () => {
    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
      const copy = [...items];
      const dragged = copy.splice(dragItem.current, 1)[0];
      copy.splice(dragOver.current, 0, dragged);
      setItems(copy);
    }
    dragItem.current = null; dragOver.current = null; setDraggingIdx(null);
  };

  return (
    <div>
      <ImageModal src={modalImg?.image} label={modalImg?.label} onClose={() => setModalImg(null)} />
      {/* Fixed rank numbers */}
      <div style={{ display: "flex", gap: 10, padding: "0 2px", marginBottom: 6 }}>
        {items.map((_, idx) => (
          <div key={idx} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 6, background: accentColor, color: "#fff",
              fontWeight: 700, fontSize: 13,
            }}>{idx + 1}</span>
          </div>
        ))}
      </div>
      {/* Draggable cards */}
      <div style={{ display: "flex", gap: 10, padding: "4px 2px 8px" }}>
        {items.map((item, idx) => {
          const isDragging = draggingIdx === idx;
          return (
            <div key={item.id} draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                flex: "1 1 0", minWidth: 0, background: "#fff",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                padding: "8px 6px 6px", cursor: "grab",
                transition: "box-shadow .15s, transform .15s",
                position: "relative", userSelect: "none",
                opacity: isDragging ? 0.5 : 1,
              }}
              onMouseOver={(e) => { if (!isDragging) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              {/* Enlarge button */}
              <button onClick={(e) => { e.stopPropagation(); setModalImg(item); }}
                onMouseDown={(e) => e.stopPropagation()} draggable={false}
                style={{
                  position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 5,
                  border: "none", background: "rgba(255,255,255,.9)", cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#4a5568", boxShadow: "0 1px 3px rgba(0,0,0,.12)", zIndex: 2,
                }} title="Click to enlarge">⤢</button>
              {/* Chart image */}
              <img src={item.image} alt={item.label} draggable={false}
                style={{ width: "100%", borderRadius: 4, display: "block" }} />
              <div style={{ textAlign: "center", marginTop: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 11, color: "#2d3748" }}>{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "#a0aec0", margin: "4px 0 0 2px", fontStyle: "italic" }}>
        Drag and rank the visualizations from 1 to {items.length}, where 1 (left) = most and {items.length} (right) = least. Click ⤢ to enlarge.
      </p>
    </div>
  );
}

/* ─── Instruction block ─── */
function TaskInstructions({ keyword, color }) {
  return (
    <div style={{
      background: "#f8f9fb", borderRadius: 10, padding: "16px 20px",
      marginBottom: 16, borderLeft: `4px solid ${color}`,
    }}>
      <p style={{ color: "#4a5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        Rank the charts below from most {keyword} to least {keyword} based on how "{keyword}" their visual style looks.
        Drag the chart that looks <span style={{ fontWeight: 800, color: "#2d3748", textDecoration: "underline" }}>
        most {keyword} to the left, and the chart that looks least {keyword} to the right</span>.
      </p>
      <p style={{ color: "#718096", fontSize: 13, lineHeight: 1.6, margin: "10px 0 0" }}>
        Important: Compare each visualization carefully, and focus only on the design style (layout, typography, color, spacing, alignment, clarity, etc.). Do not consider the data content or whether you agree with anything shown in the chart.
      </p>
    </div>
  );
}

/* ─── Radio group ─── */
function RadioGroup({ name, options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <label key={val} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: 8,
            background: value === val ? "#e8f4fb" : "#f7f8fa",
            border: value === val ? "1px solid #2a8fc1" : "1px solid transparent",
            cursor: "pointer", transition: "all .15s",
          }}>
            <input type="radio" name={name} value={val}
              checked={value === val} onChange={() => onChange(val)}
              style={{ accentColor: "#2a8fc1", width: 18, height: 18 }} />
            <span style={{ color: "#374151", fontSize: 15 }}>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function Page({ children }) {
  return (
    <div style={{
      maxWidth: 1200, margin: "0 auto", padding: "40px 24px",
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    }}>{children}</div>
  );
}

function Nav({ onBack, onNext, nextLabel = "→", nextDisabled = false, showBack = true }) {
  return (
    <div style={{ display: "flex", justifyContent: showBack ? "space-between" : "flex-end", marginTop: 36 }}>
      {showBack && (
        <button onClick={onBack} style={{
          padding: "12px 28px", borderRadius: 6, border: "1px solid #cbd5e0",
          background: "#fff", color: "#4a5568", fontSize: 16, cursor: "pointer",
        }}>← Back</button>
      )}
      <button onClick={onNext} disabled={nextDisabled} style={{
        padding: "12px 32px", borderRadius: 6, border: "none",
        background: nextDisabled ? "#a0aec0" : "#2a8fc1", color: "#fff",
        fontSize: 16, fontWeight: 600, cursor: nextDisabled ? "not-allowed" : "pointer",
      }}>{nextLabel}</button>
    </div>
  );
}

/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function SurveyApp() {
  const [step, setStep] = useState(0);

  const [prolificId, setProlificId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [designExp, setDesignExp] = useState("");
  const [colorVision, setColorVision] = useState("");
  const [nativeLang, setNativeLang] = useState("");
  const [otherLang, setOtherLang] = useState("");
  const [comments, setComments] = useState("");

  // Randomly pick which round to repeat
  const repeatIdx = useMemo(() => Math.floor(Math.random() * UNIQUE_ROUNDS), []);
  const TOTAL_ROUNDS = UNIQUE_ROUNDS + 1;

  // Map: 1=bar, 2=line, 3=pie, 4=bubble
  const roundTypeMap = { 0: 1, 1: 2, 2: 3, 3: 4 };

  const allRoundData = useMemo(() => {
    const rounds = [...baseRoundData];
    const repeated = baseRoundData[repeatIdx];
    const repeatRound = {
      id: UNIQUE_ROUNDS + 1,
      label: repeated.label,
      repeatsRound: repeatIdx + 1,
      roundType: roundTypeMap[repeatIdx],
      charts: repeated.charts.map((c) => ({ ...c, id: `rep_${c.id}` })),
    };

    // Add roundType to base rounds
    const allWithType = rounds.map((r, i) => ({ ...r, roundType: roundTypeMap[i] }));
    allWithType.push(repeatRound);

    // Shuffle until no adjacent rounds have the same roundType
    const hasAdjacentDupe = (arr) => {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].roundType === arr[i + 1].roundType) return true;
      }
      return false;
    };

    let attempts = 0;
    let shuffled = shuffle(allWithType);
    while (hasAdjacentDupe(shuffled) && attempts < 100) {
      shuffled = shuffle(allWithType);
      attempts++;
    }

    return shuffled;
  }, [repeatIdx]);

  const [profRankings, setProfRankings] = useState(() =>
    allRoundData.map((r) => shuffle([...r.charts]))
  );
  const [profExplanations, setProfExplanations] = useState(Array(TOTAL_ROUNDS).fill(""));

  const [trustRankings, setTrustRankings] = useState(() =>
    allRoundData.map((r) => shuffle([...r.charts]))
  );
  const [trustExplanations, setTrustExplanations] = useState(Array(TOTAL_ROUNDS).fill(""));

  // ── Round timing ──
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [roundTimings, setRoundTimings] = useState(Array(TOTAL_ROUNDS).fill(0));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Google Apps Script Web App URL — replace after deploying
  const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  const collectData = useCallback(() => ({
    prolificId, age, gender, education, designExp, colorVision,
    nativeLang: nativeLang === "Other" ? otherLang : nativeLang,
    repeatRound: roundTypeMap[repeatIdx],
    roundOrder: allRoundData.map((r) => r.roundType),
    roundTimings: roundTimings.map((t) => Math.round(t / 1000)), // seconds
    rounds: allRoundData.map((r, i) => ({
      round: i + 1,
      roundType: r.roundType,
      repeatsRound: r.repeatsRound || null,
      professional: { order: profRankings[i].map((c) => c.id), explanation: profExplanations[i] },
      trust: { order: trustRankings[i].map((c) => c.id), explanation: trustExplanations[i] },
    })),
    comments,
    submittedAt: new Date().toISOString(),
  }), [prolificId, age, gender, education, designExp, colorVision, nativeLang, otherLang, repeatIdx, roundTimings, allRoundData, profRankings, profExplanations, trustRankings, trustExplanations, comments]);

  const rankingStart = 2;
  const rankingEnd = rankingStart + TOTAL_ROUNDS - 1;

  const next = () => {
    setStep((s) => {
      const nextStep = s + 1;
      // Start timer when entering a ranking round
      if (nextStep >= rankingStart && nextStep <= rankingEnd) {
        setRoundStartTime(Date.now());
      }
      // Record time when leaving a ranking round
      if (s >= rankingStart && s <= rankingEnd && roundStartTime) {
        const ri = s - rankingStart;
        setRoundTimings((prev) => {
          const copy = [...prev];
          copy[ri] = Date.now() - roundStartTime;
          return copy;
        });
      }
      return nextStep;
    });
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep((s) => {
      const prevStep = s - 1;
      // Restart timer if going back to a ranking round
      if (prevStep >= rankingStart && prevStep <= rankingEnd) {
        setRoundStartTime(Date.now());
      }
      return prevStep;
    });
    window.scrollTo(0, 0);
  };

  const submitToGoogle = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const data = collectData();
    console.log("Survey data:", JSON.stringify(data, null, 2));

    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      console.warn("Google Apps Script URL not set — data logged to console only.");
      setSubmitting(false);
      next();
      return;
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitting(false);
      next();
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const inputStyle = {
    display: "block", width: "100%", marginTop: 8,
    padding: "10px 14px", borderRadius: 6,
    border: "1px solid #cbd5e0", fontSize: 15,
    outline: "none", boxSizing: "border-box",
  };

  /* ─── STEP 0: Consent ─── */
  if (step === 0) {
    return (
      <Page>
        <div style={{
          background: "#fff", borderRadius: 12, padding: "40px 36px",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #e8ecf1",
          maxWidth: 700, margin: "0 auto",
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a202c", margin: "0 0 24px" }}>
            Visualization Style Study — Consent
          </h1>
          <div style={{ color: "#4a5568", lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>
            <p>Thank you for your interest in this study. You will be shown different versions of the same data visualization and asked to rank them based on their visual style. The study takes approximately 15–20 minutes.</p>
            <p style={{ marginTop: 12 }}>Your participation is voluntary. You may withdraw at any time without penalty. All data will be stored anonymously using your Prolific ID.</p>
            <p style={{ marginTop: 12 }}>By clicking <strong>"I Consent"</strong> below, you confirm that you have read and understood this information and agree to participate.</p>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 14 }}>
              Prolific ID <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <input type="text" placeholder="e.g. 5f3c2a1b..." value={prolificId}
              onChange={(e) => setProlificId(e.target.value)} style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#2a8fc1"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={next} disabled={!prolificId.trim()} style={{
              padding: "10px 24px", borderRadius: 6, border: "none",
              background: !prolificId.trim() ? "#a0aec0" : "#2a8fc1",
              color: "#fff", fontWeight: 600, fontSize: 15,
              cursor: !prolificId.trim() ? "not-allowed" : "pointer",
            }}>I Consent</button>
            <button style={{
              padding: "10px 24px", borderRadius: 6, border: "none",
              background: "transparent", color: "#718096", fontSize: 15, cursor: "pointer",
            }}>I Do Not Consent</button>
          </div>
        </div>
      </Page>
    );
  }

  /* ─── STEP 1: Welcome + Instructions ─── */
  if (step === 1) {
    return (
      <Page>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#4a5568", margin: "0 0 24px" }}>Welcome!</h1>
          <div style={{ color: "#6b7a8d", fontSize: 17, lineHeight: 1.75, marginBottom: 32 }}>
            <p>In this study, you will be shown different versions of the same data visualization. The only difference between them will be the visual style.</p>
            <p style={{ marginTop: 20 }}>Your task is to rank each set of seven charts based on two criteria: how <strong>professional</strong> and how <strong>trustworthy</strong> each chart looks. Please ignore the data content and focus solely on the design elements. You will complete {TOTAL_ROUNDS} rounds.</p>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 24 }}>
            <p style={{ color: "#6b7a8d", fontSize: 16, lineHeight: 1.75 }}>
              In each round you will rank the same set of charts twice — once for <strong>professionalism</strong> and once for <strong>trust</strong>. Drag charts to reorder them. Click the ⤢ icon on any chart to see it enlarged.
            </p>
          </div>
          <Nav showBack={false} onNext={next} nextLabel="Begin →" />
        </div>
      </Page>
    );
  }

  /* ─── STEPS 2+: Ranking rounds ─── */
  if (step >= rankingStart && step <= rankingEnd) {
    const ri = step - rankingStart;
    const canProceed = profExplanations[ri].trim().length > 0 && trustExplanations[ri].trim().length > 0;

    return (
      <Page>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{
            fontSize: 12, color: "#2a8fc1", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1,
            background: "#e8f4fb", padding: "4px 10px", borderRadius: 4,
          }}>Round {ri + 1} of {TOTAL_ROUNDS}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: TOTAL_ROUNDS }, (_, di) => (
              <div key={di} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: di <= ri ? "#2a8fc1" : "#e2e8f0",
              }} />
            ))}
          </div>
        </div>

        {/* TASK A: Professional */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#2d3748", margin: "0 0 12px" }}>
            Task A: Rank by Professionalism
          </h2>
          <TaskInstructions keyword="professional" color="#2a8fc1" />
          <DragChartRow
            items={profRankings[ri]}
            setItems={(o) => { const c = [...profRankings]; c[ri] = o; setProfRankings(c); }}
            accentColor="#2a8fc1"
          />
          <div style={{ marginTop: 20 }}>
            <label style={{ fontWeight: 600, color: "#4a5568", fontSize: 14 }}>
              Please briefly explain why you made this ranking decision. What specific visual features influenced your decision? <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <textarea value={profExplanations[ri]}
              onChange={(e) => { const c = [...profExplanations]; c[ri] = e.target.value; setProfExplanations(c); }}
              rows={3} placeholder="e.g. I ranked Chart A highest because of its clean typography and consistent spacing..."
              style={{ ...inputStyle, marginTop: 8, resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => e.target.style.borderColor = "#2a8fc1"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"} />
            {!profExplanations[ri].trim() && (
              <p style={{ fontSize: 12, color: "#e53e3e", margin: "4px 0 0" }}>This field is required.</p>
            )}
          </div>
        </div>

        <div style={{ borderTop: "2px solid #e2e8f0", marginBottom: 32 }} />

        {/* TASK B: Trust */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#2d3748", margin: "0 0 12px" }}>
            Task B: Rank by Trust
          </h2>
          <TaskInstructions keyword="trustworthy" color="#38a169" />
          <DragChartRow
            items={trustRankings[ri]}
            setItems={(o) => { const c = [...trustRankings]; c[ri] = o; setTrustRankings(c); }}
            accentColor="#38a169"
          />
          <div style={{ marginTop: 20 }}>
            <label style={{ fontWeight: 600, color: "#4a5568", fontSize: 14 }}>
              Please briefly explain why you made this ranking decision. What specific visual features influenced your decision? <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <textarea value={trustExplanations[ri]}
              onChange={(e) => { const c = [...trustExplanations]; c[ri] = e.target.value; setTrustExplanations(c); }}
              rows={3} placeholder="e.g. I ranked Chart C highest because its restrained color palette and clear labels feel reliable..."
              style={{ ...inputStyle, marginTop: 8, resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => e.target.style.borderColor = "#38a169"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"} />
            {!trustExplanations[ri].trim() && (
              <p style={{ fontSize: 12, color: "#e53e3e", margin: "4px 0 0" }}>This field is required.</p>
            )}
          </div>
        </div>

        <Nav showBack onBack={back}
          onNext={next}
          nextLabel={ri < TOTAL_ROUNDS - 1 ? "Next Round →" : "Continue →"}
          nextDisabled={!canProceed} />
      </Page>
    );
  }

  /* ─── About You ─── */
  const aboutStep = rankingEnd + 1;
  if (step === aboutStep) {
    const canProceed = age && gender && education && designExp && colorVision && nativeLang && (nativeLang !== "Other" || otherLang.trim());
    return (
      <Page>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a202c", margin: "0 0 6px" }}>About You</h2>
          <p style={{ color: "#718096", fontSize: 15, margin: "0 0 32px" }}>Almost done! Please answer the following questions.</p>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              What is your age range? <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <select value={age} onChange={(e) => setAge(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
              <option value="">Select...</option>
              <option>18–24</option><option>25–34</option><option>35–44</option>
              <option>45–54</option><option>55–64</option><option>65+</option>
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              Please select your gender. <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <RadioGroup name="gender" options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                value={gender} onChange={setGender} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              Please select your highest level of completed education. <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <RadioGroup name="education"
                options={["High School Diploma / GED", "Associate Degree", "Bachelors Degree", "Masters Degree", "Doctorate Degree"]}
                value={education} onChange={setEducation} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              Please rate your familiarity with design and visual presentation of data. <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <RadioGroup name="designExp" options={[
                "I have no experience with design or visualizations.",
                "I have some experience with design or visualizations.",
                "I am experienced in creating visual designs and/or visualizations.",
              ]} value={designExp} onChange={setDesignExp} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              Do you have any difficulty distinguishing colors (e.g., red vs. green)? <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <RadioGroup name="colorVision" options={[
                "No, I do not have color vision problems",
                "Yes, I am color-blind (difficulty distinguishing some colors)",
                "Yes, I have other color vision deficiencies (e.g., color-weak)",
                "Prefer not to say",
              ]} value={colorVision} onChange={setColorVision} />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>What is your native language? <span style={{ color: "#e53e3e" }}>*</span></label>
            <select value={nativeLang} onChange={(e) => setNativeLang(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
              <option value="">Select...</option>
              <option value="English">English</option>
              <option value="Other">Other</option>
            </select>
            {nativeLang === "Other" && (
              <input type="text" placeholder="Please specify your native language"
                value={otherLang} onChange={(e) => setOtherLang(e.target.value)}
                style={{ ...inputStyle, marginTop: 10 }}
                onFocus={(e) => e.target.style.borderColor = "#2a8fc1"}
                onBlur={(e) => e.target.style.borderColor = "#cbd5e0"} />
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
              Please include any additional comments below. (optional)
            </label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
              style={{ ...inputStyle, marginTop: 10, resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => e.target.style.borderColor = "#2a8fc1"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"} />
          </div>

          <Nav showBack onBack={back} onNext={submitToGoogle}
            nextLabel={submitting ? "Submitting..." : "Submit"}
            nextDisabled={!canProceed || submitting} />
          {submitError && (
            <p style={{ color: "#e53e3e", fontSize: 14, marginTop: 8, textAlign: "right" }}>{submitError}</p>
          )}
        </div>
      </Page>
    );
  }

  /* ─── Thank You ─── */
  return (
    <Page>
      <div style={{ textAlign: "center", paddingTop: 60, maxWidth: 540, margin: "0 auto" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "#e8f8ee",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a202c", margin: "0 0 12px" }}>
          Thank you for your participation!
        </h1>
        <p style={{ color: "#718096", fontSize: 16, lineHeight: 1.6 }}>
          Your responses have been recorded successfully. You may now close this window or return to Prolific.
        </p>
        <div style={{
          marginTop: 32, padding: "14px 24px", background: "#f7f8fa",
          borderRadius: 8, display: "inline-block", color: "#4a5568", fontSize: 14,
        }}>
          Prolific ID: <strong>{prolificId}</strong>
        </div>
      </div>
    </Page>
  );
}
