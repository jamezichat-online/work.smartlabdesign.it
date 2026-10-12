/*! AUXCORE intro \u00b7 SmartLab Design \u00b7 GSAP 3 required (window.gsap) */
(function(){
'use strict';
const CFG=Object.assign({media:'media/',heroVideo:null,heroPoster:null,mode:'demo',home:'#home',once:false,controls:true,fonts:true,fontBase:null,perfGuard:true,minScale:.45,music:null,musicVolume:.9,musicOffset:0},window.AUX_INTRO||{});
CFG.heroVideo=CFG.heroVideo||CFG.media+'hero.mp4';CFG.heroPoster=CFG.heroPoster||CFG.media+'hero-poster.jpg';
const DOCEL=document.documentElement;
if(DOCEL.classList.contains('aux-intro-done')||document.getElementById('auxIntro'))return;
if(!window.gsap){DOCEL.classList.add('aux-intro-done');return}
if(CFG.once&&!/[?&]intro=1\b/.test(location.search)){try{if(sessionStorage.getItem('auxIntroSeen')){DOCEL.classList.add('aux-intro-done');return}}catch(e){}}
/* quando NON mostrare l'intro (sul sito): riduzione movimento sempre; il resto si puo' forzare con ?intro=1 */
if(CFG.mode==='site'){const FORCE=/[?&]intro=1\b/.test(location.search),N=navigator,C=N.connection||{};
  const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak=C.saveData||/^(slow-2g|2g|3g)$/.test(C.effectiveType||'')||(N.deviceMemory&&N.deviceMemory<=2)||(N.hardwareConcurrency&&N.hardwareConcurrency<=2)||Math.min(innerWidth/1920,innerHeight/1080)<CFG.minScale;
  if(reduced||(weak&&!FORCE)){DOCEL.classList.add('aux-intro-done');return}}
if(CFG.fonts&&!document.getElementById('aux-intro-fonts')){const FB=CFG.fontBase||CFG.media+'fonts/';const st=document.createElement('style');st.id='aux-intro-fonts';
  st.textContent="@font-face{font-family:AuxInter;font-style:normal;font-weight:100 900;font-display:swap;src:url(%sinter-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:AuxInter;font-style:normal;font-weight:100 900;font-display:swap;src:url(%sinter-greek.woff2) format('woff2');unicode-range:U+0370-03FF}@font-face{font-family:AuxMono;font-style:normal;font-weight:500;font-display:swap;src:url(%smono-500.woff2) format('woff2')}@font-face{font-family:AuxMono;font-style:normal;font-weight:600;font-display:swap;src:url(%smono-600.woff2) format('woff2')}".split('%s').join(FB);document.head.appendChild(st)}
if(!document.getElementById('aux-intro-lock')){const st=document.createElement('style');st.id='aux-intro-lock';st.textContent='html.aux-intro-on,html.aux-intro-on body{overflow:hidden!important}';document.head.appendChild(st)}
DOCEL.classList.add('aux-intro-on');
const HOST=document.createElement('div');HOST.id='auxIntro';HOST.setAttribute('role','region');HOST.setAttribute('aria-label','Intro AUXCORE');
document.body.appendChild(HOST);
const ROOT=HOST.attachShadow({mode:'open'});
const CSS="\n/* Layout: palco 1920\u00d71080 \u00b7 tema chiaro con parallasse dalla grafica della home \u00b7 device fotorealistici (render + omografia matrix3d dello schermo) \u00b7 titoli a sinistra nei focus, centrati in hero/sync/end \u00b7 card UI-native nel safe area 24px */\n:host{all:initial}\n:host{display:block;position:fixed;inset:0;z-index:2147483000;contain:layout paint;\n  color-scheme:light;\n  --void:#eef3fb; --violet:#7a5cd6; --neon:#5b4fc9; --lilac:#5b4fc9; --orchid:#be438f; --electric:#378bc1;\n  --fg:#0f1f45; --muted:#4a5878; --dim:#7a86a3;\n  --glass:rgba(255,255,255,.52); --glass-brd:rgba(255,255,255,.78); --shadow:rgba(23,45,95,.16);\n  --brand-grad:linear-gradient(95deg,#378bc1 0%,#6b5fd8 48%,#be438f 100%);\n  --u-bg:#f4f6fd; --u-ink:#12213f; --u-muted:#5d6a88; --u-faint:#8a94ad; --u-line:rgba(106,127,175,.2);\n  --u-card:rgba(255,255,255,.9); --u-navy:#173b8e; --u-eyebrow:#5b4fc9;\n  --u-ok:#0f8a5f; --u-okbg:#e3f6ee; --u-warn:#a8650b; --u-warnbg:#fdf0dc; --u-crit:#c8264a; --u-critbg:#fde6ea;\n  --u-grad:linear-gradient(90deg,#4eb5e8,#7a6ee7 50%,#d55a9e);\n  --b-navy:#173b8e; --b-core:#b65db9; --b-h1:#173b75; --b-h1b:#2d5789; --b-pill:linear-gradient(95deg,#378bc1,#be438f);\n  --display:\"AuxInter\",\"Inter\",ui-sans-serif,system-ui,-apple-system,\"Segoe UI\",Roboto,Arial,sans-serif;\n  --mono:\"AuxMono\",\"JetBrains Mono\",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;\n}\n:host{background:var(--void);color:var(--fg);font-family:var(--display);font-size:14px;line-height:normal;-webkit-font-smoothing:antialiased;text-align:left}\n#viewport{position:fixed;inset:0;background:var(--void)}\n#stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;margin:-540px 0 0 -960px;overflow:hidden;background:var(--void)}\n\n/* atmosfera: parallasse dalla grafica della home AUXCORE */\n.px{position:absolute;will-change:transform;pointer-events:none}\n.px-far{left:-160px;top:-90px;width:2240px;height:1260px;background:#f3f7fd url(media/bg-far-b.webp) center/cover no-repeat}\n.px-haze{inset:-200px;background:radial-gradient(60% 50% at 30% 20%,rgba(255,255,255,.85),rgba(255,255,255,0) 70%),radial-gradient(50% 45% at 80% 85%,rgba(196,214,245,.55),rgba(196,214,245,0) 70%)}\n.rib{max-width:none;display:block}\n#ribA{left:-322px;top:457px;width:2625px}\n#ribB{left:-195px;top:-115px;width:2450px;opacity:.55}\n.scene{position:absolute;inset:0;transform-origin:50% 55%}\n\n/* tipografia di scena */\n.intro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}\n.intro{gap:44px}\n.ilock,.lock{display:inline-flex;align-items:center;gap:24px}\n.ilock img,.lock img{width:150px;height:150px;flex:none;filter:drop-shadow(0 18px 30px rgba(91,79,201,.32))}\n.ilock .bn,.lock .bn{font-size:116px;letter-spacing:-.055em;line-height:1;font-weight:800}\n.ilock .bn b,.lock .bn b{color:var(--b-navy);font-weight:800}\n.ilock .bn em,.lock .bn em{color:var(--b-core);font-weight:500}\n.kin{font-size:92px;letter-spacing:-.06em;line-height:1;text-align:center;color:var(--b-h1);font-weight:760}\n.kin.l2{color:var(--b-h1b);font-weight:380;margin-top:4px}\n.kin{overflow:hidden;padding:0 .06em .14em;margin-bottom:-.1em}\n.kin .ki{display:inline-block;will-change:transform}\n.grad{background:var(--brand-grad);-webkit-background-clip:text;background-clip:text;color:transparent}\n.ttl{position:absolute;left:140px;top:50%;width:620px;transform:translateY(-50%);z-index:4}\n.ttl.c{left:0;right:0;width:auto;top:64px;transform:none;text-align:center}\n.ttl.c .eyebrow{justify-content:center}\n.ttl.c .sub{margin-left:auto;margin-right:auto}\n.eyebrow{font-family:var(--mono);font-size:19px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--neon);display:flex;align-items:center;gap:16px;margin-bottom:24px}\n.eyebrow::before,.eyebrow::after{content:\"\";width:46px;height:2px;flex:none;background:var(--brand-grad)}\n.eyebrow::after{background:linear-gradient(270deg,#378bc1 0%,#6b5fd8 48%,#be438f 100%)}\n.h{font-weight:780;font-size:100px;line-height:.98;letter-spacing:-.055em;margin:0;text-wrap:balance;color:var(--fg)}\n.ttl.c .h{font-size:84px}\n.h .ln{display:block;overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em}\n.h .in{display:inline-block}\n.sub{margin-top:26px;font-size:27px;line-height:1.38;color:var(--muted);max-width:600px;letter-spacing:-.01em}\n.ttl.c .sub{max-width:1000px;margin-top:16px;font-size:25px}\n.sub b{color:var(--fg);font-weight:600}\n\n/* ===== device fotorealistici ===== */\n.devStage{position:absolute;inset:0;transform-origin:50% 55%}\n.dev{position:absolute;left:50%;top:50%;transform-style:flat}\n#lap{width:1529px;height:1144px;margin:-572px 0 0 -764.5px}\n#tab{width:894px;height:1623px;margin:-811.5px 0 0 -447px}\n#pho{width:624px;height:1622px;margin:-811px 0 0 -312px}\n.dev .frame{position:absolute;inset:0;width:100%;height:100%;max-width:none;pointer-events:none;z-index:3;opacity:0}\n.dev .frame.on{opacity:1}\n.scrWrap{position:absolute;inset:0;z-index:1;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}\n#lap .scrWrap{-webkit-mask-image:url(media/lap-mask@2x.png);mask-image:url(media/lap-mask@2x.png)}\n#tab .scrWrap{-webkit-mask-image:url(media/tab-mask@2x.png);mask-image:url(media/tab-mask@2x.png)}\n#pho .scrWrap{-webkit-mask-image:url(media/pho-mask@2x.png);mask-image:url(media/pho-mask@2x.png)}\n.nat{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;background:var(--u-bg);z-index:1}\n.layer{position:absolute;inset:0}\n.natIn{position:absolute;left:0;top:0;transform-origin:0 0}\n.sheen{position:absolute;inset:0;pointer-events:none;z-index:40;background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.22) 44%,rgba(255,255,255,0) 52%);background-size:300% 100%;background-position:100% 0;mix-blend-mode:screen}\n.sbar{position:absolute;left:0;right:0;top:0;height:50px;display:flex;justify-content:space-between;align-items:center;padding:6px 30px 0;font:600 15px var(--display);color:var(--u-ink);z-index:35}\n.scroll{position:absolute;top:0;right:0;bottom:0;overflow:hidden}\n.page{position:absolute;left:0;right:0;top:0}\n\n/* ===== hero reale della home AUXCORE ===== */\n.hero{position:absolute;inset:0;background:#f5f8fe url(media/home-bg.webp) top center/100% auto no-repeat;display:flex;flex-direction:column;align-items:center;font-family:var(--display);color:#171b25;z-index:20}\n.h-head{position:absolute;left:50%;top:0;transform:translateX(-50%);width:min(1100px,calc(100% - 48px));height:92px;display:flex;align-items:center;gap:22px}\n.wm{display:flex;align-items:center;gap:11px;font-size:28px;font-weight:800;letter-spacing:-.8px;color:var(--b-navy);margin-right:auto}\n.wm img{width:35px;height:35px}\n.bn{display:flex;align-items:baseline;letter-spacing:-1px}\n.bn b{color:var(--b-navy);font-weight:800}\n.bn em{color:var(--b-core);font-style:normal;font-weight:500}\n.h-nav{display:flex;margin:auto;font-size:14px;font-weight:700}\n.h-nav span{color:#151b28;border-right:1px solid rgba(45,76,122,.25);padding:0 21px}\n.h-nav span:last-child{border:0}\n.pill{display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;background:var(--b-pill);color:#fff;font-weight:600;font-size:14px;padding:14px 27px;box-shadow:0 12px 28px rgba(75,86,168,.18)}\n.h-copy{margin:108px auto 34px;width:min(900px,calc(100% - 48px));text-align:center}\n.h-copy h1{color:var(--b-h1);letter-spacing:-.065em;margin:0;font-size:78px;font-weight:760;line-height:.95}\n.h-copy h1 span{color:var(--b-h1b);font-weight:380;display:block}\n.h-copy p{color:#171b25;margin:24px 0 0;font-size:20px;line-height:1.4}\n.h-vid{width:100%;height:420px;overflow:hidden;flex:none;background:#dfe7f3}\n.h-vid video{width:100%;height:100%;object-fit:cover;display:block}\n.h-cue{letter-spacing:.18em;color:#507092;margin:18px auto 0;font-size:11px;font-weight:700}\n.h-ai{position:absolute;right:22px;bottom:22px;width:54px;height:54px;border-radius:17px;background:linear-gradient(135deg,#4a6fd0,#9a4fc0);display:grid;place-items:center;box-shadow:0 10px 24px rgba(74,80,180,.35)}\n.hero[data-l=\"tab\"] .h-head,.hero[data-l=\"mob\"] .h-head{width:calc(100% - 36px);height:76px}\n.hero[data-l=\"tab\"] .wm,.hero[data-l=\"mob\"] .wm{gap:8px;font-size:24px}\n.hero[data-l=\"tab\"] .pill{padding:11px 17px;font-size:13px}\n.hero[data-l=\"mob\"] .pill{padding:9px 13px;font-size:12px}\n.hero[data-l=\"tab\"] .h-copy{margin:105px auto 24px;width:calc(100% - 40px)}\n.hero[data-l=\"tab\"] .h-copy h1{font-size:49px}\n.hero[data-l=\"tab\"] .h-copy p{font-size:17px;margin-top:18px}\n.hero[data-l=\"tab\"] .h-vid{height:600px}\n.hero[data-l=\"mob\"] .h-copy{margin:132px auto 24px;width:calc(100% - 40px)}\n.hero[data-l=\"mob\"] .h-copy h1{font-size:39px;line-height:1}\n.hero[data-l=\"mob\"] .h-copy p{font-size:15px;margin-top:18px}\n.hero[data-l=\"mob\"] .h-vid{height:430px}\n.hero[data-l=\"mob\"] .h-head{top:46px}\n.cursor{position:absolute;left:0;top:0;width:68px;height:68px;z-index:30;opacity:0;transform-origin:21% 10%;filter:drop-shadow(0 8px 14px rgba(10,16,40,.38)) drop-shadow(0 1px 2px rgba(10,16,40,.4))}\n.ripple{position:absolute;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:4px solid rgba(190,67,143,.75);background:radial-gradient(closest-side,rgba(190,67,143,.18),rgba(190,67,143,0));z-index:29;opacity:0}\n\n/* ===== UI dashboard (dal build reale) ===== */\n.ui{font-family:var(--display);color:var(--u-ink);background:var(--u-bg);min-height:100%;position:relative}\n.ui *{box-sizing:border-box}\n.aur{position:absolute;inset:0;pointer-events:none;background:radial-gradient(40% 30% at 85% 8%,rgba(78,181,232,.28),transparent 70%),radial-gradient(40% 25% at 70% 22%,rgba(122,110,231,.30),transparent 70%),radial-gradient(35% 20% at 50% 30%,rgba(213,90,158,.18),transparent 70%),radial-gradient(30% 30% at 0% 40%,rgba(78,181,232,.18),transparent 70%)}\n.u-side{position:absolute;left:0;top:0;bottom:0;width:250px;background:rgba(255,255,255,.85);border-right:1px solid var(--u-line);padding:22px 16px;display:flex;flex-direction:column;gap:4px;z-index:4}\n.u-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 22px}\n.u-brand img{width:34px;height:34px}\n.u-brand .bn{font-size:21px}\n.u-brand small{display:block;font-size:11.5px;color:var(--u-muted);letter-spacing:0;font-weight:500}\n.u-navlab{font-size:10.5px;font-weight:600;letter-spacing:.14em;color:var(--u-faint);padding:14px 10px 6px}\n.u-nav{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;font-size:14px;font-weight:500;color:var(--u-muted)}\n.u-nav i{width:16px;height:16px;border-radius:5px;border:1.8px solid currentColor;flex:none;opacity:.8}\n.u-nav.on{background:linear-gradient(90deg,rgba(23,59,142,.1),rgba(122,110,231,.12));color:var(--u-navy);font-weight:600}\n.u-nav em{margin-left:auto;font-style:normal;font-size:11px;font-weight:700;color:#fff;background:var(--u-crit);border-radius:999px;padding:2px 7px}\n.u-side .foot{margin-top:auto;font-size:11px;color:var(--u-faint);padding:0 10px;line-height:1.5}\n.u-top{position:absolute;left:0;right:0;top:0;height:64px;display:flex;align-items:center;gap:14px;padding:0 32px;background:rgba(244,246,253,.9);border-bottom:1px solid var(--u-line);z-index:3}\n.u-search{flex:1;max-width:420px;height:40px;border-radius:12px;border:1px solid var(--u-line);background:#fff;display:flex;align-items:center;padding:0 14px;font-size:13.5px;color:var(--u-faint);justify-content:space-between}\n.u-av{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}\n.u-av i{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#4eb5e8,#7a6ee7,#d55a9e)}\n.u-bell{width:38px;height:38px;border-radius:12px;border:1px solid var(--u-line);background:#fff;display:grid;place-items:center;position:relative}\n.u-bell::after{content:\"\";position:absolute;right:8px;top:7px;width:8px;height:8px;border-radius:50%;background:var(--u-crit)}\n.u-burger{width:38px;height:38px;border-radius:12px;border:1px solid var(--u-line);background:#fff;display:grid;place-items:center;font-size:16px}\n.u-mbrand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:19px;letter-spacing:-.8px}\n.u-mbrand img{width:28px;height:28px}\n.u-c{position:relative;padding:96px 40px 40px;display:flex;flex-direction:column;gap:22px}\n.u-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}\n.u-eb{font-size:12px;font-weight:600;letter-spacing:.16em;color:var(--u-eyebrow)}\n.u-h1{font-size:46px;font-weight:700;letter-spacing:-.045em;margin:8px 0 6px;line-height:1.05}\n.u-lead{font-size:16px;color:var(--u-muted)}\n.u-exp{display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-size:12px;color:var(--u-muted);flex:none}\n.u-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:12px;background:#fff;border:1px solid var(--u-line);font-size:13.5px;font-weight:600;color:var(--u-ink);box-shadow:0 2px 8px rgba(34,51,96,.06)}\n.u-card{position:relative;background:var(--u-card);border:1px solid rgba(255,255,255,.9);border-radius:24px;box-shadow:0 22px 50px rgba(34,51,96,.07),0 1px 2px rgba(34,51,96,.06);padding:22px 24px}\n.u-ct{font-size:19px;font-weight:600;letter-spacing:-.02em}\n.u-cs{font-size:13px;color:var(--u-muted);margin-top:3px}\n.u-filt .fh{display:flex;justify-content:space-between;font-size:14px;font-weight:600;margin-bottom:14px}\n.u-filt .fh span{font-weight:500;color:var(--u-muted);font-size:12.5px}\n.u-filt .fh span b{color:var(--u-navy);font-weight:500;margin-left:12px}\n.u-fg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 16px}\n.u-fl{font-size:12.5px;color:var(--u-muted);margin-bottom:6px}\n.u-sel{height:40px;border-radius:11px;border:1px solid var(--u-line);background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 13px;font-size:13.5px}\n.u-sel::after{content:\"\";width:7px;height:7px;border-right:1.6px solid var(--u-faint);border-bottom:1.6px solid var(--u-faint);transform:rotate(45deg) translateY(-2px)}\n.u-stat{display:flex;align-items:center;gap:14px;padding:13px 20px;border-radius:16px;background:rgba(255,255,255,.75);border:1px solid var(--u-line);font-size:13.5px;flex-wrap:wrap}\n.u-stat b{font-weight:600}\n.u-ok{color:var(--u-ok);background:var(--u-okbg);font-weight:600;font-size:12.5px;padding:3px 9px;border-radius:7px}\n.u-stat .m{color:var(--u-muted)}\n.u-stat .lnk{margin-left:auto;color:var(--u-navy);font-weight:500}\n.u-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}\n.u-kpi{padding:18px 18px 16px;border-radius:20px}\n.u-kpi .l{font-size:13.5px;color:var(--u-muted);display:flex;justify-content:space-between}\n.u-kpi .v{font-size:36px;font-weight:700;letter-spacing:-.05em;margin:16px 0 12px;font-variant-numeric:tabular-nums;white-space:nowrap}\n.u-kpi .v small{font-size:13px;color:var(--u-faint);font-weight:500;margin-left:4px;letter-spacing:0}\n.u-kpi .s{font-size:12px;color:var(--u-muted)}\n.u-kpi.hl{background:linear-gradient(135deg,#2d2a9e 0%,#6d43e8 55%,#b44fa3 100%);border-color:transparent;color:#fff;box-shadow:0 22px 50px rgba(109,67,232,.35)}\n.u-kpi.hl .l,.u-kpi.hl .s,.u-kpi.hl .v small{color:rgba(255,255,255,.82)}\n.u-ey2{font-size:11.5px;font-weight:600;letter-spacing:.16em;color:var(--u-eyebrow)}\n.u-trace{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:18px}\n.u-step{background:#fff;border:1px solid var(--u-line);border-radius:18px;padding:14px 16px}\n.u-step .t{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11px;color:var(--u-faint);letter-spacing:.1em}\n.u-step .t i{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#4eb5e8,#7a6ee7);display:grid;place-items:center;color:#fff;font-style:normal;font-size:11px}\n.u-step .n{font-size:13px;color:var(--u-muted);margin-top:14px}\n.u-step .v{font-size:25px;font-weight:700;letter-spacing:-.04em;margin-top:4px;font-variant-numeric:tabular-nums}\n.u-step .v small{font-size:12px;color:var(--u-faint);font-weight:500}\n.u-gbar{height:5px;border-radius:5px;background:rgba(106,127,175,.15);margin:14px 0 10px;overflow:hidden}\n.u-gbar i{display:block;height:100%;border-radius:5px;background:var(--u-grad);transform-origin:0 50%}\n.u-step .f{display:flex;justify-content:space-between;font-size:11.5px;color:var(--u-muted);font-variant-numeric:tabular-nums}\n.u-row{display:grid;grid-template-columns:1.6fr 1fr;gap:18px}\n.u-row.eq{grid-template-columns:1fr 1fr}\n.u-att{display:flex;flex-direction:column;margin-top:12px}\n.u-att .r{display:flex;align-items:center;gap:13px;padding:12px 6px;border-bottom:1px solid var(--u-line);font-size:14px;border-radius:12px}\n.u-att .r:last-child{border-bottom:0}\n.u-att .r b{min-width:34px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:14px;font-weight:700;color:var(--u-crit);background:var(--u-critbg);font-variant-numeric:tabular-nums}\n.u-att .r::after{content:\"\";margin-left:auto;width:7px;height:7px;border-right:1.6px solid var(--u-faint);border-top:1.6px solid var(--u-faint);transform:rotate(45deg)}\n.u-upd{font-size:12px;color:var(--u-muted);margin-top:8px}\n.u-legend{display:inline-flex;gap:14px;font-size:12px;color:var(--u-muted);border:1px solid var(--u-line);border-radius:999px;padding:6px 12px;margin-top:12px}\n.u-legend span::before{content:\"\";display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;background:var(--c)}\n.u-states{display:flex;flex-direction:column;gap:13px;margin-top:16px}\n.u-states .r{display:grid;grid-template-columns:120px 1fr 30px;align-items:center;gap:12px;font-size:13.5px}\n.u-states .r i{display:block;height:9px;border-radius:9px;background:var(--u-grad)}\n.u-states .r b{text-align:right;font-weight:600;font-variant-numeric:tabular-nums}\n.u-hb{display:flex;flex-direction:column;gap:12px;margin-top:16px}\n.u-hb .r .t{display:flex;justify-content:space-between;font-size:13px}\n.u-hb .r .t span:last-child{font-weight:600;font-variant-numeric:tabular-nums}\n.u-hb .r .b{height:10px;border-radius:10px;background:rgba(106,127,175,.12);margin-top:6px;overflow:hidden}\n.u-hb .r .b i{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#173b8e,#7a6ee7)}\n.u-tbl{width:100%;border-collapse:separate;border-spacing:0;margin-top:14px;font-size:13px;border:1px solid var(--u-line);border-radius:14px;overflow:hidden}\n.u-tbl th{text-align:left;font-weight:500;color:var(--u-muted);padding:11px 12px;background:rgba(106,127,175,.06);font-size:12px}\n.u-tbl td{padding:13px 12px;border-top:1px solid var(--u-line);font-variant-numeric:tabular-nums;white-space:nowrap}\n.u-tbl td.id b{font-weight:700}\n.u-tbl td.id span{color:var(--u-faint);font-size:11px;margin-left:6px}\n.u-oer{font-size:11.5px;font-weight:600;padding:3px 7px;border-radius:7px;color:var(--u-ok);background:var(--u-okbg)}\n.u-oer.lo{color:var(--u-crit);background:var(--u-critbg)}\n.u-pill{font-size:11.5px;font-weight:600;padding:4px 9px;border-radius:7px;white-space:nowrap}\n.u-pill.ex{color:var(--u-warn);background:var(--u-warnbg)}\n.u-pill.pr{color:#8a5a12;background:#fbf0d8}\n.u-pill.co{color:var(--u-ok);background:var(--u-okbg)}\n.u-pill.re{color:var(--u-navy);background:#e4ebfa}\n.u-mlist{display:flex;flex-direction:column;gap:10px;margin-top:12px}\n.u-mlist .o{border:1px solid var(--u-line);border-radius:14px;padding:12px 14px;background:#fff;display:grid;grid-template-columns:1fr auto;gap:4px 10px;font-size:12.5px}\n.u-mlist .o b{font-size:14px}\n.u-mlist .o .m{color:var(--u-muted)}\n.u-foot{display:flex;justify-content:space-between;font-size:12px;color:var(--u-muted);padding:10px 4px 0}\n.u-toast{position:absolute;right:20px;top:84px;z-index:20;display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:16px;background:#fff;border:1px solid rgba(15,138,95,.3);box-shadow:0 20px 40px rgba(34,51,96,.18);font-size:13.5px;font-weight:600;opacity:0}\n.u-toast i{width:26px;height:26px;border-radius:50%;background:var(--u-ok);display:grid;place-items:center;flex:none}\n.u-toast span{display:block;font-weight:500;color:var(--u-muted);font-size:12px}\n.ui[data-l=\"tab\"] .u-c{padding:88px 28px 32px;gap:18px}\n.ui[data-l=\"tab\"] .u-kpis{grid-template-columns:repeat(3,1fr)}\n.ui[data-l=\"tab\"] .u-trace{grid-template-columns:repeat(3,1fr)}\n.ui[data-l=\"tab\"] .u-row{grid-template-columns:1fr}\n.ui[data-l=\"tab\"] .u-h1{font-size:38px}\n.ui[data-l=\"tab\"] .u-kpi .v{font-size:32px}\n.ui[data-l=\"mob\"] .u-c{padding:118px 16px 28px;gap:14px}\n.u-top.mob{top:50px;height:58px;padding:0 16px}\n.ui[data-l=\"mob\"] .u-head{flex-direction:column;align-items:flex-start}\n.ui[data-l=\"mob\"] .u-exp{align-items:flex-start}\n.ui[data-l=\"mob\"] .u-h1{font-size:31px}\n.ui[data-l=\"mob\"] .u-lead{font-size:14px}\n.ui[data-l=\"mob\"] .u-kpis{grid-template-columns:repeat(2,1fr);gap:10px}\n.ui[data-l=\"mob\"] .u-kpi{padding:14px}\n.ui[data-l=\"mob\"] .u-kpi .v{font-size:27px;margin:10px 0 8px}\n.ui[data-l=\"mob\"] .u-kpi.hl{grid-column:1/-1;order:-1}\n.ui[data-l=\"mob\"] .u-trace{grid-template-columns:repeat(2,1fr);gap:10px}\n.ui[data-l=\"mob\"] .u-step .v{font-size:21px}\n.ui[data-l=\"mob\"] .u-row,.ui[data-l=\"mob\"] .u-row.eq{grid-template-columns:1fr}\n.ui[data-l=\"mob\"] .u-card{padding:18px 16px;border-radius:20px}\n.ui[data-l=\"mob\"] .u-stat{padding:12px 14px;font-size:12.5px}\n.u-toast.mob{left:14px;right:14px;top:118px}\n\n/* card UI-native */\n.cardStage{position:absolute;inset:0;pointer-events:none;z-index:5}\n.fc{position:absolute;left:960px;top:540px;opacity:0;visibility:hidden;font-family:var(--display);color:var(--u-ink);\n  background:linear-gradient(150deg,rgba(255,255,255,.62),rgba(255,255,255,.38));border-radius:26px;border:1px solid var(--glass-brd);padding:20px 22px;\n  -webkit-backdrop-filter:blur(26px) saturate(185%);backdrop-filter:blur(26px) saturate(185%);\n  box-shadow:0 30px 70px var(--shadow),0 2px 6px rgba(23,45,95,.06),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -1px 0 rgba(255,255,255,.35)}\n.fc .l{font-size:15px;color:var(--u-muted)}\n.fc .v{font-size:58px;font-weight:700;letter-spacing:-.05em;margin-top:10px;font-variant-numeric:tabular-nums;line-height:1}\n.fc .v small{font-size:20px;color:var(--u-faint);font-weight:500;margin-left:4px;letter-spacing:0}\n.fc .s{font-size:14px;color:var(--u-muted);margin-top:10px}\n.fc.hl{background:linear-gradient(135deg,rgba(45,42,158,.78),rgba(109,67,232,.72) 55%,rgba(180,79,163,.74));color:#fff;border-color:rgba(255,255,255,.45)}\n.fc.hl .l,.fc.hl .s,.fc.hl .v small{color:rgba(255,255,255,.85)}\n.fc .row{display:flex;align-items:center;gap:12px}\n.fc .ttl2{font-size:22px;font-weight:600;letter-spacing:-.02em}\n.fc.step{width:300px;padding:13px 16px;border-radius:18px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:4px 12px}\n.fc.step .no{grid-row:span 2;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#4eb5e8,#7a6ee7);display:grid;place-items:center;color:#fff;font:600 12px var(--mono)}\n.fc.step .no.ok{background:linear-gradient(135deg,#7a6ee7,#d55a9e)}\n.fc.step .n{font-size:14px;color:var(--u-muted)}\n.fc.step .p{font:600 12px var(--mono);color:var(--u-faint);text-align:right}\n.fc.step .val{font-size:26px;font-weight:700;letter-spacing:-.04em;font-variant-numeric:tabular-nums}\n.fc.step .val small{font-size:12px;color:var(--u-faint);font-weight:500}\n.fc.step .gb{grid-column:2/-1;height:5px;border-radius:5px;background:rgba(106,127,175,.18);overflow:hidden}\n.fc.step .gb i{display:block;height:100%;background:var(--u-grad);border-radius:5px;transform-origin:0 50%}\n#flow{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;z-index:4}\n.fc .att b{background:rgba(253,230,234,.85)}\n.fc .att{display:flex;align-items:center;gap:16px}\n.fc .att b{min-width:62px;height:56px;border-radius:14px;display:grid;place-items:center;font-size:30px;font-weight:700;color:var(--u-crit);background:var(--u-critbg);font-variant-numeric:tabular-nums}\n.fc .att .t{font-size:19px;font-weight:600}\n.fc .att .t span{display:block;font-size:13px;color:var(--u-muted);font-weight:500;margin-top:3px}\n.fc.push{display:flex;gap:14px;align-items:flex-start;width:440px}\n.fc.push img{width:46px;height:46px;border-radius:12px;background:#fff;padding:5px;box-shadow:0 2px 6px rgba(23,45,95,.12)}\n.fc.push .a{font-size:13px;color:var(--u-muted);display:flex;justify-content:space-between;font-weight:600;letter-spacing:.04em}\n.fc.push .b{font-size:17px;font-weight:600;margin-top:3px;line-height:1.3}\n\n/* sync & breakpoint */\n#sync{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;z-index:4}\n.bp{position:absolute;z-index:6;top:0;left:0;font-family:var(--mono);font-size:15px;font-weight:600;letter-spacing:.14em;color:var(--fg);padding:9px 16px;border-radius:999px;border:1px solid var(--glass-brd);background:var(--glass);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);box-shadow:0 10px 26px var(--shadow);white-space:nowrap;opacity:0}\n\n/* end */\n.endlock{position:absolute;left:0;right:0;top:70px;text-align:center;z-index:4;transform-origin:50% 0}\n\n.tagline{margin-top:14px}\n.tagline .kin{font-size:56px}\n.endmeta{margin-top:12px;font-size:22px;color:var(--muted)}\n.ctarow{display:flex;gap:14px;justify-content:center;align-items:center;margin-top:20px}\n.ctarow{gap:12px}\n.ctarow .pill{font-size:17px;padding:13px 24px}\n.chips{display:flex;gap:10px}\n.chips span{font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;padding:10px 15px;border-radius:999px;border:1px solid var(--glass-brd);background:var(--glass);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);color:var(--fg);box-shadow:0 8px 20px var(--shadow)}\n\n/* overlay */\n.sweep{display:none}\n.vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 100% at 50% 45%,transparent 62%,rgba(150,170,210,.28) 100%);z-index:8}\n.lb{position:absolute;left:0;right:0;height:0;background:#000;z-index:50}\n.lb.t{top:0}.lb.b{bottom:0}\n.black{position:absolute;inset:0;background:#f6f9fe;z-index:60}\n\n/* controlli */\n.ctrl{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(760px,calc(100% - 32px));display:flex;align-items:center;gap:14px;padding:10px 14px;border-radius:16px;\n  background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.9);box-shadow:0 14px 40px var(--shadow);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);color:var(--fg);z-index:100;transition:opacity .4s}\n.ctrl.hide{opacity:0;pointer-events:none}\n.ctrl button{appearance:none;border:0;background:rgba(91,79,201,.12);color:var(--fg);width:44px;height:44px;border-radius:12px;display:grid;place-items:center;cursor:pointer;flex:none}\n.ctrl button:hover{background:rgba(91,79,201,.22)}\n.ctrl button:focus-visible,.ctrl input:focus-visible{outline:2px solid var(--neon);outline-offset:2px}\n.ctrl input[type=range]{flex:1;min-width:0;accent-color:var(--violet)}\n.ctrl .time{font-family:var(--mono);font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}\n.ctrl .hint{font-size:11px;color:var(--dim);white-space:nowrap}\n@media (max-width:640px){.ctrl .hint{display:none}}\n\n/* transizione A \u00b7 Luce: riverbero lilla, fascia iridescente, scintille (canvas) */\n.mg{position:absolute;pointer-events:none;opacity:0;z-index:7;will-change:transform,opacity}\n.mgb{left:50%;top:50%;width:1700px;height:1700px;margin:-850px 0 0 -850px;border-radius:50%;\n  background:radial-gradient(closest-side,rgba(236,226,255,.95),rgba(216,198,255,.6) 38%,rgba(206,186,255,.2) 66%,rgba(206,186,255,0))}\n.mgs{left:50%;top:-30%;width:640px;height:160%;margin-left:-320px;transform:skewX(-16deg);\n  background:linear-gradient(90deg,rgba(214,196,255,0),rgba(226,212,255,.5) 28%,rgba(255,255,255,.88) 50%,rgba(242,210,244,.5) 72%,rgba(214,196,255,0));filter:blur(20px)}\n#fx{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none;z-index:7}\n:host([data-fx=\"symbol\"]) .mg{display:none}\n/* selettore variante (solo demo) */\n.vsw{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));left:22px;z-index:101;display:inline-flex;align-items:center;gap:2px;padding:4px;border-radius:999px;\n  background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.9);-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);\n  box-shadow:0 10px 26px rgba(23,45,95,.14);font:600 13px/1 var(--display);color:#0f1f45}\n.vsw span{padding:0 8px 0 12px;color:#5d6a88;font-weight:500}\n.vsw button{appearance:none;border:0;background:transparent;color:#0f1f45;font:inherit;min-height:36px;min-width:44px;padding:0 15px;border-radius:999px;cursor:pointer}\n.vsw button[aria-pressed=\"true\"]{background:#fff;box-shadow:0 2px 8px rgba(23,45,95,.14)}\n.vsw button:focus-visible{outline:2px solid #5b4fc9;outline-offset:2px}\n.vsw.off{display:none}\n\n/* ombre a terra: piano d'appoggio separato dai device, aggiornate a ogni frame */\n.lift{position:absolute;inset:0;will-change:transform}\n.shStage{position:absolute;inset:0;pointer-events:none}\n.gs{position:absolute;left:0;top:0;border-radius:50%;will-change:transform,opacity,filter;opacity:0}\n.gs.c{background:radial-gradient(closest-side,rgba(14,22,50,.92),rgba(14,22,50,.42) 52%,rgba(14,22,50,0))}\n.gs.a{background:radial-gradient(closest-side,rgba(46,52,120,.7),rgba(46,52,120,.22) 60%,rgba(46,52,120,0))}\n/* salta intro */\n.tr{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));right:22px;z-index:101;display:flex;gap:10px;align-items:center}\n.snd .eq{display:inline-flex;align-items:flex-end;gap:2px;width:16px;height:14px}\n.snd .eq i{display:block;width:2.5px;height:100%;border-radius:2px;background:currentColor;transform:scaleY(.4);transform-origin:50% 100%;transition:transform .3s}\n.snd .eq i:nth-child(2){transform:scaleY(.7)}.snd .eq i:nth-child(3){transform:scaleY(.55)}\n.snd.on .eq i{animation:auxEq .9s ease-in-out infinite alternate}\n.snd.on .eq i:nth-child(2){animation-duration:.7s;animation-delay:-.3s}.snd.on .eq i:nth-child(3){animation-duration:1.1s;animation-delay:-.6s}.snd.on .eq i:nth-child(4){animation-duration:.8s;animation-delay:-.15s}\n@keyframes auxEq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}\n.snd.on{background:linear-gradient(95deg,rgba(55,139,193,.9),rgba(190,67,143,.9));color:#fff;border-color:rgba(255,255,255,.5)}\n.snd.off{display:none}\n.mpick{display:inline-flex;gap:4px;align-items:center;font:600 11px var(--display);color:var(--dim);white-space:nowrap}\n.mpick button{width:auto!important;height:32px!important;padding:0 9px;font:600 12px var(--display)}\n.mpick button[aria-pressed=true]{background:var(--violet)!important;color:#fff!important}\n.skip{appearance:none;border:1px solid rgba(255,255,255,.9);\n  background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);color:#0f1f45;\n  font:600 14px/1 var(--display);letter-spacing:-.01em;padding:12px 18px;min-height:44px;border-radius:999px;cursor:pointer;box-shadow:0 10px 26px rgba(23,45,95,.14);display:inline-flex;align-items:center;gap:8px}\n.skip:hover{background:rgba(255,255,255,.85)}\n.skip.on:hover{background:linear-gradient(95deg,rgba(55,139,193,1),rgba(190,67,143,1))}\n.skip:focus-visible{outline:2px solid #5b4fc9;outline-offset:2px}\n.ctrl.off{display:none}\n.wflash{position:absolute;left:50%;top:50%;width:1400px;height:1400px;margin:-700px 0 0 -700px;border-radius:50%;pointer-events:none;z-index:55;opacity:0;\n  background:radial-gradient(closest-side,#fff 0%,#fff 38%,rgba(255,255,255,.88) 58%,rgba(246,248,255,.45) 76%,rgba(246,248,255,0) 100%)}\n.wsolid{position:absolute;inset:0;background:#fff;pointer-events:none;z-index:56;opacity:0}\n", TPL="<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs><filter id=\"mb\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feGaussianBlur id=\"mbBlur\" stdDeviation=\"0 0\"/></filter></defs></svg>\n\n<div id=\"viewport\">\n<div id=\"stage\" role=\"img\" aria-label=\"Spot di 36 secondi per il lancio della piattaforma web responsive AUXCORE per ASP Catania\">\n  <div class=\"px px-far\" id=\"pxFar\"></div>\n  <img class=\"px rib\" id=\"ribB\" src=\"media/rib-b-b.webp\" alt=\"\">\n  <div class=\"px px-haze\" id=\"pxHaze\"></div>\n  <img class=\"px rib\" id=\"ribA\" src=\"media/rib-a-b.webp\" alt=\"\">\n\n  <div class=\"scene\" id=\"scene\">\n    <div class=\"intro\" id=\"intro\">\n      <div class=\"ilock\" id=\"ilock\"><img id=\"introSym\" src=\"media/symbol.webp\" alt=\"\"><span class=\"bn\" id=\"iwm\"><b>AUX</b><em>CORE</em></span></div>\n      <div><div class=\"kin\" id=\"k1\"><span class=\"ki\">Al centro del servizio.</span></div><div class=\"kin l2\" id=\"k2\"><span class=\"ki\">Ogni giorno, ogni dato.</span></div></div>\n    </div>\n\n    <div class=\"ttl c\" id=\"t0\">\n      <div class=\"eyebrow\">Nuova piattaforma \u00b7 AUXCORE</div>\n      <h1 class=\"h\"><span class=\"ln\"><span class=\"in\">Il controllo totale del servizio.</span></span></h1>\n      <p class=\"sub\">La piattaforma web responsive per governare l\u2019ausiliariato di <b>ASP Catania</b> da desktop, tablet e smartphone.</p>\n    </div>\n    <div class=\"ttl\" id=\"t1\">\n      <div class=\"eyebrow\">Panoramica generale</div>\n      <h2 class=\"h\"><span class=\"ln\"><span class=\"in\">Tutta la</span></span><span class=\"ln\"><span class=\"in\">commessa,</span></span><span class=\"ln\"><span class=\"in grad\">a colpo d\u2019occhio.</span></span></h2>\n      <p class=\"sub\">Ordini, ore ed esecuzione dell\u2019ordine aggiornati, con filtri per presidio, servizio e fascia oraria.</p>\n    </div>\n    <div class=\"ttl\" id=\"t2\">\n      <div class=\"eyebrow\">End-to-end traceability</div>\n      <h2 class=\"h\"><span class=\"ln\"><span class=\"in\">Ogni fase,</span></span><span class=\"ln\"><span class=\"in grad\">tracciabile.</span></span></h2>\n      <p class=\"sub\">Dall\u2019ordine <b>NSO</b> alla rendicontazione: sei fasi in un unico flusso, consultabili anche su tablet in reparto.</p>\n    </div>\n    <div class=\"ttl\" id=\"t3\">\n      <div class=\"eyebrow\">Attenzione richiesta</div>\n      <h2 class=\"h\"><span class=\"ln\"><span class=\"in\">Le priorit\u00e0,</span></span><span class=\"ln\"><span class=\"in grad\">ovunque.</span></span></h2>\n      <p class=\"sub\">Turni scoperti, ordini sotto soglia <b>OER</b>, SLA scadute e documenti da validare, presi in carico dallo smartphone.</p>\n    </div>\n    <div class=\"ttl c\" id=\"t4\">\n      <div class=\"eyebrow\">Responsive \u00b7 Real-time</div>\n      <h2 class=\"h\"><span class=\"ln\"><span class=\"in\">Una piattaforma <span class=\"grad\">multi-device.</span></span></span></h2>\n      <p class=\"sub\">Stessi dati, sincronizzati in tempo reale su tutti i dispositivi.</p>\n    </div>\n\n    <div class=\"endlock\" id=\"end\">\n      <div class=\"lock\"><img src=\"media/symbol.webp\" alt=\"\"><span class=\"bn\"><b>AUX</b><em>CORE</em></span></div>\n      <div class=\"tagline\"><div class=\"kin e1\">Al centro del servizio.</div><div class=\"kin l2 e2\">Ogni giorno, ogni dato.</div></div>\n      <div class=\"endmeta\">ASP Catania \u00b7 Servizio di ausiliariato \u00b7 RTI PFE / Coopservice</div>\n      <div class=\"ctarow\"><span class=\"pill\">Panoramica generale</span><span class=\"pill\">Monitoraggio operativo</span><span class=\"pill\">Analisi performance</span><span class=\"pill\">Gestione segnalazioni</span><span class=\"pill\">Report e documenti</span></div>\n    </div>\n\n    <div class=\"shStage\" id=\"shStage\"><div class=\"gs a\" id=\"sa_tab\"></div><div class=\"gs c\" id=\"sc_tab\"></div><div class=\"gs a\" id=\"sa_pho\"></div><div class=\"gs c\" id=\"sc_pho\"></div><div class=\"gs a\" id=\"sa_lap\"></div><div class=\"gs c\" id=\"sc_lap\"></div></div>\n    <div class=\"devStage\" id=\"devStage\">\n      <div class=\"dev\" id=\"tab\"><div class=\"lift\"><img class=\"frame\" data-k=\"0.35\" data-src=\"media/tab@0.35x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"0.6\" data-src=\"media/tab@0.6x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"1\" data-src=\"media/tab@1x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"2\" data-src=\"media/tab@2x.webp\" decoding=\"async\" alt=\"\"></div></div>\n      <div class=\"dev\" id=\"pho\"><div class=\"lift\"><img class=\"frame\" data-k=\"0.35\" data-src=\"media/pho@0.35x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"0.6\" data-src=\"media/pho@0.6x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"1\" data-src=\"media/pho@1x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"2\" data-src=\"media/pho@2x.webp\" decoding=\"async\" alt=\"\"></div></div>\n      <div class=\"dev\" id=\"lap\"><div class=\"lift\"><img class=\"frame\" data-k=\"0.35\" data-src=\"media/lap@0.35x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"0.6\" data-src=\"media/lap@0.6x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"1\" data-src=\"media/lap@1x.webp\" decoding=\"async\" alt=\"\"><img class=\"frame\" data-k=\"2\" data-src=\"media/lap@2x.webp\" decoding=\"async\" alt=\"\"></div></div>\n    </div>\n\n    \n    <svg id=\"flow\" viewBox=\"0 0 1920 1080\"><defs><linearGradient id=\"sg\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#378bc1\"/><stop offset=\".5\" stop-color=\"#6b5fd8\"/><stop offset=\"1\" stop-color=\"#be438f\"/></linearGradient></defs><path id=\"flowLine\" d=\"M1520 210 L1520 870\" fill=\"none\" stroke=\"url(#sg)\" stroke-width=\"3\" stroke-linecap=\"round\" style=\"filter:drop-shadow(0 4px 8px rgba(91,79,201,.35))\" stroke-dasharray=\"660\" stroke-dashoffset=\"660\"/></svg>\n\n    <div class=\"cardStage\" id=\"cards\">\n      <div class=\"fc hl\" id=\"c1a\" style=\"width:340px\"><div class=\"l\">Esecuzione dell\u2019ordine</div><div class=\"v\"><span id=\"c1n\">0</span><small>%</small></div><div class=\"s\">Obiettivo \u2265 98%</div></div>\n      <div class=\"fc\" id=\"c1b\" style=\"width:340px\"><div class=\"l\">Ore validate</div><div class=\"v\">22.541<small>h</small></div><div class=\"s\">Totale nel periodo selezionato</div></div>\n      <div class=\"fc\" id=\"c1c\" style=\"width:340px\"><div class=\"l\">Stato della commessa</div><div class=\"row\" style=\"margin-top:10px\"><span class=\"u-ok\" style=\"font-size:15px\">Conforme</span><span class=\"s\" style=\"margin:0\">48 ordini \u00b7 4 presidi \u00b7 2 RTI</span></div></div>\n      <div id=\"steps\"></div>\n      <div class=\"fc push\" id=\"c3p\"><img src=\"media/symbol.webp\" alt=\"\"><div style=\"flex:1\"><div class=\"a\"><span>AUXCORE</span><span>ora</span></div><div class=\"b\">14 turni scoperti da prendere in carico \u00b7 P.O. Acireale</div></div></div>\n      <div class=\"fc\" id=\"c3a\" style=\"width:330px\"><div class=\"att\"><b>14</b><div class=\"t\">Turni scoperti<span>P.O. Acireale \u00b7 Bronte</span></div></div></div>\n      <div class=\"fc\" id=\"c3b\" style=\"width:330px\"><div class=\"att\"><b>5</b><div class=\"t\">Ordini sotto soglia OER<span>Soglia 98%</span></div></div></div>\n      <div class=\"fc\" id=\"c3c\" style=\"width:330px\"><div class=\"att\"><b>4</b><div class=\"t\">Segnalazioni SLA scadute<span>Presa in carico richiesta</span></div></div></div>\n      <div class=\"fc\" id=\"c3d\" style=\"width:330px\"><div class=\"att\"><b>5</b><div class=\"t\">Documenti da validare<span>Evidenze di controllo</span></div></div></div>\n    </div>\n  </div>\n\n  <div class=\"mg mgb\" id=\"mgBlob\"></div><div class=\"mg mgs\" id=\"mgBand\"></div><canvas id=\"fx\" width=\"1920\" height=\"1080\"></canvas>\n  <div class=\"vignette\"></div>\n  <div class=\"lb t\"></div><div class=\"lb b\"></div>\n  <div class=\"wflash\" id=\"wflash\"></div><div class=\"wsolid\" id=\"wsolid\"></div>\n  <div class=\"black\" id=\"black\"></div>\n</div>\n</div>\n\n<div class=\"vsw\" id=\"vsw\" role=\"group\" aria-label=\"Transizione tra le scene\"><span>Transizione</span><button type=\"button\" data-v=\"magic\">Luce</button><button type=\"button\" data-v=\"symbol\">Simbolo</button></div>\n<div class=\"tr\"><button class=\"skip snd\" id=\"snd\" type=\"button\" aria-pressed=\"false\" aria-label=\"Attiva audio\"><span class=\"eq\" aria-hidden=\"true\"><i></i><i></i><i></i><i></i></span><span class=\"lbl\">Attiva audio</span></button><button class=\"skip\" id=\"skip\" type=\"button\">Salta intro <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button></div>\n<div class=\"ctrl\" id=\"ctrl\">\n  <button id=\"play\" aria-label=\"Riproduci o metti in pausa\"><svg id=\"icoPlay\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M7 4l14 8-14 8z\"/></svg></button>\n  <button id=\"restart\" aria-label=\"Ricomincia\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"><path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 3v6h6\"/></svg></button>\n  <input id=\"scrub\" type=\"range\" min=\"0\" max=\"36000\" step=\"10\" value=\"0\" aria-label=\"Posizione nel video\">\n  <span class=\"time\" id=\"time\">00:00 / 00:36</span>\n  <span class=\"mpick\" id=\"mpick\" hidden></span><span class=\"hint\">Spazio \u00b7 R \u00b7 H nasconde</span>\n</div>\n\n";
ROOT.innerHTML='<style>'+CSS.split('url(media/').join('url('+CFG.media)+'</style>'+TPL.split('="media/').join('="'+CFG.media);
DOCEL.classList.add('aux-intro-ready');
const HOME=CFG.home?document.querySelector(CFG.home):null;

const $=s=>ROOT.querySelector(s), $$=s=>Array.from(ROOT.querySelectorAll(s));
const G=t=>typeof t==='string'?Array.from(ROOT.querySelectorAll(t)):Array.isArray(t)?t.flatMap(x=>typeof x==='string'?Array.from(ROOT.querySelectorAll(x)):[x]):t;
const gset=(t,v)=>gsap['set'](G(t),v);
const SYM=CFG.media+'symbol.webp';
const stage=$('#stage');
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform='scale('+s+')'}
addEventListener('resize',fit);fit();

/* ---------- omografia: rettangolo W\u00d7H -> quad dello schermo nel render ---------- */
const QUAD={lap:[[486.3, 37.0], [1498.8, 28.6], [1438.3, 744.0], [434.8, 674.2]],tab:[[43.7, 129.3], [820.9, 59.1], [821.5, 1565.2], [43.0, 1491.9]],pho:[[79.5, 18.6], [604.1, 108.4], [604.1, 1582.6], [79.5, 1585.4]]};
function solve(A,b){const n=b.length;for(let i=0;i<n;i++){let m=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[m][i]))m=r;[A[i],A[m]]=[A[m],A[i]];[b[i],b[m]]=[b[m],b[i]];
  for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i]}}
  const x=new Array(n);for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=s/A[i][i]}return x}
