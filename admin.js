// admin.js

const SUPABASE_URL = 'https://fmsysdjqcliuwjesilam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtc3lzZGpxY2xpdXdqZXNpbGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDYzNTYsImV4cCI6MjA3MDg4MjM1Nn0.PJpuqtAAnP5396wzP-g4Bh2tFs_NWjJ6YgyQiTVcx5w';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const logoutButton = document.getElementById('logout-button');
const proyectosLista = document.getElementById('proyectos-lista');
const projectForm = document.getElementById('project-form');
const projectIdInput = document.getElementById('project-id');
const cancelEditButton = document.getElementById('cancel-edit');

// --- 1. PROTEGER LA PÁGINA ---
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Si no hay sesión, lo mandamos de vuelta al login
        window.location.href = '/login.html';
    } else {
        console.log('Sesión activa para:', session.user.email);
        // Si hay sesión, cargamos los proyectos
        loadProjects();
    }
}

// --- 2. CERRAR SESIÓN ---
logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesión:', error);
    } else {
        // Al cerrar sesión, lo mandamos de vuelta al login
        window.location.href = '/login.html';
    }
});

// --- 3. CARGAR Y MOSTRAR PROYECTOS ---
async function loadProjects() {
    const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando proyectos:', error);
        return;
    }

    proyectosLista.innerHTML = ''; // Limpiar la lista
    data.forEach(proyecto => {
        const div = document.createElement('div');
        div.classList.add('proyecto-item'); // Necesitarás un poco de CSS para esto
        div.innerHTML = `
            <h4>${proyecto.titulo}</h4>
            <button class="btn btn--small" onclick="editProject(${proyecto.id}, '${proyecto.titulo}', '${proyecto.descripcion}', '${proyecto.url_imagen}', '${proyecto.url_sitio}')">Editar</button>
            <button class="btn btn--secondary btn--small" onclick="deleteProject(${proyecto.id})">Eliminar</button>
        `;
        proyectosLista.appendChild(div);
    });
}

// --- 4. AÑADIR O ACTUALIZAR PROYECTO ---
projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const proyectoData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        url_imagen: document.getElementById('url_imagen').value,
        url_sitio: document.getElementById('url_sitio').value,
    };

    const projectId = projectIdInput.value;
    let error;

    if (projectId) {
        // Si hay un ID, estamos ACTUALIZANDO
        const { error: updateError } = await supabase
            .from('proyectos')
            .update(proyectoData)
            .eq('id', projectId);
        error = updateError;
    } else {
        // Si no hay ID, estamos INSERTANDO
        const { error: insertError } = await supabase
            .from('proyectos')
            .insert([proyectoData]);
        error = insertError;
    }

    if (error) {
        alert('Error al guardar el proyecto: ' + error.message);
    } else {
        alert('¡Proyecto guardado!');
        projectForm.reset();
        projectIdInput.value = ''; // Limpiar el ID oculto
        cancelEditButton.style.display = 'none';
        loadProjects(); // Recargar la lista
    }
});

// --- 5. FUNCIÓN PARA ELIMINAR PROYECTO ---
async function deleteProject(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        const { error } = await supabase
            .from('proyectos')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Proyecto eliminado.');
            loadProjects(); // Recargar la lista
        }
    }
}

// --- 6. FUNCIÓN PARA EDITAR PROYECTO ---
function editProject(id, titulo, descripcion, url_imagen, url_sitio) {
    // Rellenamos el formulario con los datos del proyecto a editar
    projectIdInput.value = id;
    document.getElementById('titulo').value = titulo;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('url_imagen').value = url_imagen;
    document.getElementById('url_sitio').value = url_sitio;
    
    cancelEditButton.style.display = 'inline-block'; // Mostramos el botón de cancelar
    window.scrollTo(0, 0); // Llevamos la vista al formulario
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