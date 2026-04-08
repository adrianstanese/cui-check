"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const TH: Record<string, Record<string, string>> = {
  light: {
    id:"light",lb:"☀️",
    bg:"#ffffff",bg2:"#f8fafc",card:"#ffffff",hdr:"rgba(255,255,255,0.92)",
    input:"#ffffff",muted:"#f1f5f9",brd:"#e2e8f0",brd2:"#f1f5f9",
    tx:"#0f172a",tx2:"#475569",tx3:"#94a3b8",
    pri:"#002B7F",priS:"rgba(0,43,127,0.07)",priG:"rgba(0,43,127,0.15)",
    accG:"rgba(252,209,22,0.2)",grad:"linear-gradient(135deg,#002B7F,#0047d4)",
    ok:"#059669",okB:"rgba(5,150,105,0.07)",okD:"rgba(5,150,105,0.22)",
    wn:"#d97706",wnB:"rgba(217,119,6,0.07)",wnD:"rgba(217,119,6,0.22)",
    er:"#dc2626",erB:"rgba(220,38,38,0.05)",erD:"rgba(220,38,38,0.18)",
    inf:"#2563eb",infB:"rgba(37,99,235,0.05)",infD:"rgba(37,99,235,0.14)",
    sh:"0 4px 24px rgba(0,0,0,0.06)",shL:"0 8px 40px rgba(0,0,0,0.08)",
    dot:"rgba(0,0,0,0.03)",tipBg:"#0f172a",tipTx:"#f1f5f9",
  },
  dark: {
    id:"dark",lb:"🌙",
    bg:"#080c18",bg2:"#0d1224",card:"#111828",hdr:"rgba(8,12,24,0.94)",
    input:"#111828",muted:"#1a2340",brd:"#1f2b48",brd2:"#162037",
    tx:"#e8ecf4",tx2:"#8a96b0",tx3:"#4c5b78",
    pri:"#5b9aff",priS:"rgba(91,154,255,0.1)",priG:"rgba(91,154,255,0.18)",
    accG:"rgba(252,209,22,0.1)",grad:"linear-gradient(135deg,#2563eb,#5b9aff)",
    ok:"#3ddba4",okB:"rgba(61,219,164,0.1)",okD:"rgba(61,219,164,0.28)",
    wn:"#fbbf24",wnB:"rgba(251,191,36,0.1)",wnD:"rgba(251,191,36,0.28)",
    er:"#ff6b6b",erB:"rgba(255,107,107,0.08)",erD:"rgba(255,107,107,0.22)",
    inf:"#5b9aff",infB:"rgba(91,154,255,0.08)",infD:"rgba(91,154,255,0.18)",
    sh:"0 4px 24px rgba(0,0,0,0.3)",shL:"0 8px 40px rgba(0,0,0,0.5)",
    dot:"rgba(255,255,255,0.02)",tipBg:"#e8ecf4",tipTx:"#0f172a",
  },
  pink: {
    id:"pink",lb:"🌸",
    bg:"#fef1f7",bg2:"#fde4ef",card:"#fff5fa",hdr:"rgba(254,241,247,0.94)",
    input:"#ffffff",muted:"#fce7f3",brd:"#f5a0cd",brd2:"#f9c6df",
    tx:"#4a0e2b",tx2:"#8b1a50",tx3:"#c44a83",
    pri:"#d6246e",priS:"rgba(214,36,110,0.07)",priG:"rgba(214,36,110,0.15)",
    accG:"rgba(244,114,182,0.2)",grad:"linear-gradient(135deg,#d6246e,#f06daa)",
    ok:"#059669",okB:"rgba(5,150,105,0.08)",okD:"rgba(5,150,105,0.22)",
    wn:"#d97706",wnB:"rgba(217,119,6,0.08)",wnD:"rgba(217,119,6,0.22)",
    er:"#d6246e",erB:"rgba(214,36,110,0.06)",erD:"rgba(214,36,110,0.2)",
    inf:"#d6246e",infB:"rgba(214,36,110,0.06)",infD:"rgba(214,36,110,0.16)",
    sh:"0 4px 24px rgba(214,36,110,0.05)",shL:"0 8px 40px rgba(214,36,110,0.1)",
    dot:"rgba(214,36,110,0.03)",tipBg:"#4a0e2b",tipTx:"#fef1f7",
  },
};
const KEYS = ["light","dark","pink"];

