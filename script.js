const candidates = [
    { id: 'nabila', name: 'Nabila Tiara Putri', role: 'Kandidat 01', image: 'Nabila Tiara.jpeg', vision: 'Mahasiswi Universitas Sriwijaya Fakultas Ilmu Komputer Jurusan Manajemen Informatika, Gontor Putri Kampus 3.', experience: 'Pengalaman berorganisasi; Bagian Pengajaran OPPM, Bagian "Taylor Zaada Helwa" Kampus Putri 3.'},
    { id: 'winika', name: 'Winika Oryza Pratiwi', role: 'Kandidat 02', image: 'WinWin.jpeg', vision: 'Mahasiswi Universitas Sriwijaya Fakultas Keguruan dan Ilmu Pendidikan Jurusan Pendidikan Masyarakat, Gontor Putri Kampus 8-1.', experience: 'Pengalaman berorganisasi; Andalan Koordinator Urusan Latihan Pramuka Kampus Putri 8, Ketua Koordinasi Guru Pengabdian Tahun Pertama Kampus Putri 8.',},
    { id: 'tsalisah', name: 'Tsalisah Andani', role: 'Kandidat 03', image: 'Tsalisah.jpeg', vision: 'Mahasiswi Universitas Sriwijaya Fakultas Ilmu Komputer Jurusan Teknik Informatika, Gontor Putri Kampus 1.', experience: 'Pengalaman berorganisasi; Andalan Koordinator Urusan Kedai Pramuka Kampus Putri 1 , Staff Bagian Kafetaria OPPM Kampus Putri 1.'},
    { id: 'intan', name: 'Intan Anastasya Fachir Mumtaz', role: 'Kandidat 04', image: 'Anya.jpeg', vision: 'Mahasiswi Politeknik Negeri Sriwijaya Fakultas Teknik Jurusan Teknik Komputer, Gontor Putri Kampus 8.', experience: 'Pengalaman berorganisasi; Bagian Pengajaran Kampus Putri 8, Bagian Kesehatan Kampus Putri 3.'}
];

const ADMIN_PIN = '3399';
const VOTED_STORAGE_KEY = 'emeraldVoteSubmitted';
const VOTED_ROUND_KEY = 'emeraldVoteRound';
const ELECTION_STATE_PATH = 'settings/election';
let db = null;
let votesRef = null;
let votersRef = null;
let electionStateRef = null;
let electionRound = null;
let selectedCandidate = null;
let votesChart = null;

function hasVoted() {
    const votedRound = localStorage.getItem(VOTED_ROUND_KEY);
    return electionRound !== null && votedRound === electionRound;
}

function applyElectionRound(round) {
    electionRound = String(round || 1);
    localStorage.removeItem(VOTED_STORAGE_KEY);

    if (localStorage.getItem(VOTED_ROUND_KEY) !== electionRound) {
        localStorage.removeItem(VOTED_STORAGE_KEY);
        localStorage.removeItem(VOTED_ROUND_KEY);
    }

    updateVotingState();
}

async function syncElectionRound() {
    if (!electionStateRef) {
        return;
    }

    const snapshot = await electionStateRef.once('value');
    applyElectionRound(snapshot.val()?.round);
}

function updateVotingState() {
    const voted = hasVoted();

    document.querySelectorAll('[data-vote], #modalVoteButton, #confirmVoteButton').forEach(button => {
        button.disabled = voted;
    });

    document.querySelectorAll('[data-vote]').forEach(button => {
        button.textContent = voted ? 'Sudah memilih' : 'Pilih kandidat';
    });
}

const candidateGrid = document.getElementById('candidateGrid');
const candidateModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('candidateModal'));
const confirmModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmVoteModal'));
const successModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('successModal'));
const adminLoginModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminLoginModal'));
const adminDashboardModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('adminDashboardModal'));

async function getVotes() {
    if (!db || !votesRef) {
        return {};
    }

    const snapshot = await votesRef.once('value');
    const votes = snapshot.val() || {};
    return Object.fromEntries(
        Object.entries(votes).map(([candidateId, voteData]) => [candidateId, voteData.count || 0])
    );
}

async function getVoters() {
    if (!db || !votersRef) {
        return [];
    }

    const snapshot = await votersRef.once('value');
    return Object.values(snapshot.val() || {})
        .sort((a, b) => (b.votedAt || 0) - (a.votedAt || 0));
}

