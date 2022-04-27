import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";
import { ActionIcon, Center, Group, Paper, ScrollArea, Space, Stack, Text } from "@mantine/core";
import { PlayerPlay, PlayerTrackNext, PlayerTrackPrev } from "tabler-icons-react";


// TODO load preguntas and display them at the end
const Reading = () => {

	const { tema } = useParams()

	const [mazo, setMazo] = useState(null)
	// TODO divide the text in sentences and play the audio sentence by sentence
	const [sentences, setSentences] = useState([])
	const [current, setCurrent] = useState(0)

	useEffect(async () => {
		const user = getAuth().currentUser;
		if (!user) return;
		const db = getFirestore();
		const mazoRef = doc(db, "users", user.uid, "mazos", tema);
		const mazoDoc = await getDoc(mazoRef);
		setMazo({ id: mazoDoc.id, ...mazoDoc.data() })
		setSentences(getSentences(getText(mazoDoc.data().content)))
	}, [])

	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<Center>
				<ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
					<Center>
						<h1>{mazo?.title}</h1>
					</Center>

					<RichTextEditor value={mazo?.content} readOnly />
					<Center>
						<Stack align="center">

							<Group>
								{
									current == 0
										?
										< Space />
										:
										<ActionIcon onClick={() => setCurrent(old => old - 1)}>
											<PlayerTrackPrev />
										</ActionIcon>
								}

								<ActionIcon onClick={() => say(sentences[current])}>
									<PlayerPlay />
								</ActionIcon>
								{
									current < sentences?.length - 1
										?
										<ActionIcon onClick={() => setCurrent(old => old + 1)} >
											<PlayerTrackNext />
										</ActionIcon>
										:
										< Space />
								}
							</Group>
							<Center>
								<Text>{sentences[current]}</Text>
							</Center>
						</Stack>
					</Center>
				</ScrollArea>
			</Center >
		</Paper >
	)
}


const getText = (html_text) => {
	// This is a little HACK that prevents the last line of a paragraph and the first of the next to merge into one sentence
	html_text = html_text.replace("</p>", "</p> ")
	return new DOMParser()
		.parseFromString(html_text, "text/html")
		.documentElement.textContent;
}

const getSentences = (text) => {
	const sentence_segmenter = new Intl.Segmenter('en-En', { granularity: 'sentence' })
	const sentences = [...sentence_segmenter.segment(text)]
	return sentences.map((sentence) => sentence.segment)
}

const say = text => {
	window.speechSynthesis.cancel()
	let msg = new SpeechSynthesisUtterance();
	let voices = window.speechSynthesis.getVoices();
	voices = voices.filter((v) => v.lang.includes("en-GB") || v.lang.includes("en-US"))
	msg.voice = voices[0];

	msg.volume = 1; // From 0 to 1
	msg.rate = 1; // From 0.1 to 10
	msg.pitch = 1; // From 0 to 2
	msg.text = text;
	msg.lang = 'en';
	window.speechSynthesis.speak(msg);
}

export default Reading