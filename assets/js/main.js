// 1. CONFIGURACIÓN DE SUPABASE
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto real en Supabase
const SUPABASE_URL = 'https://ciofzurzkmyhaubcocsr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpb2Z6dXJ6a215aGF1YmNvY3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDE1ODIsImV4cCI6MjA4MDIxNzU4Mn0.LuElDx3Y95pbOYmkuPPMbPB-Vq7fddRzDfQ-Om7TF3k';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables de estado
let currentMode = 'image';
let selectedFile = null;

// Referencias al DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyze-btn');
const tabs = document.querySelectorAll('.tab');

// 2. LÓGICA DE INTERFAZ
function setMode(mode) {
    currentMode = mode;
    // Actualizar estilo de tabs
    tabs.forEach(t => t.classList.remove('active'));
    // Encontrar el botón que fue clickeado (buscamos en el evento global o pasamos 'this' si refactorizamos, 
    // pero para mantenerlo simple iteramos por texto o usamos event.target en el HTML inline)
    const clickedTab = Array.from(tabs).find(t => t.innerText.toLowerCase().includes(mode === 'image' ? 'imagen' : mode));
    if(clickedTab) clickedTab.classList.add('active');
    
    // Resetear input y textos
    selectedFile = null;
    fileInput.value = ''; // Limpiar el input file interno
    analyzeBtn.classList.remove('ready');
    analyzeBtn.disabled = true;
    
    // Texto dinámico según modo
    const modeName = mode === 'image' ? 'imagen' : mode;
    document.querySelector('.upload-area p').innerText = `Arrastra tu ${modeName} aquí o haz clic`;
    document.getElementById('result-container').classList.add('hidden');
}

// Click en zona de carga abre el selector de archivos
dropZone.addEventListener('click', () => fileInput.click());

// Cuando se selecciona un archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        handleFileSelection(selectedFile);
    }
});

function handleFileSelection(file) {
    // Feedback visual simple
    document.querySelector('.upload-area p').innerText = `Archivo listo: ${file.name}`;
    
    // Habilitar botón
    analyzeBtn.classList.add('ready');
    analyzeBtn.disabled = false;
}

// 3. LÓGICA DE ANÁLISIS (Placeholder)
analyzeBtn.addEventListener('click', async () => {
    const resultBox = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    const content = document.getElementById('result-content');
    
    // Mostrar estado de carga
    resultBox.classList.remove('hidden');
    loader.classList.remove('hidden');
    content.style.display = 'none';

    console.log(`Enviando ${currentMode} a analizar:`, selectedFile);

    // --- AQUI INTEGRARÁS LA FUNCTION DE SUPABASE LUEGO ---
    
    // Simulación de respuesta (Fake)
    setTimeout(() => {
        loader.classList.add('hidden');
        content.style.display = 'block';
        document.getElementById('score-display').innerText = "98.5%";
        document.getElementById('details-msg').innerText = "Alta probabilidad de ser generado por IA";
    }, 2000);
});