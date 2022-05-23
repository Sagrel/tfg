import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore";
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";
import { ActionIcon, Anchor, Button, Card, Center, Checkbox, Divider, Group, Paper, ScrollArea, Space, Stack, Text } from "@mantine/core";
import { Check, PlayerPlay, PlayerTrackNext, PlayerTrackPrev, X } from "tabler-icons-react";
import { checkAchivement } from "../utils";
import { useNotifications } from "@mantine/notifications";

// reference: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array
}

const Reading = () => {

	const { tema } = useParams()

	const [mazo, setMazo] = useState(null)
	const [sentences, setSentences] = useState([])
	const [questions, setQuestions] = useState([])
	const [current, setCurrent] = useState(0)
	const [showTest, setShowTest] = useState(false)
	const [answers, setAnswers] = useState([])
	const [showResults, setShowResults] = useState(false)

	const notifications = useNotifications()

	useEffect(async () => {
		const user = getAuth().currentUser;
		const db = getFirestore();
		const mazoRef = doc(db, "users", user.uid, "mazos", tema);
		const mazoDoc = await getDoc(mazoRef);
		setMazo({ id: mazoDoc.id, ...mazoDoc.data() })
		setSentences(getSentences(getText(mazoDoc.data().content)))

		const preguntasRef = collection(db, mazoRef.path, "preguntas")
		const preguntasDocs = await getDocs(preguntasRef)
		const preguntasData = shuffleArray(preguntasDocs.docs).slice(0, 5).map(doc => doc.data())
		setQuestions(preguntasData)
		setAnswers(preguntasData.map(
			(pregunta) =>
				pregunta.options.map((option) => ({ checked: false, correct: option.correct }))
		)
		)
	}, [])

	const aciertos = answers.map(question => question.every(({ checked, correct }) => checked == correct) ? 1 : 0).reduce((a, b) => a + b, 0)

	return (
		<Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
			<Center>
				<ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
					<Center>
						<h1>{mazo?.title}</h1>
					</Center>

					<RichTextEditor value={mazo?.content} readOnly />
					<Center m="lg">
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



					{
						!showTest ?
							<Center m="md">
								<Button onClick={() => setShowTest(true)}>Realizar prueba</Button>
							</Center>
							:
							<>
								{
									questions.map((q, idx) => {
										return (
											<Card key={idx}>

												<Stack justify={"flex-start"}>
													<Text>{idx + 1}. {q.title}</Text>
													{
														q.options.map((o, idx2) => {

															const isWrong = showResults && answers[idx][idx2].checked != answers[idx][idx2].correct

															const icon = ({ _, className }) =>
																answers[idx][idx2].correct ? <Check className={className} /> : <X className={className} />;

															const conditional = isWrong ? { color: answers[idx][idx2].correct ? "yellow" : "red", icon: icon } : { color: showResults ? "green" : "blue" }

															return (

																<Group align={"flex-start"}>
																	<Checkbox
																		{...conditional}
																		checked={answers[idx][idx2].checked || isWrong}
																		onChange={(e) => {
																			if (!showResults)
																				setAnswers(old => {
																					old[idx][idx2].checked = e.target.checked
																					return [...old]
																				})
																		}}
																	></Checkbox>
																	<Text>{o.name}</Text>
																</Group>
															)
														})
													}
												</Stack>
											</Card>
										)
									})
								}
								<Center>
									{
										!showResults ?
											<Button m="md" onClick={async () => {
												setShowResults(true)
												if (aciertos === answers.length) {
													const db = getFirestore()
													const user = getAuth().currentUser
													const userRef = doc(db, "users", user.uid)
													await updateDoc(userRef, { "Estudiante modelo": increment(1) })

													checkAchivement("Estudiante modelo", notifications)
												}
											}}>Revisar</Button>
											:
											<Text m="md" >Has hacertado {aciertos} de {answers.length}. Volver al <Anchor component={Link} to="/">inicio</Anchor> </Text>
									}
								</Center>
							</>
					}
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