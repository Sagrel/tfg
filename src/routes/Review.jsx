import { Button, Card, Center, Group, Paper, Stack, Text } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "tabler-icons-react";
import { checkAchivement, cleanObject } from "../utils";


const Review = () => {

	const [cards, setCards] = useState([])
	const [total, setTotal] = useState(0)

	const { mazo } = useParams();

	const learning = mazo ? true : false

	const navigate = useNavigate();
	const notifications = useNotifications();

	const [bonus, setBonus] = useState(null)

	const [timeLimit, setTimeLimit] = useState(100);
	const [seconds, setSeconds] = useState(timeLimit);
	const [isActive, setIsActive] = useState(false);
	const [showBack, setShowBack] = useState(false)

	useEffect(async () => {
		const db = getFirestore();

		const user = getAuth().currentUser;

		// Distinge si estamos repasando todos o si estamos aprendiendo nuevas
		let mazosIds = [];
		if (mazo) {
			mazosIds = [mazo]
		} else {
			const mazosRef = collection(db, "users", user.uid, "mazos")
			const mazos = await getDocs(mazosRef)
			mazosIds = mazos.docs.map(doc => doc.id)
		}

		// Get cards to review
		let cards = []
		for (const mazoId of mazosIds) {
			const cardsRef = collection(db, "users", user.uid, "mazos", mazoId, "tarjetas")
			const cardDocs = await getDocs(cardsRef)
			cards = cards.concat(cardDocs.docs.map(card => ({ uid: card.id, mazoId, ...card.data() })))
		}

		const userData = await (await getDoc(doc(db, "users", user.uid))).data()
		const learnedToday = userData.learnedToday ?? 0
		const learnLimit = userData.learnLimit ?? 10

		setBonus({ easy: userData.easyBonus ?? 3, ok: userData.okBonus ?? 2, hard: userData.hardBonus ?? 1 })

		const definitiveCards = mazo ? cards.filter(card => !card["due date"]).slice(0, learnLimit - learnedToday) : cards.filter(card => new Date(card["due date"]) <= new Date())

		if (learnedToday == learnLimit && definitiveCards.length == 0) {
			notifications.showNotification({
				title: "Limite alcanzado",
				message: "Ya has alcanzado el limite de tarjetas nuevas que puedes aprender hoy",
				color: "blue"
			})
		}

		setCards(definitiveCards)
		setTotal(definitiveCards.length)


		setTimeLimit(userData.timer);
		setSeconds(userData.timer);
		setIsActive(true);
	}, [mazo])

	const reveal = () => {
		setIsActive(false)
		setShowBack(true)
	}

	const time_passed_percentage = (seconds / timeLimit) * 100

	const advanceOrEnd = async (newCards) => {
		if (newCards.length == 0) {
			if (learning) {
				const db = getFirestore();
				const user = getAuth().currentUser.uid
				const tarjetasRef = collection(db, "users", user, "mazos", mazo, "tarjetas")
				const tarjetas = await getDocs(tarjetasRef)
				const tarjetasEnAprendizaje = tarjetas.docs.filter(t => t.data()["due date"] == undefined).length

				if (tarjetasEnAprendizaje === 0) {
					const userRef = doc(db, "users", user)
					await updateDoc(userRef, { Terminator: increment(1) })

					checkAchivement("Terminator", notifications)
				}
			}

			notifications.clean()
			notifications.showNotification({
				title: "Repaso terminado",
				message: "Enhorabuena, has terminado de repasar",
				color: "green"
			})
			navigate("/")
		} else {
			setCards(newCards)
		}
	}

	const next_card = (correct) => {

		const updateCard = (newDueDate, newInterval, failed) => {
			const db = getFirestore()
			const user = getAuth().currentUser
			const cardRef = doc(db, "users", user.uid, "mazos", cards[0].mazoId, "tarjetas", cards[0].uid)
			const resultado = failed
				?
				"nFallos"
				:
				time_passed_percentage > 66
					?
					"nFacil"
					: time_passed_percentage > 33
						?
						"nOk"
						:
						"nDificil"

			updateDoc(cardRef, cleanObject({ "due date": newDueDate.toDateString(), "interval": newInterval, "failed": failed, [resultado]: increment(1) }))
		}

		const incrementLearned = async () => {
			const db = getFirestore()
			const user = getAuth().currentUser
			const userRef = doc(db, "users", user.uid)
			await updateDoc(userRef, { learnedToday: increment(1), "Sabelo todo": increment(1) })

			checkAchivement("Sabelo todo", notifications)
		}


		const incrementCorrect = async () => {
			const db = getFirestore()
			const user = getAuth().currentUser
			const userRef = doc(db, "users", user.uid)
			const userDoc = await getDoc(userRef)
			const userData = userDoc.data()

			const newRacha = (userData.rachaCorrectas ?? 0) + 1
			const batidoRecord = (userData.Infalible ?? 0) < newRacha
			const newInfalible = batidoRecord ? newRacha : (userData.Infalible ?? 0)

			await updateDoc(userRef, { Erudito: increment(1), rachaCorrectas: newRacha, Infalible: newInfalible })

			checkAchivement("Erudito", notifications)
			if (batidoRecord) {
				checkAchivement("Infalible", notifications)
			}
		}

		const romperRachaCorrectas = async () => {
			const db = getFirestore()
			const user = getAuth().currentUser
			const userRef = doc(db, "users", user.uid)
			await updateDoc(userRef, { rachaCorrectas: 0 })
		}

		if (correct) {
			const multiplier = time_passed_percentage > 66 ?
				bonus.easy
				: time_passed_percentage > 33 ?
					bonus.ok
					:
					bonus.hard

			const newInterval = Math.round(multiplier * cards[0].interval)
			const newDueDate = new Date()

			newDueDate.setDate(newDueDate.getDate() + newInterval)



			updateCard(newDueDate, newInterval, false)
			if (learning) {
				incrementLearned()
			} else {
				incrementCorrect()
			}
			// remove the card from review list
			const [_, ...tail] = cards;

			advanceOrEnd(tail)
		} else {
			romperRachaCorrectas()
			const newDueDate = new Date();
			const newInterval = 1;
			updateCard(newDueDate, newInterval, true)
			// add card to the back
			const [head, ...tail] = cards;
			setCards([...tail, head])
		}

		setSeconds(timeLimit)
		setShowBack(false)
		setIsActive(true)
	}

	// Set up the timer
	useEffect(() => {
		let interval;
		if (isActive) {
			interval = setInterval(() => {
				// We compare against 1 because this is before subtracting the value
				if (seconds == 1 && cards.length > 0) {
					reveal()
				}
				setSeconds(seconds => seconds - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isActive, seconds]);


	let color = "red"
	if (time_passed_percentage > 66) {
		color = "green"
	} else if (time_passed_percentage > 33) {
		color = "yellow"
	} else if (time_passed_percentage > 0) {
		color = "orange"
	}

	const [palabra, frase] = cards[0] ? (!showBack ? [cards[0].titleFront, cards[0].dataFront] : [cards[0].titleBack, cards[0].dataBack]) : ["", ""]

	const buttoms = showBack ? <Group grow position="apart" style={{ marginBottom: 5, marginTop: 5 }}>
		<Button color="red" onClick={() => next_card(false)}>Mal</Button>
		<Button color={color} disabled={seconds == 0} onClick={() => next_card(true)}>Bien</Button>
	</Group> : <Button onClick={reveal}>Mostrar respuesta</Button>

	return (
		<Paper radius={0} style={{ width: "100vw", height: "100vh" }}>

			<Center style={{ width: "100vw", height: "100vh" }}>
				<Card style={{ width: "70vw", height: "70vh", margin: 'auto' }}>
					{
						(isActive && cards.length == 0) ?

							<Stack justify="space-around" style={{ width: "100%", height: "100%" }}>
								<Center>
									<h1>¡Has terminado de repasar por hoy!</h1>
								</Center>
								<Button onClick={() => navigate("/")}>Volver a inicio</Button>
							</Stack>
							:
							<Stack justify="space-around" style={{ width: "100%", height: "100%" }}>


								<div style={{ position: "absolute", top: "0", right: "0", margin: "2em", color: color }} >
									{seconds}<Clock size={18} style={{ width: 17 }}></Clock>
								</div>
								{ /* TODO change this for a new/failed/pending kind of thing */}
								<div style={{ position: "absolute", top: "0", left: "0", margin: "2em" }} >
									<Text>{total - cards.length}/{total}</Text>
								</div>
								<Center>
									<Text size="xl" weight={500} >{palabra}</Text>
								</Center>
								<Center>
									<Text>{frase}</Text>
								</Center>
								{buttoms}
							</Stack>
					}
				</Card>
			</Center>
		</Paper>
	)
}

export default Review;