// 1. CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables de estado
let currentMode = 'image';
let selectedFile = null;

// Referencias al DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyze-btn');
const tabs = document.querySelectorAll('.tab');
const resultBox = document.getElementById('result-container');
const loader = document.getElementById('loader');
const content = document.getElementById('result-content');
const scoreDisplay = document.getElementById('score-display');
const detailsMsg = document.getElementById('details-msg');

// 2. LÓGICA DE INTERFAZ (Tabs y selección)
function setMode(mode) {
    currentMode = mode;
    tabs.forEach(t => t.classList.remove('active'));
    // Busca el tab correcto y lo activa
    const clickedTab = Array.from(tabs).find(t => t.innerText.toLowerCase().includes(mode === 'image' ? 'imagen' : mode));
    if(clickedTab) clickedTab.classList.add('active');
    
    // Resetear
    selectedFile = null;
    fileInput.value = '';
    analyzeBtn.classList.remove('ready');
    analyzeBtn.disabled = true;
    document.querySelector('.upload-area p').innerText = `Arrastra tu ${mode === 'image' ? 'imagen' : mode} aquí`;
    resultBox.classList.add('hidden');
}

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        document.querySelector('.upload-area p').innerText = `Archivo listo: ${selectedFile.name}`;
        analyzeBtn.classList.add('ready');
        analyzeBtn.disabled = false;
    }
});

// 3. LÓGICA PRINCIPAL: SUBIR Y ANALIZAR
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Mostrar UI de carga
    resultBox.classList.remove('hidden');
    loader.classList.remove('hidden');
    content.style.display = 'none';

    try {
        // A. Subir imagen a Supabase Storage
        // Usamos timestamp para evitar nombres duplicados
        const fileName = `${Date.now()}_${selectedFile.name.replace(/\s/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        // B. Obtener URL Pública (necesaria para que Sightengine la lea)
        const { data: { publicUrl } } = supabase
            .storage
            .from('uploads')
            .getPublicUrl(fileName);

        console.log("Archivo subido, URL:", publicUrl);

        // C. Llamar a nuestra Edge Function (Tu Backend)
        const { data: aiResponse, error: fnError } = await supabase.functions.invoke('detectar-ia', {
            body: { 
                fileUrl: publicUrl, 
                type: currentMode 
            }
        });

        if (fnError) throw fnError;

        console.log("Respuesta de Sightengine:", aiResponse);

        // D. Interpretar resultado (Lógica adaptada para Sightengine)
        let score = 0;
        
        // El backend ahora nos devuelve un objeto limpio con 'score'
        if (aiResponse.score !== undefined) {
            score = aiResponse.score;
        } 
        // Por si acaso, soporte para respuesta cruda
        else if (aiResponse.type && aiResponse.type.ai_generated) {
            score = aiResponse.type.ai_generated;
        }

        // E. Mostrar Resultado en pantalla
        loader.classList.add('hidden');
        content.style.display = 'block';

        const percentage = (score * 100).toFixed(1);
        scoreDisplay.innerText = `${percentage}%`;
        
        if (score > 0.8) {
            scoreDisplay.style.color = '#ef4444'; // Rojo - Alta probabilidad
            detailsMsg.innerText = "⚠️ Muy alta probabilidad de ser generado por IA.";
        } else if (score > 0.5) {
            scoreDisplay.style.color = '#f59e0b'; // Naranja - Duda
            detailsMsg.innerText = "Posiblemente generado por IA o muy editado.";
        } else {
            scoreDisplay.style.color = '#10b981'; // Verde - Humano
            detailsMsg.innerText = "Parece ser auténtico (Humano).";
        }

    } catch (error) {
        console.error("Error completo:", error);
        loader.classList.add('hidden');
        content.style.display = 'block';
        scoreDisplay.innerText = "Error";
        scoreDisplay.style.color = 'white';
        detailsMsg.innerText = "Ocurrió un error. Revisa la consola (F12) para ver detalles.";
        
        if (error.message && error.message.includes("row-level security")) {
            alert("Error de permisos: Revisa las Policies en Supabase Storage.");
        }
    }
});