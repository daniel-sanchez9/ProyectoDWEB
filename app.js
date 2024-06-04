const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const connection = require('./database/db');
const { sendVerificationEmail } = require('./emailService');
const crypto = require('crypto');

// Configuración de middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración de dotenv
dotenv.config({ path: './env/.env' });

// Configuración de directorios estáticos
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// Configuración del motor de plantillas
app.set('view engine', 'ejs');

// Configuración de sesiones
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Rutas
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/certificado', (req, res) => {
    res.render('certificadoresidencia');
});

function requireAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.isVerified) {
        // Si hay una sesión de usuario y el usuario está verificado
        return next();
    } else if (req.session && req.session.user) {
        // Si el usuario está autenticado pero no verificado
        return res.status(403).send('Usuario no verificado');
    } else {
        // Si no hay sesión de usuario
        res.redirect('/login'); // Ajusta la ruta según corresponda en tu aplicación
    }
}

app.post('/guardarreservabbq', async (req, res) => {
    console.log(req.body); // Imprimir req.body en la consola del servidor

    const { nombre, torre, apartamento, email, fecha, mensaje } = req.body;

    // Aquí debes insertar los datos en la base de datos
    connection.query('INSERT INTO reservas_bbq SET ?', {nombre, torre, apartamento, email, fecha, mensaje}, async (error, results, fields) => {
        if (error) {
            console.log(error); 
            res.status(500).send('Error al guardar la reserva de bbq en la base de datos');
        } else {
            res.status(200).send('Reserva de bbq guardada exitosamente');
        }
    });
});

app.post('/guardarreservapiscina', async (req, res) => {
    console.log(req.body); // Imprimir req.body en la consola del servidor

    const { nombre, torre, apartamento, email, fecha, mensaje } = req.body;

    // Aquí debes insertar los datos en la base de datos
    connection.query('INSERT INTO reservas_piscina SET ?', {nombre, torre, apartamento, email, fecha, mensaje}, async (error, results, fields) => {
        if (error) {
            console.log(error); 
            res.status(500).send('Error al guardar la reserva de PISCINA en la base de datos');
        } else {
            res.status(200).send('Reserva de PISCINA guardada exitosamente');
        }
    });
});

app.post('/guardarreservasalon', async (req, res) => {
    console.log(req.body); // Imprimir req.body en la consola del servidor

    const { nombre, torre, apartamento, email, fecha, mensaje } = req.body;

    // Aquí debes insertar los datos en la base de datos
    connection.query('INSERT INTO reservas_salon SET ?', {nombre, torre, apartamento, email, fecha, mensaje}, async (error, results, fields) => {
        if (error) {
            console.log(error); 
            res.status(500).send('Error al guardar la reserva de Salon Social en la base de datos');
        } else {
            res.status(200).send('Reserva de Salon Social guardada exitosamente');
        }
    });
});

app.post('/certifcadoresidenciapost', async (req, res) => {
    console.log(req.body);

    const { nombres, torre, apartamento, fecha, fecha_generacion } = req.body;

    connection.query('INSERT INTO certificado_de_residencia SET ?', 
    { 
        nombres, 
        torre, 
        apartamento, 
        fecha, 
        fecha_generacion 
    }, 
    async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error al guardar la solicitud de certificado de residencia en la base de datos');
        } else {
            res.status(200).send('Solicitud de certificado de residencia guardada exitosamente');
        }
    });
});

app.post('/register', async (req, res) => {
    try {
        const { user, email, torre, apartamento, tipo, pass, name } = req.body;
        let passwordHash = await bcrypt.hash(pass, 8);

        // Combinar torre y apartamento en un solo campo
        const torreyapto = `${torre} ${apartamento}`;
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const query = 'INSERT INTO users SET ?';
        const values = { user, email, torreyapto, tipo, pass: passwordHash, name, verificationToken };

        connection.query(query, values, (error, results) => {
            if (error) {
                console.log(error);
                return res.render('register', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Registration Failed!",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'register'
                });
            } else {    
                // Enviar correo de verificación
                sendVerificationEmail(email, verificationToken);

                return res.render('register', {
                    alert: true,
                    alertTitle: "Registration",
                    alertMessage: "¡Successful Registration! Please verify your email",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.render('register', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Server Error!",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'register'
        });
    }
});

app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    // Busca al usuario con el token de verificación
    connection.query('SELECT * FROM users WHERE verificationToken = ?', [token], async (error, results) => {
        if (error || results.length === 0) {
            return res.status(400).send('Token de verificación no válido.');
        }

        const user = results[0];

        // Marca al usuario como verificado y elimina el token
        connection.query('UPDATE users SET isVerified = true, verificationToken = null WHERE email = ?', [user.email], (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error al verificar el correo.');
            }

            res.status(200).send('Correo verificado con éxito.');
        });
    });
});

