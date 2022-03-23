import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { TextInput, Checkbox, Button, Group, Box } from '@mantine/core';
import { useNotifications } from "@mantine/notifications";
import { Link } from "react-router-dom";

const Register = () => {
	const notifications = useNotifications();

	// TODO extract this style and the one in login to help them keep in sync
	// They are now out off sync, Login is more complete
	return (
		<Box sx={{ maxWidth: "25%" }} mx="auto">
			<form onSubmit={(e) => {
				e.preventDefault();
				const email = e.target.email.value
				const password = e.target.password.value
				const name = e.target.name.value

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
					createUserWithEmailAndPassword(auth, email, password)
						.then((userCredential) => {
							return updateProfile(userCredential.user, {
								displayName: name,
								photoURL: "avatar.png"
							}).then(() => {
								notifications.showNotification({
									title: "Cuenta creada con exito",
									message: `Bien venido ${userCredential.user.displayName}`,
									color: "green"
								})
								navigate("/")
							})
						})
						.catch((error) => {
							const errorMessage = error.message;
							// TODO mejorar esto
							notifications.showNotification({
								title: "Error al crear la cuenta",
								message: `Hemos encontrado este error: ${errorMessage}`,
								color: "red"
							})
						});
				}

			}}>
				<TextInput
					required
					label="Nombre"
					type="text"
					id="name"
					placeholder="Tu nombre"
				/>

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

				<Checkbox
					required
					mt="md"
					label="Estoy de acuerdo con la politica de privacidad"
				/>

				<Group position="right" mt="md">
					<Link to="/login">¿Ya tienes cuenta?</Link>
					<Button type="submit">Crear</Button>
				</Group>
			</form>
		</Box>
	)
}

export default Register;