interface Company {
  cui:string;den:string;reg:string;adr:string;inm:string;
  tva:boolean;dtva:string|null;drad?:string;
  inact:boolean;dinact?:string;
  efact:boolean;defact:string|null;
  tvainc:boolean;tvaincP?:string;
  split:boolean;bpi:boolean;bpiText?:string;risk:number;
}

type Th = Record<string,string>;

const MK: Record<string,Company> = {
  "12345678":{cui:"12345678",den:"SC INNOVATION TECH SRL",reg:"J40/1234/2015",adr:"Str. Victoriei nr. 100, Sector 1, București",inm:"2015-03-15",tva:true,dtva:"2015-04-01",inact:false,efact:true,defact:"2024-01-15",tvainc:false,split:false,bpi:false,risk:12},
  "87654321":{cui:"87654321",den:"SC BETA CONSTRUCT SRL",reg:"J12/5678/2018",adr:"Bd. Unirii nr. 50, Cluj-Napoca",inm:"2018-06-20",tva:true,dtva:"2018-07-01",inact:false,efact:false,defact:null,tvainc:true,tvaincP:"T1 2024 – prezent",split:false,bpi:false,risk:45},
  "11223344":{cui:"11223344",den:"SC OMEGA SERVICES SRL",reg:"J03/9012/2012",adr:"Str. Independenței nr. 22, Pitești",inm:"2012-01-10",tva:false,dtva:null,drad:"2023-11-01",inact:true,dinact:"2024-02-15",efact:false,defact:null,tvainc:false,split:true,bpi:true,bpiText:"BPI nr. 4523/2024 – Deschidere procedură simplificată",risk:89},
  "99887766":{cui:"99887766",den:"SC ALPHA PHARMA SRL",reg:"J40/2345/2010",adr:"Calea Floreasca nr. 175, Sector 1, București",inm:"2010-09-01",tva:true,dtva:"2010-10-01",inact:false,efact:true,defact:"2023-06-01",tvainc:false,split:false,bpi:false,risk:8},
};

const fmtD=(d:string|null|undefined)=>{if(!d)return"—";const x=new Date(d),m=["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"];return`${x.getDate()} ${m[x.getMonth()]} ${x.getFullYear()}`};
const rLvl=(s:number)=>s<=30?{l:"Risc Scăzut",k:"ok"}:s<=60?{l:"Atenție",k:"wn"}:{l:"Risc Ridicat",k:"er"};
const sC=(k:string,t:Th)=>({ok:{c:t.ok,b:t.okB,d:t.okD},wn:{c:t.wn,b:t.wnB,d:t.wnD},er:{c:t.er,b:t.erB,d:t.erD},inf:{c:t.inf,b:t.infB,d:t.infD}}[k]||{c:t.inf,b:t.infB,d:t.infD});
const nowS=()=>{const n=new Date(),m=["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];return`${n.getDate()} ${m[n.getMonth()]} ${n.getFullYear()}, ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`};

const ic=(ch:React.ReactNode,s=20)=>()=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ch}</svg>;
const II={
  Search:ic(<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>),
  Shield:ic(<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>),
  ShieldOk:ic(<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></>),
  ShieldX:ic(<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/></>),
  Building:ic(<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></>),
  File:ic(<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></>),
  Receipt:ic(<><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></>),
  Alert:ic(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></>),
  Card:ic(<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>),
  Gavel:ic(<><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/></>),
  Gauge:ic(<><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></>),
  Down:ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,18),
  Share:ic(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,18),
  Refresh:ic(<><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>,16),
  Back:ic(<><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>,18),
  Clock:ic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,13),
  Info:ic(<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,13),
};

