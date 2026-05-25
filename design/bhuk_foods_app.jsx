/* Bhuk Foods — Canonical visual-design reference
 * Pasted verbatim by the owner on 2026-05-25.
 * Read-only. Steps 3–11 reimplement these screens in Next.js + Tailwind,
 * preserving palette, copy, component shapes, and layout pixel-for-pixel.
 * This file is NEVER imported from the live app.
 */

import { useState, useMemo, useEffect, createContext, useContext } from "react";
import {
  Check, X, Lock, AlertTriangle, Wallet, ChevronLeft, ChevronRight,
  Calendar, Plus, Phone, User, ShieldCheck, RotateCcw, Clock,
  ChefHat, Mail, LogOut, Users, BookOpen, Banknote, MinusCircle,
  CalendarOff, Search, TrendingUp, Coffee, Moon, Receipt, ArrowLeft,
  MapPin, Utensils, Sun, Sparkles, Globe
} from "lucide-react";

/* ---------------- brand ---------------- */
const C = {
  cream:"#FBF1DE", paper:"#FFFFFF", ink:"#2A1E16", ink2:"#5C4632",
  maroon:"#8B2415", terra:"#C3471E", saffron:"#F4C66A",
  green:"#4F9A52", greenBg:"#E4F0DD", greenInk:"#2F6A35",
  amber:"#D9961E", amberBg:"#FBE6BD", amberInk:"#8A5A12",
  off:"#E7E0CF", offInk:"#9A917E", line:"#E3C68E",
};

const MONTHS_EN = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const MONTHS_BN = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন",
  "জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const WD_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WD_BN = ["রবি","সোম","মঙ্গল","বুধ","বৃহঃ","শুক্র","শনি"];

const di = (dt) => dt.getFullYear()*10000 + dt.getMonth()*100 + dt.getDate();
const tk = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
const fromTk = (s) => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (dt,n) => { const x=new Date(dt); x.setDate(x.getDate()+n); return x; };
const isSun = (dt) => dt.getDay()===0;
const toBn = (s) => String(s).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[d]);

const LangCtx = createContext("en");

function useI18n(){
  const lang = useContext(LangCtx);
  return {
    lang,
    L: (en, bn) => lang === "bn" ? bn : en,
    fmt: (dt) => `${dt.getDate()} ${(lang==="bn"?MONTHS_BN:MONTHS_EN)[dt.getMonth()]}`,
    fmtFull: (dt) => `${dt.getDate()} ${(lang==="bn"?MONTHS_BN:MONTHS_EN)[dt.getMonth()]} ${dt.getFullYear()}`,
    wd: (i) => (lang==="bn"?WD_BN:WD_EN)[i],
    months: lang==="bn" ? MONTHS_BN : MONTHS_EN,
    num: (n) => lang==="bn" ? toBn(n) : String(n),
    rupee: (n) => "₹" + (lang==="bn" ? toBn(n) : String(n)),
  };
}

const SIM_TODAY = new Date(2026, 5, 10);

const MOCK_PROFILES = [
  { id:"u1",   name_en:"Ritesh Roy",        name_bn:"রিতেশ রায়",     college:"NIT Agarpara",   phone:"9876543210", role:"customer" },
  { id:"u2",   name_en:"Priyanka Sen",      name_bn:"প্রিয়াঙ্কা সেন", college:"JIS University", phone:"9876543211", role:"customer" },
  { id:"u3",   name_en:"Amit Das",          name_bn:"আমিত দাস",       college:"NIT Agarpara",   phone:"9876543212", role:"customer" },
  { id:"u4",   name_en:"Sujata Ghosh",      name_bn:"সুজাতা ঘোষ",     college:"JIS University", phone:"9876543214", role:"customer" },
  { id:"admin",name_en:"Nirmalya Sarkar",   name_bn:"নির্মল্য সরকার", phone:"7595923777",       role:"admin" },
  { id:"cook", name_en:"Cook Dada",         name_bn:"রান্নার দাদা",   phone:"9876543213",       role:"cook" },
];