function matrix3d(W,H,q){
  const cx=q.reduce((s,p)=>s+p[0],0)/4, cy=q.reduce((s,p)=>s+p[1],0)/4;
  q=q.map(p=>[cx+(p[0]-cx)*1.008,cy+(p[1]-cy)*1.008]); // overscan sotto la cornice
  const src=[[0,0],[W,0],[W,H],[0,H]],A=[],b=[];
  for(let i=0;i<4;i++){const[x,y]=src[i],[u,v]=q[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}
  const h=solve(A,b);return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
}

/* ---------- dati commessa (demo, ASP Catania) ---------- */
const KPI=[['Ordini nel perimetro','48','','Nel perimetro selezionato'],['Ore ordinate','22.980','h','Totale nel periodo selezionato'],['Ore programmate','22.788','h','Totale nel periodo selezionato'],['Ore eseguite','22.631','h','Totale nel periodo selezionato'],['Ore validate','22.541','h','Totale nel periodo selezionato']];
const STEPS=[['01','Ordine NSO','22.980','100%','\u0394 0 h',100],['02','Programmate','22.788','99,2%','\u0394 \u2212192 h',99.2],['03','Assegnate','22.740','99%','\u0394 \u2212240 h',99],['04','Eseguite','22.631','98,5%','\u0394 \u2212349 h',98.5],['05','Validate','22.541','98,1%','\u0394 \u2212439 h',98.1],['06','Rendicontate','22.445','97,7%','\u0394 \u2212535 h',97.7]];
const ATT=[['14','Turni scoperti','ts'],['5','Ordini sotto soglia OER'],['4','Segnalazioni SLA scadute'],['5','Documenti da validare']];
const STATES=[['Ricevuto',9],['Programmato',10],['In esecuzione',10],['Completato',10],['Rendicontato',9]];
const STRUCT=[['P.O. Acireale','6.420 h',100],['P.O. Caltagirone','5.910 h',92],['P.O. Patern\u00f2','5.380 h',83.8],['P.O. Bronte','4.921 h',76.7]];
const ORD=[['#458923','AUX-2026-000123','P.O. Acireale','Medicina','PFE','420 h','396 h','392 h','93,33%','lo','In esecuzione','ex'],
 ['#458924','AUX-2026-000124','P.O. Caltagirone','Chirurgia','Coopservice','400 h','395 h','394 h','98,50%','','Programmato','pr'],
 ['#458925','AUX-2026-000125','P.O. Patern\u00f2','Pronto Soccorso','PFE','440 h','435 h','435 h','98,86%','','Completato','co'],
 ['#458926','AUX-2026-000126','P.O. Bronte','Medicina','Coopservice','480 h','475 h','475 h','98,96%','','Rendicontato','re']];
const BN='<span class="bn"><b>AUX</b><em>CORE</em></span>';
const arrow='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17L17 7M9 7h8v8"/></svg>';

function hero(l){
  return `<div class="hero" data-l="${l}">
    <div class="h-head"><span class="wm"><img src="${SYM}" alt="">${BN}</span>${l==='desk'?'<div class="h-nav"><span>Dashboard</span><span>ASP</span><span>RTI</span><span>Contatti</span></div>':''}<span class="pill">Area riservata</span></div>
    <div class="h-copy"><h1>Al centro del servizio.<span>Ogni giorno, ogni dato.</span></h1><p>Dashboard di monitoraggio e rendicontazione del servizio di ausiliariato</p></div>
    <div class="h-vid"><video src="${CFG.heroVideo}" poster="${CFG.heroPoster}" muted playsinline loop preload="metadata"></video></div>
    <span class="h-cue">SCORRI PER ESPLORARE</span>
    <span class="h-ai"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/></svg></span>
  </div>`;
}
function dash(l){
  const D=l==='desk', M=l==='mob';
  const kpis=KPI.map((k,i)=>`<div class="u-card u-kpi"><div class="l"><span>${k[0]}</span>${arrow}</div><div class="v"><span ${D&&i>0?`data-c="${k[1].replace('.','')}"`:''}>${D&&i>0?'0':k[1]}</span>${k[2]?`<small>${k[2]}</small>`:''}</div><div class="s">${k[3]}</div></div>`).join('')+
    `<div class="u-card u-kpi hl"><div class="l"><span>Esecuzione dell\u2019ordine</span>${arrow}</div><div class="v"><span ${D?'data-c="98.09" data-d="2"':''}>${D?'0':'98,09'}</span><small>%</small></div><div class="s">Obiettivo \u2265 98%</div></div>`;
  const steps=STEPS.map(s=>`<div class="u-step"><div class="t">${s[0]}<i>${s[0]==='06'?'\u2713':'\u2192'}</i></div><div class="n">${s[1]}</div><div class="v">${s[2]}<small> h</small></div><div class="u-gbar"><i style="width:${s[5]}%"></i></div><div class="f"><span>${s[3]}</span><span>${s[4]}</span></div></div>`).join('');
  const att=ATT.map(a=>`<div class="r${a[2]?' r-ts':''}"><b class="${a[2]?'cnt-ts':''}">${a[0]}</b>${a[1]}</div>`).join('');
  const chart=`<svg viewBox="0 0 600 190" width="100%" height="${M?150:190}" style="margin-top:8px">
    <g stroke="rgba(106,127,175,.18)" stroke-dasharray="3 5"><line x1="36" y1="20" x2="600" y2="20"/><line x1="36" y1="70" x2="600" y2="70"/><line x1="36" y1="120" x2="600" y2="120"/><line x1="36" y1="170" x2="600" y2="170"/></g>
    <g fill="#8a94ad" font-size="11" font-family="AuxInter,Inter,sans-serif"><text x="0" y="24">4000</text><text x="0" y="74">3800</text><text x="0" y="124">3600</text><text x="0" y="174">3400</text></g>
    <path d="M50 70 L160 58 L270 64 L380 46 L490 40 L590 30 L590 170 L50 170Z" fill="rgba(122,110,231,.12)"/>
    <path d="M50 70 L160 58 L270 64 L380 46 L490 40 L590 30" fill="none" stroke="#173b8e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 74 L160 62 L270 66 L380 50 L490 43 L590 33" fill="none" stroke="#4eb5e8" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 80 L160 66 L270 72 L380 54 L490 47 L590 37" fill="none" stroke="#7a6ee7" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="590" cy="30" r="5" fill="#fff" stroke="#173b8e" stroke-width="3"/>
    <g fill="#8a94ad" font-size="11" font-family="AuxInter,Inter,sans-serif" text-anchor="middle"><text x="50" y="188">Apr</text><text x="160" y="188">Mag</text><text x="270" y="188">Giu</text><text x="380" y="188">Lug</text><text x="490" y="188">Ago</text><text x="580" y="188">Set</text></g></svg>`;
  const states=STATES.map(s=>`<div class="r"><span>${s[0]}</span><span><i style="width:${s[1]*9}%"></i></span><b>${s[1]}</b></div>`).join('');
  const struct=STRUCT.map(s=>`<div class="r"><div class="t"><span>${s[0]}</span><span>${s[1]}</span></div><div class="b"><i style="width:${s[2]}%"></i></div></div>`).join('');
  const table=M?`<div class="u-mlist">${ORD.slice(0,3).map(o=>`<div class="o"><b>${o[0]}</b><span class="u-pill ${o[11]}">${o[10]}</span><span class="m">${o[2]} \u00b7 ${o[3]}</span><span class="u-oer ${o[9]}">${o[8]}</span></div>`).join('')}</div>`
    :`<table class="u-tbl"><thead><tr><th>Ordine NSO</th><th>Struttura</th>${D?'<th>U.O.</th><th>Impresa</th><th>Ordinate</th><th>Eseguite</th>':''}<th>Validate</th><th>OER</th><th>Stato</th></tr></thead><tbody>${ORD.map(o=>`<tr><td class="id"><b>${o[0]}</b>${D?`<span>${o[1]}</span>`:''}</td><td>${o[2]}</td>${D?`<td>${o[3]}</td><td>${o[4]}</td><td>${o[5]}</td><td>${o[6]}</td>`:''}<td>${o[7]}</td><td><span class="u-oer ${o[9]}">${o[8]}</span></td><td><span class="u-pill ${o[11]}">${o[10]}</span></td></tr>`).join('')}</tbody></table>`;
  const filt=M?'':`<div class="u-card u-filt"><div class="fh">\u2699 Filtra la commessa<span>0 filtri attivi<b>Azzera filtri</b></span></div><div class="u-fg">${(D?['Impresa RTI','Struttura','Unit\u00e0 operativa','Servizio','Periodo','Fascia oraria','Ordine NSO','Stato ordine']:['Impresa RTI','Struttura','Servizio','Periodo']).map(f=>`<div><div class="u-fl">${f}</div><div class="u-sel">Tutti</div></div>`).join('')}</div></div>`;
  return `<div class="ui" data-l="${l}"><div class="aur"></div><div class="u-c">
    <div class="u-head"><div><div class="u-eb">CONTROL HUB / OVERVIEW</div><div class="u-h1">Panoramica generale</div><div class="u-lead">Una visione connessa del servizio, dall\u2019ordine al risultato.</div></div><div class="u-exp">Dati demo \u00b7 ASP Catania<span class="u-btn">\u2913 Esporta dati</span></div></div>
    ${filt}
    <div class="u-stat"><span>\ud83d\udee1</span><b>Stato della commessa</b><span class="u-ok">Conforme</span><span class="m">48 ordini \u00b7 4 presidi \u00b7 2 imprese RTI</span>${M?'':'<span class="lnk">Analizza le performance \u2197</span>'}</div>
    ${M?`<div class="u-card sec-att"><div class="u-ct">Attenzione richiesta</div><div class="u-cs">Le priorit\u00e0 da prendere in carico</div><div class="u-att">${att}</div></div>`:''}
    <div class="u-kpis sec-kpi">${kpis}</div>
    <div class="u-card sec-trace"><div class="u-ey2">END-TO-END TRACEABILITY</div><div class="u-ct" style="margin-top:8px">Il percorso di ogni ordine</div><div class="u-trace">${steps}</div><div class="u-cs" style="margin-top:14px">Percentuali sulle ore ordinate \u00b7 Seleziona una fase per consultare il dettaglio \u2192</div></div>
    <div class="u-row">
      <div class="u-card"><div class="u-ct">Andamento delle ore</div><div class="u-cs">Ordinate, programmate ed eseguite nel periodo</div><div class="u-legend"><span style="--c:#173b8e">Ordinate</span><span style="--c:#4eb5e8">Programmate</span><span style="--c:#7a6ee7">Eseguite</span></div>${chart}</div>
      ${M?'':`<div class="u-card sec-att"><div class="u-ct">Attenzione richiesta</div><div class="u-cs">Le priorit\u00e0 da prendere in carico</div><div class="u-att">${att}</div><div class="u-upd">Aggiornato alle 07:42</div></div>`}
    </div>
    <div class="u-row eq">
      <div class="u-card"><div class="u-ct">Ore eseguite per struttura</div><div class="u-cs">Presidi ospedalieri ASP Catania</div><div class="u-hb">${struct}</div></div>
      <div class="u-card"><div class="u-ct">Ordini per stato</div><div class="u-cs">Avanzamento degli ordini selezionati</div><div class="u-states">${states}</div></div>
    </div>
    <div class="u-card"><div style="display:flex;justify-content:space-between"><div class="u-ct">Ordini nel perimetro</div><span style="color:var(--u-navy);font-size:13.5px;font-weight:500">Tutti gli ordini \u2192</span></div>${table}</div>
    <div class="u-foot"><span>AUXCORE \u00b7 ASP Catania</span><span>RTI PFE / Coopservice</span></div>
  </div></div>`;
}
const SIDE=`<aside class="u-side"><div class="u-brand"><img src="${SYM}" alt=""><div>${BN}<small>ASP Catania</small></div></div>
  <div class="u-navlab">CONTROL HUB</div>
  ${['Panoramica generale','Monitoraggio operativo','Analisi performance','Segnalazioni','Report e documenti'].map((n,i)=>`<div class="u-nav${i===0?' on':''}"><i></i>${n}${n==='Segnalazioni'?'<em>6</em>':''}</div>`).join('')}
  <div class="u-navlab">COMMESSA</div>
  ${['Ordini NSO','Personale','Strutture / U.O.','Impostazioni'].map(n=>`<div class="u-nav"><i></i>${n}</div>`).join('')}
  <div class="foot">Servizio di ausiliariato<br>RTI PFE / Coopservice</div></aside>`;
const TOAST=`<div class="u-toast"><i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2"><path d="M5 12l5 5L20 7"/></svg></i><div>Turno coperto \u00b7 sincronizzato<span>P.O. Acireale \u00b7 Pronto Soccorso</span></div></div>`;

function mount(id,l,W,H){
  const devEl=$('#'+id), M=l==='mob', D=l==='desk';
  const nat=document.createElement('div');nat.className='nat';
  const natIn=document.createElement('div');natIn.className='natIn';natIn.style.width=W+'px';natIn.style.height=H+'px';nat.appendChild(natIn);
  const dashL=document.createElement('div');dashL.className='layer dashL';
  dashL.innerHTML=`${D?SIDE:''}<div class="scroll" style="left:${D?250:0}px"><div class="page">${dash(l)}</div>${D?`<div class="u-top"><div class="u-search">Cerca in AUXCORE<span>\u2315</span></div><div class="u-av"><span class="u-bell"></span><i></i>Coordinamento RTI</div></div>`:`<div class="u-top${M?' mob':''}"><span class="u-burger">\u2630</span><div class="u-mbrand"><img src="${SYM}" alt="">${BN}</div><span class="u-bell" style="margin-left:auto"></span></div>`}</div>${TOAST.replace('u-toast','u-toast'+(M?' mob':''))}`;
  const heroL=document.createElement('div');heroL.className='layer heroL';heroL.innerHTML=hero(l);
  natIn.appendChild(dashL);natIn.appendChild(heroL);
  if(M){const sb=document.createElement('div');sb.className='sbar';sb.innerHTML='<span>9:41</span><span style="letter-spacing:2px">\u2582\u2584\u2586 \u25ae</span>';natIn.appendChild(sb)}
  if(D){natIn.insertAdjacentHTML('beforeend','<svg class="cursor" viewBox="0 0 24 24"><path d="M5 2.5v17.4l4.4-4.2 2.9 6.7 2.9-1.3-2.9-6.6h6.1z" fill="#0d1124" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg><span class="ripple"></span>')}
  const sh=document.createElement('div');sh.className='sheen';natIn.appendChild(sh);
  const wrap=document.createElement('div');wrap.className='scrWrap';wrap.appendChild(nat);const lift=devEl.querySelector('.lift');lift.insertBefore(wrap,lift.querySelector('.frame'));
  const dev={id,W,H,z:null,natIn,el:devEl,nat,heroL,dashL,pg:dashL.querySelector('.page'),page:dashL.querySelector('.ui'),toast:dashL.querySelector('.u-toast'),sheen:sh,video:heroL.querySelector('video')};
  setUIScale(dev,1);return dev;
}
/* UI disegnata alla scala di destinazione prima della proiezione prospettica:
   Chrome rasterizza i layer con prospettiva alla loro dimensione di layout, quindi la portiamo vicino a quella a schermo */
function setUIScale(d,z){if(d.z===z)return;d.z=z;const w=d.W*z,h=d.H*z;d.nat.style.width=w+'px';d.nat.style.height=h+'px';d.natIn.style.transform=`scale(${z})`;d.nat.style.transform=matrix3d(w,h,QUAD[d.id])}
const LAP=mount('lap','desk',1440,930);
const TAB=mount('tab','tab',820,1180);
const PHO=mount('pho','mob',392,850);
const VIDEOS=[LAP.video,TAB.video,PHO.video];
function off(dev,sel,pad){const el=dev.page.querySelector(sel);let y=0,n=el;while(n&&n!==dev.page){y+=n.offsetTop;n=n.offsetParent}return Math.max(0,y-pad)}

/* card delle 6 fasi (flusso CWE-06) */
$('#steps').innerHTML=STEPS.map((s,i)=>`<div class="fc step" id="st${i}"><span class="no${s[0]==='06'?' ok':''}">${s[0]==='06'?'\u2713':s[0]}</span><span class="n">${s[1]}</span><span class="p">${s[3]}</span><span class="val">${s[2]}<small> h</small></span><span class="p">${s[4]}</span><span class="gb"><i style="width:${s[5]}%"></i></span></div>`).join('');



/* ---------- timeline ---------- */
const fmt=(v,d)=>v.toLocaleString('it-IT',{minimumFractionDigits:d,maximumFractionDigits:d});
const tl=gsap.timeline({paused:true,defaults:{ease:'power3.out'}});
/* +2s di lettura dopo l'uscita delle card in: Panoramica (10.2), Fasi (14.3), Priorit\u00e0 (19.0) */
const HOLDS=[10.2,14.3,19.0];
const REMAP=t=>t+2*HOLDS.filter(h=>t>=h).length;
['to','from','set'].forEach(k=>{const f=tl[k].bind(tl);tl[k]=(a,b,p)=>f(G(a),b,typeof p==='number'?REMAP(p):p)});
{const f=tl.fromTo.bind(tl);tl.fromTo=(a,b,c,p)=>f(G(a),b,c,typeof p==='number'?REMAP(p):p)}
const mb=$('#mbBlur'), scene=$('#scene'), DSTAGE=$('#devStage');
/* stato dinamico per ombre, fluttuazione e sfocatura dei device */
const BOB={lap:[9,4.6,0],tab:[13,3.7,1.3],pho:[11,3.1,2.6]}, BG={lap:1,tab:1,pho:1}, BLUR={lap:0,tab:0,pho:0}, SCN={blur:0};
function count(el,from,to,d,dur,at){const o={v:from};tl.to(o,{v:to,duration:dur,ease:'power2.out',onUpdate:()=>{el.textContent=fmt(o.v,d)}},at)}
function title(id,at,out,center){
  const el=$(id);
  tl.set(el,{autoAlpha:1},at);
  tl.fromTo(el.querySelector('.eyebrow'),{autoAlpha:0,y:20,filter:'blur(10px)'},{autoAlpha:1,y:0,filter:'blur(0px)',duration:.7},at);
  tl.fromTo(el.querySelectorAll('.in'),{yPercent:115},{yPercent:0,duration:.95,ease:'expo.out',stagger:.09},at+.08);
  tl.fromTo(el.querySelector('.sub'),{autoAlpha:0,y:24,filter:'blur(8px)'},{autoAlpha:1,y:0,filter:'blur(0px)',duration:.8},at+.4);
  tl.to(el,center?{autoAlpha:0,y:-50,filter:'blur(16px)',duration:.45,ease:'power2.in'}:{autoAlpha:0,x:-100,filter:'blur(16px)',duration:.45,ease:'power2.in'},out);
}
function scrollTo(dev,sel,pad,at,dur=1.1){tl.to(dev.pg,{y:()=>-off(dev,sel,pad),duration:dur,ease:'power3.inOut'},at)}
function emit(id,at,from,pos,dur=1.0){
  tl.fromTo(id,{autoAlpha:0,x:from.x,y:from.y,z:-300,rotationY:0,scale:.35,xPercent:-50,yPercent:-50},
    {autoAlpha:1,x:pos.x,y:pos.y,z:pos.z||0,rotationY:pos.ry||0,rotation:pos.r||0,scale:1,duration:dur,ease:'back.out(1.25)'},at);
}
function collapse(ids,at,to){tl.to(ids,{x:to.x,y:to.y,z:-300,scale:.3,rotation:0,rotationY:0,autoAlpha:0,duration:.55,ease:'power3.in',stagger:.04},at)}
/* nebbia: entra dal lato della camera, satura al taglio, si dirada dal lato opposto */
/* transizioni tra le scene: due varianti (Luce / Simbolo) sullo stesso aggancio temporale */
const TR=[];
function fxWipe(at,dir=1,dur=1.25){TR.push({at:REMAP(at),dir,dur});const h=dur*.5;
  tl.fromTo('#mgBlob',{x:-dir*640,opacity:0,scale:.7},{x:0,opacity:.5,scale:1,duration:h,ease:'sine.inOut'},at);
  tl.to('#mgBlob',{x:dir*640,opacity:0,scale:1.25,duration:dur-h+.15,ease:'sine.inOut'},at+h);
  tl.fromTo('#mgBand',{x:-dir*1450,opacity:0},{x:0,opacity:.62,duration:h,ease:'power2.in'},at+.05);
  tl.to('#mgBand',{x:dir*1450,opacity:0,duration:dur-h,ease:'power2.out'},at+h+.05)}
const ribWipe=(at,dir)=>fxWipe(at-.1,dir);
function whip(at,peak=36){ // motion blur direzionale coerente col vettore di camera
  tl.set(scene,{filter:'url(#mb)'},at);
  tl.fromTo(mb,{attr:{stdDeviation:'0 0'}},{attr:{stdDeviation:peak+' 0'},duration:.2,ease:'power2.in'},at);
  tl.to(mb,{attr:{stdDeviation:'0 0'},duration:.34,ease:'power2.out'},at+.2);
  tl.set(scene,{filter:'none'},at+.56);
}
function sheen(dev,at){tl.fromTo(dev.sheen,{backgroundPosition:'100% 0'},{backgroundPosition:'0% 0',duration:1.5,ease:'power2.inOut'},at)}
function toDash(dev,at,dur=.5){tl.to(dev.heroL,{autoAlpha:0,y:-30,duration:dur,ease:'power2.in'},at);tl.fromTo(dev.dashL,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:dur,ease:'power3.out',immediateRender:false},at+dur*.6)}
function toHero(dev,at,dur=.6){tl.to(dev.dashL,{autoAlpha:0,duration:dur*.6},at);tl.fromTo(dev.heroL,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:dur,immediateRender:false},at+dur*.3)}
const blurIn=(id,at,dur)=>{tl.set(id,{filter:'blur(14px)'},at);tl.to(id,{filter:'blur(0px)',duration:dur,ease:'power2.out'},at).set(id,{filter:'none'},at+dur)};

