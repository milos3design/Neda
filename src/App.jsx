import { useState, useEffect, useCallback } from "react";
import {
  GAME_MODES,
  TOTAL_QUESTIONS,
  POINTS_PER_CORRECT,
  generateQuestions,
} from "./utils/gameLogic";
import { styles } from "./styles";

const STARS = Array.from({ length: 20 }, (_, i) => {
  const size = `${6 + Math.random() * 10}px`;
  return {
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 4}s`,
    width: size,
    height: size,
    opacity: 0.15 + Math.random() * 0.3,
  };
});

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | game | result
  const [selectedMode, setSelectedMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const handleAnswer = useCallback(
    (choice) => {
      if (chosen !== null) return;
      setTimerActive(false);
      setChosen(choice);
      const q = questions[current];
      const correct = choice === q.answer;
      if (correct) {
        setScore((s) => s + POINTS_PER_CORRECT);
        setBounce(true);
        setTimeout(() => setBounce(false), 600);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      const usedTime = 30 - timeLeft;
      setTotalTime((t) => t + usedTime);
      setAnswers((prev) => [...prev, { q, choice, correct, time: usedTime }]);

      setTimeout(() => {
        if (current + 1 < TOTAL_QUESTIONS) {
          setCurrent((c) => c + 1);
          setChosen(null);
          setTimeLeft(30);
          setTimerActive(true);
        } else {
          setScreen("result");
        }
      }, 900);
    },
    [chosen, questions, current, timeLeft],
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimeout(() => handleAnswer(null), 0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, handleAnswer]);

  const startGame = (mode) => {
    const qs = generateQuestions(mode);
    setSelectedMode(mode);
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setChosen(null);
    setTimeLeft(30);
    setTotalTime(0);
    setAnswers([]);
    setTimerActive(true);
    setScreen("game");
  };

  const timerColor =
    timeLeft > 15 ? "#6AB04C" : timeLeft > 7 ? "#FF9F43" : "#FF6B6B";
  const timerPct = (timeLeft / 30) * 100;

  return (
    <div style={styles.root}>
      {/* Stars background */}
      <div style={styles.starsLayer}>
        {STARS.map((s) => (
          <div
            key={s.id}
            style={{
              ...styles.star,
              left: s.left,
              top: s.top,
              animationDelay: s.animationDelay,
              width: s.width,
              height: s.height,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {screen === "menu" && (
        <div style={styles.menuWrap}>
          <div style={styles.titleBlock}>
            <div style={styles.titleEmoji}>🧮</div>
            <h1 style={styles.title}>Недина Вежбанка</h1>
            <p style={styles.subtitle}>Изабери своју игру!</p>
          </div>
          <div
            style={{
              ...styles.modeGrid,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                style={{
                  ...styles.modeCard,
                  background: mode.bg,
                  borderColor: mode.color,
                }}
                onClick={() => startGame(mode)}
              >
                <span style={styles.modeEmoji}>{mode.emoji}</span>
                <span style={{ ...styles.modeLabel, color: mode.color }}>
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === "game" && questions.length > 0 && (
        <div style={styles.gameWrap}>
          {/* Header */}
          <div style={styles.gameHeader}>
            <button style={styles.backBtn} onClick={() => setScreen("menu")}>
              ← Почетна
            </button>
            <div style={styles.scoreBox}>
              ⭐ <span style={styles.scoreNum}>{score}</span>{" "}
              <span style={styles.scoreMax}>
                / {TOTAL_QUESTIONS * POINTS_PER_CORRECT}
              </span>
            </div>
            <div style={styles.questionCount}>
              {current + 1} / {TOTAL_QUESTIONS}
            </div>
          </div>

          {/* Timer bar */}
          <div style={styles.timerBar}>
            <div
              style={{
                ...styles.timerFill,
                width: `${timerPct}%`,
                background: timerColor,
                transition: "width 1s linear, background 0.5s",
              }}
            />
            <span style={{ ...styles.timerText, color: timerColor }}>
              {timeLeft}s
            </span>
          </div>

          {/* Question card */}
          <div
            style={{
              ...styles.questionCard,
              animation: shake
                ? "shake 0.4s ease"
                : bounce
                  ? "bounce 0.5s ease"
                  : "fadeIn 0.3s ease",
            }}
          >
            <div style={styles.questionText}>
              <span style={styles.qNum}>{questions[current].a}</span>
              <span style={styles.qOp}>{questions[current].op}</span>
              <span style={styles.qNum}>{questions[current].b}</span>
              <span style={styles.qEq}>=</span>
              <span style={styles.qAnswer}>?</span>
            </div>
          </div>

          {/* Choices */}
          <div style={styles.choicesWrap}>
            {questions[current].choices.map((c, i) => {
              const isCorrect = c === questions[current].answer;
              const isChosen = c === chosen;
              let bg = "#fff";
              let border = "3px solid #E0E0E0";
              let color = "#333";
              if (chosen !== null) {
                if (isCorrect) {
                  bg = "#D4EDDA";
                  border = "3px solid #6AB04C";
                  color = "#2D6A4F";
                } else if (isChosen && !isCorrect) {
                  bg = "#FDECEA";
                  border = "3px solid #FF6B6B";
                  color = "#C0392B";
                }
              }
              return (
                <button
                  key={i}
                  style={{ ...styles.choiceBtn, background: bg, border, color }}
                  onClick={() => handleAnswer(c)}
                  disabled={chosen !== null}
                >
                  <span
                    style={{
                      color: ["#FF6B6B", "#4834D4", "#F9CA24"][i],
                      fontSize: 12,
                      verticalAlign: "middle",
                      position: "relative",
                      top: "-2px",
                    }}
                  >
                    =
                  </span>{" "}
                  {c}
                </button>
              );
            })}
          </div>

          {/* Mode label */}
          <div
            style={{
              ...styles.modePill,
              background: selectedMode.bg,
              color: selectedMode.color,
              borderColor: selectedMode.color,
            }}
          >
            {selectedMode.emoji} {selectedMode.label}
          </div>
        </div>
      )}

      {screen === "result" && (
        <div style={styles.resultWrap}>
          <div style={styles.resultCard}>
            <div style={styles.trophyEmoji}>
              {score >= 90
                ? "🏆"
                : score >= 60
                  ? "🥈"
                  : score >= 30
                    ? "🥉"
                    : "💪"}
            </div>
            <h2 style={styles.resultTitle}>
              {score >= 90
                ? "Одлично!"
                : score >= 60
                  ? "Браво!"
                  : score >= 30
                    ? "Добро!"
                    : "Бежбај даље!"}
            </h2>
            <div style={styles.resultStats}>
              <div style={styles.statBox}>
                <div style={styles.statVal}>{score}</div>
                <div style={styles.statLabel}>Поена</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statVal}>
                  {answers.filter((a) => a.correct).length}
                </div>
                <div style={styles.statLabel}>Тачно</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statVal}>{totalTime}s</div>
                <div style={styles.statLabel}>Време</div>
              </div>
            </div>

            <div style={styles.answerList}>
              {answers.map((a, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.answerRow,
                    background: a.correct ? "#D4EDDA" : "#FDECEA",
                  }}
                >
                  <span style={styles.answerIcon}>
                    {a.correct ? "✅" : "❌"}
                  </span>
                  <span style={styles.answerQ}>
                    {a.q.a} {a.q.op} {a.q.b} = {a.q.answer}
                  </span>
                  {!a.correct && a.choice !== null && (
                    <span style={styles.answerWrong}>Ti: {a.choice}</span>
                  )}
                  {a.choice === null && (
                    <span style={styles.answerWrong}>Vreme!</span>
                  )}
                  <span style={styles.answerTime}>{a.time}s</span>
                </div>
              ))}
            </div>

            <div style={styles.resultBtns}>
              <button
                style={styles.playAgainBtn}
                onClick={() => startGame(selectedMode)}
              >
                🔄 Играј поново
              </button>
              <button style={styles.menuBtn} onClick={() => setScreen("menu")}>
                🏠 Почетна
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }
        @keyframes twinkle { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.4);opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-8px)}
          80%{transform:translateX(8px)}
        }
        @keyframes bounce {
          0%,100%{transform:scale(1)}
          40%{transform:scale(1.07)}
          70%{transform:scale(0.97)}
        }
        button { cursor: pointer; font-family: 'Nunito', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      `}</style>
    </div>
  );
}
