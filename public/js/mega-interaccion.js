const Mega = require('mega');

// Función para interactuar con Mega.io
async function interactuarConMega() {
    try {
        const mega = Mega({ email: 'tu_correo@ejemplo.com', password: 'tu_contraseña' });
        await mega.login();

        // Realizar operaciones con Mega.io aquí

        await mega.logout();
        console.log('Sesión de Mega cerrada correctamente');
    } catch (error) {
        console.error('Error al interactuar con Mega:', error);
    }
}

module.exports = interactuarConMega;