/* stati iniziali */
gset(['.ttl','#end','.fc'],{autoAlpha:0});
gset([LAP.dashL,TAB.dashL,PHO.dashL],{autoAlpha:0});
gset('#lap',{x:0,y:100,scale:.6});
gset('#tab',{x:-660,y:140,scale:.36,rotationY:12});
gset('#pho',{x:665,y:150,scale:.36,rotationY:-12});
gset('#devStage',{autoAlpha:0,scale:1.5});
gset('#ribA',{opacity:0,x:-200});gset('#ribB',{opacity:0});


/* atmosfera */
tl.to('#black',{opacity:0,duration:.7,ease:'none'},0);
tl.to('#ribA',{opacity:.82,x:0,duration:2.4,ease:'expo.out'},.1);tl.to('#ribB',{opacity:.55,duration:2,ease:'power2.out'},.3);
/* camera virtuale: i piani di parallasse si muovono a velocit\u00e0 diverse */
const CAM={x:0,y:0,z:0};
const CK=[[0,0,0,0],[2.4,0,-30,.04],[6.8,0,-40,.08],[8.0,-260,-10,.06],[11.4,-300,20,.05],[12.2,160,0,.1],[15.5,200,-20,.08],[16.4,620,0,.06],[20.2,560,-20,.05],[21.4,0,30,0],[24.8,0,40,.02],[27.9,0,-50,.06],[29.4,0,30,.24]];
for(let i=1;i<CK.length;i++){const[a]=CK[i-1],[t,x,y,z]=CK[i];tl.to(CAM,{x,y,z,duration:REMAP(t)-REMAP(a),ease:'sine.inOut'},a)}

