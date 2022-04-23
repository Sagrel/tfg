import { Button, Card, Center, Group, Paper, Stack, Text } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "tabler-icons-react";

// TODO distingir entre aprender nuevas y repasar un mazo
const Review = () => {

	const [cards, setCards] = useState([])
	// TODO handle global review
	const { mazo } = useParams();

	const navigate = useNavigate();
	const notifications = useNotifications();

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
		// TODO allow user to set number of new cards per day
		// TODO account for already learned cards today
		const definitiveCards = mazo ? cards.filter(card => !card["due date"]).slice(0, 10) : cards.filter(card => card["due date"] <= Date.now())
		setCards(definitiveCards)

		// Get user custom timer timit
		const userRef = doc(db, "users", user.uid);
		const user_data = await getDoc(userRef);
		setTimeLimit(user_data.data().timer);
		setSeconds(user_data.data().timer);
		setIsActive(true);
	}, [mazo])

	const reveal = () => {
		setIsActive(false)
		setShowBack(true)
	}

	const time_passed_percentage = (seconds / timeLimit) * 100

	const advanceOrEnd = (newCards) => {
		// TODO Advance the achievements
		// TODO Do it also if we just dont have any reviews to begin with
		if (newCards.length == 0) {
			notifications.clean()
			notifications.showNotification({
				title: "Repaso terminado",
				message: "Enhorabuena, has terminado el repaso de hoy",
				color: "green"
			})
			navigate("/")
		} else {
			setCards(newCards)
		}
	}

	const next_card = (correct) => {

		const updateCard = (newDueDate, newInterval) => {
			const db = getFirestore()
			const user = getAuth().currentUser
			const cardRef = doc(db, "users", user.uid, "mazos", cards[0].mazoId, "tarjetas", cards[0].uid)
			updateDoc(cardRef, { "due date": newDueDate, "interval": newInterval })
		}

		if (correct) {
			// TODO advance the required achivements
			const newDueDate = Date.now() + cards[0].interval;
			const newInterval = cards[0].interval * (2 + time_passed_percentage / 100);
			updateCard(newDueDate, newInterval)
			// remove the card from review list
			const [_, ...tail] = cards;
			advanceOrEnd(tail)
		} else {
			const newDueDate = Date.now();
			const newInterval = 1 /* TODO make this 1 day and configurable in the future */;
			updateCard(newDueDate, newInterval)
			// add card to the back
			const [head, ...tail] = cards;
			advanceOrEnd([...tail, head])
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
									{ /* Make this look good */}
									{seconds}<Clock size={18} style={{ width: 17 }}></Clock>
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