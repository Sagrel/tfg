import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { TextInput, Button, Group, Box } from '@mantine/core';
import { useNotifications } from "@mantine/notifications";
import { Link } from "react-router-dom";

const Login = () => {
	const notifications = useNotifications();

	return (
		<Box sx={{ maxWidth: "25%" }} mx="auto">
			<form onSubmit={(e) => {
				e.preventDefault();
				const email = e.target.email.value
				const password = e.target.password.value

				const error_contraseña = (m) => {
					notifications.showNotification({
						title: "Contraseña invalida",
						message: m,
						color: "red"
					})
				}

				if (password.length < 8) {
					error_contraseña("La contraseña debe tener minimo 8 caracteres")
				} else if (!password.match(/[a-z]+/)) {
					error_contraseña("La contraseña debe contener letras en minuscula")
				} else if (!password.match(/[A-Z]+/)) {
					error_contraseña("La contraseña debe contener letras en mayuscula")
				} else if (!password.match(/[0-9]+/)) {
					error_contraseña("La contraseña debe contener numeros")
				} else {
					const auth = getAuth();
					signInWithEmailAndPassword(auth, email, password)
						.then((userCredential) => {
							notifications.showNotification({
								title: "Sesión iniciada",
								message: `Bien venido ${userCredential.user.displayName}`,
								color: "green"
							})
						})
						.catch((error) => {
							const errorMessage = error.message;
							notifications.showNotification({
								title: "Error inicio de sesión",
								message: `Hemos encontrado este error: ${errorMessage}`,
								color: "red"
							})
						});
				}

			}}>
				<TextInput
					required
					label="Email"
					type="email"
					id="email"
					placeholder="tu@email.com"
				/>

				<TextInput
					required
					label="Contraseña"
					type="password"
					id="password"
					placeholder="Tu contraseña"
				/>

				<Group position="right" mt="md">
					<Link to="/register">¿Aún no tienes cuenta?</Link>
					<Button type="submit">Iniciar sesión</Button>
				</Group>
			</form>
		</Box>
	)
}

export default Login;