/* 0\u20132.8 \u00b7 HOOK */
tl.fromTo('#introSym',{scale:.3,rotation:-120,autoAlpha:0,filter:'blur(24px)'},{scale:1,rotation:0,autoAlpha:1,filter:'blur(0px)',duration:1.1,ease:'expo.out'},.2);
tl.fromTo('#iwm',{x:-40,autoAlpha:0,filter:'blur(16px)',letterSpacing:'.04em'},{x:0,autoAlpha:1,filter:'blur(0px)',letterSpacing:'-.055em',duration:1.1,ease:'expo.out'},.4);
tl.fromTo('#k1 .ki',{yPercent:112,opacity:0},{yPercent:0,opacity:1,duration:1.05,ease:'expo.out'},.85);
tl.fromTo('#k2 .ki',{yPercent:112,opacity:0},{yPercent:0,opacity:1,duration:1.05,ease:'expo.out'},1.08);
tl.to('#intro',{scale:1.06,duration:1.2,ease:'none'},1.3);
/* seam 1: push-in continuo \u2014 il testo passa la camera, il trio arriva dalla profondit\u00e0 */
tl.to('#intro',{scale:2.6,autoAlpha:0,filter:'blur(24px)',duration:.6,ease:'power3.in'},2.35);
fxWipe(2.15,1,1.3);
tl.to('#devStage',{autoAlpha:1,scale:1,duration:1.5,ease:'expo.out'},2.5);
blurIn('#devStage',2.5,1.1);


