// admin.js

const SUPABASE_URL = 'https://fmsysdjqcliuwjesilam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtc3lzZGpxY2xpdXdqZXNpbGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDYzNTYsImV4cCI6MjA3MDg4MjM1Nn0.PJpuqtAAnP5396wzP-g4Bh2tFs_NWjJ6YgyQiTVcx5w';

// --- CORRECCIÓN CLAVE ---
const supabaseCliente = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const logoutButton = document.getElementById('logout-button');
const proyectosLista = document.getElementById('proyectos-lista');
const projectForm = document.getElementById('project-form');
const projectIdInput = document.getElementById('project-id');
const cancelEditButton = document.getElementById('cancel-edit');

// --- 1. PROTEGER LA PÁGINA ---
async function checkUserSession() {
    const { data: { session } } = await supabaseCliente.auth.getSession();
    if (!session) {
        window.location.href = '/login.html';
    } else {
        console.log('Sesión activa para:', session.user.email);
        loadProjects();
    }
}

// --- 2. CERRAR SESIÓN ---
logoutButton.addEventListener('click', async () => {
    await supabaseCliente.auth.signOut();
    window.location.href = '/login.html';
});

// --- 3. CARGAR Y MOSTRAR PROYECTOS ---
async function loadProjects() {
    const { data, error } = await supabaseCliente
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando proyectos:', error);
        return;
    }

    proyectosLista.innerHTML = '';
    data.forEach(proyecto => {
        const div = document.createElement('div');
        div.classList.add('proyecto-item');
        // Usamos JSON.stringify para pasar los datos de forma segura al onclick
        div.innerHTML = `
            <h4>${proyecto.titulo}</h4>
            <div>
                <button class="btn btn--small" onclick='editProject(${JSON.stringify(proyecto)})'>Editar</button>
                <button class="btn btn--secondary btn--small" onclick="deleteProject(${proyecto.id})">Eliminar</button>
            </div>
        `;
        proyectosLista.appendChild(div);
    });
}

// --- 4. AÑADIR O ACTUALIZAR PROYECTO ---
projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Convertimos los tags de un string "a, b, c" a un array ["a", "b", "c"]
    const tagsArray = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    const proyectoData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        url_sitio: document.getElementById('url_sitio').value,
        url_imagen: document.getElementById('url_imagen').value,
        tags: tagsArray,
    };

    const projectId = projectIdInput.value;
    let error;

    if (projectId) {
        const { error: updateError } = await supabaseCliente
            .from('proyectos')
            .update(proyectoData)
            .eq('id', projectId);
        error = updateError;
    } else {
        const { error: insertError } = await supabaseCliente
            .from('proyectos')
            .insert([proyectoData]);
        error = insertError;
    }

    if (error) {
        alert('Error al guardar el proyecto: ' + error.message);
    } else {
        alert('¡Proyecto guardado con éxito!');
        projectForm.reset();
        projectIdInput.value = '';
        cancelEditButton.style.display = 'none';
        loadProjects();
    }
});

// --- 5. FUNCIÓN PARA ELIMINAR PROYECTO ---
async function deleteProject(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        const { error } = await supabaseCliente
            .from('proyectos')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Proyecto eliminado.');
            loadProjects();
        }
    }
}

// --- 6. FUNCIÓN PARA EDITAR PROYECTO ---
function editProject(proyecto) {
    projectIdInput.value = proyecto.id;
    document.getElementById('titulo').value = proyecto.titulo;
    document.getElementById('descripcion').value = proyecto.descripcion;
    document.getElementById('url_sitio').value = proyecto.url_sitio;
    document.getElementById('url_imagen').value = proyecto.url_imagen;
    // Convertimos el array de tags de nuevo a un string para el input
    document.getElementById('tags').value = proyecto.tags.join(', ');
    
    cancelEditButton.style.display = 'inline-block';
    window.scrollTo(0, 0);
}

// --- 7. BOTÓN DE CANCELAR EDICIÓN ---
cancelEditButton.addEventListener('click', () => {
    projectForm.reset();
    projectIdInput.value = '';
    cancelEditButton.style.display = 'none';
});

// --- INICIAR LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});