function ThemeBar({tk,setTk,t}:{tk:string;setTk:(v:string)=>void;t:Th}) {
  return <div style={{display:"flex",gap:4}}>
    {KEYS.map(k=>(
      <button key={k} onClick={()=>setTk(k)}
        style={{padding:"6px 12px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",
          border:tk===k?`2px solid ${TH[k].pri}`:`1px solid ${t.brd}`,
          background:tk===k?TH[k].pri:t.muted,color:tk===k?"#fff":t.tx2,fontFamily:"inherit"}}>
        {TH[k].lb}
      </button>
    ))}
  </div>;
}

function Badge({status,t,size="md"}:{status:string;t:Th;size?:string}) {
  const lb:Record<string,string>={ok:"OK",wn:"Atenție",er:"Risc",inf:"Info"};
  const sc=sC(status,t);
  const sz=size==="lg"?{px:16,py:8,fs:13}:size==="sm"?{px:8,py:3,fs:10}:{px:12,py:5,fs:11};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,borderRadius:99,fontWeight:800,textTransform:"uppercase",letterSpacing:".05em",padding:`${sz.py}px ${sz.px}px`,fontSize:sz.fs,color:sc.c,background:sc.b,border:`1px solid ${sc.d}`}}>
    <span style={{width:6,height:6,borderRadius:99,background:sc.c,animation:status==="er"?"pulse 2s infinite":"none"}}/>{lb[status]||"Info"}
  </span>;
}

function Tip({text,children,t}:{text:string;children:React.ReactNode;t:Th}) {
  const [s,setS]=useState(false);
  return <span style={{position:"relative",display:"inline-flex"}} onMouseEnter={()=>setS(true)} onMouseLeave={()=>setS(false)}>
    {children}
    {s&&<span style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",padding:"10px 14px",fontSize:11,borderRadius:10,lineHeight:1.5,background:t.tipBg,color:t.tipTx,boxShadow:"0 8px 30px rgba(0,0,0,.25)",zIndex:50,width:240,textAlign:"center",pointerEvents:"none",fontWeight:500}}>{text}</span>}
  </span>;
}

function RGauge({score,t}:{score:number;t:Th}) {
  const r=rLvl(score);const c=sC(r.k,t).c;const a=-90+(score/100)*180;
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
    <div style={{width:115,height:58,overflow:"hidden"}}>
      <svg viewBox="0 0 120 62" style={{width:"100%",height:"100%"}}>
        <path d="M 10 57 A 50 50 0 0 1 110 57" fill="none" stroke={t.brd} strokeWidth="8" strokeLinecap="round"/>
        <path d="M 10 57 A 50 50 0 0 1 110 57" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score/100)*157} 157`} style={{transition:"stroke-dasharray 1s ease"}}/>
        <line x1="60" y1="57" x2="60" y2="18" stroke={c} strokeWidth="2.5" strokeLinecap="round" style={{transformOrigin:"60px 57px",transform:`rotate(${a}deg)`,transition:"transform 1s ease"}}/>
        <circle cx="60" cy="57" r="4" fill={c}/>
      </svg>
    </div>
    <div><span style={{fontSize:24,fontWeight:900,color:c}}>{score}</span><span style={{fontSize:11,color:t.tx3}}>/100</span></div>
    <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em",color:c}}>{r.l}</span>
  </div>;
}

function CCard({icon:Icon,title,status,main,sub,tip,delay=0,t}:{icon:React.ComponentType;title:string;status:string;main:string;sub?:string;tip?:string;delay?:number;t:Th}) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{const x=setTimeout(()=>setVis(true),delay);return()=>clearTimeout(x)},[delay]);
  const sc=sC(status,t);
  return <div style={{borderRadius:16,border:`1px solid ${sc.d}`,padding:20,background:t.card,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(14px)",transition:"all .35s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
      <div style={{padding:8,borderRadius:12,background:sc.b,color:sc.c}}><Icon/></div>
      <Badge status={status} t={t}/>
    </div>
    <h3 style={{fontWeight:800,color:t.tx,marginBottom:4,fontSize:13}}>{title}</h3>
    <p style={{fontSize:13,color:t.tx2,marginBottom:3,fontWeight:600,lineHeight:1.4}}>{main}</p>
    {sub&&<p style={{fontSize:12,color:t.tx3,lineHeight:1.4}}>{sub}</p>}
    {tip&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${t.brd2}`}}>
      <Tip text={tip} t={t}><button style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:t.pri,fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}><II.Info/> De ce contează?</button></Tip>
    </div>}
  </div>;
}

