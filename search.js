const classGrid=document.getElementById('classGrid');
const searchInput=document.getElementById('searchInput');
let classesData=[];
const icons=['📘','📗','📙','📕','🎓','📚','📒','🧮'];
async function initHome(){
 classesData=await loadJSON('../data/classes.json');
 render(classesData);
 searchInput?.addEventListener('input',()=>{const q=searchInput.value.toLowerCase().trim();render(classesData.filter(c=>(c.name+' '+c.id+' '+c.subjects.join(' ')).toLowerCase().includes(q)));});
}
function render(items){
 document.getElementById('resultCount').textContent=items.length+' classes';
 classGrid.innerHTML=items.map((c,i)=>`<article class="card class-card" onclick="location.href='class.html?class=${encodeURIComponent(c.id)}&semester=1'"><div class="class-icon">${icons[i%icons.length]}</div><h3>${escapeHtml(c.name)}</h3><p>${c.subjects.length} Subjects • 4 Semesters</p><div class="class-subject-preview">${c.subjects.slice(0,4).map(id=>`<span>${escapeHtml(subjectLabel(id))}</span>`).join('')}${c.subjects.length>4?`<span>+${c.subjects.length-4} more</span>`:''}</div><div class="arrow">→</div></article>`).join('');
}
function subjectLabel(id){const map={bangla:'Bengali',english:'English',physics:'Physics','life-science':'Life Science',mathematics:'Mathematics',geography:'Geography',history:'History','computer-science':'Computer Science',accountancy:'Accountancy','commercial-law':'Commercial Law','cost-tax':'Cost Tax','business-studies':'Business Studies','political-science':'Political Science','রাষ্ট্রবিজ্ঞান':'রাষ্ট্রবিজ্ঞান'};return map[id]||id;}
initHome().catch(console.error);
