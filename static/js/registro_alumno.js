document.addEventListener('DOMContentLoaded', function () {

    // Mostrar/ocultar contraseña
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });


    // Validación del formulario
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email.endsWith('@liceovvh.cl') && !email.endsWith('@comeduc.cl')) {
            alert('Correo no valido. Solo se permiten correos institucionales.');
            return;
        }
        window.location.href = 'inicio.html';

        // Limpiar el formulario
        loginForm.reset();
    });
});