/* 2.8\u20136.9 \u00b7 DEVELOPMENT: la hero reale della home sul trio */
title('#t0',3.1,6.55,true);
tl.to('#devStage',{y:-12,duration:2.2,ease:'sine.inOut',yoyo:true,repeat:7},2.9);
sheen(LAP,3.6);sheen(TAB,3.8);sheen(PHO,4.0);
tl.to('#lap',{scale:.62,duration:4,ease:'none'},2.9);
tl.to('#tab',{x:-690,rotationY:8,duration:4,ease:'sine.inOut'},2.9);
tl.to('#pho',{x:695,rotationY:-8,duration:4,ease:'sine.inOut'},2.9);

/* 6.9\u20138.0 \u00b7 BEAT senza copy: push nel laptop, click su Area riservata, ingresso in dashboard */
tl.to('#tab',{x:-1500,rotationY:30,duration:.8,ease:'power3.in'},6.75);
tl.to('#pho',{x:1500,rotationY:-30,duration:.8,ease:'power3.in'},6.75);
tl.to('#lap',{x:-272,y:274,scale:1.35,duration:1.0,ease:'power3.inOut'},6.8);
tl.fromTo(LAP.nat.querySelector('.cursor'),{x:860,y:600,autoAlpha:0,scale:.9},{x:1176,y:43,autoAlpha:1,scale:1,duration:.6,ease:'power3.inOut'},6.95);
tl.to(LAP.nat.querySelector('.cursor'),{scale:.84,duration:.09,yoyo:true,repeat:1,ease:'power2.inOut'},7.5);
tl.fromTo(LAP.nat.querySelector('.ripple'),{x:1190,y:50,scale:.15,autoAlpha:1},{scale:1.25,autoAlpha:0,duration:.55,ease:'power2.out'},7.55);
tl.to(LAP.heroL.querySelector('.pill'),{scale:.94,duration:.08,yoyo:true,repeat:1},7.55);
tl.to(LAP.nat.querySelector('.cursor'),{autoAlpha:0,duration:.2},7.75);
toDash(LAP,7.65,.45);
tl.to('#lap',{x:360,y:10,scale:.72,rotationY:-10,duration:1.1,ease:'expo.inOut'},7.9);

