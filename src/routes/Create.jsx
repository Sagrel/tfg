import { useState, useEffect, useContext } from "react"

import { RichTextEditor } from '@mantine/rte';
import { ActionIcon, Button, Card, Center, Checkbox, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore";
import { CirclePlus, Rotate360 } from "tabler-icons-react";
import { useNotifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";
import { checkAchivement, createDeck, editDeck, Show, handleImageUpload, UserContext } from "../utils";


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
			<form onSubmit={(e) => {
				e.preventDefault()
				SaveOrCreate(creating, setCards, close, data, index)
			}
			}>
				<Stack>

					{
						!showBack ?
							<>
								<Group grow>
									<TextInput label="Titulo frente" value={data?.titleFront} required onChange={(e) => setData(old => ({ ...old, titleFront: e.target.value }))}></TextInput>
									{flipButton}
								</Group>
								<TextInput label="Extra frente" value={data?.dataFront} onChange={(e) => setData(old => ({ ...old, dataFront: e.target.value }))}></TextInput>
							</>
							:
							<>
								<Group grow >
									<TextInput label="Titulo detras" value={data?.titleBack} required onChange={(e) => setData(old => ({ ...old, titleBack: e.target.value }))}></TextInput>
									{flipButton}
								</Group>
								<TextInput label="Extra detras" value={data?.dataBack} onChange={(e) => setData(old => ({ ...old, dataBack: e.target.value }))}></TextInput>
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
			<form onSubmit={(e) => {
				e.preventDefault()
				SaveOrCreate(creating, setNotes, close, data, index)
			}}>
				<Stack>
					<TextInput value={data?.title} label="Titulo" required onChange={(e) => setData(old => ({ ...old, title: e.target.value }))}></TextInput>
					<Text>Contenido</Text>
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
			<form onSubmit={(e) => {
				e.preventDefault()
				SaveOrCreate(creating, setQuestions, close, data, index)
			}
			}>

				<Stack>
					<TextInput value={data?.title} label="Titulo" required onChange={(event) => setData(old => ({ ...old, title: event.target.value }))}></TextInput>
					<Text>Opciones</Text>
					{
						data.options.map((elem, idx) => {
							return (
								<Group key={idx}>
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


const AddPreview = ({ activate }) => {
	return (
		<ActionIcon onClick={activate} color="teal">
			<CirclePlus />
		</ActionIcon>
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

	const isProfesor = useContext(UserContext)

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
				<form onSubmit={async (e) => {
					e.preventDefault()
					const myId = getAuth().currentUser.uid
					const alumnos = isProfesor ? (await getDoc(doc(getFirestore(), "users", myId))).data().alumnos ?? [] : []
					if (idMazo) {
						try {
							await editDeck(title, content, notes, cards, questions, deletedNotes, deletedCards, deletedQuestions, myId, idMazo)

							if (isProfesor) {
								await Promise.all(
									alumnos.map(alumno => editDeck(title, content, notes, cards, questions, deletedNotes, deletedCards, deletedQuestions, alumno, idMazo))
								)
							}
							notifications.showNotification({
								title: "Lección creada con exito",
								color: "green"
							})
						} catch (e) {
							console.error(e)
							notifications.clean()
							notifications.showNotification({
								title: "Error creando la lección",
								message: "Intentalo más tarde",
								color: "red"
							})
						}
					} else {
						try {

							const mazoId = await createDeck(title, content, notes, cards, questions, myId)

							if (isProfesor) {
								await Promise.all(
									alumnos.map(alumno => createDeck(title, content, notes, cards, questions, alumno, mazoId))
								)
							}
							notifications.showNotification({
								title: "Lección editada con exito",
								color: "green"
							})
						} catch (e) {
							console.error(e)
							notifications.clean()
							notifications.showNotification({
								title: "Error editando lección",
								message: "Intentalo más tarde",
								color: "red"
							})
						}
					}

					// Si estamos creando un mazo nuevo avanzamos el logro
					if (!idMazo) {
						const db = getFirestore()
						const user = getAuth().currentUser
						const userRef = doc(db, "users", user.uid)
						await updateDoc(userRef, { "Creador de conocimiento": increment(1) })

						checkAchivement("Creador de conocimiento", notifications)
					}

					navigate("/")
				}}>

					<Stack justify="center" style={{ width: "94%", height: "100%", paddingLeft: "2%", paddingRight: "2%" }}>
						<h3>Titulo</h3>
						<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} required></TextInput>
						<h3>Contenido</h3>
						<RichTextEditor value={content} onChange={setContent} onImageUpload={handleImageUpload} />
						<Group>
							<h3>Tarjetas</h3>
							<AddPreview activate={() => setSelectedCard(-2)}></AddPreview>
						</Group>

						<SimpleGrid cols={4}>
							{
								cards.map(({ titleFront, id }, idx) =>
									<CardPreview key={titleFront + id} name={titleFront} setSelected={() => setSelectedCard(idx)} />
								)
							}
						</SimpleGrid>
						<Group>
							<h3>Notas</h3>
							<AddPreview activate={() => setSelectedNote(-2)}></AddPreview>
						</Group>
						<SimpleGrid cols={4}>
							{
								notes.map(({ title, id }, idx) =>
									<CardPreview key={title + id} name={title} setSelected={() => setSelectedNote(idx)} />
								)
							}
						</SimpleGrid>
						<Group>
							<h3>Preguntas</h3>
							<AddPreview activate={() => setSelectedQuestion(-2)}></AddPreview>
						</Group>
						<SimpleGrid cols={4}>
							{
								questions.map(({ title, id }, idx) =>
									<CardPreview key={title + id} name={title} setSelected={() => setSelectedQuestion(idx)} />
								)
							}
						</SimpleGrid>


						<Group grow>
							<Button color="red" onClick={() => {
								setDeleteModal({
									text: "esta lectura completamente", action: async () => {
										try {

											if (idMazo) {
												const myId = getAuth().currentUser.uid
												const db = getFirestore();
												const mazoRef = doc(db, 'users', myId, "mazos", idMazo);
												await deleteDoc(mazoRef)

												if (isProfesor) {
													const alumnos = isProfesor ? (await getDoc(doc(getFirestore(), "users", myId))).data().alumnos ?? [] : []

													await Promise.all(
														alumnos.map(alumno => {
															const mazoRef = doc(db, 'users', alumno, "mazos", idMazo);
															return deleteDoc(mazoRef)
														})
													)
												}
											}
											notifications.showNotification({ color: "green", title: "Lección eliminada correctamente" })
											navigate("/")
										} catch (e) {
											console.error(e)
											notifications.showNotification({ color: "red", title: "Error al eliminar la lección" })
										}
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

				<Show condition={selectedCard != -1}>
					<CardEditModal index={selectedCard} cards={cards} setCards={setCards} close={() => setSelectedCard(-1)} setDeletedCards={setDeletedCards} setModalData={setDeleteModal}></CardEditModal>
				</Show>
				<Show condition={selectedNote != -1}>
					<NoteEditModal index={selectedNote} notes={notes} setNotes={setNotes} close={() => setSelectedNote(-1)} setDeletedNotes={setDeletedNotes} setModalData={setDeleteModal}></NoteEditModal >
				</Show>
				<Show condition={selectedQuestion != -1}>
					<QuestionEditModal index={selectedQuestion} questions={questions} setQuestions={setQuestions} close={() => setSelectedQuestion(-1)} setDeletedQuestions={setDeletedQuestions} setModalData={setDeleteModal} />
				</Show>

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