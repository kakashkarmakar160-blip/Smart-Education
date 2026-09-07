async function init(){
 const p=params(),cid=p.get('class'),sid=p.get('subject');
 const classes=await loadJSON('../data/classes.json'),subjects=await loadJSON('../data/subjects.json'),schools=await loadJSON('../data/schools.json');
 const c=classes.find(x=>x.id===cid),s=subjects.find(x=>x.id===sid);
 document.getElementById('pageTitle').textContent=s?.name||'Question Sets';
 document.getElementById('heading').textContent=(c?.name||'Class')+' • '+(s?.name||sid);
 const grid=document.getElementById('setGrid');
 const files=schools.slice(0,3).map(sc=>`../data/${cid}/${sid}/${sc.id}.json`);
 const loaded=await Promise.all(files.map((f,i)=>loadJSON(f).then(d=>({d,f})).catch(()=>null)));
 grid.innerHTML=loaded.filter(Boolean).map(({d,f})=>`<article class="card set-card"><div class="school">${escapeHtml(d.school_name)}</div><h3>${escapeHtml(d.title)}</h3><div class="info">${d.questions.length} Questions • Model Set</div><div class="set-actions"><a class="primary" href="student-exam.html?file=${encodeURIComponent(f)}&mode=practice">Practice →</a></div></article>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
init().catch(e=>{document.getElementById('setGrid').innerHTML='<div class="card" style="padding:25px">Question set could not be loaded. Use a local web server.</div>';console.error(e)});