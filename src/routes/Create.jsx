import { useState, useEffect } from "react"

import { RichTextEditor } from '@mantine/rte';
import { ActionIcon, Button, Card, Center, Checkbox, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import { CirclePlus, Rotate360 } from "tabler-icons-react";
import { useNotifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";
import { cleanObject } from "../utils";



const save = async (title, content, notes, cards, notifications, id, deletedCards, deletedNotes, questions, deletedQuestions) => {
	try {
		const user = getAuth().currentUser;
		const db = getFirestore();
		const mazosRef = collection(db, 'users', user.uid, "mazos");

		// If we have a deck we edit it, other whise create it
		let mazoId;
		if (id) {
			const mazoDoc = doc(db, mazosRef.path, id);
			await updateDoc(mazoDoc, { title, content });
			mazoId = id;
		} else {
			mazoId = await (await addDoc(mazosRef, { title, content })).id;
		}

		const notasRef = collection(db, mazosRef.path, mazoId, "notas");
		notes.forEach(async (note) => {
			if (note.id) {
				const noteRef = doc(db, notasRef.path, note.id)
				const { id, ...updatedNote } = note

				updateDoc(noteRef, cleanObject(updatedNote))
			} else {
				await addDoc(notasRef, note)
			}
		});

		const tarjetasRef = collection(db, mazosRef.path, mazoId, "tarjetas");
		cards.forEach(async (card) => {
			card = cleanObject(card)
			if (card.id) {
				const cardRef = doc(db, tarjetasRef.path, card.id)
				delete card["id"]
				updateDoc(cardRef, card)
			} else {
				const interval = 1;
				await addDoc(tarjetasRef, { interval, ...card })
			}
		});

		const preguntasRef = collection(db, mazosRef.path, mazoId, "preguntas");
		questions.forEach(async (question) => {
			question = cleanObject(question)
			if (question.id) {
				const preguntaRef = doc(db, preguntasRef.path, question.id)
				delete question["id"]
				updateDoc(preguntaRef, question)
			} else {
				await addDoc(preguntasRef, question)
			}
		});

		for (const cardId of deletedCards) {
			await deleteDoc(doc(db, mazosRef.path, mazoId, "tarjetas", cardId))
		}

		for (const noteId of deletedNotes) {
			await deleteDoc(doc(db, mazosRef.path, mazoId, "notas", noteId))
		}

		for (const questionId of deletedQuestions) {
			await deleteDoc(doc(db, mazosRef.path, mazoId, "preguntas", questionId))
		}

		notifications.clean()
		notifications.showNotification({
			title: "Leccion guardada con exito",
			message: `La leccion ya debería aparecer en la pestaña de inicio`,
			color: "green"
		})
	} catch (e) {
		console.error(e)
		notifications.clean()
		notifications.showNotification({
			title: "Error",
			message: "No se ha podido crear la leccion",
			color: "red"
		})
	}
}


const apiKey = "2f96d4553b7ba2244a0ce62f3d3d749b";

const EliminarGuardar = ({ text, setModalData, setDeleted, setArray, close, original, creating, index }) => {
	return <Group position="apart">
		<>
			<Button color="red" onClick={() => {
				if (creating) {
					close()
				} else {
					setModalData({
						text: text, action: () => {
							if (original.id) {
								setDeleted(old => [...old, original.id])
							}
							setArray(old => {
								const newArray = old.slice()
								newArray.splice(index, 1)
								return newArray
							})
							close()
						}
					})
				}

			}}>{creating ? "Cancelar" : "Eliminar"}</Button>
			<Button color="green" type="submit">{creating ? "Crear" : "Guardar cambios"}</Button>
		</>
	</Group>
}

const SaveOrCreate = (creating, setArray, close, data, index) => {
	if (creating) {
		setArray(old => [...old, data])
		close()
	} else {
		setArray(old => {
			const newArray = old.slice()
			newArray[index] = data
			return newArray
		})
		close()
	}
}

const CardEditModal = ({ index, cards, close, setCards, setDeletedCards, setModalData }) => {
	const creating = index == -2;
	const original = creating ? { titleFront: "", dataFront: "", titleBack: "", dataBack: "" } : cards[index];
	const [data, setData] = useState(original)
	const [showBack, setShowBack] = useState(false);

	const flipButton = (
		<ActionIcon onClick={() => setShowBack(old => !old)}>
			<Rotate360 />
		</ActionIcon>
	)

	return (
		<Modal
			zIndex={1}
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando el " + (showBack ? "reverso" : "frente")}
		>
			<form onSubmit={() => SaveOrCreate(creating, setCards, close, data, index)}>
				<Stack>

					{
						!showBack ?
							<>
								<Group grow>
									<TextInput value={data?.titleFront} required onChange={(e) => setData(old => ({ ...old, titleFront: e.target.value }))}></TextInput>
									{flipButton}
								</Group>
								<TextInput value={data?.dataFront} onChange={(e) => setData(old => ({ ...old, dataFront: e.target.value }))}></TextInput>
							</>
							:
							<>
								<Group grow >
									<TextInput value={data?.titleBack} required onChange={(e) => setData(old => ({ ...old, titleBack: e.target.value }))}></TextInput>
									{flipButton}
								</Group>
								<TextInput value={data?.dataBack} onChange={(e) => setData(old => ({ ...old, dataBack: e.target.value }))}></TextInput>
							</>
					}
					<EliminarGuardar close={close} original={original} setArray={setCards} setDeleted={setDeletedCards} setModalData={setModalData} text="esta tarjeta" creating={creating} index={index} />
				</Stack>
			</form>
		</Modal >
	)
}

const NoteEditModal = ({ index, notes, close, setNotes, setDeletedNotes, setModalData }) => {
	const creating = index == -2;
	const original = creating ? { title: "", content: "" } : notes[index];
	const [data, setData] = useState(original)

	return (
		<Modal
			zIndex={1}
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando nota"}
		>
			<form onSubmit={() => SaveOrCreate(creating, setNotes, close, data, index)}>
				<Stack>
					<TextInput value={data?.title} label="Titulo" required onChange={(e) => setData(old => ({ ...old, title: e.target.value }))}></TextInput>
					<RichTextEditor value={data?.content} onChange={(value) => setData(old => ({ ...old, content: value }))} required onImageUpload={handleImageUpload}></RichTextEditor>

					<EliminarGuardar close={close} original={original} setArray={setNotes} setDeleted={setDeletedNotes} setModalData={setModalData} text="esta nota" creating={creating} index={index} />
				</Stack>
			</form>
		</Modal >
	)
}

const QuestionEditModal = ({ index, questions, close, setQuestions, setDeletedQuestions, setModalData }) => {
	const creating = index == -2;
	const original = creating ? { title: "", options: [{ name: "", correct: false }, { name: "", correct: false }, { name: "", correct: false }, { name: "", correct: false }] } : questions[index];
	const [data, setData] = useState(original)


	return (
		<Modal
			zIndex={1}
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando pregunta"}
		>
			<form onSubmit={() => SaveOrCreate(creating, setQuestions, close, data, index)}>

				<Stack>
					<TextInput value={data?.title} label="Titulo" required onChange={(event) => setData(old => ({ ...old, title: event.target.value }))}></TextInput>
					{
						data.options.map((elem, idx) => {
							return (
								<Group>
									<TextInput value={elem.name} onChange={(e) => setData(old => {
										old.options[idx].name = e.target.value
										return { ...old }
									})} required></TextInput>
									<Checkbox checked={elem.correct} onChange={(e) => setData(old => {
										old.options[idx].correct = e.target.checked
										return { ...old }
									})}></Checkbox>
								</Group>
							)
						})
					}
					<EliminarGuardar close={close} original={original} setArray={setQuestions} setDeleted={setDeletedQuestions} setModalData={setModalData} text="esta pregunta" creating={creating} index={index} />
				</Stack>
			</form>
		</Modal >
	)
}


const CardPreview = ({ name, setSelected }) => {
	return (
		<Card onClick={setSelected} style={{ cursor: "pointer" }}>
			<Center>
				<Text>{name}</Text>
			</Center>
		</Card>
	)
}

const handleImageUpload = (file) =>
	new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('image', file);

		fetch('https://api.imgbb.com/1/upload?key=' + apiKey, {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((result) => resolve(result.data.url))
			.catch(() => reject(new Error('Upload failed')));
	}
	)

const AddPreview = ({ activate }) => {
	return (
		<Center onClick={activate} style={{ cursor: "pointer" }}>
			<CirclePlus />
		</Center>
	)
}


const Create = () => {
	const [notes, setNotes] = useState([])
	const [cards, setCards] = useState([])
	const [questions, setQuestions] = useState([])
	const [deletedCards, setDeletedCards] = useState([])
	const [deletedNotes, setDeletedNotes] = useState([])
	const [deletedQuestions, setDeletedQuestions] = useState([])

	const [deleteModal, setDeleteModal] = useState(null)

	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")

	const notifications = useNotifications();
	const navigate = useNavigate();

	const { mazo: idMazo } = useParams();
	const [selectedCard, setSelectedCard] = useState(-1)
	const [selectedNote, setSelectedNote] = useState(-1)
	const [selectedQuestion, setSelectedQuestion] = useState(-1)

	useEffect(async () => {
		// Si estamos editando carga los datos del mazo, si no cancela
		if (!idMazo) return;
		const db = getFirestore();
		const user = getAuth().currentUser;
		const mazoRef = doc(db, "users", user.uid, "mazos", idMazo)
		const mazo = (await getDoc(mazoRef)).data()

		setTitle(mazo.title)
		setContent(mazo.content)

		const notasRef = collection(db, mazoRef.path, "notas")
		const tarjetasRef = collection(db, mazoRef.path, "tarjetas")
		const preguntasRef = collection(db, mazoRef.path, "preguntas")

		const notas = await getDocs(notasRef)
		const tarjetas = await getDocs(tarjetasRef)
		const preguntas = await getDocs(preguntasRef)

		setNotes(notas.docs.map(doc => ({ id: doc.id, ...doc.data() })))
		setCards(tarjetas.docs.map(doc => ({ id: doc.id, ...doc.data() })))
		setQuestions(preguntas.docs.map(doc => ({ id: doc.id, ...doc.data() })))

	}, [idMazo])


	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<ScrollArea style={{ height: "100vh", width: "100vw" }} type="never">
				<form onSubmit={() => {
					save(title, content, notes, cards, notifications, idMazo, deletedCards, deletedNotes, questions, deletedQuestions).then(navigate("/"))
				}}>

					<Stack align="center" justify="center" style={{ width: "94%", height: "100%", paddingLeft: "2%", paddingRight: "2%" }}>
						<h3>Titulo</h3>
						<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} required></TextInput>
						<h3>Contenido</h3>
						<RichTextEditor value={content} onChange={setContent} onImageUpload={handleImageUpload} />
						<h3>Tarjetas</h3>
						<SimpleGrid cols={4}>
							<AddPreview activate={() => setSelectedCard(-2)}></AddPreview>
							{
								cards.map(({ titleFront, id }, idx) =>
									<CardPreview key={titleFront + id} name={titleFront} setSelected={() => setSelectedCard(idx)} />
								)
							}
						</SimpleGrid>
						<h3>Notas</h3>
						<SimpleGrid cols={4}>
							<AddPreview activate={() => setSelectedNote(-2)}></AddPreview>
							{
								notes.map(({ title, id }, idx) =>
									<CardPreview key={title + id} name={title} setSelected={() => setSelectedNote(idx)} />
								)
							}
						</SimpleGrid>
						<h3>Preguntas</h3>
						<SimpleGrid cols={4}>
							<AddPreview activate={() => setSelectedQuestion(-2)}></AddPreview>
							{
								questions.map(({ title, id }, idx) =>
									<CardPreview key={title + id} name={title} setSelected={() => setSelectedQuestion(idx)} />
								)
							}
						</SimpleGrid>


						<Group grow>
							<Button color="red" onClick={() => {
								setDeleteModal({
									text: "esta lectura completamente", action: () => {
										if (idMazo) {
											const user = getAuth().currentUser;
											const db = getFirestore();
											const mazoRef = doc(db, 'users', user.uid, "mazos", idMazo);
											deleteDoc(mazoRef)
										}
										navigate("/")
									}
								})

							}}>
								{idMazo ? "Eliminar" : "Cancelar"}
							</Button>
							<Button color="green" type="submit">
								Guardar
							</Button>

						</Group>
					</Stack>
				</form>

				{
					// Modal de editar/crear tarjeta
					(selectedCard != -1) &&
					<CardEditModal index={selectedCard} cards={cards} setCards={setCards} close={() => setSelectedCard(-1)} setDeletedCards={setDeletedCards} setModalData={setDeleteModal}></CardEditModal>
				}
				{
					// Modal de editar/crear nota
					(selectedNote != -1) &&
					<NoteEditModal index={selectedNote} notes={notes} setNotes={setNotes} close={() => setSelectedNote(-1)} setDeletedNotes={setDeletedNotes} setModalData={setDeleteModal}></NoteEditModal >
				}
				{
					// Modal de editar/crear pregunta
					(selectedQuestion != -1) &&
					<QuestionEditModal index={selectedQuestion} questions={questions} setQuestions={setQuestions} close={() => setSelectedQuestion(-1)} setDeletedQuestions={setDeletedQuestions} setModalData={setDeleteModal} />
				}
				<Modal zIndex={11} opened={deleteModal != null} onClose={() => setDeleteModal(null)} centered>

					<Text size="xl" align="center">¿Estas seguro de que quieres eliminar {deleteModal?.text}?</Text>
					<Text size="xl" align="center" my="md">Este cambio <Text component="span" weight={700}>NO</Text> se puede deshacer</Text>
					<Group grow>
						<Button onClick={() => {
							deleteModal?.action()
							setDeleteModal(null)
						}} color="red">Eliminar</Button>
						<Button onClick={() => setDeleteModal(null)} color="blue">Cancelar</Button>
					</Group>
				</Modal>
			</ScrollArea>
		</Paper >
	)
}


export default Create