async function hasRegisteredEmail(email) {
    const snapshot = await votersRef.orderByChild('email').equalTo(email).once('value');
    return snapshot.exists();
}

function renderCandidates(votes = {}) {
    candidateGrid.innerHTML = candidates.map((candidate, index) => `
        <div class="col-md-6 col-lg-6">
            <article class="candidate-card">
                <div class="candidate-image">
                    <img src="${candidate.image}" alt="Foto ${candidate.name}" loading="lazy">
                    <span class="candidate-number">0${index + 1}</span>
                </div>
                <div class="candidate-body">
                    <div class="candidate-role">${candidate.role}</div>
                    <h3>${candidate.name}</h3>
                    <p>${candidate.vision}</p>
                    <p>${candidate.experience}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-success flex-grow-1 vote-button" data-vote="${candidate.id}">Pilih kandidat</button>
                    </div>
                    <div class="small text-secondary mt-3">Suara saat ini: <strong>${votes[candidate.id] || 0}</strong></div>
                </div>
            </article>
        </div>
    `).join('');
    updateVotingState();
}

function openCandidate(id) {
    selectedCandidate = candidates.find(candidate => candidate.id === id);
    document.getElementById('candidateModalTitle').textContent = selectedCandidate.name;
    document.getElementById('candidateModalRole').textContent = selectedCandidate.role;
    document.getElementById('candidateModalContent').innerHTML = `
        <p class="lead">${selectedCandidate.vision}</p>
        <p>${selectedCandidate.bio}</p>
        <h3 class="h6 mt-4">Misi utama</h3>
        <ul class="detail-list">${selectedCandidate.mission.map(item => `<li>${item}</li>`).join('')}</ul>
        <h3 class="h6 mt-4">Pengalaman</h3>
        <p class="text-secondary mb-0">${selectedCandidate.experience}</p>
    `;
    candidateModal.show();
}

function askForVote(id) {
    if (hasVoted()) {
        alert('Kamu sudah memberikan suara. Setiap pemilih hanya dapat memilih satu kali.');
        return;
    }

    selectedCandidate = candidates.find(candidate => candidate.id === id);
    document.getElementById('confirmCandidateName').textContent = selectedCandidate.name;
    confirmModal.show();
}

async function submitVote() {
    if (!selectedCandidate || !db || !votesRef) {
        alert('Firebase belum siap. Isi konfigurasi Firebase terlebih dahulu.');
        return;
    }

    if (hasVoted()) {
        confirmModal.hide();
        alert('Kamu sudah memberikan suara.');
        return;
    }

    const voterEmailInput = document.getElementById('voterEmail');
    const voterEmail = voterEmailInput.value.trim().toLowerCase();
    if (!voterEmailInput.checkValidity()) {
        voterEmailInput.reportValidity();
        return;
    }

    try {
        if (await hasRegisteredEmail(voterEmail)) {
            alert('Email ini sudah tercatat sebagai pemilih.');
            return;
        }

        const voterKey = votersRef.push().key;
        const updates = {};
        updates[`votes/${selectedCandidate.id}`] = {
            candidateId: selectedCandidate.id,
            count: firebase.database.ServerValue.increment(1),
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        updates[`voters/${voterKey}`] = {
            email: voterEmail,
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.name,
            round: electionRound || '1',
            votedAt: firebase.database.ServerValue.TIMESTAMP
        };
        await db.ref().update(updates);

        localStorage.setItem(VOTED_ROUND_KEY, electionRound || '1');
        voterEmailInput.value = '';
        updateVotingState();
        confirmModal.hide();
        candidateModal.hide();
        successModal.show();
        refreshVoteData();
    } catch (error) {
        console.error('Gagal menyimpan suara:', error);
        if (error.code === 'permission-denied') {
            alert('Suara belum tersimpan karena Realtime Database Rules menolak akses. Perbarui rules di Firebase Console.');
            return;
        }

        alert('Gagal mencatat suara. Coba lagi beberapa saat.');
    }
}

async function refreshVoteData() {
    try {
        const votes = await getVotes();
        const voters = await getVoters();
        renderCandidates(votes);
        renderDashboard(votes, voters);
    } catch (error) {
        console.error('Gagal memuat data suara:', error);
        renderCandidates();
    }
}

function renderDashboard(votes = {}, voters = []) {
    const sorted = candidates
        .map(candidate => ({ ...candidate, votes: votes[candidate.id] || 0 }))
        .sort((a, b) => b.votes - a.votes);

    document.getElementById('totalVotes').textContent = sorted.reduce((total, candidate) => total + candidate.votes, 0);
    document.getElementById('totalCandidates').textContent = candidates.length;
    document.getElementById('totalVoters').textContent = voters.length;
    document.getElementById('leaderboard').innerHTML = sorted.map((candidate, index) => `
        <div class="leader-row">
            <span class="leader-rank">#${index + 1}</span>
            <img class="leader-avatar" src="${candidate.image}" alt="">
            <span class="leader-name">${candidate.name}</span>
            <strong>${candidate.votes}</strong>
        </div>
    `).join('');

    document.getElementById('voterList').innerHTML = voters.length ? voters.map(voter => `
        <tr>
            <td>${escapeHtml(voter.email || '-')}</td>
            <td>${escapeHtml(voter.candidateName || voter.candidateId || '-')}</td>
            <td>${formatVotedAt(voter.votedAt)}</td>
        </tr>
    `).join('') : '<tr><td colspan="3" class="text-secondary">Belum ada data pemilih.</td></tr>';

    const context = document.getElementById('votesChart');
    if (votesChart) votesChart.destroy();

    votesChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: candidates.map(candidate => candidate.name),
            datasets: [{
                label: 'Suara',
                data: candidates.map(candidate => votes[candidate.id] || 0),
                backgroundColor: ['#10b981', '#087f5b', '#8de6b8'],
                borderRadius: 7,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));
}

function formatVotedAt(timestamp) {
    if (!timestamp) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(timestamp));
}

