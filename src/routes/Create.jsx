import { useState } from "react"

import { RichTextEditor } from '@mantine/rte';
import { ActionIcon, Button, Card, Center, Grid, Group, Modal, Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { addDoc, collection, doc } from "firebase/firestore";
import { CirclePlus, Rotate360 } from "tabler-icons-react";

const get_text = (html_text) => {
	return new DOMParser()
		.parseFromString(html_text, "text/html")
		.documentElement.textContent;
	// NOTE this does not account for line endings, so don't forget to put the "." at the end of a sentence 
}

// TODO usar esto
const createDeck = async (name, text, notes, cards) => {
	const user = getAuth().currentUser;
	const db = getFirestore();
	const mazosRef = collection(db, 'users', user.uid, "mazos");
	const mazoDoc = await addDoc(mazoRef, { name, text });
	const notasRef = collection(db, mazosRef, mazoDoc.id, "notas");
	notes.forEach(async ({ name, content }) => {
		await addDoc(notasRef, { name, content })
	});
	// TODO subir las tarjetas
	notifications.clean()
	notifications.showNotification({
		title: "Leccion creada con exito",
		message: `La leccion ya debería aparecer en la pestaña de inicio`,
		color: "green"
	})
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

// TODO Hide this?
const apiKey = "2f96d4553b7ba2244a0ce62f3d3d749b";

const CardEditModal = ({ index, cards, close, setCards }) => {
	const creating = index == 0;
	const [titleFront, setTitleFront] = useState(cards[index].titleFront);
	const [dataFront, setDataFront] = useState(cards[index].dataFront);
	const [titleBack, setTitleBack] = useState(cards[index].titleBack);
	const [dataBack, setDataBack] = useState(cards[index].dataBack);
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

const CardPreview = ({ name, setSelected }) => {
	return (
		<>
			<Card onClick={setSelected}>
				<Center>
					<Text>{name}</Text>
				</Center>
			</Card>
		</>
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
	});

const Create = () => {
	const [words, setWords] = useState([])
	const [selectedCard, setSelectedCard] = useState(-1)

	const testCards = [
		{ titleFront: "", dataFront: "", titleBack: "", dataBack: "" },
		{ titleFront: "Test1", dataFront: "", titleBack: "", dataBack: "" },
		{ titleFront: "A long one just to test", dataFront: "", titleBack: "", dataBack: "" },
		{ titleFront: "Test3", dataFront: "", titleBack: "", dataBack: "" },
		{ titleFront: "Test4", dataFront: "", titleBack: "", dataBack: "" },
		{ titleFront: "An even longer one just to test the limits", dataFront: "", titleBack: "", dataBack: "" },
	]

	// TODO do not use test cards
	const [cards, setCards] = useState(testCards)

	const [value, onChange] = useState("");
	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<Stack align="center" justify="center" style={{ width: "100vw", height: "100vh" }}>
				<h3>Contenido</h3>
				<RichTextEditor value={value} onChange={onChange} onImageUpload={handleImageUpload} />
				<h3>Tarjetas</h3>
				<SimpleGrid cols={4}>
					{
						// TODO make is so the first cards is for adding new (add a CirclePuls icon)
						cards.map(({ titleFront }, idx) =>
							<CardPreview key={titleFront} name={titleFront} setSelected={() => setSelectedCard(idx)} />
						)
					}
				</SimpleGrid>
				<Button onClick={() => setWords(get_words(get_text(value)))}>Extraer palabras</Button>
				{
					words.map(([sentence, parts]) => {
						return <p>{sentence + " ==> " + parts.join(" : ").toString()} </p>
					})
				}
				{
					(selectedCard != -1) &&
					<CardEditModal index={selectedCard} cards={cards} setCards={setCards} close={() => setSelectedCard(-1)}></CardEditModal>
				}
			</Stack>
		</Paper>
	)
}

export default Create

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