/* 8.0\u201311.4 \u00b7 PANORAMICA (desktop) */
title('#t1',8.4,11.15);
scrollTo(LAP,'.sec-kpi',150,8.4,1.0);
$$('#lap [data-c]').forEach((el,i)=>count(el,0,+el.dataset.c,+(el.dataset.d||0),1.3,8.9+i*.07));
emit('#c1a',9.3,{x:420,y:-40},{x:40,y:-232,z:30,ry:8});
count($('#c1n'),0,98.09,2,1.2,9.35);
emit('#c1b',9.5,{x:420,y:-40},{x:40,y:-45,z:30,ry:8});
emit('#c1c',9.7,{x:420,y:-40},{x:40,y:112,z:30,ry:8});
tl.to('#lap',{rotationY:-5,duration:2.6,ease:'sine.inOut'},8.9);
tl.to(['#c1a','#c1b','#c1c'],{y:'-=10',duration:1.3,ease:'sine.inOut'},10.2);
collapse(['#c1a','#c1b','#c1c'],10.95,{x:420,y:-40});
scrollTo(LAP,'.sec-trace',80,10.9,.9);

/* seam 2: push sulla sezione trace del laptop -> match cut sulla stessa sezione nel tablet */
tl.to('#lap',{x:-1600,rotationY:-26,duration:.8,ease:'power3.in'},11.25);
whip(11.6,22);fxWipe(11.4,-1);
tl.set('#lap',{autoAlpha:0},11.95);
tl.set([TAB.heroL],{autoAlpha:0},11.9);tl.set([TAB.dashL],{autoAlpha:1,y:0},11.9);
tl.set(TAB.pg,{y:()=>-off(TAB,'.sec-trace',90)},11.9);
tl.set('#tab',{x:180,y:200,scale:1.25,rotationY:0,autoAlpha:1},11.95);
tl.to('#tab',{x:230,y:0,scale:.52,rotationY:-7,duration:1.1,ease:'expo.out'},11.96);

/* 12\u201315.6 \u00b7 TRACCIABILIT\u00c0 (tablet) \u2014 sei fasi in flusso, tutte nel safe area */
title('#t2',12.3,15.45);
tl.fromTo('#tab .u-gbar i',{scaleX:0},{scaleX:1,duration:.9,stagger:.08,ease:'expo.out'},12.4);
tl.to('#flowLine',{strokeDashoffset:0,duration:1.6,ease:'power2.inOut'},12.9);
STEPS.forEach((s,i)=>{emit('#st'+i,12.95+i*.2,{x:230,y:-60},{x:600,y:-330+i*132,z:0,ry:-4},.9)});
tl.fromTo('#cards .fc.step .gb i',{scaleX:0},{scaleX:1,duration:.8,stagger:.2,ease:'expo.out'},13.2);
tl.to('#tab',{rotationY:-3,duration:2.4,ease:'sine.inOut'},13.1);
collapse(STEPS.map((s,i)=>'#st'+i),15.15,{x:230,y:-60});
tl.to('#flowLine',{strokeDashoffset:-660,duration:.5,ease:'power2.in'},15.15);

/* seam 3: whip a sinistra con vettore coerente tablet -> smartphone */
whip(15.62,40);fxWipe(15.42,-1);
tl.to('#tab',{x:-1500,rotationY:24,duration:.7,ease:'power3.in'},15.55);
tl.set([PHO.heroL],{autoAlpha:0},15.9);tl.set([PHO.dashL],{autoAlpha:1,y:0},15.9);tl.set(PHO.pg,{y:0},15.9);
tl.set('#pho',{x:1500,y:0,scale:.52,rotationY:-24,autoAlpha:1},15.9);
tl.to('#pho',{x:330,rotationY:-8,duration:1.0,ease:'expo.out'},15.92);

/* 16.4\u201320.2 \u00b7 PRIORIT\u00c0 (smartphone) */
title('#t3',16.5,20.0);
scrollTo(PHO,'.sec-att',128,17.0,1.0);
emit('#c3p',17.6,{x:330,y:-300},{x:330,y:-330,z:60});
emit('#c3a',18.0,{x:330,y:0},{x:0,y:-160,z:30,ry:8,r:-2});
emit('#c3b',18.15,{x:330,y:0},{x:690,y:-190,z:20,ry:-8,r:2});
emit('#c3c',18.3,{x:330,y:0},{x:0,y:210,z:40,ry:8,r:2});
emit('#c3d',18.45,{x:330,y:0},{x:690,y:230,z:30,ry:-8,r:-2});
tl.to('#pho',{rotationY:-4,duration:2.4,ease:'sine.inOut'},17.6);
collapse(['#c3p','#c3a','#c3b','#c3c','#c3d'],19.75,{x:330,y:0});

/* seam 4: pull-back, il trio si ricompone */
fxWipe(19.8,1,1.2);
tl.to('#pho',{x:600,y:150,scale:.3,rotationY:-10,duration:1.1,ease:'expo.inOut'},20.2);
tl.set([LAP.heroL,TAB.heroL],{autoAlpha:0},20.2);tl.set([LAP.dashL,TAB.dashL],{autoAlpha:1,y:0},20.2);
tl.set(LAP.pg,{y:()=>-off(LAP,'.sec-att',120)},20.2);tl.set(TAB.pg,{y:()=>-off(TAB,'.sec-att',120)},20.2);tl.to(PHO.pg,{y:()=>-off(PHO,'.sec-att',128),duration:.1},20.2);
tl.set('#lap',{x:0,y:900,scale:.44,rotationY:0,autoAlpha:1},20.2);
tl.to('#lap',{y:110,duration:1.2,ease:'expo.out'},20.3);
tl.set('#tab',{x:-1300,y:140,scale:.3,rotationY:30,autoAlpha:1},20.2);
tl.to('#tab',{x:-610,rotationY:10,duration:1.2,ease:'expo.out'},20.4);

