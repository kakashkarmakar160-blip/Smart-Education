async function initSolution(){
 const p=params(), file=p.get('file'), index=Number(p.get('q')||0); const d=await loadJSON(file); const q=d.questions[index];
 const page=document.getElementById('solutionPage');
 page.innerHTML=`<article class="solution-card"><p class="eyebrow">${d.class_name} • ${d.subject_name}</p><h1>${d.school_name}</h1><div class="question-preview">${q.question}</div>${q.solution?.enabled?`<div class="ok">✓ সমাধান</div><ol>${q.solution.steps.map(s=>`<li class="step">${s}</li>`).join('')}</ol>`:`<p class="muted">এই প্রশ্নের জন্য আলাদা worked solution দেওয়া হয়নি।</p>`}<a class="primary back-btn" href="javascript:history.back()">← Back to Exam</a></article>`;
}
initSolution().catch(console.error);