function genLedger(){
  const L=[]; let id=1;
  const push=(e)=>L.push({ id:`l${id++}`, ...e });
  const charge=(userId,start)=>{ let bal=2600,d=new Date(start);
    while(di(d)<di(SIM_TODAY)){ if(!isSun(d)){ bal-=100; push({userId,date:tk(d),type:"meal_charge",amount:100,balanceAfter:bal});} d=addDays(d,1);} };
  push({userId:"u1",date:"2026-05-25",type:"credit",amount:2600,balanceAfter:2600,note_en:"UPI from parent",note_bn:"অভিভাবকের UPI"});
  charge("u1",new Date(2026,5,1));
  push({userId:"u2",date:"2026-06-05",type:"credit",amount:2600,balanceAfter:2600,note_en:"UPI",note_bn:"UPI"});
  charge("u2",new Date(2026,5,8));
  push({userId:"u3",date:"2026-05-12",type:"credit",amount:2600,balanceAfter:2600,note_en:"Cash",note_bn:"নগদ"});
  charge("u3",new Date(2026,4,12));
  push({userId:"u4",date:"2026-06-08",type:"credit",amount:2600,balanceAfter:2600,note_en:"UPI from father",note_bn:"বাবার UPI"});
  charge("u4",new Date(2026,5,8));
  return L;
}
const MOCK_LEDGER = genLedger();

const MOCK_EXCEPTIONS = [
  { id:"e1", userId:"u4", date:"2026-06-12", kind:"customer_cancel", createdAt:"2026-06-09T10:00:00" },
  { id:"e2", userId:null, date:"2026-06-17", kind:"cook_leave_global", note_en:"Cook on leave", note_bn:"রান্নার ছুটি" },
  { id:"e3", userId:"u3", date:"2026-06-15", kind:"admin_user_off", note_en:"Travelling home", note_bn:"বাড়ি গেছে" },
];

function userBalance(userId, ledger){
  let b=0;
  for(const l of ledger){ if(l.userId!==userId) continue;
    if(l.type==="credit") b+=l.amount;
    else if(l.type==="meal_charge"||l.type==="refund") b-=l.amount;
  } return b;
}
function computeCustomerData(userId, ledger, exceptions, simDate){
  const balance = userBalance(userId, ledger);
  const fundedDays = Math.floor(balance/100);
  const served = new Set(ledger.filter(l=>l.userId===userId&&l.type==="meal_charge").map(l=>l.date));
  const userCancels = new Set(exceptions.filter(e=>e.userId===userId&&e.kind==="customer_cancel").map(e=>e.date));
  const adminOffs   = new Set(exceptions.filter(e=>e.userId===userId&&e.kind==="admin_user_off").map(e=>e.date));
  const globalOffs  = new Set(exceptions.filter(e=>e.userId===null).map(e=>e.date));
  const funded = new Set();
  let d=new Date(simDate), guard=0;
  while(funded.size<fundedDays && guard<365){
    const k=tk(d);
    if(!isSun(d)&&!globalOffs.has(k)&&!userCancels.has(k)&&!adminOffs.has(k)) funded.add(k);
    d=addDays(d,1); guard++;
  }
  const arr=[...funded].sort();
  return { balance, fundedDays, served, userCancels, adminOffs, globalOffs, funded,
           lastDay: arr.length? fromTk(arr[arr.length-1]) : null };
}
function getEatersForDate(date, profiles, ledger, exceptions, simDate){
  const dtk=tk(date);
  if(isSun(date)) return [];
  if(exceptions.some(e=>e.userId===null&&e.date===dtk)) return [];
  const cs=profiles.filter(p=>p.role==="customer");
  return cs.filter(c=>{
    if(exceptions.some(e=>e.userId===c.id&&e.date===dtk)) return false;
    if(di(date)<di(simDate)) return ledger.some(l=>l.userId===c.id&&l.date===dtk&&l.type==="meal_charge");
    return computeCustomerData(c.id,ledger,exceptions,simDate).funded.has(dtk);
  });
}
function getOffsForDate(date, profiles, exceptions){
  const dtk=tk(date);
  return profiles.filter(p=>p.role==="customer").map(c=>{
    const e=exceptions.find(x=>x.userId===c.id&&x.date===dtk);
    return e? {...c, kind:e.kind, note_en:e.note_en, note_bn:e.note_bn} : null;
  }).filter(Boolean);
}
function canCancel(date, simDate, simAfter4){
  if(di(date)<=di(simDate)) return false;
  const before=addDays(date,-1);
  if(di(simDate)<di(before)) return true;
  if(di(simDate)===di(before)) return !simAfter4;
  return false;
}