/* 20.5\u201324.8 \u00b7 RESPONSIVE + SYNC */
title('#t4',20.75,24.75,true);
/* device scollegati: zoom-in, deriva e rotazione indipendenti per ciascuno */
tl.to('#lap',{x:-30,y:88,scale:.53,rotationY:7,duration:3.3,ease:'power1.inOut'},21.3);
tl.to('#tab',{x:-665,y:116,scale:.37,rotationY:20,rotationX:3,duration:3.0,ease:'sine.inOut'},21.6);
tl.to('#pho',{x:672,y:120,scale:.385,rotationY:-21,duration:3.4,ease:'power2.inOut'},21.2);
tl.fromTo('#tab',{yPercent:0},{yPercent:-1.6,duration:1.5,ease:'sine.inOut',yoyo:true,repeat:1,immediateRender:false},21.6);
tl.fromTo('#pho',{yPercent:0},{yPercent:1.4,duration:1.15,ease:'sine.inOut',yoyo:true,repeat:1,immediateRender:false},21.4);
tl.fromTo('#lap',{yPercent:0},{yPercent:-1.1,duration:1.7,ease:'sine.inOut',yoyo:true,repeat:1,immediateRender:false},21.5);
$$('.cnt-ts').forEach(el=>count(el,14,13,0,.3,23.0));
tl.fromTo('.r-ts',{backgroundColor:'rgba(15,138,95,0)'},{backgroundColor:'rgba(15,138,95,.14)',duration:.4,yoyo:true,repeat:1},23.0);
tl.fromTo([LAP.toast,TAB.toast,PHO.toast],{opacity:0,y:-20},{opacity:1,y:0,duration:.5,ease:'back.out(2)'},23.05);
tl.to([LAP.toast,TAB.toast,PHO.toast],{opacity:0,duration:.3},24.6);

/* 24.7\u201327.9 \u00b7 lockup: notebook al centro, tablet e smartphone in secondo piano e sfuocati */
tl.set('#tab',{zIndex:1},24.6);tl.set('#pho',{zIndex:1},24.6);tl.set('#lap',{zIndex:3},24.6);
tl.to('#lap',{x:0,y:262,scale:.44,rotationY:0,duration:1.5,ease:'expo.inOut'},24.75);
tl.to('#tab',{x:-420,y:236,scale:.27,rotationY:18,rotationX:0,duration:1.4,ease:'expo.inOut'},24.7);
tl.to('#pho',{x:430,y:244,scale:.28,rotationY:-18,duration:1.45,ease:'expo.inOut'},24.82);
tl.to(BLUR,{tab:3.4,pho:3.4,duration:1.3,ease:'power2.inOut'},25.0);
tl.to(['#tab','#pho'],{opacity:.9,duration:1.3},25.0);
tl.to('#tab',{x:-468,scale:.262,rotationY:22,duration:2.3,ease:'sine.inOut'},26.2);
tl.to('#pho',{x:476,scale:.272,rotationY:-22,duration:2.3,ease:'sine.inOut'},26.2);
tl.to('#lap',{scale:.462,y:254,duration:2.3,ease:'sine.inOut'},26.2);
toHero(LAP,25.0);toHero(TAB,25.05);toHero(PHO,25.1);
tl.set('#end',{autoAlpha:1},25.0);
tl.fromTo('#end .lock',{y:-60,autoAlpha:0,filter:'blur(18px)'},{y:0,autoAlpha:1,filter:'blur(0px)',duration:1.1,ease:'expo.out'},25.05);
tl.fromTo('#end .lock img',{rotation:-90},{rotation:0,duration:1.1,ease:'expo.out'},25.05);
tl.fromTo('#end .tagline',{y:-30,autoAlpha:0,filter:'blur(14px)'},{y:0,autoAlpha:1,filter:'blur(0px)',duration:1,ease:'expo.out'},25.45);
tl.fromTo('#end .endmeta',{y:-14,autoAlpha:0},{y:0,autoAlpha:1,duration:.8},25.85);
tl.fromTo('#end .ctarow > *',{y:18,autoAlpha:0,scale:.9},{y:0,autoAlpha:1,scale:1,duration:.6,stagger:.09,ease:'back.out(2)'},26.15);
sheen(LAP,26.7);
/* 27.9\u201329.4 \u00b7 dolly-in nello schermo del notebook con motion blur \u2192 home */
const LQ=QUAD.lap, LCX=(LQ[0][0]+LQ[1][0]+LQ[2][0]+LQ[3][0])/4-1529/2, LCY=(LQ[0][1]+LQ[1][1]+LQ[2][1]+LQ[3][1])/4-1144/2;
const LSW=((LQ[1][0]-LQ[0][0])+(LQ[2][0]-LQ[3][0]))/2, LSH=((LQ[3][1]-LQ[0][1])+(LQ[2][1]-LQ[1][1]))/2;
const zoomS=()=>{const f=Math.min(innerWidth/1920,innerHeight/1080);return Math.max(innerWidth/f*1.08/LSW,innerHeight/f*1.08/LSH)};
tl.to('#end',{y:-80,autoAlpha:0,filter:'blur(16px)',duration:.6,ease:'power2.in'},27.85);
tl.to(BG,{lap:0,duration:.5},27.8);
tl.to('#tab',{x:-980,y:300,scale:.2,rotationY:30,duration:1.15,ease:'power3.in'},28.0);
tl.to('#pho',{x:990,y:310,scale:.2,rotationY:-30,duration:1.15,ease:'power3.in'},28.0);
tl.to(BLUR,{tab:14,pho:14,duration:1,ease:'power2.in'},28.0);
tl.to(['#tab','#pho'],{opacity:0,duration:.55,ease:'power1.in'},28.55);
tl.to('#lap',{x:()=>-LCX*zoomS(),y:()=>-LCY*zoomS(),scale:zoomS,rotationY:0,duration:1.3,ease:'power4.in'},27.95);
const scnF=()=>{scene.style.filter=(SCN.blur>.05||SCN.br>1.001)?`blur(${SCN.blur.toFixed(2)}px) brightness(${SCN.br.toFixed(3)})`:''};
SCN.br=1;
tl.to(SCN,{blur:9,duration:.55,ease:'power2.in',onUpdate:scnF},28.7);
tl.to(SCN,{br:1.6,duration:.45,ease:'power2.in',onUpdate:scnF},28.8);
/* bagliore bianco: alone radiale che si espande dal centro dello schermo, poi bianco pieno */
tl.fromTo('#wflash',{opacity:0,scale:.45},{opacity:1,scale:2.4,duration:.55,ease:'power2.in'},28.72);
tl.fromTo('#wsolid',{opacity:0},{opacity:1,duration:.32,ease:'power1.in'},28.98);
if(CFG.mode==='site'){tl.to(HOST,{opacity:0,duration:.6,ease:'power2.inOut'},29.45);tl.to({},{duration:.01},30.05)}
else tl.to({},{duration:.01},29.55);

/* ---------- video della hero: sincronizzato alla timeline ---------- */
let VID_PLAY=false,vidN=0;
function syncVideos(play){VID_PLAY=play;vidGate(true)}
function vidGate(force){if(!force&&(++vidN%12))return;const vt=tl.time()%10;
  for(const dv of [LAP,TAB,PHO]){const v=dv.video;let sh=false;
    try{sh=+gsap.getProperty(dv.heroL,'opacity')>.02&&+gsap.getProperty(dv.el,'opacity')>.02&&+gsap.getProperty(DSTAGE,'opacity')>.02}catch(e){}
    try{if(sh){if(force||VID_PLAY){if(v.paused||Math.abs(v.currentTime-vt)>.35)v.currentTime=vt}
        if(VID_PLAY&&v.paused)v.play().catch(()=>{});else if(!VID_PLAY&&!v.paused)v.pause()}
      else if(!v.paused)v.pause()}catch(e){}}}
VIDEOS.forEach(v=>{v.addEventListener('error',()=>{v.removeAttribute('src');v.load()})}); // fallback al poster

/* ---------- parallasse: profondit\u00e0 per piano ---------- */
const LAYERS=[['#pxFar',.18,.25],['#ribB',.4,.5],['#pxHaze',.28,.3],['#ribA',.75,.9]].map(([q,k,kz])=>[ROOT.querySelector(q),k,kz]);
function drawParallax(){for(const[el,k,kz]of LAYERS){el.style.transform=`translate3d(${(-CAM.x*k).toFixed(2)}px,${(-CAM.y*k).toFixed(2)}px,0) scale(${(1+CAM.z*kz).toFixed(4)})`}}
/* ---------- effetti di transizione su canvas ---------- */
const FX=$('#fx'),FXC=FX.getContext('2d'),OFF=document.createElement('canvas');OFF.width=1920;OFF.height=1080;const OC=OFF.getContext('2d');
const SYMI=new Image();SYMI.src=CFG.media+'symbol-4k.webp';
let VAR=CFG.transition||'symbol';
const easeIO=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2, cl=v=>v<0?0:v>1?1:v;
function seeded(s){return()=>(s=(s*16807)%2147483647)/2147483647}
const PS=[];
function parts(i){if(PS[i])return PS[i];const r=seeded(1000+i*77),a=[];
  for(let k=0;k<130;k++)a.push({y:60+r()*960,o:(r()-.5)*900,sz:1+r()*2.8,tw:r()*6.283,sp:.75+r()*.5,h:r(),dy:(r()-.5)*140});return PS[i]=a}
