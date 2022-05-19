# Requisitos del usuario
1. El usuario podrá crear una cuenta usando solo un correo y una contraseña.
2. El usuario podrá iniciar sesión en la aplicación.
3. El usuario podrá elegir entre el tema claro o el tema oscuro en los ajustes.
4. El usuario podrá personalizar la dificultad en los ajustes.
5. El usuario podra interactuar con sus temas de las siguientes formas:
   1. Estudiar tarjetas nuevas.
   2. Acceder a las notas.
   3. Acceder a la lectura.
   4. Realizar un test de conocimiento. 
6. El usuario podrá repasar todas sus tarjetas de conocimiento pendientes.
7. El usuario podrá ver sus estadisticas: repasos promedios por día, número de palabrás aprendidas, ... // TODO


# Requisitos de incorporación de contenidos 
1. El usurario podrá crear una nueva lectura, que puede contener texto, imagenes y videos.
2. El usuario podrá añadir tarjetas de repaso asociadas a una lectura (tarjetas de vocabulario por ejemplo). Estas tarjetas tendrán dos caras, una en ingles donde se mostrará el contenido a aprender y una frase donde se utilice y la otra en la que se mostrará la traducción e información adicional en caso de ser necesario.
3. El usuario podrá añadir notas explicativas, con contenido multimedia, a una lectura.
4. El usuario podrá añadir preguntas de selección multiple a una lectura. 


# Requisitos del sistema de logros 
1. El usuario podrá consultar sus logros en la pestaña de logros. 
2. El sistema de logros lanzará notificaciones cuando se alcance una meta. 
3. El usuario podrá desbloquear "titulos" al obtener logros. 
4. El usuario podrá equiparse un "titulo", el cual se mostrará junto a su nombre. // TODO
5. El usuario recibirá "puntos de comprension" al completar repasos. La cantidad de puntos dependerá de su velocidad al responder. // TODO quitar
6. Los logros seran:
   - Dias de rachas seguidos: Tenaz      
   - Repasos correctos: Erudito            
   - Aprender x palabras: Sabelo todo     
   - No fallar en x repasos: Maestro infalible  
   - Hacer lecciones en fines de semana: El que persiste 
   - Añadir una foto de perfil: Fotogenico  
   - Crear una leccion: Creador de conocimiento 
   - Terminar una leccion: Terminator  // TODO
   - Responder un test bien: Estudiante modelo  // TODO
   - Leer notas: Empollón  

# Requisitos de monitorización del progreso
1. Si el usuario tiene el rol de profesor podrá generar un enlace que permitirá a sus alumnos asociarle como profesor. // TODO
2. El profesor podrá compartir sus lecturas con sus alumnos asociados.  // TODO
3. El profesor tendra acceso a la información del progreso de sus alumnos: // TODO
   1. El numero de repasos diaros.
   2. Las palabras más dificiles (con mayor porcentaje de fallo).
   3. Los "titulos" de un usuario.
   4. Cuantas veces tiene "facil", "ok", y "dificil"
   5. Etc...

# Requisitos no funcionles
1. La contraseña del usuario debe contener al menos una letra mayucula, una minuscula, un numnero y tener más de seis caracteres.
2. Se mantendrá iniciada la sesión aun cuando se cierre el navegador.
3. Se utilizará un metodo seguro para autentificar al usuario.