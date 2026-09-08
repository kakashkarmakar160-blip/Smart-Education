const p = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
const qs = JSON.parse(localStorage.getItem('teacherQuestions') || '[]');
const papers = JSON.parse(localStorage.getItem('teacherPublishedPapers') || '[]');
const legacy = JSON.parse(localStorage.getItem('publishedSet') || 'null');
const results = JSON.parse(localStorage.getItem('teacherResults') || '[]');

const teacherName = p.name || 'Mr. Arindam Sen';
const teacherId = p.id || teacherName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

let allPapers = [...papers];

if (
    legacy &&
    !allPapers.some(
        x => x.id === legacy.id || x.password === legacy.password
    )
) {
    allPapers.push({
        ...legacy,
        id: legacy.id || 'legacy-' + legacy.password,
        teacherId: legacy.teacherId || teacherId,
        teacher: legacy.teacher || teacherName
    });
}


// =====================================================
// BASIC TEACHER INFORMATION
// =====================================================

document.getElementById('name').textContent = teacherName;

if (p.className || p.semester) {
    document.getElementById('meta').textContent =
        [p.className, p.semester]
            .filter(Boolean)
            .join(' • ');
}

document.getElementById('teacherAvatar').textContent =
    teacherName
        .split(/\s+/)
        .map(x => x[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

document.getElementById('created').textContent = qs.length;


// =====================================================
// LOAD PAPERS FROM SUPABASE
// =====================================================

async function loadTeacherPapersFromSupabase() {

    try {

        if (
            typeof supabaseClient === 'undefined' ||
            !supabaseClient
        ) {
            console.warn('Supabase client not available.');
            renderTeacherProfile();
            return;
        }

        // Only use teacherId if it looks like a UUID.
        const isUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                .test(String(teacherId));

        if (!isUUID) {
            console.log(
                'Current local teacher ID is not a Supabase UUID. Local papers will remain available.'
            );

            renderTeacherProfile();
            return;
        }


        const { data, error } = await supabaseClient
            .from('question_papers')
            .select(`
                id,
                teacher_id,
                title,
                class_name,
                stream,
                subject,
                semester,
                paper_password,
                paper_type,
                max_questions,
                is_published,
                created_at,
                updated_at
            `)
            .eq('teacher_id', teacherId)
            .order('created_at', {
                ascending: false
            });


        if (error) {
            console.error(
                'Could not load question papers:',
                error
            );

            renderTeacherProfile();
            return;
        }


        if (data && data.length) {

            const supabasePapers = data.map(paper => ({
                id: paper.id,
                teacherId: paper.teacher_id,

                name: paper.title,

                target: [
                    paper.class_name,
                    paper.stream,
                    paper.subject,
                    paper.semester
                        ? `Semester ${paper.semester}`
                        : ''
                ]
                    .filter(Boolean)
                    .join(' • '),

                className: paper.class_name,
                stream: paper.stream,
                subject: paper.subject,
                semester: paper.semester,

                password: paper.paper_password,

                paperType: paper.paper_type,

                maxQuestions: paper.max_questions,

                questions: [],

                isPublished: paper.is_published,

                publishedAt: paper.created_at,

                updatedAt: paper.updated_at,

                teacher: teacherName
            }));


            // Merge Supabase papers + old local papers.
            const merged = [
                ...supabasePapers,
                ...allPapers
            ];

            const unique = [];

            const seen = new Set();

            merged.forEach(paper => {

                const key =
                    paper.id ||
                    paper.password ||
                    paper.name;

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(paper);
                }

            });

            allPapers = unique;
        }


        renderTeacherProfile();

    } catch (err) {

        console.error(
            'Unexpected Supabase error:',
            err
        );

        renderTeacherProfile();
    }
}


// =====================================================
// DISPLAY TEACHER PROFILE
// =====================================================

function renderTeacherProfile() {

    document.getElementById('published').textContent =
        allPapers.length;


    const myResults = results.filter(
        r =>
            !r.teacherId ||
            r.teacherId === teacherId ||
            r.teacher === teacherName
    );


    document.getElementById('students').textContent =
        new Set(
            myResults.map(
                r =>
                    r.student?.id ||
                    r.student?.name ||
                    r.studentName
            )
        ).size;


    const list =
        document.getElementById('paperList');


    if (!allPapers.length) {

        list.innerHTML = `
            <div class="empty-history">
                <div>📝</div>

                <h3>No published paper yet</h3>

                <p>
                    প্রথমে প্রশ্ন তৈরি করে Preview থেকে Publish করো।
                </p>

                <a
                    class="primary"
                    href="teacher-question.html"
                >
                    Create Question →
                </a>
            </div>
        `;

        return;
    }


    list.innerHTML =
        allPapers
            .map((paper, i) => {

                const pid =
                    paper.id ||
                    'paper-' + i;


                const prs =
                    myResults.filter(
                        r =>
                            r.paperId === pid ||
                            r.paperPassword === paper.password ||
                            (
                                r.title === paper.name &&
                                r.teacher === teacherName
                            )
                    );


                return `
                    <article class="teacher-paper">

                        <div class="paper-title">

                            <div class="paper-icon">
                                📚
                            </div>

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        paper.name ||
                                        'Question Paper'
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        paper.target ||
                                        teacherName
                                    )}
                                    •
                                    ${paper.questions?.length || paper.maxQuestions || 0}
                                    Questions
                                    • Code:
                                    <b>
                                        ${escapeHtml(
                                            paper.password || ''
                                        )}
                                    </b>
                                </p>

                            </div>

                        </div>


                        <div class="paper-stats">

                            <span>
                                <b>
                                    ${prs.length}
                                </b>
                                Exams
                            </span>

                            <span>
                                <b>
                                    ${
                                        paper.questions?.length ||
                                        paper.maxQuestions ||
                                        0
                                    }
                                </b>
                                Questions
                            </span>

                            <span>
                                <b>
                                    ${
                                        paper.publishedAt
                                            ? new Date(
                                                paper.publishedAt
                                            ).toLocaleDateString(
                                                'en-IN'
                                            )
                                            : ''
                                    }
                                </b>
                            </span>

                        </div>


                        <div class="student-results">

                            ${
                                prs.length

                                    ? prs.map(r => {

                                        const pct =
                                            Number(
                                                r.percentage
                                            ) || 0;

                                        return `
                                            <div class="student-result-row">

                                                <div>

                                                    <b>
                                                        ${escapeHtml(
                                                            r.student?.name ||
                                                            r.studentName ||
                                                            'Student'
                                                        )}
                                                    </b>

                                                    <small>
                                                        ${escapeHtml(
                                                            r.student?.id ||
                                                            ''
                                                        )}
                                                        •
                                                        ${escapeHtml(
                                                            r.subject ||
                                                            ''
                                                        )}
                                                    </small>

                                                </div>


                                                <span class="score-pill">

                                                    ${
                                                        Number(
                                                            r.obtained
                                                        ) || 0
                                                    }/

                                                    ${
                                                        Number(
                                                            r.totalMarks
                                                        ) || 0
                                                    }

                                                    •

                                                    ${pct}%

                                                </span>


                                                <a
                                                    class="preview-btn"
                                                    href="teacher-student-result.html?resultId=${encodeURIComponent(
                                                        r.id
                                                    )}"
                                                >
                                                    Preview
                                                </a>


                                                <a
                                                    class="preview-btn edit-result-btn"
                                                    href="teacher-marksheet-edit.html?resultId=${encodeURIComponent(
                                                        r.id
                                                    )}"
                                                >
                                                    Edit
                                                </a>

                                            </div>
                                        `;

                                    }).join('')

                                    : `
                                        <div class="no-students">
                                            এখনও কোনো student এই paper-এ
                                            exam দেয়নি।
                                        </div>
                                    `
                            }

                        </div>

                    </article>
                `;

            })
            .join('');
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(s) {

    return String(s ?? '')
        .replace(
            /[&<>"']/g,
            m =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[m])
        );
}


// =====================================================
// DELETE LOCAL TEACHER DATA
// =====================================================

document
    .getElementById('deleteAllQuestions')
    ?.addEventListener('click', () => {

        const ok = confirm(
            'তুমি কি নিশ্চিত? Teacher-এর তৈরি করা সব প্রশ্ন এবং published paper একেবারে মুছে যাবে। এই কাজটি Undo করা যাবে না।'
        );

        if (!ok) return;

        localStorage.removeItem(
            'teacherQuestions'
        );

        localStorage.removeItem(
            'teacherPublishedPapers'
        );

        localStorage.removeItem(
            'publishedSet'
        );

        localStorage.removeItem(
            'teacherDraftMeta'
        );

        localStorage.removeItem(
            'teacherSetName'
        );

        location.reload();
    });


// =====================================================
// START
// =====================================================

loadTeacherPapersFromSupabase();