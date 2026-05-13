export const TOTAL_QUESTIONS = 10;
export const POINTS_PER_CORRECT = 10;

export const GAME_MODES = [
  {
    id: 1,
    label: "➕ Сабирање до 10",
    emoji: "🐣",
    color: "#FF6B6B",
    bg: "#FFF0F0",
    type: "add",
    max: 10,
    carry: false,
    subtractTen: false,
  },
  {
    id: 2,
    label: "➕ Сабирање до 20",
    emoji: "🐥",
    color: "#FF9F43",
    bg: "#FFF5E6",
    type: "add",
    max: 20,
    carry: true,
    subtractTen: false,
  },
  {
    id: 3,
    label: "➕ до 100 без прелаза",
    emoji: "🦊",
    color: "#F9CA24",
    bg: "#FFFAE6",
    type: "add",
    max: 100,
    carry: false,
    subtractTen: false,
  },
  {
    id: 4,
    label: "➕ до 100 са прелазом",
    emoji: "🦁",
    color: "#6AB04C",
    bg: "#F0FFF0",
    type: "add",
    max: 100,
    carry: true,
    subtractTen: false,
  },
  {
    id: 5,
    label: "➖ Одузимање до 10",
    emoji: "🐢",
    color: "#22A6B3",
    bg: "#E6F9FF",
    type: "sub",
    max: 10,
    carry: false,
    subtractTen: false,
  },
  {
    id: 6,
    label: "➖ Одузимање до 20",
    emoji: "🦋",
    color: "#4834D4",
    bg: "#EEF0FF",
    type: "sub",
    max: 20,
    carry: true,
    subtractTen: false,
  },
  {
    id: 7,
    label: "➖ десетица од 100 ",
    emoji: "🦅",
    color: "#BE2EDD",
    bg: "#FAF0FF",
    type: "sub",
    max: 100,
    carry: false,
    subtractTen: true,
  },
];

function generateQuestion(mode) {
  let a, b, answer;

  if (mode.type === "add") {
    if (mode.carry === false && mode.max === 100) {
      const a_tens = Math.floor(Math.random() * 9) * 10;
      const b_tens = Math.floor(Math.random() * ((90 - a_tens) / 10 + 1)) * 10;
      const a_units = Math.floor(Math.random() * 9) + 1;
      const b_units = Math.floor(Math.random() * (9 - a_units + 1));
      a = a_tens + a_units;
      b = b_tens + b_units;
      if (a === 0) a = 1;
    } else if (mode.carry && mode.max === 100) {
      do {
        a = Math.floor(Math.random() * (mode.max - 1)) + 1;
        b = Math.floor(Math.random() * (mode.max - a)) + 1;
      } while (a + b > mode.max || (a % 10) + (b % 10) < 10);
    } else {
      do {
        a = Math.floor(Math.random() * (mode.max - 1)) + 1;
        b = Math.floor(Math.random() * (mode.max - a)) + 1;
      } while (a + b > mode.max || b === 0);
    }
    answer = a + b;
  } else {
    if (mode.subtractTen) {
      a = 100;
      b = (Math.floor(Math.random() * 9) + 1) * 10;
    } else if (mode.carry && mode.max === 20) {
      do {
        a = Math.floor(Math.random() * (mode.max - 1)) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
      } while (a - b < 0 || a % 10 < b % 10);
    } else {
      do {
        a = Math.floor(Math.random() * (mode.max - 1)) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
      } while (a - b < 0);
    }
    answer = a - b;
  }

  const offsets = [2, 3, -2, -3].sort(() => Math.random() - 0.5);
  const wrongs = [];
  for (const off of offsets) {
    const w = answer + off;
    if (w >= 0 && w <= 100 && w !== answer && !wrongs.includes(w)) {
      wrongs.push(w);
      if (wrongs.length === 2) break;
    }
  }
  while (wrongs.length < 2) {
    const fallback = answer + (wrongs.length === 0 ? 2 : -2);
    if (
      fallback >= 0 &&
      fallback <= 100 &&
      fallback !== answer &&
      !wrongs.includes(fallback)
    )
      wrongs.push(fallback);
    else wrongs.push(answer - (wrongs.length === 0 ? 2 : 3));
  }

  const choices = [answer, wrongs[0], wrongs[1]].sort(
    () => Math.random() - 0.5,
  );
  return { a, b, answer, choices, op: mode.type === "add" ? "+" : "−" };
}

export function generateQuestions(mode) {
  return Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(mode));
}
