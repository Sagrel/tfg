import { useState, useEffect } from "react"

import { RichTextEditor } from '@mantine/rte';
import { ActionIcon, Button, Card, Center, Checkbox, Group, Modal, Paper, RadioGroup, ScrollArea, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
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

// TODO unificar los modales y reutilizar la logica
// TODO usar formularios y poner los required

const CardEditModal = ({ index, cards, close, setCards, setDeletedCards }) => {
	const creating = index == -2;
	const original = creating ? { titleFront: "", dataFront: "", titleBack: "", dataBack: "" } : cards[index];
	const [titleFront, setTitleFront] = useState(original.titleFront);
	const [dataFront, setDataFront] = useState(original.dataFront);
	const [titleBack, setTitleBack] = useState(original.titleBack);
	const [dataBack, setDataBack] = useState(original.dataBack);
	const [showBack, setShowBack] = useState(false);

	const flipButton = (
		<ActionIcon onClick={() => setShowBack(old => !old)}>
			<Rotate360 />
		</ActionIcon>
	)

	return (
		<Modal
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando el " + (showBack ? "reverso" : "frente")}
		>
			<Stack>

				{
					!showBack ?
						<>
							<Group grow>
								<TextInput value={titleFront} onChange={(event) => setTitleFront(event.currentTarget.value)}></TextInput>
								{flipButton}
							</Group>
							<TextInput value={dataFront} onChange={(event) => setDataFront(event.currentTarget.value)}></TextInput>
						</>
						:
						<>
							<Group grow>
								<TextInput value={titleBack} onChange={(event) => setTitleBack(event.currentTarget.value)}></TextInput>
								{flipButton}
							</Group>
							<TextInput value={dataBack} onChange={(event) => setDataBack(event.currentTarget.value)}></TextInput>
						</>
				}
				<Group position="apart">
					{
						creating ?
							<Button color="green" onClick={() => {
								setCards(old => [...old, { titleFront, dataFront, titleBack, dataBack }])
								close()
							}}>Crear</Button>
							:
							<>
								<Button color="red" onClick={() => {
									if (original.id) {
										setDeletedCards(old => [...old, original.id])
									}
									setCards(old => {
										const newArray = old.slice()
										newArray.splice(index, 1)
										return newArray
									})
									close()
								}}>Eliminar</Button>
								<Button color="green" onClick={() => {
									setCards(old => {
										const newArray = old.slice()
										// Conservo el id original y el resto de su info para poder modificar in-place
										newArray[index] = { titleFront, dataFront, titleBack, dataBack, id: original.id, interval: original.interval, "due date": original["due date"] }
										return newArray
									})
									close()
								}}>Guardar cambios</Button>
							</>
					}
				</Group>
			</Stack>
		</Modal>
	)
}

const NoteEditModal = ({ index, notes, close, setNotes, setDeletedNotes }) => {
	const creating = index == -2;
	const original = creating ? { title: "", content: "" } : notes[index];
	const [title, setTitle] = useState(original.title);
	const [content, setContent] = useState(original.content);

	return (
		<Modal
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando nota"}
		>
			<Stack>
				<TextInput value={title} label="Titulo" required onChange={(event) => setTitle(event.currentTarget.value)}></TextInput>
				<RichTextEditor value={content} onChange={setContent} onImageUpload={handleImageUpload}></RichTextEditor>
				<Group position="apart">
					{
						creating ?
							<Button color="green" onClick={() => {
								setNotes(old => [...old, { title, content }])
								close()
							}}>Crear</Button>
							:
							<>
								<Button color="red" onClick={() => {
									if (original.id) {
										setDeletedNotes(old => [...old, original.id])
									}
									setNotes(old => {
										const newArray = old.slice()
										newArray.splice(index, 1)
										return newArray
									})
									close()
								}}>Eliminar</Button>
								<Button color="green" onClick={() => {
									setNotes(old => {
										const newArray = old.slice()
										// Conservo el id original para poder modificar in-place
										newArray[index] = { title, content, id: original.id }
										return newArray
									})
									close()
								}}>Guardar cambios</Button>
							</>
					}
				</Group>
			</Stack>
		</Modal>
	)
}

const QuestionEditModal = ({ index, questions, close, setQuestions, setDeletedQuestions }) => {
	const creating = index == -2;
	const original = creating ? { title: "", options: [{ name: "", correct: false }, { name: "", correct: false }, { name: "", correct: false }, { name: "", correct: false }] } : questions[index];
	const [title, setTitle] = useState(original.title);
	const [options, setOptions] = useState(original.options);

	return (
		<Modal
			opened={true}
			centered
			size="xl"
			onClose={close}
			title={"Editando pregunta"}
		>
			<Stack>
				<TextInput value={title} label="Titulo" required onChange={(event) => setTitle(event.currentTarget.value)}></TextInput>
				{
					options.map((elem, idx) => {
						return (
							<Group>
								<TextInput value={elem.name} onChange={(e) => setOptions(old => {
									old[idx].name = e.target.value
									return [...old]
								})} required></TextInput>
								<Checkbox checked={elem.correct} onChange={(e) => setOptions(old => {
									old[idx].correct = e.target.checked
									return [...old]
								})}></Checkbox>
							</Group>
						)
					})
				}
				<Group position="apart">
					{
						creating ?
							<Button color="green" onClick={() => {
								setQuestions(old => [...old, { title, options }])
								close()
							}}>Crear</Button>
							:
							<>
								<Button color="red" onClick={() => {
									if (original.id) {
										setDeletedQuestions(old => [...old, original.id])
									}
									setQuestions(old => {
										const newArray = old.slice()
										newArray.splice(index, 1)
										return newArray
									})
									close()
								}}>Eliminar</Button>
								<Button color="green" onClick={() => {
									setQuestions(old => {
										const newArray = old.slice()
										// Conservo el id original para poder modificar in-place
										newArray[index] = { title, options, id: original.id }
										return newArray
									})
									close()
								}}>Guardar cambios</Button>
							</>
					}
				</Group>
			</Stack>
		</Modal>
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


// TODO Add preguntas
const Create = () => {
	const [notes, setNotes] = useState([])
	const [cards, setCards] = useState([])
	const [questions, setQuestions] = useState([])
	const [deletedCards, setDeletedCards] = useState([])
	const [deletedNotes, setDeletedNotes] = useState([])
	const [deletedQuestions, setDeletedQuestions] = useState([])

	const [title, setTitle] = useState("") // TODO add verification 
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
								// TODO Si el titleFront no es unico explota todo
								cards.map(({ titleFront }, idx) =>
									<CardPreview key={titleFront} name={titleFront} setSelected={() => setSelectedCard(idx)} />
								)
							}
						</SimpleGrid>
						<h3>Notas</h3>
						<SimpleGrid cols={4}>
							<AddPreview activate={() => setSelectedNote(-2)}></AddPreview>
							{
								// TODO Si el title no es unico explota todo
								notes.map(({ title }, idx) =>
									<CardPreview key={title} name={title} setSelected={() => setSelectedNote(idx)} />
								)
							}
						</SimpleGrid>
						<h3>Preguntas</h3>
						<SimpleGrid cols={4}>
							<AddPreview activate={() => setSelectedQuestion(-2)}></AddPreview>
							{
								// TODO Si el title no es unico explota todo
								questions.map(({ title }, idx) =>
									<CardPreview key={title} name={title} setSelected={() => setSelectedQuestion(idx)} />
								)
							}
						</SimpleGrid>
						{
							// Modal de editar/crear tarjeta
							(selectedCard != -1) &&
							<CardEditModal index={selectedCard} cards={cards} setCards={setCards} close={() => setSelectedCard(-1)} setDeletedCards={setDeletedCards} ></CardEditModal>
						}
						{
							// Modal de editar/crear nota
							(selectedNote != -1) &&
							<NoteEditModal index={selectedNote} notes={notes} setNotes={setNotes} close={() => setSelectedNote(-1)} setDeletedNotes={setDeletedNotes} ></NoteEditModal >
						}
						{
							// Modal de editar/crear pregunta
							(selectedQuestion != -1) &&
							<QuestionEditModal index={selectedQuestion} questions={questions} setQuestions={setQuestions} close={() => setSelectedQuestion(-1)} setDeletedQuestions={setDeletedQuestions} ></QuestionEditModal >
						}
						<Group grow>
							<Button color="red" onClick={() => {
								// TODO add some sort of verification pop up for this
								if (idMazo) {
									const user = getAuth().currentUser;
									const db = getFirestore();
									const mazoRef = doc(db, 'users', user.uid, "mazos", idMazo);
									deleteDoc(mazoRef)
								}
								navigate("/")
							}}>
								{idMazo ? "Eliminar" : "Cancelar"}
							</Button>
							<Button color="green" type="submit">
								Guardar
							</Button>

						</Group>
					</Stack>
				</form>

			</ScrollArea>
		</Paper >
	)
}


export default Create