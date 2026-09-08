const THEME_KEY='smartEduTheme';

function applyTheme(){
  document.body.classList.toggle('dark', localStorage.getItem(THEME_KEY)==='dark');
  document.querySelectorAll('#themeBtn').forEach(btn=>{
    btn.textContent=document.body.classList.contains('dark')?'☀':'☾';
  });
}

function roleTarget(id){
  return id==='teacher'?'teacher-save.html':id==='computer'?'computer-save.html':'student-save.html';
}

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

async function loadJSON(path){
  const r=await fetch(path);
  if(!r.ok) throw new Error('Cannot load '+path);
  return r.json();
}

function params(){ return new URLSearchParams(location.search); }

async function initRoles(){
  const grid=document.getElementById('roleGrid');
  if(!grid) return;
  const roles=await loadJSON('data/roles.json');
  const html=roles.map(r=>`
    <button class="role-card" data-role="${r.id}" type="button">
      <img src="${r.image}" alt="${escapeHtml(r.name)}">
      <div><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.description)}</p></div>
      <span>→</span>
    </button>`).join('');
  grid.innerHTML=html;
  document.querySelectorAll('.role-card').forEach(b=>{
    b.addEventListener('click',()=>location.href=roleTarget(b.dataset.role));
  });
}

function bindGlobal(){
  applyTheme();

  document.querySelectorAll('#themeBtn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      localStorage.setItem(THEME_KEY, localStorage.getItem(THEME_KEY)==='dark'?'light':'dark');
      applyTheme();
    });
  });

  document.getElementById('profileBtn')?.addEventListener('click',()=>location.href='profile.html');

  // Any avatar that is not already a link works as the profile button.
  document.querySelectorAll('.avatar:not(a)').forEach(a=>{
    if(a.id==='profileBtn') return;
    a.setAttribute('role','button');
    a.setAttribute('tabindex','0');
    a.addEventListener('click',()=>location.href='profile.html');
    a.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')location.href='profile.html';});
  });

  document.getElementById('menuBtn')?.addEventListener('click',()=>{
    document.getElementById('rolePanel')?.classList.remove('hidden');
  });
  document.getElementById('closeRolePanel')?.addEventListener('click',()=>{
    document.getElementById('rolePanel')?.classList.add('hidden');
  });
  document.getElementById('closeProfilePanel')?.addEventListener('click',()=>{
    document.getElementById('profilePanel')?.classList.add('hidden');
  });
  const p2=document.getElementById('paper2Modal'), p2pass=document.getElementById('paper2Password'), p2msg=document.getElementById('paper2Msg');
  document.getElementById('addPaper2Btn')?.addEventListener('click',()=>{p2pass.value='';p2msg.textContent='';p2.classList.remove('hidden');setTimeout(()=>p2pass.focus(),50)});
  document.getElementById('closePaper2')?.addEventListener('click',()=>p2.classList.add('hidden'));
  document.getElementById('unlockPaper2')?.addEventListener('click',()=>{if(p2pass.value==='AK1234'){sessionStorage.setItem('practiceEditorUnlocked','1');location.href='practice-question-paper.html?class=5&semester=1&subject=bangla'}else p2msg.textContent='Password wrong'});
  p2pass?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('unlockPaper2')?.click()});
  document.querySelectorAll('.side-overlay').forEach(x=>x.addEventListener('click',e=>{
    if(e.target===x)x.classList.add('hidden');
  }));
}

document.addEventListener('DOMContentLoaded',()=>{
  bindGlobal();
  initRoles().catch(console.error);
});