const SPC=[[205,186,255],[255,255,255],[238,196,242]];
function drawSpark(R,i,p,t){const env=Math.sin(Math.PI*cl(p));if(env<=.002)return;
  for(const q of parts(i)){const e=easeIO(cl(p*q.sp+(1-q.sp)*.5*0));const x=960+R.dir*(-1250+2500*e)+q.o,y=q.y+q.dy*p;
    const tw=.45+.55*(.5+.5*Math.sin(t*11+q.tw)),al=env*tw*.8,c=SPC[q.h<.55?0:q.h<.85?1:2];
    FXC.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${(al*.12).toFixed(3)})`;FXC.beginPath();FXC.arc(x,y,q.sz*7,0,6.283);FXC.fill();
    FXC.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${(al*.3).toFixed(3)})`;FXC.beginPath();FXC.arc(x,y,q.sz*2.6,0,6.283);FXC.fill();
    FXC.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${al.toFixed(3)})`;FXC.beginPath();FXC.arc(x,y,q.sz,0,6.283);FXC.fill()}}
/* simbolo su tre piani di profondit\u00e0; motion blur ad accumulo (media di 12 campioni lungo l'otturatore) */
const LAY=[{s:190,y:-250,rot:260,a:.55,d:.1,blur:2.2,n:8},{s:500,y:170,rot:-300,a:.82,d:.04,blur:.6,n:16},{s:1180,y:0,rot:360,a:.92,d:0,blur:0,n:26}];
function symState(L,R,p){const q=cl((p-L.d)/(1-L.d)),e=easeIO(q),span=960+L.s*.62;
  return{x:960+R.dir*(-span+2*span*e),y:540+L.y-Math.sin(Math.PI*q)*80,r:R.dir*L.rot*Math.PI/180*e,sc:1+.1*Math.sin(Math.PI*q)}}
function drawSym(R,p){if(!SYMI.complete||!SYMI.naturalWidth)return;const env=cl(Math.min(p*7,(1.12-p)*7));if(env<=0)return;
  const SH=.045,ar=SYMI.naturalHeight/SYMI.naturalWidth;
  for(const L of LAY){const S=L.n;OC.setTransform(1,0,0,1,0,0);OC.clearRect(0,0,1920,1080);OC.globalCompositeOperation='lighter';OC.globalAlpha=1/S;OC.filter=L.blur?`blur(${L.blur}px)`:'none';
    for(let k=0;k<S;k++){const st=symState(L,R,p-SH*k/S),w=L.s*st.sc,h=w*ar;OC.setTransform(1,0,0,1,st.x,st.y);OC.rotate(st.r);OC.drawImage(SYMI,-w/2,-h/2,w,h)}
    OC.setTransform(1,0,0,1,0,0);OC.globalCompositeOperation='source-over';OC.globalAlpha=1;OC.filter='none';
    FXC.globalAlpha=L.a*env;FXC.drawImage(OFF,0,0);FXC.globalAlpha=1}}
function drawFX(t){FXC.clearRect(0,0,1920,1080);for(let i=0;i<TR.length;i++){const R=TR[i],p=(t-R.at)/R.dur;if(p<-.05||p>1.2)continue;
  if(VAR==='magic')drawSpark(R,i,p,t);else drawSym(R,p)}}
const VSW=$('#vsw');
function setVar(v){VAR=v;HOST.dataset.fx=v;VSW.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)))}
VSW.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setVar(b.dataset.v)});
setVar(VAR);VSW.classList.add('off');

/* ---------- ombre a terra dinamiche ---------- */
const SHD=['lap','tab','pho'].map(id=>({id,el:ROOT.getElementById(id),lift:ROOT.querySelector('#'+id+' .lift'),c:ROOT.getElementById('sc_'+id),a:ROOT.getElementById('sa_'+id),
  W:{lap:1529,tab:894,pho:624}[id],H:{lap:1144,tab:1623,pho:1622}[id],f:{lap:.9,tab:.74,pho:.72}[id]}));
function shp(el,x,y,w,h,o,b){el.style.cssText=`width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:translate3d(${(x-w/2).toFixed(1)}px,${(y-h/2).toFixed(1)}px,0);opacity:${o.toFixed(3)};filter:blur(${b.toFixed(2)}px)`}
function drawShadows(t){const gp=gsap.getProperty,s0=+gp(DSTAGE,'scale')||1,dy=+gp(DSTAGE,'y')||0,dop=+gp(DSTAGE,'opacity');
  for(const d of SHD){const[A,P,ph]=BOB[d.id];const lift=A*BG[d.id]*(1-Math.cos(2*Math.PI*t/P+ph))/2;
    d.lift.style.transform=`translate3d(0,${(-lift).toFixed(2)}px,0)`;
    const x=+gp(d.el,'x'),y=+gp(d.el,'y'),sc=+gp(d.el,'scale'),yp=+gp(d.el,'yPercent')||0,ry=+gp(d.el,'rotationY')||0,op=+gp(d.el,'opacity');
    const e=Math.max(0,(lift*sc-yp/100*d.H*sc)*s0-dy);
    const X=960+x*s0,Yb=594+((540+y+d.H*sc/2)-594)*s0;
    const Wf=d.W*sc*s0*Math.max(.25,Math.abs(Math.cos(ry*Math.PI/180)))*d.f,bl=BLUR[d.id];
    const cw=Wf*Math.max(.55,.94-e*.0016),ch=Math.max(3,cw*.055*(1+e*.012)),co=Math.max(.06,.5*(1-e/80))*op*dop;
    shp(d.c,X,Yb+4*sc*s0,cw,ch,co,1.5+e*.2+bl);
    const aw=Wf*(1.12+e*.006),ah=aw*.13*(1+e*.004),ao=Math.max(.05,.24*(1-e/200))*op*dop;
    shp(d.a,X,Yb+12*sc*s0,aw,ah,ao,8+e*.4+bl*1.5);
    d.el.style.filter=bl>.05?`blur(${bl.toFixed(2)}px)`:''}}
/* ---------- controlli ---------- */
const play=$('#play'),scrub=$('#scrub'),time=$('#time'),ctrl=$('#ctrl'),ico=$('#icoPlay');
const P_ICON='<path d="M7 4l14 8-14 8z"/>',PA_ICON='<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
const mmss=s=>'00:'+String(Math.floor(s)).padStart(2,'0');
function sync(){const playing=!(tl.paused()||tl.progress()===1);ico.innerHTML=playing?PA_ICON:P_ICON;syncVideos(playing)}
tl.eventCallback('onComplete',()=>{sync();finish()});
play.addEventListener('click',()=>{if(tl.progress()===1)tl.restart();else tl.paused(!tl.paused());sync()});
$('#restart').addEventListener('click',()=>{tl.restart();sync()});
let dragging=false;
scrub.addEventListener('input',()=>{dragging=true;tl.pause();tl.seek(scrub.value/1000,false);sync()});
scrub.addEventListener('change',()=>{dragging=false});
let idle,manualHide=false;
function onKey(e){if(e.key==='Escape'){skip();return}if((e.key==='m'||e.key==='M')&&TRK.length){setSnd(!MUS.on);return}if(!CFG.controls)return;if(e.code==='Space'){e.preventDefault();play.click()}else if(e.key==='r'||e.key==='R'){$('#restart').click()}else if(e.key==='h'||e.key==='H'){ctrl.classList.toggle('hide');manualHide=ctrl.classList.contains('hide')}}
addEventListener('keydown',onKey);
function wake(){if(manualHide)return;ctrl.classList.remove('hide');clearTimeout(idle);idle=setTimeout(()=>{if(!tl.paused())ctrl.classList.add('hide')},2600)}
ROOT.addEventListener('pointermove',wake);ROOT.addEventListener('pointerdown',wake);
const TOTAL=tl.duration();scrub.max=Math.round(TOTAL*1000);
function tick(){if(typeof musSync==='function')musSync();const t=tl.time();lodPrefetch(t);vidGate(false);perfGuard();drawParallax();drawShadows(t);drawFX(t);if(!dragging)scrub.value=Math.round(t*1000);time.textContent=mmss(t)+' / '+mmss(TOTAL)}
gsap.ticker.add(tick);
/* LOD: per ogni device usa la variante con risoluzione appena superiore alla scala a schermo (niente aliasing da sottocampionamento) */
const LODS=[0.35,0.6,1,2];
const LOD=['lap','tab','pho'].map(id=>{const el=ROOT.getElementById(id);
  LODS.forEach(k=>{const im=new Image();im.src=`${CFG.media}${id}-mask@${k}x.png`});
  return {id,el,wrap:el.querySelector('.scrWrap'),frames:[...el.querySelectorAll('.frame')],k:null,have:new Set(),pend:new Set()}});
const UIF={lap:0.703,tab:0.948,pho:1.339}, ZS=[0.2,0.28,0.4,0.55,0.75,1,1.4,2], DEVS={lap:LAP,tab:TAB,pho:PHO};
/* le varianti dei device si scaricano a richiesta e sostituiscono la precedente solo a decode finito (mai un frame vuoto) */
function lodLoad(d,k){if(d.have.has(k)||d.pend.has(k))return;const f=d.frames.find(x=>+x.dataset.k===k);if(!f)return;d.pend.add(k);
  f.src=f.dataset.src;(f.decode?f.decode():new Promise((ok,ko)=>{f.onload=ok;f.onerror=ko})).then(()=>{d.have.add(k);d.k=null},()=>{}).then(()=>{d.pend.delete(k)})}
function lodShow(d,want){const ks=[...d.have].sort((a,b)=>a-b);const up=ks.find(v=>v>=want);return up!==undefined?up:ks[ks.length-1]}
/* scala massima raggiunta da ogni device e istante (tempi base) in cui conviene anticipare la variante giusta */
const MAXS={lap:2.1,tab:1.25,pho:.55}, PRE={lap:3.4,tab:8,pho:12.4}, PREDONE={};
function lodPrefetch(t){for(const d of LOD){if(PREDONE[d.id]||t<REMAP(PRE[d.id]))continue;PREDONE[d.id]=1;
  const f=Math.min(innerWidth/1920,innerHeight/1080),dpr=window.devicePixelRatio||1;lodLoad(d,LODS.find(v=>v>=MAXS[d.id]*f*dpr)||2)}}
function applyLOD(){const fitS=Math.min(innerWidth/1920,innerHeight/1080), dpr=window.devicePixelRatio||1;
  const ss=Math.min(1,+gsap.getProperty(DSTAGE,'scale')||1)*(+gsap.getProperty(scene,'scale')||1)*fitS;
  for(const d of LOD){const ds=Math.abs(+gsap.getProperty(d.el,'scale'))*ss;
    const want=LODS.find(v=>v>=ds*dpr)||2;lodLoad(d,want);const k=lodShow(d,want);
    if(k!==undefined&&k!==d.k){d.k=k;d.frames.forEach(f=>f.classList.toggle('on',+f.dataset.k===k));
      const u=`url(${CFG.media}${d.id}-mask@${k}x.png)`;d.wrap.style.webkitMaskImage=u;d.wrap.style.maskImage=u}
    const dv=DEVS[d.id], need=UIF[d.id]*ds*1.05;
    if(dv.z===null||dv.z<need||dv.z>need*1.7){setUIScale(dv,ZS.find(v=>v>=need)||2)}}}
gsap.ticker.add(applyLOD);
/* ---------- passaggio alla home ---------- */
let done=false;
function skip(){const tS=REMAP(28.7);if(!done&&tl.time()<tS){tl.seek(tS,false);tl.play();sync()}}
$('#skip').addEventListener('click',skip);
if(!CFG.controls)ctrl.classList.add('off');
/* ---------- musica opt-in: parte solo da un gesto dell'utente, agganciata al tempo della timeline ---------- */
const SND=$('#snd'), TRK=[].concat(CFG.music||[]).map(m=>typeof m==='string'?{url:m}:m);
const MUS={el:null,ctx:null,g:null,on:false,i:0,need:true,align:true,lt:0,lg:0,vol:CFG.musicVolume||.9,off:CFG.musicOffset||0};
function musLoad(){if(MUS.el)return;const a=new Audio();a.preload='auto';a.src=TRK[MUS.i].url;MUS.el=a;
  /* primo istante di riproduzione: l'audio si allinea alla timeline (volume ancora in salita), cosi' l'animazione non riavvolge mai */
  a.addEventListener('playing',()=>{MUS.starting=false;if(MUS.align&&MUS.on){MUS.align=false;try{a.currentTime=tl.time()+MUS.off}catch(e){}}});
  try{const C=window.AudioContext||window.webkitAudioContext;MUS.ctx=new C();MUS.g=MUS.ctx.createGain();MUS.g.gain.value=0;MUS.ctx.createMediaElementSource(a).connect(MUS.g);MUS.g.connect(MUS.ctx.destination)}catch(e){MUS.ctx=null;a.volume=0}}
function musGain(v,tc){if(MUS.g&&MUS.ctx){const n=MUS.ctx.currentTime;MUS.g.gain.cancelScheduledValues(n);MUS.g.gain.setValueAtTime(MUS.g.gain.value,n);MUS.g.gain.setTargetAtTime(v,n,tc)}else if(MUS.el){MUS.el.volume=v}}
function musSync(){const a=MUS.el;if(!a||!MUS.on||done)return;
  /* tempi di riferimento presi a inizio frame: ticker GSAP (non performance.now, falsato dai frame pesanti) */
  const g=gsap.ticker.time,t=tl.time(),run=!(tl.paused()||tl.progress()===1),tt=t+MUS.off;
  /* salto esplicito (scrub, salta intro, restart): unico caso in cui l'audio viene riposizionato */
  if(MUS.lg&&(run?Math.abs((t-MUS.lt)-(g-MUS.lg)*tl.timeScale())>.3:Math.abs(t-MUS.lt)>.001)){MUS.need=true;if(CFG.musDebug)console.log('JUMP',t.toFixed(3),MUS.lt.toFixed(3))}
  MUS.lt=t;MUS.lg=g;
  if(tt<0||(a.duration&&tt>=a.duration-.05)){if(!run&&!a.paused)a.pause();tl.timeScale(1);return}
  if(!run){if(!a.paused)a.pause();tl.timeScale(1);if(MUS.need&&a.readyState>=1){try{a.currentTime=tt}catch(e){}MUS.need=false}return}
  if(MUS.need&&a.readyState>=1){try{a.currentTime=tt}catch(e){}MUS.need=false}
  if(a.paused){MUS.align=true;MUS.starting=true;a.play().catch(()=>{MUS.starting=false});return}
  if(MUS.starting||a.seeking||a.readyState<3)return;
  /* phase-lock: l'audio e' il clock master; la timeline recupera la deriva variando la velocita' (max +-8%), mai a salti */
  const d=(a.currentTime-MUS.off)-t;
  if(Math.abs(d)>.5){if(CFG.musDebug)console.log('HARD',d.toFixed(3));tl.time(t+d);MUS.lt=t+d;tl.timeScale(1)}
  else{const k=Math.abs(d)<.015?1:1+Math.max(-.08,Math.min(.08,d*1.5));if(Math.abs(k-tl.timeScale())>.002)tl.timeScale(k)}}
function setSnd(on){MUS.on=on;SND.classList.toggle('on',on);SND.setAttribute('aria-pressed',String(on));SND.setAttribute('aria-label',on?'Disattiva audio':'Attiva audio');SND.querySelector('.lbl').textContent=on?'Audio':'Attiva audio';
  /* con la musica attiva la timeline segue il tempo reale: niente rallentamenti da lag smoothing */
  gsap.ticker.lagSmoothing(on?0:500,33);
  if(on){musLoad();if(MUS.ctx&&MUS.ctx.state==='suspended')MUS.ctx.resume();MUS.need=true;MUS.align=true;MUS.lg=0;musSync();musGain(MUS.vol,.25)}
  else{musGain(0,.08);tl.timeScale(1);setTimeout(()=>{if(!MUS.on&&MUS.el)MUS.el.pause()},400)}}
function setTrack(i){MUS.i=i;if(MUS.el){MUS.el.src=TRK[i].url;MUS.el.load();MUS.need=true;MUS.align=true;if(MUS.on){musSync()}}
  MPICK.querySelectorAll('button').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)))}
const MPICK=$('#mpick');
if(!TRK.length)SND.classList.add('off');
else{SND.addEventListener('click',()=>setSnd(!MUS.on));
  /* precarico solo su intenzione (hover/focus): nessun peso per chi non attiva l'audio */
  ['pointerenter','focus','touchstart'].forEach(ev=>SND.addEventListener(ev,()=>musLoad(),{once:true,passive:true}));
  if(TRK.length>1&&CFG.controls){MPICK.hidden=false;MPICK.innerHTML='Musica '+TRK.map((t,k)=>`<button type="button" aria-pressed="${k===0}" title="${t.title||''}">${t.label||String.fromCharCode(65+k)}</button>`).join('');
    MPICK.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=[...MPICK.children].indexOf(b);setTrack(k);if(!MUS.on)setSnd(true)})}}
function musOut(){tl.timeScale(1);if(!MUS.el||!MUS.on)return;const a=MUS.el;musGain(0,.55);setTimeout(()=>{a.pause()},2600)}
/* guardia di fluidita': se il dispositivo non regge (media < ~22 fps per due finestre), l'intro si dissolve sulla home invece di scattare */
let pgN=0,pgSum=0,pgLast=0,pgBad=0,bailing=false;
function perfGuard(){if(CFG.mode!=='site'||CFG.perfGuard===false||window.__AUX_NOGUARD||done)return;const n=performance.now(),dt=n-pgLast;pgLast=n;
  if(tl.time()<1.5||tl.paused()||dt>1000||document.hidden)return;pgSum+=dt;
  if(++pgN>=45){pgBad=(pgSum/pgN>45)?pgBad+1:0;pgN=0;pgSum=0;if(pgBad>=2)bail('fps')}}
function bail(why){if(bailing||done)return;bailing=true;try{document.documentElement.dataset.auxBail=why}catch(e){}gsap.to(HOST,{opacity:0,duration:.5,ease:'power2.out',onComplete:finish})}
if(CFG.mode==='site')setTimeout(()=>{if(!done&&LOD.some(d=>!d.have.size))bail('assets')},7000);
function finish(){if(done)return;done=true;musOut();
  document.documentElement.classList.remove('aux-intro-on');
  try{sessionStorage.setItem('auxIntroSeen','1')}catch(e){}
  VIDEOS.forEach(v=>{try{v.pause()}catch(e){}});
    if(CFG.mode==='site'){gsap.ticker.remove(tick);gsap.ticker.remove(applyLOD);removeEventListener('keydown',onKey);tl.kill();HOST.remove();
    document.documentElement.classList.add('aux-intro-done');document.dispatchEvent(new CustomEvent('auxintro:done'))}
  else{document.dispatchEvent(new CustomEvent('auxintro:done'))}}
function replay(){if(CFG.mode==='site')return;done=false;scene.style.filter='';tl.restart();sync();wake();if(MUS.on){musSync();musGain(MUS.vol,.2)}}
window.AuxIntro={replay,skip,finish};
window.__aux={seek:t=>{tl.pause();tl.seek(t,false);syncVideos(false)},ctrl:v=>ctrl.classList.toggle('off',!v),fx:v=>setVar(v),root:ROOT,tl,REMAP,mus:MUS};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const start=()=>{fit();tl.invalidate();if(reduce){finish();return}tl.play(0);sync();wake()};
const FL=(document.fonts&&document.fonts.load)?Promise.race([Promise.all(['400 16px AuxInter','800 16px AuxInter','600 16px AuxMono'].map(f=>document.fonts.load(f).catch(()=>{}))),new Promise(r=>setTimeout(r,2200))]):Promise.resolve();
FL.then(()=>setTimeout(start,120));

})();
