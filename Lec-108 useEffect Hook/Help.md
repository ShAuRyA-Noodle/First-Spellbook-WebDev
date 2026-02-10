# 🌟 React + Vite Quick Notes (Shaurya Edition) 🌟

## 🚀 Creating a Project
- `npm create vite@latest` → Makes a new React project **in the folder you’re in** (no extra nesting nonsense ✨).
- `code -r Project` → Opens that project in VS Code like a boss 💻.

---

## 🪄 useEffect Hook
- Think of **useEffect** as React’s “after party” 🎉 → it runs side effects (API calls, alerts, etc.) after rendering.  
- Side effect = *“Do this extra thing after the UI is done”*.

---

## 😵 Why Alert Pops Twice?
- Blame **React Strict Mode** 🧐.
- In dev mode, React runs stuff **twice**:
  1. Practice run 🏃‍♂️
  2. Real run 🎯
- This helps catch bugs early, but makes alerts go *“SURPRISE x2”*.

---
💡 Tip: It won’t double-run in production, so chill 😌.
