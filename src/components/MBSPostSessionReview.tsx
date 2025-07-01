import React, { useMemo, useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { MBSTradeLog } from '../types';

interface MBSPostSessionReviewProps {
  isOpen: boolean;
  onClose: () => void;
  sessionGoal: string;
  tradeHistory: MBSTradeLog[];
  onSetNextSessionGoal: (goal: string) => void;
}

const moodEmojis = [
  { value: 1, emoji: '😡' },
  { value: 2, emoji: '😞' },
  { value: 3, emoji: '🙁' },
  { value: 4, emoji: '😐' },
  { value: 5, emoji: '🙂' },
  { value: 6, emoji: '😃' },
  { value: 7, emoji: '🤩' },
];

// --- 80 Rule-based Feedback Responses (grouped by trigger) ---
const FEEDBACK = {
  discipline: [
    "Excellent discipline—most of your trades followed your plan. Keep it up!",
    "You made money, but several trades didn't follow your plan. Focus on process over outcome.",
    "You stuck to your plan even when losing. That's the mark of a pro.",
    "You deviated from your plan after a win. Remember, consistency is key.",
    "You followed your plan less than 50% of the time. Review your playbook before your next session.",
    "You adjusted your plan mid-session. Make sure changes are intentional, not emotional.",
    "You hesitated on a setup and missed the trade. Trust your plan and act decisively.",
    "You followed your plan after a losing trade—excellent resilience.",
    "You made impulsive trades outside your playbook. Review your rules before the next session.",
    "You journaled every trade, even the ones you didn't want to. That's true discipline.",
  ],
  emotion: [
    "You logged several anxious moods after losses. Consider taking a break or reviewing your risk plan.",
    "Your mood improved after following your plan, regardless of outcome. Great self-awareness.",
    "You reported frustration after missing entries. Practice patience and wait for your setup.",
    "You felt overconfident after a win. Stay grounded and stick to your process.",
    "You traded while feeling tired or distracted. Consider skipping sessions when not 100%.",
    "You logged excitement after a win. Celebrate, but stay focused on the next trade.",
    "You felt regret after skipping a setup. Accept that not every opportunity is yours.",
    "You noticed boredom during slow markets. Use this time to review your playbook.",
    "You felt pressure to make back losses. Remember, the market will be here tomorrow.",
    "You recognized fear before entering a trade. Acknowledge it, but don't let it control your actions.",
  ],
  risk: [
    "You respected your risk limits all session. That's professional risk management.",
    "You increased size after a win. Be cautious of overconfidence and stick to your sizing rules.",
    "You hit your max loss and stopped trading. Excellent discipline.",
    "You traded more aggressively after a loss. Watch for revenge trading.",
    "You took too many trades in a short period. Consider slowing down and being more selective.",
    "You reduced size after a loss—good risk control.",
    "You risked more than planned on a single trade. Review your max risk per trade.",
    "You scaled out of winners according to your plan. Well managed.",
    "You let a loser run past your stop. Next time, honor your stop loss.",
    "You kept your daily loss within limits. That's professional risk management.",
  ],
  streaks: [
    "You had a winning streak, but discipline slipped after the third win. Stay focused.",
    "You lost three trades in a row and kept trading. Consider a break after consecutive losses.",
    "You bounced back after a losing streak by following your plan. Well done.",
    "You chased losses late in the session. Next time, step away after your max loss.",
    "You traded larger after a big win. Remember to keep your risk consistent.",
    "You stopped trading after a hot streak. Smart move to avoid overconfidence.",
    "You increased frequency after a loss. Watch for tilt and stick to your routine.",
    "You took a break after two losses. That's a pro move.",
    "You traded more after a big win. Stay consistent with your process.",
    "You recognized tilt and paused trading. Excellent self-awareness.",
  ],
  goal: [
    "You achieved your session goal—great job!",
    "You didn't meet your session goal. What can you adjust for next time?",
    "Your goal was to be patient, and your trade log shows improvement.",
    "You set a goal but didn't review it during the session. Keep your goal visible next time.",
    "You reflected thoughtfully after each trade. This habit will accelerate your growth.",
    "You set a clear, actionable goal for the session. This sets you up for success.",
    "You reviewed your goal mid-session. Great way to stay focused.",
    "You didn't set a goal today. Try to set one before your next session.",
    "You reflected on your performance honestly. This is how pros improve.",
    "You adjusted your goal after market conditions changed. Flexibility is key.",
  ],
  pattern: [
    "Most of your wins came when you were calm and followed your plan.",
    "Losing trades often happened when you ignored your checklist.",
    "You tend to lose after a big win. Watch for overtrading or overconfidence.",
    "You perform best in the first hour of your session. Consider focusing your trading there.",
    "Your mood drops after missing a setup. Accept missed trades and wait for the next opportunity.",
    "You tend to perform better after taking a break. Use this to your advantage.",
    "You lose more often when trading outside your best hours. Focus on your edge.",
    "You win more when you wait for confirmation. Patience pays.",
    "You often lose after skipping your pre-trade checklist. Don't skip your process.",
    "You perform best when you keep your mood positive. Consider a pre-session routine.",
  ],
  breaks: [
    "You took regular breaks—this helps maintain focus and discipline.",
    "You skipped breaks during a losing streak. Remember, stepping away can reset your mindset.",
    "You traded for several hours without a break. Schedule regular pauses to stay sharp.",
    "You logged feeling tired late in the session. Consider ending earlier next time.",
    "You used the gut check feature—great job staying self-aware.",
    "You took a break after a stressful trade. That's a healthy habit.",
    "You ignored the gut check prompt. Next time, use it to check in with yourself.",
    "You hydrated and stretched during your session. Small habits, big impact.",
    "You ended your session when tired. That's professional self-care.",
    "You scheduled breaks in advance. This helps maintain focus.",
  ],
  general: [
    "Your journaling is detailed and honest. This is the foundation of improvement.",
    "Consider reviewing your playbook before each session to reinforce good habits.",
    "You're building strong risk management habits. Keep tracking your discipline.",
    "Focus on process, not just P&L. The results will follow.",
    "Remember: Consistency and discipline are your edge. Keep working your plan.",
    "You're building a strong foundation. Keep journaling every session.",
    "Review your best and worst trades weekly to spot patterns.",
    "Share your journal with a mentor or peer for accountability.",
    "Remember, every session is a learning opportunity.",
    "Stay humble—markets reward discipline, not ego.",
  ],
};

function getSessionFeedback(trades: MBSTradeLog[], sessionGoal: string): string[] {
  // Heuristic triggers for each feedback group
  const total = trades.length;
  const followedPlan = trades.filter(t => t.followedPlan).length;
  const winCount = trades.filter(t => t.result === 'win').length;
  const loseCount = trades.filter(t => t.result === 'lose').length;
  const avgMood = total > 0 ? trades.reduce((sum, t) => sum + t.mood, 0) / total : 4;
  const anxiousTrades = trades.filter(t => t.mood <= 3).length;
  const breaksTaken = 0; // Placeholder, if you track breaks
  const gutChecks = 0; // Placeholder, if you track gut checks
  const streaks = (() => {
    let maxWin = 0, maxLose = 0, curWin = 0, curLose = 0;
    trades.forEach(t => {
      if (t.result === 'win') {
        curWin++; curLose = 0;
      } else {
        curLose++; curWin = 0;
      }
      maxWin = Math.max(maxWin, curWin);
      maxLose = Math.max(maxLose, curLose);
    });
    return { maxWin, maxLose };
  })();

  const bestTrade = trades.find(t => t.isBestTrade);
  const worstTrade = trades.find(t => t.isWorstTrade);

  const feedback: string[] = [];

  // Discipline
  if (followedPlan / (total || 1) > 0.8) feedback.push(FEEDBACK.discipline[0]);
  if (winCount > 0 && followedPlan / (total || 1) < 0.7) feedback.push(FEEDBACK.discipline[1]);
  if (loseCount > 0 && followedPlan / (total || 1) > 0.7) feedback.push(FEEDBACK.discipline[2]);
  if (winCount > 0 && trades.some((t, i) => t.result === 'win' && !t.followedPlan)) feedback.push(FEEDBACK.discipline[3]);
  if (followedPlan / (total || 1) < 0.5) feedback.push(FEEDBACK.discipline[4]);

  // Emotion
  if (anxiousTrades / (total || 1) > 0.3) feedback.push(FEEDBACK.emotion[0]);
  if (trades.some(t => t.followedPlan && t.mood >= 5)) feedback.push(FEEDBACK.emotion[1]);
  if (trades.some(t => t.notes && t.notes.toLowerCase().includes('miss'))) feedback.push(FEEDBACK.emotion[2]);
  if (trades.some((t, i) => t.result === 'win' && t.mood >= 6)) feedback.push(FEEDBACK.emotion[3]);
  if (trades.some(t => t.mood <= 2)) feedback.push(FEEDBACK.emotion[4]);

  // Risk
  if (trades.length > 0 && trades.every(t => t.followedPlan)) feedback.push(FEEDBACK.risk[0]);
  if (trades.some((t, i) => t.result === 'win' && i > 0 && trades[i-1].result === 'win')) feedback.push(FEEDBACK.risk[1]);
  if (loseCount > 0 && trades[trades.length-1]?.result === 'lose') feedback.push(FEEDBACK.risk[2]);
  if (trades.some((t, i) => t.result === 'lose' && i > 0 && trades[i-1].result === 'lose')) feedback.push(FEEDBACK.risk[3]);
  if (total > 10 && trades.slice(-5).filter(t => t.result === 'win').length > 3) feedback.push(FEEDBACK.risk[4]);

  // Streaks
  if (streaks.maxWin >= 3) feedback.push(FEEDBACK.streaks[0]);
  if (streaks.maxLose >= 3) feedback.push(FEEDBACK.streaks[1]);
  if (streaks.maxLose >= 2 && trades.some(t => t.followedPlan)) feedback.push(FEEDBACK.streaks[2]);
  if (trades.length > 0 && trades[trades.length-1].result === 'lose') feedback.push(FEEDBACK.streaks[3]);
  if (streaks.maxWin >= 2 && trades.some(t => t.result === 'win' && !t.followedPlan)) feedback.push(FEEDBACK.streaks[4]);

  // Goal
  if (sessionGoal && trades.some(t => t.followedPlan)) feedback.push(FEEDBACK.goal[0]);
  if (sessionGoal && trades.every(t => !t.followedPlan)) feedback.push(FEEDBACK.goal[1]);
  if (sessionGoal && trades.some(t => t.notes && t.notes.toLowerCase().includes('patience'))) feedback.push(FEEDBACK.goal[2]);
  if (sessionGoal && !trades.some(t => t.notes && t.notes.toLowerCase().includes(sessionGoal.toLowerCase()))) feedback.push(FEEDBACK.goal[3]);
  if (trades.some(t => t.reflection)) feedback.push(FEEDBACK.goal[4]);

  // Pattern
  if (trades.some(t => t.followedPlan && t.result === 'win')) feedback.push(FEEDBACK.pattern[0]);
  if (trades.some(t => !t.followedPlan && t.result === 'lose')) feedback.push(FEEDBACK.pattern[1]);
  if (streaks.maxWin >= 2 && trades.some(t => t.result === 'win' && trades[trades.indexOf(t)-1]?.result === 'win')) feedback.push(FEEDBACK.pattern[2]);
  if (trades.length > 0 && trades[0].result === 'win') feedback.push(FEEDBACK.pattern[3]);
  if (trades.some(t => t.notes && t.notes.toLowerCase().includes('miss'))) feedback.push(FEEDBACK.pattern[4]);

  // Best/Worst Trade Analysis
  if (bestTrade) {
    if (bestTrade.result === 'win' && bestTrade.followedPlan) {
      feedback.push("Your best trade was a win where you followed your plan perfectly. This is the blueprint for success.");
    } else if (bestTrade.result === 'win' && !bestTrade.followedPlan) {
      feedback.push("Your best trade was a win, but you didn't follow your plan. While profitable, this isn't sustainable.");
    } else if (bestTrade.result === 'lose' && bestTrade.followedPlan) {
      feedback.push("Your best trade was a loss where you followed your plan. This shows excellent discipline.");
    }
    
    if (bestTrade.extendedReflection?.setup) {
      feedback.push(`Your best trade setup was: "${bestTrade.extendedReflection.setup}". Look for similar setups in future sessions.`);
    }
    
    if (bestTrade.extendedReflection?.mindset) {
      feedback.push("Your mindset in your best trade was optimal. Recreate this mental state before future trades.");
    }
  }

  if (worstTrade) {
    if (worstTrade.result === 'lose' && !worstTrade.followedPlan) {
      feedback.push("Your worst trade was a loss where you didn't follow your plan. This confirms why process matters.");
    } else if (worstTrade.result === 'lose' && worstTrade.followedPlan) {
      feedback.push("Your worst trade was a loss despite following your plan. Review your setup criteria.");
    } else if (worstTrade.result === 'win' && !worstTrade.followedPlan) {
      feedback.push("Your worst trade was actually a win, but you didn't follow your plan. Don't let profits mask poor process.");
    }
    
    if (worstTrade.extendedReflection?.lessons) {
      feedback.push(`Key lesson from your worst trade: "${worstTrade.extendedReflection.lessons}". Apply this immediately.`);
    }
    
    if (worstTrade.extendedReflection?.mindset) {
      feedback.push("Your mindset in your worst trade needs improvement. Work on this before your next session.");
    }
  }

  // Compare best vs worst
  if (bestTrade && worstTrade) {
    if (bestTrade.followedPlan && !worstTrade.followedPlan) {
      feedback.push("Notice how following your plan led to your best trade while ignoring it led to your worst. Process matters.");
    }
    
    if (bestTrade.mood > worstTrade.mood) {
      feedback.push("Your mood was better in your best trade than your worst. Emotional state directly impacts performance.");
    }
    
    if (bestTrade.extendedReflection?.setup && worstTrade.extendedReflection?.setup) {
      feedback.push("Compare the setups between your best and worst trades. What patterns do you notice?");
    }
  }

  // General
  feedback.push(FEEDBACK.general[Math.floor(Math.random() * FEEDBACK.general.length)]);

  // Limit to 5-7 feedbacks for clarity
  return feedback.slice(0, 7);
}

export const MBSPostSessionReview: React.FC<MBSPostSessionReviewProps> = ({ isOpen, onClose, sessionGoal, tradeHistory, onSetNextSessionGoal }) => {
  const [nextGoal, setNextGoal] = useState('');
  const sessionFeedback = useMemo(() => getSessionFeedback(tradeHistory, sessionGoal), [tradeHistory, sessionGoal]);
  const total = tradeHistory.length;
  const wins = tradeHistory.filter(t => t.result === 'win').length;
  const losses = tradeHistory.filter(t => t.result === 'lose').length;
  const avgMood = total > 0 ? Math.round(tradeHistory.reduce((sum, t) => sum + t.mood, 0) / total) : 4;
  const moodTimeline = tradeHistory.map(t => moodEmojis.find(e => e.value === t.mood)?.emoji || '😐').join(' ');
  const quadrantSummary = useMemo(() => {
    const q = { winPlan: 0, losePlan: 0, winNoPlan: 0, loseNoPlan: 0 };
    tradeHistory.forEach(t => {
      if (t.result === 'win' && t.followedPlan) q.winPlan++;
      if (t.result === 'lose' && t.followedPlan) q.losePlan++;
      if (t.result === 'win' && !t.followedPlan) q.winNoPlan++;
      if (t.result === 'lose' && !t.followedPlan) q.loseNoPlan++;
    });
    return q;
  }, [tradeHistory]);

  const bestTrade = tradeHistory.find(t => t.isBestTrade);
  const worstTrade = tradeHistory.find(t => t.isWorstTrade);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Session Review & Coach Feedback" size="full">
      <div className="space-y-8 p-8">
        {/* Session Summary */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
          <div className="text-xl font-bold text-blue-300">Session Summary</div>
          <div className="flex flex-wrap gap-6 items-center">
            <div><span className="font-semibold">Goal:</span> {sessionGoal}</div>
            <div><span className="font-semibold">Trades:</span> {total}</div>
            <div><span className="font-semibold">Wins:</span> {wins}</div>
            <div><span className="font-semibold">Losses:</span> {losses}</div>
            <div><span className="font-semibold">Avg Mood:</span> {moodEmojis.find(e => e.value === avgMood)?.emoji || '😐'}</div>
            <div><span className="font-semibold">Mood Timeline:</span> {moodTimeline}</div>
          </div>
          <div className="flex gap-6 mt-2">
            <div className="bg-green-900/40 rounded p-2">🏆 Win & Plan: {quadrantSummary.winPlan}</div>
            <div className="bg-green-900/40 rounded p-2">❌ Lose & Plan: {quadrantSummary.losePlan}</div>
            <div className="bg-red-900/40 rounded p-2">🏆 Win & No Plan: {quadrantSummary.winNoPlan}</div>
            <div className="bg-red-900/40 rounded p-2">❌ Lose & No Plan: {quadrantSummary.loseNoPlan}</div>
          </div>
        </div>
        {/* Trade List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-lg font-semibold text-blue-200 mb-4">Session Trades</div>
          <div className="space-y-3">
            {tradeHistory.map(trade => (
              <div key={trade.id} className="bg-gray-700 rounded p-4 flex flex-col gap-1 border-2 border-gray-600">
                <div className="flex gap-4 text-sm text-gray-300">
                  <span>{trade.time}</span>
                  <span>{trade.type}</span>
                  <span>{trade.result === 'win' ? '🏆 Win' : '❌ Lose'}</span>
                  <span>Plan: {trade.followedPlan ? 'Yes' : 'No'}</span>
                  <span>Mood: {moodEmojis.find(e => e.value === trade.mood)?.emoji || '😐'}</span>
                </div>
                {trade.notes && <div className="text-xs text-gray-400 mt-1">Notes: {trade.notes}</div>}
                {trade.reflection && (
                  <div className="text-xs text-blue-300 mt-1">Reflection: {trade.reflection}</div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Best/Worst Trade Analysis */}
        {(bestTrade || worstTrade) && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">Best & Worst Trade Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestTrade && (
                <div className="bg-green-900/30 border border-green-500 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold text-green-300">Best Trade</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <span className="text-green-400">{bestTrade.type}</span> • 
                    <span className={bestTrade.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                      {bestTrade.result === 'win' ? ' Win' : ' Loss'}
                    </span> • 
                    <span className={bestTrade.followedPlan ? 'text-green-400' : 'text-yellow-400'}>
                      Plan: {bestTrade.followedPlan ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {bestTrade.extendedReflection && (
                    <div className="space-y-1 text-xs">
                      {bestTrade.extendedReflection.setup && (
                        <div><strong>Setup:</strong> {bestTrade.extendedReflection.setup}</div>
                      )}
                      {bestTrade.extendedReflection.mindset && (
                        <div><strong>Mindset:</strong> {bestTrade.extendedReflection.mindset}</div>
                      )}
                      {bestTrade.extendedReflection.riskManagement && (
                        <div><strong>Risk:</strong> {bestTrade.extendedReflection.riskManagement}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {worstTrade && (
                <div className="bg-red-900/30 border border-red-500 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👎</span>
                    <span className="font-semibold text-red-300">Worst Trade</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <span className="text-red-400">{worstTrade.type}</span> • 
                    <span className={worstTrade.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                      {worstTrade.result === 'win' ? ' Win' : ' Loss'}
                    </span> • 
                    <span className={worstTrade.followedPlan ? 'text-green-400' : 'text-yellow-400'}>
                      Plan: {worstTrade.followedPlan ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {worstTrade.extendedReflection && (
                    <div className="space-y-1 text-xs">
                      {worstTrade.extendedReflection.lessons && (
                        <div><strong>Lessons:</strong> {worstTrade.extendedReflection.lessons}</div>
                      )}
                      {worstTrade.extendedReflection.mindset && (
                        <div><strong>Mindset:</strong> {worstTrade.extendedReflection.mindset}</div>
                      )}
                      {worstTrade.extendedReflection.setup && (
                        <div><strong>Setup:</strong> {worstTrade.extendedReflection.setup}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Coach & Risk Manager Feedback */}
        <div className="bg-blue-900/80 border border-blue-500 rounded-lg p-6">
          <div className="text-lg font-bold text-blue-200 mb-2">Coach & Risk Manager Feedback</div>
          <ul className="list-disc pl-6 space-y-2">
            {sessionFeedback.map((f, i) => (
              <li key={i} className="text-blue-100">{f}</li>
            ))}
          </ul>
        </div>
        {/* Guided Reflection */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
          <div className="text-lg font-semibold text-blue-200">Guided Reflection</div>
          <Input type="text" value={nextGoal} onChange={e => setNextGoal(e.target.value)} placeholder="What will you focus on next session?" />
          <Button onClick={() => { onSetNextSessionGoal(nextGoal); onClose(); }} disabled={!nextGoal.trim()}>Save & Close</Button>
        </div>
      </div>
    </Modal>
  );
}; 