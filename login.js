// login.js

const SUPABASE_URL = 'https://fmsysdjqcliuwjesilam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtc3lzZGpxY2xpdXdqZXNpbGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDYzNTYsImV4cCI6MjA3MDg4MjM1Nn0.PJpuqtAAnP5396wzP-g4Bh2tFs_NWjJ6YgyQiTVcx5w';

// --- CORRECCIÓN CLAVE ---
// El objeto global del script se llama 'supabase'. Lo usamos para crear nuestro cliente
// y lo guardamos en una variable con un nombre diferente para evitar conflictos.
const supabaseCliente = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = ''; // Limpiar errores previos

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Intentamos iniciar sesión con Supabase
    const { data, error } = await supabaseCliente.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Error al iniciar sesión:', error.message);
        errorMessage.textContent = 'Email o contraseña incorrectos.';
    } else {
        // Si el login es exitoso, redirigimos al panel de admin
        console.log('Login exitoso:', data);
        window.location.href = '/admin.html';
    }
});