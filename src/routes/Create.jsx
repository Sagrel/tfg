import { useState, useEffect } from "react"

import { RichTextEditor } from '@mantine/rte';
import { ActionIcon, Button, Card, Center, Group, Modal, Paper, ScrollArea, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { CirclePlus, Rotate360 } from "tabler-icons-react";
import { useNotifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";

// TODO account for editing, don't create a whole new deck
// TODO add default values for "due date" and "interval" for cards
const createDeck = async (title, content, notes, cards, notifications) => {
	try {
		const user = getAuth().currentUser;
		const db = getFirestore();
		const mazosRef = collection(db, 'users', user.uid, "mazos");
		const mazoDoc = await addDoc(mazosRef, { title, content });
		const notasRef = collection(db, mazosRef.path, mazoDoc.id, "notas");
		notes.forEach(async (note) => {
			await addDoc(notasRef, note)
		});
		const tarjetasRef = collection(db, mazosRef.path, mazoDoc.id, "tarjetas");
		cards.forEach(async (card) => {
			await addDoc(tarjetasRef, card)
		});
		notifications.clean()
		notifications.showNotification({
			title: "Leccion creada con exito",
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


// TODO Hide this?
const apiKey = "2f96d4553b7ba2244a0ce62f3d3d749b";

const CardEditModal = ({ index, cards, close, setCards }) => {
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
										newArray[index] = { titleFront, dataFront, titleBack, dataBack }
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


const NoteEditModal = ({ index, notes, close, setNotes }) => {
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
										newArray[index] = { title, content }
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

// TODO pòner más bonico
const AddPreview = ({ activate }) => {
	return (
		<Card onClick={activate} style={{ cursor: "pointer" }}>
			<Center>
				<CirclePlus></CirclePlus>
			</Center>
		</Card>
	)
}

// TODO delete this 
const testNotes = [
	{ title: "basic note 1", content: "Some basic html content" },
	{ title: "basic note 2", content: "Some basic html content" },
	{ title: "basic note 3", content: "Some basic html content" },
	{ title: "basic note 4", content: "Some basic html content" },
]
const testCards = [
	{ titleFront: "Test1", dataFront: "", titleBack: "", dataBack: "" },
	{ titleFront: "A long one just to test", dataFront: "", titleBack: "", dataBack: "" },
	{ titleFront: "Test3", dataFront: "", titleBack: "", dataBack: "" },
	{ titleFront: "Test4", dataFront: "", titleBack: "", dataBack: "" },
	{ titleFront: "An even longer one just to test the limits", dataFront: "", titleBack: "", dataBack: "" },
]

// TODO Add preguntas
const Create = () => {
	// TODO do not use test data
	const [notes, setNotes] = useState(testNotes)
	const [cards, setCards] = useState(testCards)
	const [title, setTitle] = useState("") // TODO add verification 
	const [content, setContent] = useState("")

	const notifications = useNotifications();
	const navigate = useNavigate();

	const { mazo: idMazo } = useParams();
	const [selectedCard, setSelectedCard] = useState(-1)
	const [selectedNote, setSelectedNote] = useState(-1)

	useEffect(async () => {
		if (!idMazo) return;
		const db = getFirestore();
		const user = getAuth().currentUser;
		const mazoRef = doc(db, "users", user.uid, "mazos", idMazo)
		const mazo = (await getDoc(mazoRef)).data()

		setTitle(mazo.title)
		setContent(mazo.content)

		const notasRef = collection(db, mazoRef.path, "notas")
		const tarjetasRef = collection(db, mazoRef.path, "tarjetas")

		const notas = await getDocs(notasRef)
		const tarjetas = await getDocs(tarjetasRef)

		setNotes(notas.docs.map(doc => ({ id: doc.id, ...doc.data() })))
		setCards(tarjetas.docs.map(doc => ({ id: doc.id, ...doc.data() })))

	}, [idMazo])


	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<ScrollArea style={{ height: "100vh", width: "100vw" }} type="never">
				<Stack align="center" justify="center" style={{ width: "94%", height: "100%", paddingLeft: "2%", paddingRight: "2%" }}>
					<h3>Titulo</h3>
					<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} required></TextInput>
					<h3>Contenido</h3>
					<RichTextEditor value={content} onChange={setContent} onImageUpload={handleImageUpload} />
					<h3>Tarjetas</h3>
					<SimpleGrid cols={4}>
						<AddPreview activate={() => setSelectedCard(-2)}></AddPreview>
						{
							cards.map(({ titleFront }, idx) =>
								<CardPreview key={titleFront} name={titleFront} setSelected={() => setSelectedCard(idx)} />
							)
						}
					</SimpleGrid>
					<h3>Notas</h3>
					<SimpleGrid cols={4}>
						<AddPreview activate={() => setSelectedNote(-2)}></AddPreview>
						{
							notes.map(({ title }, idx) =>
								<CardPreview key={title} name={title} setSelected={() => setSelectedNote(idx)} />
							)
						}
					</SimpleGrid>
					{
						// Modal de editar/crear tarjeta
						(selectedCard != -1) &&
						<CardEditModal index={selectedCard} cards={cards} setCards={setCards} close={() => setSelectedCard(-1)}></CardEditModal>
					}
					{
						// Modal de editar/crear nota
						(selectedNote != -1) &&
						<NoteEditModal index={selectedNote} notes={notes} setNotes={setNotes} close={() => setSelectedNote(-1)}></NoteEditModal >
					}
					<Button color="green" onClick={() => createDeck(title, content, notes, cards, notifications).then(navigate("/"))}>
						Guardar
					</Button>
				</Stack>
			</ScrollArea>
		</Paper>
	)
}


export default Create

/*
{
	TODO Decidir si voy a hacer lo de extraer las palabras y traducirlas
	<Button onClick={() => setContent(get_words(get_text(value)))}>Extraer palabras</Button>
	content.map(([sentence, parts]) => {
		return <p>{sentence + " ==> " + parts.join(" : ").toString()} </p>
	})
}
*/

// TODO Some how translate the words and sentences
const get_words_translated = (text, setState) => {
	let words = [...new Set(text.match(/[a-z'-]+/gi))]


	const get_translation = async (word) => {
		const res = await fetch("https://translate.mentality.rip/translate", {
			method: "POST",
			body: JSON.stringify({
				q: word,
				source: "en",
				target: "es"
			}),
			headers: { "Content-Type": "application/json" }
		});

		return (await res.json()).translatedText
	}

	for (const w of words) {

		get_translation(w).then((translated) => {
			setState(previousState => ({ ...previousState, [w]: translated }))
		})
	}
}

const get_text = (html_text) => {
	return new DOMParser()
		.parseFromString(html_text, "text/html")
		.documentElement.textContent;
	// NOTE this does not account for line endings, so don't forget to put the "." at the end of a sentence 
}

const get_words = (text) => {
	const word_segmenter = new Intl.Segmenter('en-En', { granularity: 'word' });
	const sentence_segmenter = new Intl.Segmenter('en-En', { granularity: 'sentence' })
	const sentences = [...sentence_segmenter.segment(text)]
	console.log(sentences)
	const res = sentences.map((sentence) => {
		const sentence_text = sentence.segment;
		//let words = [...word_segmenter.segment(sentence_text)]
		return [sentence_text, [...word_segmenter.segment(sentence_text)].filter(w => w.isWordLike).map(w => w.segment.toLowerCase())]
	})
	console.log(res)
	return [...res]
}