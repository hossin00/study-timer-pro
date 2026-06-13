import { useState, useEffect } from 'react';
import { BookOpen, Play, Square, RotateCcw, Coffee, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
const AC='#8b5cf6';
const SAVE='stp_v1';
interface StudyLog { date:string; minutes:number; sessions:number; }
const today=format(new Date(),'yyyy-MM-dd');
const load=():{[k:string]:StudyLog}=>{try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return{}}};
const MODES=[{label:'Focus',duration:25,color:'#8b5cf6'},{label:'Short Break',duration:5,color:'#10b981'},{label:'Long Break',duration:15,color:'#3b82f6'}];
export default function App() {
  const [log,setLog]=useState<{[k:string]:StudyLog}>(load);
  const [mode,setMode]=useState(0); const [running,setRunning]=useState(false);
  const [secsLeft,setSecsLeft]=useState(MODES[0].duration*60); const [cycles,setCycles]=useState(0);
  const [goal,setGoal]=useState(120);
  const todayLog=log[today]||{date:today,minutes:0,sessions:0};
  const total=Object.values(log).reduce((s,l)=>s+l.minutes,0);
  
  useEffect(()=>{
    if(!running)return;
    const i=setInterval(()=>{
      setSecsLeft(s=>{
        if(s<=1){
          setRunning(false);
          if(mode===0){
            const mins=MODES[0].duration;
            const updated={...log,[today]:{...todayLog,minutes:todayLog.minutes+mins,sessions:todayLog.sessions+1}};
            setLog(updated); localStorage.setItem(SAVE,JSON.stringify(updated));
            setCycles(c=>c+1);
          }
          const nextMode=mode===0?(cycles+1)%4===0?2:1:0;
          setMode(nextMode);
          return MODES[nextMode].duration*60;
        }
        return s-1;
      });
    },1000);
    return()=>clearInterval(i);
  },[running,mode,log,todayLog,cycles]);

  const reset=()=>{setRunning(false);setSecsLeft(MODES[mode].duration*60);};
  const mins=Math.floor(secsLeft/60); const secs=secsLeft%60;
  const pct=((MODES[mode].duration*60-secsLeft)/(MODES[mode].duration*60))*100;
  const modeColor=MODES[mode].color;
  return (
    <div style={{minHeight:'100vh',background:'#08080f',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1e1b4b',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${AC},#6d28d9)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${AC}30`}}><BookOpen size={16} color="white"/></div>
          <div style={{fontWeight:'700',fontSize:'16px',color:'white'}}>Study Timer Pro</div>
        </div>
        <div style={{fontSize:'12px',color:'#4a1d96'}}>{todayLog.minutes}m today · {todayLog.sessions} sessions</div>
      </header>
      <div style={{flex:1,overflow:'auto',padding:'20px',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'}}>
        {/* Mode tabs */}
        <div style={{display:'flex',gap:'6px',background:'#0e0c1f',borderRadius:'12px',padding:'4px',width:'100%',maxWidth:'380px'}}>
          {MODES.map((m,i)=><button key={m.label} onClick={()=>{setMode(i);setRunning(false);setSecsLeft(m.duration*60);}}
            style={{flex:1,padding:'8px',borderRadius:'9px',border:'none',background:mode===i?m.color+'20':'transparent',color:mode===i?m.color:'#312e81',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',textAlign:'center' as const}}>{m.label}</button>)}
        </div>
        {/* Timer */}
        <div style={{position:'relative',width:'220px',height:'220px'}}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{transform:'rotate(-90deg)'}}>
            <circle cx="110" cy="110" r="100" fill="none" stroke="#1e1b4b" strokeWidth="8"/>
            <circle cx="110" cy="110" r="100" fill="none" stroke={modeColor} strokeWidth="8"
              strokeDasharray={`${2*Math.PI*100}`} strokeDashoffset={`${2*Math.PI*100*(1-pct/100)}`}
              strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s ease'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{fontSize:'11px',color:'#312e81',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:'8px'}}>{MODES[mode].label}</div>
            <div style={{fontSize:'52px',fontWeight:'700',color:'white',fontFamily:'monospace',fontVariantNumeric:'tabular-nums'}}>{mins.toString().padStart(2,'0')}:{secs.toString().padStart(2,'0')}</div>
            <div style={{fontSize:'12px',color:'#312e81',marginTop:'4px'}}>Cycle {cycles+1}</div>
          </div>
        </div>
        {/* Controls */}
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={reset} style={{padding:'12px 20px',borderRadius:'12px',background:'#0e0c1f',border:'1px solid #1e1b4b',color:'#312e81',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',fontFamily:'Inter',fontSize:'13px'}}>
            <RotateCcw size={14}/> Reset
          </button>
          <button onClick={()=>setRunning(!running)}
            style={{padding:'14px 32px',borderRadius:'12px',background:running?'#1e1b4b':`linear-gradient(135deg,${modeColor},${modeColor}cc)`,border:`1px solid ${running?'#312e81':modeColor}`,color:running?modeColor:'white',fontSize:'16px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',boxShadow:running?'none':`0 4px 16px ${modeColor}40`,display:'flex',alignItems:'center',gap:'8px'}}>
            {running?<><Square size={16}/>Pause</>:<><Play size={16}/>Start</>}
          </button>
        </div>
        {/* Daily goal */}
        <div style={{width:'100%',maxWidth:'380px',background:'#0e0c1f',border:'1px solid #1e1b4b',borderRadius:'12px',padding:'14px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <span style={{fontSize:'12px',color:'#312e81',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em'}}>Daily Goal</span>
            <span style={{fontSize:'13px',fontWeight:'700',color:todayLog.minutes>=goal?AC:'white'}}>{todayLog.minutes}/{goal} min</span>
          </div>
          <div style={{height:'6px',background:'#1e1b4b',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{width:`${Math.min(100,todayLog.minutes/goal*100)}%`,height:'100%',background:modeColor,borderRadius:'3px',transition:'width 0.5s'}}/>
          </div>
        </div>
        {/* Stats */}
        <div style={{width:'100%',maxWidth:'380px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
          {[['Today',todayLog.minutes+'m',AC],['Sessions',String(todayLog.sessions),'#c4b5fd'],['All Time',(total/60).toFixed(0)+'h','#818cf8']].map(([l,v,c])=>(
            <div key={l as string} style={{background:'#0e0c1f',border:'1px solid #1e1b4b',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'18px',fontWeight:'700',color:String(c)}}>{v as string}</div>
              <div style={{fontSize:'10px',color:'#312e81',marginTop:'2px'}}>{l as string}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}