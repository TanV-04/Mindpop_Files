// frontend/src/pages/games/BalloonPop.jsx
// Key fix: use refs to track score/missed/combo/difficulty so endGame reads
// the LATEST values (React state closures capture stale values in async callbacks)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { progressService } from '../../utils/apiService';
import './BalloonPop.css';

// ─── Age-based configuration ──────────────────────────────────────────
const getGameConfig = (age) => {
  if      (age >= 6  && age <= 8)  return { ageGroup: '6-8',   baseSpeed: 0.8, spawnRate: 2000, speedIncrease: 0.15 };
  else if (age >= 9  && age <= 10) return { ageGroup: '8-10',  baseSpeed: 1.2, spawnRate: 1700, speedIncrease: 0.20 };
  else if (age >= 11 && age <= 12) return { ageGroup: '10-12', baseSpeed: 1.5, spawnRate: 1500, speedIncrease: 0.25 };
  else                             return { ageGroup: '12-14', baseSpeed: 1.8, spawnRate: 1300, speedIncrease: 0.30 };
};

const BALLOON_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#FF9F1C', '#C77DFF'];
const TOTAL_GAME_TIME = 60; // seconds

const BalloonPop = () => {
  const navigate = useNavigate();
  const gameAreaRef     = useRef(null);
  const balloonIdRef    = useRef(0);
  const lastSpawnRef    = useRef(0);
  const animFrameRef    = useRef(null);

  // ── Live refs for stale-closure-safe progress saving ─────────────
  const scoreRef        = useRef(0);
  const missedRef       = useRef(0);
  const maxComboRef     = useRef(0);
  const difficultyRef   = useRef(1);

  // ── State ─────────────────────────────────────────────────────────
  const [gameState,       setGameState]       = useState('start');
  const [balloons,        setBalloons]        = useState([]);
  const [score,           setScore]           = useState(0);
  const [missed,          setMissed]          = useState(0);
  const [combo,           setCombo]           = useState(0);
  const [maxCombo,        setMaxCombo]        = useState(0);
  const [timeLeft,        setTimeLeft]        = useState(TOTAL_GAME_TIME);
  const [difficulty,      setDifficulty]      = useState(1);
  const [popEffects,      setPopEffects]      = useState([]);
  const [userAge,         setUserAge]         = useState(8);
  const [config,          setConfig]          = useState(getGameConfig(8));
  const [saveError,       setSaveError]       = useState(null);
  const [isSaving,        setIsSaving]        = useState(false);
  const [finalStats,      setFinalStats]      = useState(null);

  // ── Load user age on mount ────────────────────────────────────────
  useEffect(() => {
    const user   = JSON.parse(localStorage.getItem('user') || '{}');
    const age    = user.age || 8;
    const cfg    = getGameConfig(age);
    setUserAge(age);
    setConfig(cfg);
  }, []);

  // ── Game timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) { endGame(); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // ── Difficulty auto-scaling ───────────────────────────────────────
  useEffect(() => {
    const total = score + missed;
    if (total > 0) {
      const accuracy = (score / total) * 100;
      if (accuracy > 75 && score > 0 && score % 15 === 0) {
        setDifficulty((prev) => {
          const next = Math.min(prev + 1, 3);
          difficultyRef.current = next;
          return next;
        });
      }
    }
  }, [score, missed]);

  // ── Balloon spawning ──────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawnInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastSpawnRef.current >= config.spawnRate / difficultyRef.current) {
        spawnBalloon();
        lastSpawnRef.current = now;
      }
    }, 100);
    return () => clearInterval(spawnInterval);
  }, [gameState, config]);

  const spawnBalloon = useCallback(() => {
    if (!gameAreaRef.current) return;
    const areaWidth   = gameAreaRef.current.offsetWidth;
    const balloonSize = 80;
    setBalloons((prev) => [
      ...prev,
      {
        id:    balloonIdRef.current++,
        x:     Math.random() * (areaWidth - balloonSize),
        y:     window.innerHeight,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        speed: config.baseSpeed + (difficultyRef.current - 1) * config.speedIncrease,
        popped: false,
      },
    ]);
  }, [config]);

  // ── Balloon movement ──────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const tick = () => {
      setBalloons((prev) => {
        return prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => {
            if (b.y < -100 && !b.popped) {
              setMissed((m) => {
                const next = m + 1;
                missedRef.current = next;
                return next;
              });
              setCombo(0);
              return false;
            }
            return b.y > -100;
          });
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState]);

  // ── Pop a balloon ─────────────────────────────────────────────────
  const popBalloon = useCallback((id, x, y, color) => {
    setBalloons((prev) => prev.map((b) => (b.id === id ? { ...b, popped: true } : b)));
    setTimeout(() => setBalloons((prev) => prev.filter((b) => b.id !== id)), 100);

    setScore((s) => { const next = s + 1; scoreRef.current = next; return next; });
    setCombo((c) => {
      const next = c + 1;
      setMaxCombo((mx) => {
        const newMax = Math.max(mx, next);
        maxComboRef.current = newMax;
        return newMax;
      });
      return next;
    });

    // Pop visual effect
    const effectId = Date.now() + Math.random();
    setPopEffects((prev) => [...prev, { id: effectId, x, y, color }]);
    setTimeout(() => setPopEffects((prev) => prev.filter((e) => e.id !== effectId)), 600);
  }, []);

  // ── End game – ALWAYS reads from refs, not stale state ────────────
  const endGame = useCallback(async () => {
    setGameState('finished');
    cancelAnimationFrame(animFrameRef.current);

    const finalScore    = scoreRef.current;
    const finalMissed   = missedRef.current;
    const finalMaxCombo = maxComboRef.current;
    const finalDiff     = difficultyRef.current;
    const accuracy      = finalScore + finalMissed > 0
      ? Math.round((finalScore / (finalScore + finalMissed)) * 1000) / 10
      : 0;

    // Cache stats for results screen before async save
    setFinalStats({ finalScore, finalMissed, finalMaxCombo, accuracy });

    const user     = JSON.parse(localStorage.getItem('user') || '{}');
    const userAge  = user.age || 8;
    const cfg      = getGameConfig(userAge);

    const progressPayload = {
      gameType:         'balloon',
      completionTime:   TOTAL_GAME_TIME,
      level:            finalDiff,
      accuracy,
      ageGroup:         cfg.ageGroup,
      balloonsPopped:   finalScore,
      balloonsMissed:   finalMissed,
      maxCombo:         finalMaxCombo,
      finalScore,
      difficultyReached: finalDiff,
      sessionAccuracy:  accuracy,
    };

    setIsSaving(true);
    try {
      await progressService.saveGameProgress(progressPayload);
    } catch (err) {
      console.error('Failed to save balloon progress:', err);
      setSaveError('Progress could not be saved. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Start / Restart ───────────────────────────────────────────────
  const startGame = () => {
    scoreRef.current    = 0;
    missedRef.current   = 0;
    maxComboRef.current = 0;
    difficultyRef.current = 1;

    setGameState('playing');
    setScore(0); setMissed(0); setCombo(0); setMaxCombo(0);
    setTimeLeft(TOTAL_GAME_TIME);
    setDifficulty(1);
    setBalloons([]); setPopEffects([]);
    setSaveError(null); setFinalStats(null);
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="balloon-game-container">
      {/* START */}
      {gameState === 'start' && (
        <motion.div className="game-screen start-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="start-content">
            <h1 className="game-title quicksand">🎈 Balloon Pop!</h1>
            <p className="game-instructions">Pop as many balloons as you can in 60 seconds!</p>
            <p className="game-instructions">Click on the balloons before they float away!</p>
            <div className="difficulty-info">
              <p>Age: {userAge} years</p>
              <p>Age Group: {config.ageGroup}</p>
            </div>
            <button className="start-button quicksand" onClick={startGame}>Start Playing!</button>
            <button className="back-button quicksand" onClick={() => navigate('/games')}>← Back to Games</button>
          </div>
        </motion.div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && (
        <div className="game-screen playing-screen">
          <div className="game-stats">
            <div className="stat-item"><span className="stat-label">Score</span><span className="stat-value">{score}</span></div>
            <div className="stat-item"><span className="stat-label">Time</span><span className="stat-value">{timeLeft}s</span></div>
            <div className="stat-item"><span className="stat-label">Combo</span><span className="stat-value combo-value">x{combo}</span></div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">
                {score + missed > 0 ? Math.round((score / (score + missed)) * 100) : 100}%
              </span>
            </div>
          </div>

          <div className="game-area" ref={gameAreaRef}>
            <AnimatePresence>
              {balloons.map((balloon) => (
                <motion.div
                  key={balloon.id}
                  className="balloon-hitbox"
                  style={{ left: `${balloon.x - 20}px`, bottom: `${window.innerHeight - balloon.y - 20}px` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: balloon.popped ? 0 : 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => popBalloon(balloon.id, balloon.x, balloon.y, balloon.color)}
                >
                  <div className="balloon" style={{ backgroundColor: balloon.color }}>
                    <div className="balloon-string" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {popEffects.map((effect) => (
                <motion.div
                  key={effect.id}
                  className="pop-effect"
                  style={{ left: `${effect.x + 40}px`, bottom: `${window.innerHeight - effect.y}px`, color: effect.color }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  💥
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {gameState === 'finished' && (
        <motion.div className="game-screen finished-screen" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="finished-content">
            <h1 className="game-title quicksand">🎉 Great Job!</h1>

            {isSaving && <p className="saving-indicator">💾 Saving your progress...</p>}
            {saveError && (
              <div className="error-message" style={{ background: '#FEE', color: '#C33', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '2px solid #C33' }}>
                {saveError}
              </div>
            )}

            {finalStats && (
              <div className="final-stats">
                <div className="final-stat">
                  <span className="final-stat-label">🏆 Final Score</span>
                  <span className="final-stat-value">{finalStats.finalScore}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">🎈 Balloons Popped</span>
                  <span className="final-stat-value">{finalStats.finalScore}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">💨 Missed</span>
                  <span className="final-stat-value">{finalStats.finalMissed}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">🔥 Max Combo</span>
                  <span className="final-stat-value">x{finalStats.finalMaxCombo}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">🎯 Accuracy</span>
                  <span className="final-stat-value">{finalStats.accuracy}%</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">⬆️ Difficulty Reached</span>
                  <span className="final-stat-value">Level {difficultyRef.current}</span>
                </div>
              </div>
            )}

            <div className="finished-buttons">
              <button className="start-button quicksand" onClick={startGame}>Play Again! 🎈</button>
              <button className="back-button quicksand" onClick={() => navigate('/games')}>← Back to Games</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BalloonPop;
