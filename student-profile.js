const p=JSON.parse(localStorage.getItem('studentProfile')||'{}');
const results=JSON.parse(localStorage.getItem('studentResults')||'[]');
const nameEl=document.getElementById('name'),metaEl=document.getElementById('meta');
if(p.name) nameEl.textContent=p.name;
if(p.className||p.semester) metaEl.textContent=[p.className,p.semester].filter(Boolean).join(' • ');
const initials=String(p.name||'AK').trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
document.getElementById('studentAvatar').textContent=initials||'AK';
const list=document.getElementById('resultList');
function grade(pct){return pct>=90?'A+':pct>=80?'A':pct>=70?'B':pct>=60?'C':pct>=40?'D':'F';}
function gradeClass(g){return g.startsWith('A')?'a':g==='B'?'b':g==='C'?'c':'d';}
if(!results.length){list.innerHTML='<div class="empty-history"><div>📊</div><h3>No exam result yet</h3><p>কোনো Teacher Paper/Practice শেষ করলে তার Result এখানে দেখা যাবে।</p><a class="primary" href="student-paper.html">Start Practice →</a></div>';}else{
  list.innerHTML=results.map((r,i)=>{
    const pct=Number(r.percentage)||0,g=r.grade||grade(pct),date=r.date?new Date(r.date).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
    return `<article class="result-row"><div class="result-icon">${escapeHtml((r.subject||'EX').slice(0,2).toUpperCase())}</div><div class="result-main"><h3>${escapeHtml(r.title||'Exam Result')}</h3><p>${escapeHtml(r.subject||'')} ${r.teacher?'• '+escapeHtml(r.teacher):''} ${date?'• '+date:''}</p><div class="result-bar"><span style="width:${Math.min(100,Math.max(0,pct))}%"></span></div></div><div class="result-score"><b>${Number(r.obtained)||0}/${Number(r.totalMarks)||Number(r.total)||0}</b><span>${pct}%</span></div><div class="grade-badge ${gradeClass(g)}">${escapeHtml(g)}</div><a class="preview-btn" href="student-result.html?resultId=${encodeURIComponent(r.id)}">Preview</a></article>`;
  }).join('');
}
const count=results.length,total=results.reduce((s,r)=>s+(Number(r.obtained)||0),0),avg=count?Math.round(results.reduce((s,r)=>s+(Number(r.percentage)||0),0)/count):0;
document.getElementById('paperCount').textContent=count;document.getElementById('totalScore').textContent=total;document.getElementById('avgScore').textContent=avg+'%';
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
