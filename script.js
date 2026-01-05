// CONFIGURATION
const API_URL = "https://medresultapi.ferhathamza17.workers.dev"; // Paste your Cloudflare Worker URL here

// TRANSLATIONS
const translations = {
    fr: {
        title: "Résultats du Concours",
        subtitle: "Veuillez entrer vos informations pour consulter votre résultat.",
        lbl_name: "Nom et Prénom",
        lbl_email: "Email",
        lbl_phone: "Numéro de Téléphone",
        btn_search: "Voir le Résultat",
        rank_lbl: "Classement :",
        next_steps: "Prochaines étapes :",
        step_1: "Préparez vos documents originaux.",
        step_2: "Présentez-vous au bureau d'administration.",
        step_3: "Vérifiez votre email pour la convocation officielle.",
        btn_back: "Vérifier un autre candidat",
        status_admis: "Félicitations, vous êtes admis !",
        msg_admis: "Nous sommes ravis de vous accueillir. Veuillez suivre les instructions ci-dessous.",
        status_attente: "Liste d'Attente",
        msg_attente: "Vous êtes actuellement sur la liste d'attente. Si une place se libère, nous vous contacterons immédiatement.",
        status_non: "Non Admis",
        msg_non: "Merci pour votre participation. Nous vous souhaitons bonne chance pour vos futurs projets.",
        status_notfound: "Dossier Introuvable",
        msg_notfound: "Aucun résultat trouvé pour ces informations. Veuillez vérifier votre saisie."
    },
    en: {
        title: "Competition Results",
        subtitle: "Please enter your details to check your result.",
        lbl_name: "Full Name",
        lbl_email: "Email Address",
        lbl_phone: "Phone Number",
        btn_search: "See Result",
        rank_lbl: "Ranking:",
        next_steps: "Next Steps:",
        step_1: "Prepare your original documents.",
        step_2: "Visit the administration office.",
        step_3: "Check your email for the official convocation.",
        btn_back: "Check another",
        status_admis: "Congratulations, you are admitted!",
        msg_admis: "We are excited to welcome you. Please follow the instructions below.",
        status_attente: "Waiting List",
        msg_attente: "You are currently on the waiting list. If a position opens up, we will contact you immediately.",
        status_non: "Not Admitted",
        msg_non: "Thank you for participating. We wish you the best of luck in your future endeavors.",
        status_notfound: "Record Not Found",
        msg_notfound: "No result found for these details. Please check your spelling."
    }
};

let currentLang = 'fr';

// DOM ELEMENTS
const searchForm = document.getElementById('search-form');
const searchView = document.getElementById('search-view');
const resultView = document.getElementById('result-view');
const resIcon = document.getElementById('res-icon');
const resTitle = document.getElementById('res-title');
const resRank = document.getElementById('res-rank');
const resMsg = document.getElementById('res-msg');
const resInstructions = document.getElementById('res-instructions');
const backBtn = document.getElementById('back-btn');

// --- LANGUAGE LOGIC ---
function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// Initialize Default Language
setLang('fr');

// --- SEARCH LOGIC ---
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = searchForm.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "Checking...";
    btn.disabled = true;

    const data = {
        fullName: document.getElementById('s-name').value,
        email: document.getElementById('s-email').value,
        phone: document.getElementById('s-phone').value
    };

    try {
        const response = await fetch(`${API_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        showResult(result);
    } catch (error) {
        alert("Connection Error / Erreur de connexion");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

function showResult(data) {
    searchView.classList.add('hidden');
    resultView.classList.remove('hidden');
    
    // Reset specific UI elements
    resInstructions.classList.add('hidden');
    resRank.parentElement.classList.remove('hidden');

    const t = translations[currentLang];

    if (data.status === 'admis') {
        // ADMIS / WINNER
        resIcon.innerHTML = "🎉";
        resTitle.className = "text-2xl font-bold text-teal-600 mb-1";
        resTitle.innerText = t.status_admis;
        resMsg.innerText = t.msg_admis;
        resRank.innerText = "#" + data.ranking;
        resInstructions.classList.remove('hidden'); // Show instructions
    } 
    else if (data.status === 'attente') {
        // LISTE D'ATTENTE / BACKUP
        resIcon.innerHTML = "⏳"; // Hourglass
        resTitle.className = "text-2xl font-bold text-orange-500 mb-1";
        resTitle.innerText = t.status_attente;
        resMsg.innerText = t.msg_attente;
        resRank.innerText = "#" + data.ranking;
    } 
    else if (data.status === 'non_admis') {
        // NON ADMIS / REJECTED
        resIcon.innerHTML = "📃"; 
        resTitle.className = "text-2xl font-bold text-slate-500 mb-1";
        resTitle.innerText = t.status_non;
        resMsg.innerText = t.msg_non;
        resRank.innerText = "#" + data.ranking;
    } 
    else {
        // NOT FOUND IN DB
        resIcon.innerHTML = "🔍";
        resTitle.className = "text-2xl font-bold text-slate-400 mb-1";
        resTitle.innerText = t.status_notfound;
        resMsg.innerText = t.msg_notfound;
        resRank.parentElement.classList.add('hidden'); // Hide rank badge
    }
    
    // Re-apply language specific text to dynamic elements if needed
    // (Handled above by variables)
}

backBtn.addEventListener('click', () => {
    resultView.classList.add('hidden');
    searchView.classList.remove('hidden');
    searchForm.reset();
});

// --- ADMIN LOGIC (Hidden) ---
let clicks = 0;
document.getElementById('admin-trigger').addEventListener('click', () => {
    clicks++;
    if (clicks === 3) {
        document.getElementById('admin-view').classList.remove('hidden');
        document.getElementById('admin-view').scrollIntoView({behavior: "smooth"});
        clicks = 0;
    }
});

document.getElementById('admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('admin-msg');
    msg.innerText = "Saving...";
    
    const data = {
        password: document.getElementById('a-pass').value,
        fullName: document.getElementById('a-name').value,
        email: document.getElementById('a-email').value,
        phone: document.getElementById('a-phone').value,
        status: document.getElementById('a-status').value,
        ranking: parseInt(document.getElementById('a-rank').value)
    };

    try {
        const response = await fetch(`${API_URL}/api/admin/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            msg.innerText = "Saved / Enregistré!";
            msg.className = "text-xs text-center mt-2 text-green-600";
            // Clear inputs
            document.getElementById('a-name').value = '';
            document.getElementById('a-email').value = '';
            document.getElementById('a-phone').value = '';
            document.getElementById('a-rank').value = '';
        } else {
            msg.innerText = "Error / Erreur";
            msg.className = "text-xs text-center mt-2 text-red-600";
        }
    } catch (e) {
        msg.innerText = "Connection Failed";
    }
});
