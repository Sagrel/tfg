import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { TextInput, Button, Group, Box } from '@mantine/core';
import { useNotifications } from "@mantine/notifications";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
	const notifications = useNotifications();
	const navigate = useNavigate();

	const { state } = useLocation();

	// FIXME HACK can this be moved somewhere else, maybe in index?
	if (getAuth().currentUser) {
		navigate(state?.from ?? "/", { replace: true })
	}

	return (
		<Box sx={(theme) => ({
			width: "100vw",
			height: "100vh",
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
			color: theme.colorScheme !== 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
		})}>

			<Box mx="auto" sx={{ maxWidth: "25%" }}>
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
							.catch((error) => {
								console.error(error)
								notifications.showNotification({
									title: "Error inicio de sesión",
									message: "Los datos son incorrectos",
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
		</Box>
	)
}

export default Login;