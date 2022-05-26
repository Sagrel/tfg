import { Avatar, Button, Card, Center, Modal, Popover, ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { arrayRemove, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAchivements } from "./Achivements";
import { useEstadisticasAlumno, useProfesores, UserStats } from "./User";

const StudentPreview = ({ id, photo, name, remove }) => {
	const [opened, setOpened] = useState(false)
	const [modal, setModal] = useState(false)
	const achivements = useAchivements(id)
	const cardStats = useEstadisticasAlumno(id)
	const profesores = useProfesores(id)
	return (
		<Card key={id} onClick={() => setOpened((o) => !o)} style={{ cursor: "pointer" }}>
			<Modal size="xl3" opened={modal} onClose={() => setModal(false)}>
				<UserStats achivements={achivements} cardStats={cardStats} profesores={profesores} />
			</Modal>
			<Center >
				<Popover
					opened={opened}
					onClose={() => setOpened(false)}
					target={
						<Stack align="center" >
							<Avatar size="xl" src={photo}></Avatar>
							<Text>{name}</Text>
						</Stack >
					}
					position="bottom"
					placement="center"
					withArrow
				>
					<Stack>
						<Button onClick={() => setModal(true)}>Ver progreso</Button>
						<Button color="red" onClick={() => {
							const user = getAuth().currentUser
							const db = getFirestore();
							const userRef = doc(db, "users", user.uid);
							updateDoc(userRef, { alumnos: arrayRemove(id) })
							remove()
							setOpened(false)
						}}>Eliminar</Button>
					</Stack>
				</Popover >
			</Center>
		</Card>
	)
}

const Students = () => {

	const [alumnos, setAlumnos] = useState([])

	useEffect(async () => {
		const db = getFirestore()
		const user = getAuth().currentUser
		const userRef = doc(db, "users", user.uid)
		const userData = (await getDoc(userRef)).data()

		const alumnosId = userData.alumnos ?? []

		setAlumnos(await Promise.all(alumnosId.map(async (id) => {
			const userRef = doc(db, "users", id)
			const userData = (await getDoc(userRef)).data()
			return { id, photo: userData.photo, name: userData.name }
		})))
	}, [])

	return (
		<ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
			{
				alumnos.length == 0
					?
					<>
						<h1>No tienes ningun alumno</h1>
						<h2>Puedes añadir nuevos alumnos desde la pantalla de inicio</h2>
					</>
					:
					<SimpleGrid cols="4" m="md">
						{
							alumnos.map((alumno, idx) => {
								return (
									<StudentPreview key={alumno.id} {...alumno} remove={() => setAlumnos(old => {
										old.splice(idx, 1)
										updateDoc(doc(getFirestore(), "users", alumno.id), { profesores: arrayRemove(getAuth().currentUser.uid) })

										return [...old]
									})} />
								)
							})
						}
					</SimpleGrid>
			}

		</ScrollArea>
	)
}

export default Students;