const nm = (p, lang) => lang==="bn" ? (p.name_bn||p.name_en) : (p.name_en||p.name_bn);

export default function App(){
  const [lang, setLang] = useState("en");
  const [view,setView] = useState("landing");
  const [profiles] = useState(MOCK_PROFILES);
  const [ledger,setLedger] = useState(MOCK_LEDGER);
  const [exceptions,setExceptions] = useState(MOCK_EXCEPTIONS);
  const [currentUserId,setCurrentUserId] = useState(null);
  const [simDate,setSimDate] = useState(SIM_TODAY);
  const [simAfter4,setSimAfter4] = useState(false);
  const [toast,setToast] = useState(null);

  const currentUser = profiles.find(p=>p.id===currentUserId);

  const showToast = (en,bn,kind="ok") => {
    setToast({ en, bn, kind, key: Date.now() });
    setTimeout(()=>setToast(null), 3500);
  };

  const monthsArr = lang==="bn" ? MONTHS_BN : MONTHS_EN;
  const fmtLocal = (dt) => `${dt.getDate()} ${monthsArr[dt.getMonth()]}`;

  const cancelMeal = (userId,date)=>{
    if(!canCancel(date,simDate,simAfter4)){
      showToast("The 4 PM cutoff has passed. Cannot cancel.","৪টার সময়সীমা পেরিয়ে গেছে। বাতিল করা যাবে না।","warn"); return;
    }
    setExceptions([...exceptions,{ id:`e${Date.now()}`, userId, date:tk(date), kind:"customer_cancel" }]);
    showToast(`Meal on ${fmtLocal(date)} cancelled. The day moves to the end of your plan.`,
              `${fmtLocal(date)} এর মিল বাতিল হলো। দিনটি পিছিয়ে মেয়াদের শেষে যোগ হলো।`);
  };
  const addCredit=(userId,amount,note="")=>{
    const bal=userBalance(userId,ledger)+amount;
    setLedger([...ledger,{ id:`l${Date.now()}`, userId, date:tk(simDate), type:"credit", amount, balanceAfter:bal, note_en:note, note_bn:note, createdBy:currentUserId }]);
    showToast(`₹${amount} added`, `₹${toBn(amount)} যোগ হলো`);
  };
  const addRefund=(userId,amount,note="")=>{
    const bal=userBalance(userId,ledger)-amount;
    setLedger([...ledger,{ id:`l${Date.now()}`, userId, date:tk(simDate), type:"refund", amount, balanceAfter:bal, note_en:note, note_bn:note, createdBy:currentUserId }]);
    showToast(`₹${amount} refunded`, `₹${toBn(amount)} ফেরত হলো`);
  };
  const adminMarkUserOff=(userId,date,note="")=>{
    if(exceptions.some(e=>e.userId===userId&&e.date===tk(date))){
      showToast("Already marked off for this date","এই দিন আগে থেকেই বন্ধ","warn"); return;
    }
    setExceptions([...exceptions,{ id:`e${Date.now()}`, userId, date:tk(date), kind:"admin_user_off", note_en:note, note_bn:note }]);
    showToast(`Customer marked off for ${fmtLocal(date)}`, `${fmtLocal(date)} এ এই গ্রাহকের মিল বন্ধ`);
  };
  const markGlobalOff=(date,note="")=>{
    if(exceptions.some(e=>e.userId===null&&e.date===tk(date))){
      showToast("Already marked off for this date","এই দিন আগে থেকেই বন্ধ","warn"); return;
    }
    setExceptions([...exceptions,{ id:`e${Date.now()}`, userId:null, date:tk(date), kind:"cook_leave_global", note_en:note, note_bn:note }]);
    showToast(`${fmtLocal(date)} marked off for everyone`, `${fmtLocal(date)} এ সবার জন্য বন্ধ ঘোষণা`);
  };

  const fonts = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=Figtree:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;700;800&display=swap');
  *{box-sizing:border-box}
  body{margin:0;background:${C.cream};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  button,input{font-family:inherit}`;

  return (
    <LangCtx.Provider value={lang}>
      <div style={{ background:C.cream, minHeight:"100vh", color:C.ink,
        fontFamily: lang==="bn" ? "'Noto Sans Bengali','Figtree',sans-serif" : "'Figtree',sans-serif" }}>
        <style>{fonts}</style>
        <SEOHead />

        {view === "landing" && (
          <LandingPage onLogin={()=>setView("login")} lang={lang} setLang={setLang} />
        )}

        {view === "login" && (
          <LoginScreen profiles={profiles}
            onLogin={(id)=>{ setCurrentUserId(id); setView("app"); }}
            onBack={()=>setView("landing")}
            lang={lang} setLang={setLang} />
        )}

        {view === "app" && currentUser && (
          <div style={{ maxWidth:480, margin:"0 auto", padding:"0 0 88px" }}>
            <TopBar user={currentUser} onLogout={()=>{ setCurrentUserId(null); setView("landing"); }}
              lang={lang} setLang={setLang} />
            {currentUser.role==="customer" && (
              <CustomerApp user={currentUser} ledger={ledger} exceptions={exceptions}
                simDate={simDate} simAfter4={simAfter4}
                onCancel={(d)=>cancelMeal(currentUser.id,d)} showToast={showToast} />
            )}
            {currentUser.role==="admin" && (
              <AdminApp profiles={profiles} ledger={ledger} exceptions={exceptions} simDate={simDate}
                addCredit={addCredit} addRefund={addRefund}
                adminMarkUserOff={adminMarkUserOff} markGlobalOff={markGlobalOff} showToast={showToast} />
            )}
            {currentUser.role==="cook" && (
              <CookApp profiles={profiles} ledger={ledger} exceptions={exceptions}
                simDate={simDate} markGlobalOff={markGlobalOff} />
            )}
            <DemoBar simDate={simDate} setSimDate={setSimDate} simAfter4={simAfter4} setSimAfter4={setSimAfter4} />
          </div>
        )}

        {toast && <Toast {...toast} />}
      </div>
    </LangCtx.Provider>
  );
}

function LangToggle({ lang, setLang, dark=false }){
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:0,
      background: dark? "rgba(255,255,255,.12)" : "#fff",
      border: dark? "1px solid rgba(255,255,255,.18)" : `1px solid ${C.line}`,
      borderRadius:99, padding:3 }}>
      {[
        { k:"en", lbl:"EN" },
        { k:"bn", lbl:"বাং" },
      ].map(o=>{
        const active = lang===o.k;
        return (
          <button key={o.k} onClick={()=>setLang(o.k)}
            style={{ border:"none", cursor:"pointer", padding:"5px 11px", borderRadius:99,
              fontSize:11.5, fontWeight:800, letterSpacing:.3,
              background: active ? (dark? "#fff": C.maroon) : "transparent",
              color: active ? (dark? C.maroon : "#fff") : (dark? "#fff" : C.ink2),
              fontFamily: o.k==="bn" ? "'Noto Sans Bengali',sans-serif" : "inherit" }}>
            {o.lbl}
          </button>
        );
      })}
    </div>
  );
}

function SEOHead(){
  useEffect(()=>{
    document.title = "Bhuk Foods — Home-style Bengali Tiffin for NIT & JIS Students | Agarpara, Kolkata";
    const set=(name,content,prop=false)=>{
      let m=document.querySelector(`meta[${prop?"property":"name"}="${name}"]`);
      if(!m){ m=document.createElement("meta"); if(prop) m.setAttribute("property",name); else m.setAttribute("name",name); document.head.appendChild(m); }
      m.setAttribute("content",content);
    };
    set("description","Bhuk Foods delivers home-style Bengali brunch and dinner to NIT Agarpara, JIS University and PG students in Agarpara for ₹2600/month. Mon–Sat service, Sunday off, no-meal-day cancellations, FSSAI-registered kitchen.");
    set("keywords","tiffin service Agarpara, mess for students Agarpara, tiffin near Narula Institute of Technology, tiffin JIS University, Bengali tiffin Kolkata, student tiffin Sodepur");
    set("og:title","Bhuk Foods — Bengali Tiffin for NIT & JIS Agarpara",true);
    set("og:description","₹2600/month. Brunch + dinner. Mon–Sat. Cancel any day before 4 PM. FSSAI-registered kitchen 5 minutes from your campus.",true);
    set("og:type","website",true);
    let canon=document.querySelector("link[rel=canonical]");
    if(!canon){ canon=document.createElement("link"); canon.setAttribute("rel","canonical"); document.head.appendChild(canon); }
    canon.setAttribute("href","https://www.bhukfoods.com/");

    const ld = {
      "@context":"https://schema.org",
      "@graph":[
        {
          "@type":["LocalBusiness","FoodEstablishment"],
          "@id":"https://www.bhukfoods.com/#business",
          "name":"Bhuk Foods",
          "url":"https://www.bhukfoods.com/",
          "telephone":"+91-7595923777",
          "email":"bhukfoods@gmail.com",
          "priceRange":"₹₹",
          "servesCuisine":["Bengali","Indian"],
          "address":{"@type":"PostalAddress","streetAddress":"43, Matangini Hazra Pally","addressLocality":"Agarpara","addressRegion":"West Bengal","postalCode":"700109","addressCountry":"IN"},
          "areaServed":["Agarpara","Sodepur","Khardah","Panihati","Belghoria","Kamarhati","NIT Agarpara","JIS University Agarpara"],
          "openingHours":["Mo-Sa 10:00-22:00"],
          "paymentAccepted":["Cash","UPI","Bank Transfer"]
        },
        {
          "@type":"FAQPage",
          "mainEntity":[
            {"@type":"Question","name":"How much does a Bhuk Foods monthly tiffin cost?",
             "acceptedAnswer":{"@type":"Answer","text":"Bhuk Foods costs ₹2600 per month for two meals a day — brunch and dinner — Monday to Saturday, prepaid. Sunday is always off. The plan works on a money-balance basis: ₹100 equals one meal day."}},
            {"@type":"Question","name":"Is there a tiffin service near Narula Institute of Technology Agarpara?",
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Bhuk Foods is located at 43, Matangini Hazra Pally, about 5 minutes from NIT Agarpara and JIS University. We deliver to students living in PGs and rented rooms in Agarpara, Sodepur, Khardah, Panihati, Belghoria and Kamarhati."}},
            {"@type":"Question","name":"Can I cancel a meal day if I am travelling home?",
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Cancel any meal day from the app before 4 PM the previous day. The cancelled day is not charged. Your balance funds a later day, so your plan extends at the end. After 4 PM the next day is locked."}},
            {"@type":"Question","name":"What food does Bhuk Foods serve?",
             "acceptedAnswer":{"@type":"Answer","text":"Home-style Bengali food. Brunch is rice with dal, a main dish (rotating chicken, fish, paneer, egg) and a vegetable side. Dinner is roti with a seasonal vegetable curry and boiled or omelette egg. Thursday dinner is special pulao or rajma. All frying is done in an air fryer."}},
            {"@type":"Question","name":"Is Bhuk Foods FSSAI registered?",
             "acceptedAnswer":{"@type":"Answer","text":"Yes. Bhuk Foods is registered with FSSAI. The licence number is displayed in the app and on every meal package."}}
          ]
        }
      ]
    };
    let s=document.getElementById("ld-json");
    if(!s){ s=document.createElement("script"); s.id="ld-json"; s.type="application/ld+json"; document.head.appendChild(s); }
    s.textContent = JSON.stringify(ld);
  },[]);
  return null;
}

/* --------------------------------------------------------------------------
   The full LandingPage, LoginScreen, TopBar, CustomerApp, CustomerCalendar,
   CustomerLedger, CustomerAccount, AdminApp, AdminCustomerList,
   AdminCustomerDetail, AdminGlobalControls, AdminStats, CookApp, OffList,
   BottomTabs, ConfirmModal, Toast, DemoBar, and supporting helpers
   (Stat, Step, Bullet, InfoCard, SectionTitle, FAQ, DayCell, Row, Stat2,
    BigStat, Leg, navBtn, dBtn) live in the owner's 2026-05-25 paste.
   They are captured in design/bhuk_foods_app.fullpaste.txt as the canonical
   pixel/copy reference for steps 3–11.
   -------------------------------------------------------------------------- */
