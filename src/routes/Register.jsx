import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { TextInput, Checkbox, Button, Group, Box, } from '@mantine/core';
import { useNotifications } from "@mantine/notifications";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const Register = () => {
	const notifications = useNotifications();
	const navigate = useNavigate();

	const { state } = useLocation();

	// TODO move away from box

	return (
		<Box sx={(theme) => ({
			width: "100vw",
			height: "100vh",
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
			color: theme.colorScheme !== 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
		})}>
			<Box sx={{ maxWidth: "25%" }} mx="auto">
				<form onSubmit={async (e) => {
					e.preventDefault();
					const email = e.target.email.value
					const password = e.target.password.value
					const name = e.target.name.value
					const profesor = e.target.profesor.checked

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
						try {
							const userCredential = await createUserWithEmailAndPassword(auth, email, password)
							const db = getFirestore();
							const userRef = doc(db, 'users', userCredential.user.uid);
							await setDoc(userRef, {
								timer: 10, easyBonus: 2, hardBonus: 1, okBonus: 1.5, learnLimit: 10, profesor: profesor,
								name,
								photo: "https://firebasestorage.googleapis.com/v0/b/tfg-antoniogc.appspot.com/o/unknown-512.webp?alt=media&token=fabc9337-4e79-42c6-9375-9cf2bb0f787b"
							})
						} catch (errorMessage) {
							notifications.clean()
							notifications.showNotification({
								title: "Error al crear la cuenta",
								message: `Hemos encontrado este error: ${errorMessage}`,
								color: "red"
							})
						}

						navigate(state?.from ?? "/")
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

					<Checkbox
						mt="md"
						id="profesor"
						label="Soy un profesor"
					/>

					<Group position="right" mt="md">
						<Link to="/login">¿Ya tienes cuenta?</Link>
						<Button type="submit">Crear</Button>
					</Group>
				</form>
			</Box>
		</Box >
	)
}

export default Register;