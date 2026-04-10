import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Shield, TrendingUp, DollarSign, Activity, CheckCircle2, XCircle } from 'lucide-react';

type GameState = 'start' | 'playing' | 'gameover1' | 'gameover2' | 'win' | 'normalend';
type TeachingMode = 'hengshui' | 'quality';

interface State {
  turn: number;
  admissionRate: number;
  pressure: number;
  wireMesh: number;
  money: number;
  prCost: number;
  gameState: GameState;
  logs: string[];
  eventInspection: boolean;
  eventGoodMood: boolean;
}

const generateInitialState = (): State => ({
  turn: 1,
  admissionRate: 50,
  pressure: 0,
  wireMesh: 0,
  money: 0,
  prCost: 15,
  gameState: 'start',
  logs: ['你上任某高中新校长，学区房地产开发商王老八表示会经常来打点'],
  eventInspection: Math.random() < 0.1,
  eventGoodMood: Math.random() < 0.1,
});

export default function App() {
  const [state, setState] = useState<State>(generateInitialState());
  const [selectedMode, setSelectedMode] = useState<TeachingMode>('hengshui');
  const [upgradeWire, setUpgradeWire] = useState(false);
  const [criticalEvent, setCriticalEvent] = useState<{title: string, message: string, pendingGameState: GameState} | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const dismissCriticalEvent = () => {
    if (criticalEvent?.pendingGameState !== 'playing') {
      setState(s => ({ ...s, gameState: criticalEvent!.pendingGameState }));
    }
    setCriticalEvent(null);
  };

  useEffect(() => {
    if (state.eventInspection) {
      setSelectedMode('quality');
    }
  }, [state.eventInspection]);



  const handleEndTurn = () => {
    let { admissionRate, pressure, wireMesh, money, prCost, turn, logs, eventGoodMood } = state;
    let newLogs = [...logs];
    
    newLogs.push(`--- 第 ${turn} 回合结算 ---`);

    // 1. Apply Wire Mesh Upgrade
    if (upgradeWire && money >= 5 && wireMesh < 5) {
      money -= 5;
      wireMesh += 1;
      newLogs.push(`花费 5 万加固了铁丝网，当前强度：${wireMesh}`);
    }

    // 2. Apply Teaching Mode
    if (selectedMode === 'hengshui') {
      admissionRate += 8;
      pressure += 40;
      newLogs.push(`执行【衡水模式】：升学率 +8%，压力 +40`);
    } else if (selectedMode === 'quality') {
      admissionRate -= 10;
      pressure -= 25;
      newLogs.push(`执行【素质教育】：升学率 -10%，压力 -25`);
    }

    if (pressure < 0) pressure = 0;

    // 3. Bribe
    const housingPrice = 3 + (admissionRate - 40) * 0.1;
    let income = housingPrice;
    if (eventGoodMood) {
      income += 5;
      newLogs.push(`王老八心情好，额外贿赂 5 万！`);
    }
    money += income;
    newLogs.push(`收到王老八的贿赂：${income.toFixed(1)} 万`);

    // 4. Pressure Check & Modal Setup
    let eventModal = null;
    let gameOverState: GameState = 'playing';

    if (pressure >= 100) {
      if (wireMesh >= 2) {
        wireMesh -= 2;
        pressure = Math.floor(pressure / 2);
        eventModal = {
          title: '有人尝试跳楼！',
          message: '铁丝网旁边倒着一个头破血流的学生，铁丝网上面有血。趁着人没死，你赶紧把他开除了。'
        };
      } else {
        wireMesh = 0;
        pressure = Math.floor(pressure / 2);
        if (money >= prCost) {
          money -= prCost;
          eventModal = {
            title: '【严重事故】防跳失败！',
            message: `学生掉下去了！跳楼事件上热搜了！\n你紧急支付了 ${prCost} 万公关费压下热搜。`
          };
          prCost *= 2;
        } else {
          eventModal = {
            title: '【舆论失控】防跳失败！',
            message: `学生掉下去了！跳楼事件上热搜了！\n你的小金库不足以支付 ${prCost} 万公关费，舆论彻底失控了！`
          };
          gameOverState = 'gameover2';
        }
      }
    }

    // 5. Win/Loss Check
    if (gameOverState === 'playing') {
      if (admissionRate < 25) {
        gameOverState = 'gameover1';
      } else if (turn >= 12) {
        if (admissionRate < 80) {
          gameOverState = 'normalend';
        } else {
          gameOverState = 'win';
        }
      }
    }

    const nextInspection = Math.random() < 0.1;
    const nextGoodMood = Math.random() < 0.1;

    if (eventModal) {
      setState({
        ...state,
        turn: gameOverState === 'playing' ? turn + 1 : turn,
        admissionRate,
        pressure,
        wireMesh,
        money,
        prCost,
        gameState: 'playing',
        logs: newLogs,
        eventInspection: nextInspection,
        eventGoodMood: nextGoodMood
      });
      setCriticalEvent({
        ...eventModal,
        pendingGameState: gameOverState
      });
    } else {
      setState({
        ...state,
        turn: gameOverState === 'playing' ? turn + 1 : turn,
        admissionRate,
        pressure,
        wireMesh,
        money,
        prCost,
        gameState: gameOverState,
        logs: newLogs,
        eventInspection: nextInspection,
        eventGoodMood: nextGoodMood
      });
    }
    
    // Reset turn selections
    setUpgradeWire(false);
    setSelectedMode(nextInspection ? 'quality' : 'hengshui');
  };

  const restartGame = () => {
    setState({ ...generateInitialState(), gameState: 'playing' });
    setSelectedMode('hengshui');
    setUpgradeWire(false);
    setCriticalEvent(null);
  };

  if (state.gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full p-8 rounded-2xl border bg-slate-900/80 border-slate-700 text-center space-y-8 shadow-2xl">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-100 tracking-tight">中国校长模拟器</h1>
            <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed text-left bg-slate-950/50 p-6 rounded-xl border border-slate-800">
            你上任中国某高中校长，学区房地产商王老八每回合会贿赂你。请务必守护学区房房价、确保升学率、保证无人跳楼，如果有人跳楼及时压热搜。
          </p>
          <div className="pt-4">
            <button 
              onClick={() => setState({ ...state, gameState: 'playing' })}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.gameState !== 'playing') {
    const isWin = state.gameState === 'win';
    const isNormal = state.gameState === 'normalend';
    const title = isWin ? '光荣退休' : isNormal ? '无功无过' : state.gameState === 'gameover1' ? '老八的愤怒' : '纸里包不住火';
    const desc = isWin 
      ? '高考放榜，你的学校出了个省状元！周边学区房一夜暴涨！王老八笑得合不拢嘴，你在表彰大会上深情演讲完《教育的本质是爱》后，登上了飞往洛杉矶的头等舱。'
      : isNormal
      ? '你的校长任期内没出跳楼热搜，升学率也一般般，你无功无过地退休，回老家遛鸟去了。'
      : state.gameState === 'gameover1'
      ? '升学率暴跌，学区房价也暴跌，王老八带着一群买学区房被套牢的家长冲进校长室。教育局收到了800封举报信。你因贪污受贿被双开了'
      : '#某校学生跳楼# 登顶热搜第一，王老八为了自保迅速与你切割。你在千夫所指中被双开了';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className={`max-w-lg w-full p-8 rounded-2xl border ${isWin ? 'bg-emerald-950/30 border-emerald-900/50' : isNormal ? 'bg-blue-950/30 border-blue-900/50' : 'bg-rose-950/30 border-rose-900/50'} text-center space-y-6 shadow-2xl`}>
          {isWin ? <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" /> : isNormal ? <CheckCircle2 className="w-20 h-20 text-blue-500 mx-auto" /> : <XCircle className="w-20 h-20 text-rose-500 mx-auto" />}
          <h1 className={`text-4xl font-bold ${isWin ? 'text-emerald-400' : isNormal ? 'text-blue-400' : 'text-rose-400'}`}>{title}</h1>
          <p className="text-slate-300 text-lg leading-relaxed">{desc}</p>
          <div className="pt-6">
            <button onClick={restartGame} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700">
              重新开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-2 md:p-4 flex flex-col">
      {criticalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-rose-900/20">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-rose-400 text-center mb-4">{criticalEvent.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
              {criticalEvent.message}
            </p>
            <button 
              onClick={dismissCriticalEvent}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              确定
            </button>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-slate-800 pb-2 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">中国校长模拟器</h1>
          </div>
          <div className="text-right">
            <div className="text-l font-mono text-emerald-400"> {state.turn} / 12 回合</div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column: Stats */}
          <div className="grid grid-cols-2 gap-2 lg:col-span-1 content-start">
            <StatCard title="升学率" value={`${state.admissionRate}%`} icon={<TrendingUp className="w-4 h-4" />} color="text-blue-400" bgColor="bg-blue-400" progress={state.admissionRate} />
            <StatCard title="学生压力" value={`${state.pressure}%`} icon={<Activity className="w-4 h-4" />} color="text-rose-500" bgColor="bg-rose-500" progress={state.pressure} />
            <StatCard title="铁丝网强度" value={`${'★'.repeat(state.wireMesh)}${''.repeat(5 - state.wireMesh)}`} icon={<Shield className="w-4 h-4" />} color="text-amber-400" />
            <StatCard title="小金库" value={`${state.money.toFixed(1)} 万`} icon={<DollarSign className="w-4 h-4" />} color="text-emerald-400" />
          </div>
          {/* Right Column: Actions & Logs */}
          <div className="lg:col-span-2 space-y-3 flex flex-col min-h-0">
            {/* Events Alert */}
            {(state.eventInspection || state.eventGoodMood) && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 space-y-2 shadow-sm shrink-0">
                {state.eventInspection && (
                  <div className="flex items-center text-rose-400 bg-rose-400/10 px-3 py-2 rounded-md border border-rose-500/20 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>教育局视察！强制【素质教育】。</span>
                  </div>
                )}
                {state.eventGoodMood && (
                  <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-md border border-emerald-500/20 text-sm">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>王老八心情大好，额外赞助 5 万！</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-sm shrink-0">
              <div className="space-y-3">
                {/* Teaching Mode */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">教学模式</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ModeButton 
                      title="衡水模式" 
                      desc="升学率+8, 压力+40" 
                      selected={selectedMode === 'hengshui'} 
                      onClick={() => setSelectedMode('hengshui')}
                      disabled={state.eventInspection}
                    />
                    <ModeButton 
                      title="素质教育" 
                      desc="升学率-10, 压力-25" 
                      selected={selectedMode === 'quality'} 
                      onClick={() => setSelectedMode('quality')}
                    />
                  </div>
                </div>

                {/* Wire Mesh */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">危机预备</label>
                  <button 
                    onClick={() => setUpgradeWire(!upgradeWire)}
                    disabled={state.money < 5 || state.wireMesh >= 5}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      upgradeWire 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-inner' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    } ${(state.money < 5 || state.wireMesh >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center">
                      <Shield className={`w-4 h-4 mr-2 ${upgradeWire ? 'text-amber-400' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <div className="font-medium text-sm">加固铁丝网</div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-medium">
                      花费 5 万
                    </div>
                  </button>
                </div>

                {/* Submit */}
                <button 
                  onClick={handleEndTurn}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-sm active:scale-[0.98]"
                >
                  结束回合
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col shadow-sm overflow-hidden" style={{height: '200px'}}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 shrink-0"> </h3>
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs pr-2" ref={logsEndRef}>
                {state.logs.slice().reverse().map((log, i) => (
                  <div key={i} className={`pb-1.5 border-b border-slate-800/50 ${log.includes('警告') || log.includes('失败') || log.includes('失控') ? 'text-rose-400' : log.includes('打款') || log.includes('赞助') ? 'text-emerald-400' : 'text-slate-300'}`}>
                    <span className="text-slate-600 mr-2">[{i+1}]</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bgColor, progress }: { title: string, value: string, icon: React.ReactNode, color: string, bgColor?: string, progress?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-sm flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${color} bg-slate-800 p-1 rounded-md`}>{icon}</div>
          <div className="text-slate-400 text-xs font-medium">{title}</div>
        </div>
        <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-800 h-1 mt-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${bgColor} transition-all duration-500 ease-out`} 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ModeButton({ title, desc, selected, onClick, disabled }: { title: string, desc: string, selected: boolean, onClick: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg border text-left transition-all ${
        selected 
          ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 shadow-inner' 
          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="font-medium text-sm mb-0.5">{title}</div>
      <div className="text-[10px] opacity-80 leading-tight">{desc}</div>
    </button>
  );
}
