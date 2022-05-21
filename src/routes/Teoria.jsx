import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { collection, doc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore"
import { Accordion, Button, Center, Group, Paper, ScrollArea, Text } from "@mantine/core"
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";
import { checkAchivement, Show } from "../utils";
import { useNotifications } from "@mantine/notifications";

const Teoria = () => {
	const { tema } = useParams()

	const [notas, setNotas] = useState([])


	const notification = useNotifications()
	const navigate = useNavigate()

	let interval;
	useEffect(() => {
		const user = getAuth().currentUser;
		const db = getFirestore();
		const notasRef = collection(db, "users", user.uid, "mazos", tema, "notas");
		getDocs(notasRef)
			.then(notas => setNotas(notas.docs.map(doc => ({ id: doc.id, ...doc.data() }))));



		interval = setInterval(async () => {
			console.log("hola")
			const userRef = doc(db, "users", user.uid)
			await updateDoc(userRef, { Empollon: increment(1) })
			checkAchivement("Empollon", notification)
		}, 10000)

		return () => clearInterval(interval)

	}, [])

	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<Center>

				<ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
					<h1>Notas del mazo</h1>
					<Show condition={notas.length > 0}>
						<Accordion>
							{notas.map((note) => {
								return (
									<Accordion.Item label={note.title} key={note.id}>
										<RichTextEditor value={note.content} readOnly />
									</Accordion.Item>
								)
							})}
						</Accordion>
					</Show>
					<Show condition={notas.length == 0}>
						<Group>
							<Text>Parece que esta leccion no contiene notas</Text>
							<Button onClick={() => navigate("/create/" + tema)}>Añadir notas</Button>
						</Group>
					</Show>
					<Button m="md" onClick={() => navigate("/")}>Volver</Button>
				</ScrollArea>
			</Center>
		</Paper>
	)
}

export default Teoria