// Ruta para obtener el enlace de estados de cuenta
app.get('/accountLink', (req, res) => {
    if (req.session.loggedin) {
        const torreyapto = req.session.torreyapto; // Obtener el torre y apto de la sesión
        connection.query('SELECT link FROM estados WHERE torreyapto = ?', [torreyapto], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error obteniendo el enlace de estados de cuenta');
            } else {
                if (results.length > 0) {
                    const link = results[0].link;
                    res.json({ link });
                } else {
                    res.status(404).send('No se encontró ningún enlace de estados de cuenta para este usuario');
                }
            }
        });
    } else {
        res.status(401).send('Usuario no autenticado');
    }
});

app.get('/user', (req, res) => {
    if (req.session.loggedin) {
        const torreyapto = req.session.torreyapto; // Obtener el torre y apto de la sesión
        connection.query('SELECT link FROM estados WHERE torreyapto = ?', [torreyapto], (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error');
            } else {
                if (results.length > 0) {
                    const link = results[0].link;
                    res.json({ link });
                } else {
                    res.status(404).send('Por favor inicie sesion');
                }
            }
        });
    } else {
        res.status(401).send('Usuario no autenticado');
    }
});

app.post('/auth', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (email && password) {
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (error, results, fields) => {
            if (error) {
                console.log(error);
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Error en la consulta de la base de datos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }

            if (results.length === 0) {
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Correo electrónico o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.pass); // Cambio aquí

            if (passwordMatch) {
                req.session.loggedin = true;
                req.session.email = user.email;
                req.session.name = user.name; // Agregamos el nombre a la sesión
                req.session.torreyapto = user.torreyapto;
                res.redirect('/'); // Redirigir a la página principal después de iniciar sesión
            } else {
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Correo electrónico o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }
        });
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "¡Por favor ingrese un correo electrónico y una contraseña!",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
});

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(String(email).toLowerCase());
}

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name,
            torreyapto: req.session.torreyapto // Agregar torreyapto al contexto si el usuario ha iniciado sesión
        });
    } else {
        res.render('index', {
            login: false,
            name: '',
            torreyapto: '' // Incluir torreyapto incluso si el usuario no ha iniciado sesión para evitar errores en la plantilla
        });
    }
    res.end();
});

app.get('/cuenta', (req, res) => {
    if (req.session.loggedin) {
        res.render('cuenta', {
            login: true,
            name: req.session.name,
            torreyapto: req.session.torreyapto // Agregar torreyapto al contexto si el usuario ha iniciado sesión
        });
    } else {
        res.render('cuenta', {
            login: false,
            name: '',
            torreyapto: '' // Incluir torreyapto incluso si el usuario no ha iniciado sesión para evitar errores en la plantilla
        });
    }
    res.end();
});

// Ruta para Reserva_piscina
app.get('/reserva_pi', (req, res) => {
    if (req.session.loggedin) {
        res.render('Reserva_piscina', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('Reserva_piscina', {
            login: false,
            name: ''
        });
    }
});

// Ruta para Estado_de_cuenta
app.get('/cuenta', (req, res) => {
    if (req.session.loggedin) {
        res.render('cuenta', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('cuenta', {
            login: false,
            name: ''
        });
    }
});

// Ruta para Reserva_bbq
app.get('/reserva_bbq', (req, res) => {
    if (req.session.loggedin) {
        res.render('Reserva_bbq', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('Reserva_bbq', {
            login: false,
            name: ''
        });
    }
});

// Función para limpiar la caché luego del logout
app.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Logout
app.get('/logout', function (req, res) {
    req.session.destroy(() => {
        res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
    });
});

// Iniciar el servidor
app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});