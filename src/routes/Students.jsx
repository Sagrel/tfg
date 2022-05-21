import { Avatar, Card, Paper, ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";

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

			<Text> Alumnos </Text>
			<SimpleGrid cols="4">
				{
					alumnos.map(({ id, photo, name }) => {
						return (
							<Card>
								<Stack>
									<Avatar size="xl" src={photo}></Avatar>
									<Text>{name}</Text>
								</Stack>
							</Card>
						)
					})
				}
			</SimpleGrid>

		</ScrollArea>
	)
}

export default Students;