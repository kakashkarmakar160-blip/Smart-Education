let computerData=null;
async function start(){
  computerData=await loadJSON("../data/computer/questions.json");
  computerData.questions=(computerData.questions||[]).slice(0,20);
  window.computerData=computerData;
  const box=document.getElementById("computerQuestions");
  box.innerHTML=computerData.questions.map((q,i)=>`<article class="card computer-q"><div class="q-number">${i+1}. Question • ${q.marks||1} Mark</div><h3>${escapeHtml(q.question)}</h3><div class="answers">${(q.options||[]).map((o,j)=>`<button class="answer" data-q="${i}" data-j="${j}">${String.fromCharCode(65+j)}) ${escapeHtml(o)}</button>`).join("")}</div><div class="q-feedback" id="feedback-${i}"></div></article>`).join("");
  box.querySelectorAll(".answer").forEach(b=>b.onclick=()=>choose(Number(b.dataset.q),Number(b.dataset.j)));
}
function choose(i,j){
  const q=window.computerData.questions[i],buttons=document.querySelectorAll(`[data-q="${i}"]`);
  if([...buttons].some(b=>b.disabled))return;
  buttons.forEach(b=>b.disabled=true);
  const ok=q.options[j]===q.answer;
  buttons[j]?.classList.add(ok?"correct":"wrong");
  if(!ok){const k=q.options.indexOf(q.answer);buttons[k]?.classList.add("correct");}
  const f=document.getElementById("feedback-"+i);
  f.textContent=ok?"✓ সঠিক উত্তর":"✕ ভুল উত্তর";
  f.className="q-feedback "+(ok?"success":"danger");
}
start().catch(console.error);
