import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { RichTextEditor } from '@mantine/rte';
import { getAuth } from "firebase/auth";
import { ActionIcon, Button, Card, Center, Checkbox, Divider, Group, Paper, ScrollArea, Space, Stack, Text } from "@mantine/core";
import { Check, PlayerPlay, PlayerTrackNext, PlayerTrackPrev, X } from "tabler-icons-react";


const Reading = () => {

	const { tema } = useParams()

	const [mazo, setMazo] = useState(null)
	const [sentences, setSentences] = useState([])
	const [questions, setQuestions] = useState([])
	const [current, setCurrent] = useState(0)
	const [showTest, setShowTest] = useState(false)
	const [answers, setAnswers] = useState([])
	const [showResults, setShowResults] = useState(false)

	useEffect(async () => {
		const user = getAuth().currentUser;
		if (!user) return;
		const db = getFirestore();
		const mazoRef = doc(db, "users", user.uid, "mazos", tema);
		const mazoDoc = await getDoc(mazoRef);
		setMazo({ id: mazoDoc.id, ...mazoDoc.data() })
		setSentences(getSentences(getText(mazoDoc.data().content)))

		// TODO set the number of questions lo load as a setting
		const preguntasRef = collection(db, mazoRef.path, "preguntas")
		const preguntasDocs = await getDocs(preguntasRef)
		const preguntasData = preguntasDocs.docs.map(doc => doc.data())
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
					<Divider></Divider>


					{
						!showTest ?
							<Center>
								<Button onClick={() => setShowTest(true)}>Realizar prueba</Button>
							</Center>
							:
							<>
								{
									questions.map((q, idx) => {
										return (
											<Card>

												<Stack justify={"flex-start"}>
													<Text>{idx + 1}. {q.title}</Text>
													{
														q.options.map((o, idx2) => {

															const isWrong = showResults && answers[idx][idx2].checked != answers[idx][idx2].correct

															const icon = ({ indeterminate, className }) =>
																answers[idx][idx2].correct ? <Check className={className} /> : <X className={className} />;

															const conditional = isWrong ? { color: "red", icon: icon } : {}

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
										// TODO incrementar logros si haciertas todas la preguntas
										!showResults ?
											<Button onClick={() => {
												setShowResults(true)
											}}>Revisar</Button>
											:
											<Text>Has hacertado {aciertos} de {answers.length}. Volver a  <Link to={"/"}>incicio</Link> </Text>
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