import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { collection, doc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore"
import { Accordion, Center, Paper, ScrollArea } from "@mantine/core"
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";
import { checkAchivement } from "../utils";
import { useNotifications } from "@mantine/notifications";

const Teoria = () => {
	const { tema } = useParams()

	const [notas, setNotas] = useState([])


	const notification = useNotifications()

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
					<Accordion>
						{notas.map((note) => {
							return (
								<Accordion.Item label={note.title} key={note.id}>
									<RichTextEditor value={note.content} readOnly />
								</Accordion.Item>
							)
						})}
					</Accordion>
				</ScrollArea>
			</Center>
		</Paper>
	)
}

export default Teoria