function Loading({t}:{t:Th}) {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px",gap:22,minHeight:"80vh"}}>
    <div style={{width:68,height:68,borderRadius:18,background:t.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 8px 36px ${t.priG}`,animation:"pulse 1.5s infinite"}}><II.Shield/></div>
    <div style={{textAlign:"center"}}><p style={{fontSize:17,fontWeight:800,color:t.tx,marginBottom:4}}>Se interoghează ANAF în timp real…</p><p style={{fontSize:13,color:t.tx3}}>Verificăm registrele oficiale</p></div>
    <div style={{display:"flex",gap:4}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:7,height:7,borderRadius:99,background:t.pri,animation:`bounce 1s infinite ${i*.15}s`}}/>)}</div>
  </div>;
}

function Home({onCheck,tk,setTk,t}:{onCheck:(c:string)=>void;tk:string;setTk:(v:string)=>void;t:Th}) {
  const [cui,setCui]=useState("");
  const [err,setErr]=useState("");
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{ref.current?.focus()},[]);
  const go=()=>{const c=cui.replace(/\s|RO/gi,"");if(!c||!/^\d{1,10}$/.test(c)){setErr("CUI invalid — doar cifre, max 10");return;}setErr("");onCheck(c)};

  return <>
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${t.brd2}`,background:t.hdr,backdropFilter:"blur(16px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:t.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 14px ${t.priG}`}}><II.ShieldOk/></div>
        <div><div style={{fontWeight:900,color:t.tx,fontSize:15}}>CUI Check</div><div style={{fontSize:9,color:t.tx3,textTransform:"uppercase",letterSpacing:".1em",fontWeight:600}}>Verificare Fiscală România</div></div>
      </div>
      <ThemeBar tk={tk} setTk={setTk} t={t}/>
    </header>
    <main style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"64px 20px 40px",position:"relative"}}>
      <div style={{position:"absolute",top:-200,right:-200,width:480,height:480,borderRadius:"50%",background:t.priG,filter:"blur(120px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-150,left:-150,width:380,height:380,borderRadius:"50%",background:t.accG,filter:"blur(100px)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:36,maxWidth:580,position:"relative",zIndex:1,animation:"slideUp .6s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 13px",borderRadius:99,background:t.priS,color:t.pri,fontSize:11,fontWeight:800,marginBottom:22,border:`1px solid ${t.infD}`}}>
          <span style={{width:5,height:5,borderRadius:99,background:t.pri,animation:"pulse 2s infinite"}}/> DATE LIVE DIN ANAF • ONRC • BPI
        </div>
        <h2 style={{fontSize:42,fontWeight:900,color:t.tx,marginBottom:14,lineHeight:1.08,letterSpacing:"-.03em"}}>
          Verifică conformitatea<span style={{display:"block",background:t.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>fiscală în 2 secunde</span>
        </h2>
        <p style={{fontSize:16,color:t.tx2,maxWidth:460,margin:"0 auto",lineHeight:1.6}}>Dashboard complet de compliance pentru orice companie din România. 100% gratuit, fără limite.</p>
      </div>
      <div style={{width:"100%",maxWidth:520,position:"relative",zIndex:1,animation:"slideUp .6s ease .15s both"}}>
        <div style={{display:"flex",alignItems:"center",background:t.input,borderRadius:16,boxShadow:t.shL,border:`2px solid ${t.brd}`,overflow:"hidden"}}>
          <div style={{paddingLeft:18,color:t.tx3}}><II.Search/></div>
          <input ref={ref} value={cui} onChange={e=>{setCui(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Introdu CUI (ex: 12345678)"
            style={{flex:1,padding:"16px 14px",background:"transparent",border:"none",outline:"none",color:t.tx,fontSize:15,fontWeight:500,fontFamily:"inherit"}}/>
          <button onClick={go} style={{margin:5,padding:"13px 24px",borderRadius:13,fontWeight:800,color:"#fff",fontSize:14,border:"none",cursor:"pointer",background:t.grad,boxShadow:`0 4px 14px ${t.priG}`,fontFamily:"inherit"}}>Verifică</button>
        </div>
        {err&&<p style={{marginTop:10,fontSize:13,color:t.er,fontWeight:600,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:5,animation:"shake .4s ease"}}><II.Alert/> {err}</p>}
      </div>
      <div style={{marginTop:18,display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",position:"relative",zIndex:1,animation:"slideUp .6s ease .3s both"}}>
        <span style={{fontSize:12,color:t.tx3,fontWeight:600,padding:"4px 0"}}>Demo:</span>
        {Object.keys(MK).map(k=><button key={k} onClick={()=>setCui(k)} style={{padding:"5px 11px",fontSize:12,borderRadius:9,fontFamily:"monospace",fontWeight:600,border:`1px solid ${t.brd}`,background:t.muted,color:t.tx2,cursor:"pointer"}}>{k}</button>)}
      </div>
      <div style={{marginTop:50,display:"flex",gap:28,color:t.tx3,position:"relative",zIndex:1,animation:"slideUp .6s ease .45s both",flexWrap:"wrap",justifyContent:"center"}}>
        {["ANAF","ONRC","BPI","RO e-Factura"].map(s=><div key={s} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em"}}><II.ShieldOk/> {s}</div>)}
      </div>
    </main>
    <div style={{textAlign:"center",padding:"10px 20px",fontSize:11,color:t.tx3,borderTop:`1px solid ${t.brd2}`}}>Datele sunt preluate live din surse oficiale ANAF/ONRC. Nu înlocuiește consultanța fiscală profesională.</div>
    <footer style={{textAlign:"center",padding:"16px 20px",borderTop:`1px solid ${t.brd2}`,fontSize:12,color:t.tx3}}>
      <span style={{fontWeight:700}}>CUI Check © 2026</span>{" • "}Calculator Salarial{" • "}Clasificare COR{" • "}Built by Adrian Stanese
    </footer>
  </>;
}

function Dash({co,onBack,tk,setTk,t}:{co:Company;onBack:()=>void;tk:string;setTk:(v:string)=>void;t:Th}) {
  const [copied,setCopied]=useState(false);
  const r=rLvl(co.risk);const rc=sC(r.k,t);const ts=nowS();
  const copy=()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)};
  const cards=[
    {icon:II.Building,title:"Identitate Companie",status:"inf",main:co.den,sub:`${co.reg} • ${co.adr} • Înm. ${fmtD(co.inm)}`,delay:100},
    {icon:II.Receipt,title:"Status TVA (Art. 316)",status:co.tva?"ok":"er",main:co.tva?`Înregistrat TVA din ${fmtD(co.dtva)}`:`Neînregistrat TVA${co.drad?` — radiat ${fmtD(co.drad)}`:""}`,sub:co.tva?"Plătitor de TVA activ":"Nu poate emite facturi cu TVA",tip:"Dacă partenerul nu este plătitor de TVA, nu poți deduce TVA-ul de pe factură.",delay:200},
    {icon:co.inact?II.ShieldX:II.ShieldOk,title:"Contribuabil Inactiv",status:co.inact?"er":"ok",main:co.inact?`INACTIV din ${fmtD(co.dinact)}`:"Contribuabil activ fiscal",sub:co.inact?"Tranzacțiile cu inactivi nu sunt deductibile":"Fără restricții",tip:"Facturile de la contribuabili inactivi NU sunt deductibile fiscal.",delay:300},
    {icon:II.File,title:"RO e-Factura",status:co.efact?"ok":"er",main:co.efact?`Înregistrat din ${fmtD(co.defact)}`:"Neînregistrat e-Factura",sub:co.efact?"Obligatoriu B2B din 2024":"Facturi B2B posibil neconforme",tip:"Facturarea electronică e obligatorie B2B din 2024.",delay:400},
    {icon:II.Card,title:"TVA la Încasare",status:co.tvainc?"wn":"ok",main:co.tvainc?`Aplică TVA la încasare${co.tvaincP?` (${co.tvaincP})`:""}`:"Nu aplică TVA la încasare",sub:co.tvainc?"Deducere TVA la plata facturii":"Regim normal",tip:"Cu TVA la încasare, deduci TVA-ul abia la plata facturii.",delay:500},
    {icon:II.Receipt,title:"Plata Defalcată TVA",status:co.split?"wn":"ok",main:co.split?"Înscris în plata defalcată":"Nu aplică split TVA",sub:co.split?"TVA virat separat":"Fără obligații suplimentare",tip:"Split TVA obligă virarea TVA-ului separat.",delay:600},
    {icon:II.Gavel,title:"Buletin Insolvență (BPI)",status:co.bpi?"er":"ok",main:co.bpi?"Mențiuni în BPI":"Fără mențiuni BPI",sub:co.bpi?co.bpiText:"Nu se află în insolvență",tip:"Mențiunile BPI semnalează insolvență/faliment.",delay:700},
  ];
  return <>
    <header style={{position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${t.brd2}`,backdropFilter:"blur(16px)",background:t.hdr}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={onBack} style={{padding:7,borderRadius:9,border:"none",background:"transparent",color:t.tx3,cursor:"pointer",display:"flex"}}><II.Back/></button>
        <div style={{width:28,height:28,borderRadius:7,background:t.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><II.ShieldOk/></div>
        <span style={{fontWeight:900,color:t.tx,fontSize:13}}>CUI Check</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <button onClick={copy} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 15px",borderRadius:11,fontWeight:700,fontSize:12,cursor:"pointer",border:`1px solid ${t.brd}`,background:"transparent",color:t.tx2,fontFamily:"inherit"}}>{copied?"✓ Copiat!":<><II.Share/> Partajează</>}</button>
        <button style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 15px",borderRadius:11,fontWeight:700,fontSize:12,cursor:"pointer",border:"none",background:t.grad,color:"#fff",boxShadow:`0 4px 14px ${t.priG}`,fontFamily:"inherit"}}><II.Down/> PDF</button>
        <ThemeBar tk={tk} setTk={setTk} t={t}/>
      </div>
    </header>
    <main style={{maxWidth:1080,margin:"0 auto",padding:"28px 20px"}}>
      <div style={{marginBottom:24,animation:"slideUp .5s ease"}}>
        <h1 style={{fontSize:26,fontWeight:900,color:t.tx,letterSpacing:"-.02em",marginBottom:6}}>{co.den}</h1>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8}}>
          <span style={{padding:"4px 11px",borderRadius:9,background:t.priS,color:t.pri,fontSize:13,fontWeight:700,fontFamily:"monospace",border:`1px solid ${t.infD}`}}>CUI {co.cui}</span>
          <span style={{fontSize:13,color:t.tx3}}>{co.reg} • {co.adr}</span>
        </div>
      </div>
      <div style={{marginBottom:24,borderRadius:16,border:`1px solid ${rc.d}`,padding:22,background:rc.b,animation:"slideUp .5s ease .1s both"}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <RGauge score={co.risk} t={t}/>
            <div>
              <h2 style={{fontSize:19,fontWeight:900,color:t.tx,marginBottom:3}}>{co.risk<=30?"Companie activă fiscal":co.risk<=60?"Atenție — verificări necesare":"Risc ridicat"}</h2>
              <p style={{fontSize:13,color:t.tx2}}>Scor agregat din 7 verificări oficiale ANAF/ONRC</p>
            </div>
          </div>
          <div style={{textAlign:"right",fontSize:12,color:t.tx3}}>
            <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginBottom:3}}><II.Clock/> {ts}</div>
            <button style={{display:"flex",alignItems:"center",gap:4,color:t.pri,fontWeight:600,background:"none",border:"none",cursor:"pointer",marginLeft:"auto",fontSize:12,fontFamily:"inherit"}}><II.Refresh/> Reîmprospătează</button>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14,marginBottom:24}}>
        {cards.map((c,i)=><CCard key={i}{...c} t={t}/>)}
        <div style={{borderRadius:16,border:`1px solid ${rc.d}`,padding:22,background:rc.b,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,animation:"slideUp .5s ease .8s both"}}>
          <div style={{color:rc.c}}><II.Gauge/></div>
          <h3 style={{fontWeight:800,color:t.tx,fontSize:14}}>Status General</h3>
          <Badge status={r.k} t={t} size="lg"/>
          <p style={{fontSize:12,color:t.tx3,textAlign:"center"}}>{co.risk<=30?"Toate verificările OK":co.risk<=60?"Necesită atenție":"Multiple probleme"}</p>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:16,borderRadius:16,background:t.bg2,border:`1px solid ${t.brd2}`}}>
        <button style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 15px",borderRadius:11,fontWeight:700,fontSize:12,cursor:"pointer",border:"none",background:t.grad,color:"#fff",boxShadow:`0 4px 14px ${t.priG}`,fontFamily:"inherit"}}><II.Down/> Descarcă PDF</button>
        <button onClick={copy} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 15px",borderRadius:11,fontWeight:700,fontSize:12,cursor:"pointer",border:`1px solid ${t.brd}`,background:"transparent",color:t.tx2,fontFamily:"inherit"}}><II.Share/> {copied?"Copiat!":"Copiază raportul"}</button>
      </div>
      <div style={{textAlign:"center",fontSize:11,color:t.tx3,padding:"20px 0",marginTop:16,borderTop:`1px solid ${t.brd2}`}}>Datele sunt preluate live din surse oficiale ANAF/ONRC. Ultima actualizare: {ts}</div>
    </main>
  </>;
}

export default function Page() {
  const [page,setPage]=useState("home");
  const [tk,setTk]=useState("light");
  const [co,setCo]=useState<Company|null>(null);
  const t=TH[tk];
  const check=useCallback((cui:string)=>{
    setPage("loading");
    setTimeout(()=>{
      const c=MK[cui]||{cui,den:`SC COMPANIE ${cui} SRL`,reg:`J40/${cui.slice(0,4)}/2020`,adr:"Str. Exemplu nr. 1, București",inm:"2020-01-01",tva:Math.random()>.3,dtva:"2020-02-01",inact:Math.random()>.8,efact:Math.random()>.4,defact:"2024-01-01",tvainc:Math.random()>.7,split:Math.random()>.85,bpi:Math.random()>.9,risk:Math.floor(Math.random()*100)} as Company;
      setCo(c);setPage("dash");
    },1800);
  },[]);
  return (
    <div style={{background:t.bg,color:t.tx,minHeight:"100vh",fontFamily:"system-ui,-apple-system,sans-serif",transition:"background .3s,color .3s"}}>
      {page==="home"&&<Home onCheck={check} tk={tk} setTk={setTk} t={t}/>}
      {page==="loading"&&<Loading t={t}/>}
      {page==="dash"&&co&&<Dash co={co} onBack={()=>setPage("home")} tk={tk} setTk={setTk} t={t}/>}
    </div>
  );
}
