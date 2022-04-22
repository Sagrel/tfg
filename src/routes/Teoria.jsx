import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { collection, getDocs, getFirestore } from "firebase/firestore"
import { Accordion, Center, Paper, ScrollArea } from "@mantine/core"
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";

const Teoria = () => {
	const { tema } = useParams()

	const [notas, setNotas] = useState([])

	useEffect(async () => {
		const user = getAuth().currentUser;
		if (!user) return;
		const db = getFirestore();
		const notasRef = collection(db, "users", user.uid, "mazos", tema, "notas");
		const notas = await getDocs(notasRef);
		setNotas(notas.docs.map(doc => ({ id: doc.id, ...doc.data() })))
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