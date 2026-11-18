(function(){
var W = window.BS_WEB, CFG = window.FB_CONFIG, auth = null, fs = null, user = null;
var V = "10.12.2", G = "https://www.gstatic.com/firebasejs/" + V + "/";
function el(h){ var d = document.createElement("div"); d.innerHTML = h; return d.firstChild; }
function load(src){ return new Promise(function(ok, no){ var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
var css = '#acc{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:9999;padding:16px}#acc.on{display:flex}#acc .box{background:var(--card,#fff);color:inherit;border-radius:16px;max-width:380px;width:100%;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3)}#acc h3{margin:0 0 6px}#acc input{width:100%;box-sizing:border-box;padding:12px;margin:6px 0;border:1px solid #ccc;border-radius:10px;font-size:16px;direction:ltr;text-align:left}#acc .row{display:flex;gap:8px;margin-top:8px}#acc .row .btn{flex:1}#acc .msg{min-height:1.4em;font-size:14px;margin:6px 0}#acc .msg.err{color:#c0392b}#acc .msg.ok{color:#1e8449}#acc .lnk{background:none;border:0;color:#0f4c5c;text-decoration:underline;cursor:pointer;font-size:14px;padding:4px 0}#acc .x{float:left;background:none;border:0;font-size:22px;cursor:pointer;color:inherit}';
document.head.appendChild(el("<style>" + css + "</style>"));
var box = el('<div id="acc"><div class="box"><button class="x" data-a="close">×</button><div id="accb"></div></div></div>');
document.body.appendChild(box);
box.addEventListener("click", function(e){ if (e.target === box) close(); var a = e.target.closest("[data-a]"); if (a) act(a.dataset.a); });
function close(){ box.classList.remove("on"); }
function msg(t, ok){ var m = document.getElementById("accm"); if (m) { m.textContent = t; m.className = "msg " + (ok ? "ok" : "err"); } }
function paint(){
  var b = document.getElementById("accb");
  if (!CFG) { b.innerHTML = '<h3>👤 حساب ByteSpeak</h3><p>الحسابات لم تُفعَّل بعد في هذه النسخة. تقدّمك محفوظ الآن في هذا المتصفح.</p>'; return; }
  if (user) { b.innerHTML = '<h3>👤 حسابك</h3><p>الاسم: <b>' + esc(nameOf(user)) + '</b></p><p class="msg ok">✅ تقدّمك يتحفظ تلقائيًا في حسابك ويرجع لك من أي جهاز.</p><div class="row"><button class="btn" data-a="close">تمام</button><button class="btn" data-a="out">تسجيل خروج</button></div>'; return; }
  b.innerHTML = '<h3>' + (mode === "new" ? "➕ حساب جديد" : "👤 حساب ByteSpeak") + '</h3><p style="font-size:14px">اختر اسم ورمز من ٤ أرقام. بعدها من أي جوال أو كمبيوتر: اكتب نفس الاسم والرمز ويرجع لك تقدّمك.</p>' +
    '<input id="acce" type="text" placeholder="اسم المستخدم" autocomplete="username" style="direction:rtl;text-align:right"><input id="accp" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="الرمز (٤ أرقام)" autocomplete="current-password" style="text-align:center;letter-spacing:8px">' +
    '<div class="msg" id="accm"></div><div class="row">' + (mode === "new" ? '<button class="btn" data-a="up">إنشاء الحساب</button><button class="btn ghost" data-a="in">عندي حساب، دخول</button>' : '<button class="btn" data-a="in">دخول</button><button class="btn ghost" data-a="up">حساب جديد</button>') + '</div>' +
    '<p style="font-size:12px;opacity:.75">احفظ الاسم والرمز عندك، ما يمكن استرجاع الرمز إذا نسيته.</p>';
}
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function digits(t){ return String(t).replace(/[٠-٩]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/[۰-۹]/g, function(d){ return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }); }
function norm(n){ return n.trim().replace(/\s+/g, " ").toLowerCase(); }
function toEmail(n){ var b = unescape(encodeURIComponent(norm(n))), h = ""; for (var i = 0; i < b.length; i++) h += ("0" + b.charCodeAt(i).toString(16)).slice(-2); return "u" + h + "@bytespeak.app"; }
function nameOf(u){ try { var h = (u.email || "").slice(1).split("@")[0], b = ""; for (var i = 0; i < h.length; i += 2) b += String.fromCharCode(parseInt(h.substr(i, 2), 16)); return decodeURIComponent(escape(b)); } catch (e) { return ""; } }
function toPass(pin){ return "BS#" + pin + "#byte"; }
var ERR = { "auth/invalid-email": "الإيميل غير صحيح", "auth/missing-password": "اكتب كلمة المرور", "auth/weak-password": "كلمة المرور لازم ٦ أحرف أو أكثر", "auth/email-already-in-use": "هذا الاسم مستخدم. إذا هو حسابك اضغط «دخول»، أو اختر اسم ثاني", "auth/invalid-credential": "الاسم أو الرمز غلط", "auth/wrong-password": "الرمز غلط", "auth/user-not-found": "ما فيه حساب بهذا الاسم. اضغط «حساب جديد»", "auth/too-many-requests": "محاولات كثيرة، جرّب بعد شوي", "auth/network-request-failed": "تأكد من الإنترنت" };
function fail(e){ msg(ERR[e && e.code] || ("صار خطأ: " + (e && (e.code || e.message)))); }
function act(a){
  if (a === "close") return close();
  if (a === "out") { Promise.resolve(auth.signOut()).then(function(){ BS.reset(); }); return close(); }
  var nm = (document.getElementById("acce") || {}).value || "", pin = digits((document.getElementById("accp") || {}).value || "").trim();
  if (!auth) return msg("جارٍ التحميل… تأكد من الإنترنت");
  if (norm(nm).length < 2) return msg("اكتب اسم المستخدم (حرفين أو أكثر)");
  if (toEmail(nm).split("@")[0].length > 64) return msg("الاسم طويل، اختصره");
  if (!/^[0-9]{4}$/.test(pin)) return msg("الرمز لازم ٤ أرقام");
  if (a === "in") { msg("…", true); auth.signInWithEmailAndPassword(toEmail(nm), toPass(pin)).catch(fail); }
  if (a === "up") { msg("…", true); auth.createUserWithEmailAndPassword(toEmail(nm), toPass(pin)).catch(fail); }
}
var mode = "in";
W.user = function(){ return user ? nameOf(user) : null; };
W.open = function(m){
  if (m === "out") { if (auth) Promise.resolve(auth.signOut()).then(function(){ BS.reset(); }); return; }
  if (m === "new" && user) { Promise.resolve(auth.signOut()).then(function(){ BS.reset(); mode = "new"; paint(); box.classList.add("on"); }); return; }
  mode = m || "in"; paint(); box.classList.add("on");
};
function adapter(uid){
  var ref = fs.collection("users").doc(uid);
  return {
    get: function(){ return ref.get().then(function(s){ var d = s.exists ? s.data() : null; var done = null; try { done = d && d.s ? JSON.parse(d.s) : null; } catch (e) {} return { exists: !!done, data: function(){ return { done: done }; } }; }); },
    set: function(data){ return ref.set({ s: JSON.stringify(data.done), at: data.at || Date.now() }); }
  };
}
if (!CFG) return;
load(G + "firebase-app-compat.js").then(function(){ return Promise.all([load(G + "firebase-auth-compat.js"), load(G + "firebase-firestore-compat.js")]); }).then(function(){
  firebase.initializeApp(CFG); auth = firebase.auth(); fs = firebase.firestore();
  try { fs.enablePersistence({ synchronizeTabs: true }).catch(function(){}); } catch (e) {}
  var first = true;
  auth.onAuthStateChanged(function(u){
    user = u;
    if (u) { BS.attach(adapter(u.uid)).catch(function(){}); if (box.classList.contains("on")) { paint(); setTimeout(close, 900); } }
    else { BS.detach(); if (first) { try { if (!localStorage.getItem("bs-asked")) { localStorage.setItem("bs-asked", "1"); W.open(); } } catch (e) {} } }
    first = false;
    if (box.classList.contains("on")) paint();
    BS.rerender();
  });
}).catch(function(){});
})();