renderCandidates();

candidateGrid.addEventListener('click', event => {
    const detailButton = event.target.closest('[data-detail]');
    const voteButton = event.target.closest('[data-vote]');

    if (detailButton) openCandidate(detailButton.dataset.detail);
    if (voteButton) askForVote(voteButton.dataset.vote);
});

document.getElementById('modalVoteButton').addEventListener('click', () => {
    candidateModal.hide();
    askForVote(selectedCandidate.id);
});

document.getElementById('confirmVoteButton').addEventListener('click', submitVote);

document.getElementById('voterEmail').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitVote();
    }
});

document.getElementById('adminLoginForm').addEventListener('submit', async event => {
    event.preventDefault();

    if (document.getElementById('adminPin').value === ADMIN_PIN) {
        document.getElementById('pinError').classList.add('d-none');
        document.getElementById('adminPin').value = '';
        adminLoginModal.hide();
        const votes = await getVotes();
        const voters = await getVoters();
        renderDashboard(votes, voters);
        adminDashboardModal.show();
    } else {
        document.getElementById('pinError').classList.remove('d-none');
    }
});

document.getElementById('resetButton').addEventListener('click', async () => {
    if (!db || !votesRef) {
        alert('Firebase belum siap. Isi konfigurasi Firebase terlebih dahulu.');
        return;
    }

    if (confirm('Reset seluruh data pemilihan?')) {
        const electionStateSnapshot = await electionStateRef.once('value');
        const nextRound = (electionStateSnapshot.val()?.round || 1) + 1;

        await db.ref().update({
            votes: null,
            voters: null,
            [ELECTION_STATE_PATH]: {
                round: nextRound,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            }
        });
        localStorage.removeItem(VOTED_STORAGE_KEY);
        localStorage.removeItem(VOTED_ROUND_KEY);
        applyElectionRound(nextRound);
        updateVotingState();
        refreshVoteData();
    }
});

async function init() {
    if (typeof firebase === 'undefined') {
        alert('Firebase SDK belum dimuat. Periksa script Firebase di index.html.');
        return;
    }

    if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('YOUR_')) {
        alert('Firebase belum dikonfigurasi. Isi file firebase-config.js dengan kredensial proyek Anda terlebih dahulu.');
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    db = firebase.database();
    votesRef = db.ref('votes');
    votersRef = db.ref('voters');
    electionStateRef = db.ref(ELECTION_STATE_PATH);
    await syncElectionRound();
    electionStateRef.on('value', snapshot => {
        applyElectionRound(snapshot.val()?.round);
    }, error => console.error('Gagal memantau ronde pemilihan:', error));
    refreshVoteData();
}

init();
