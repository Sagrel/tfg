import { Button, Card, Center, Group, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Clock } from "tabler-icons-react";

const Review = () => {

	const [timeLimit, setTimeLimit] = useState(100);
	const [seconds, setSeconds] = useState(timeLimit);
	const [isActive, setIsActive] = useState(false);
	const [showBack, setShowBack] = useState(false)

	useEffect(async () => {
		const db = getFirestore();
		const userRef = doc(db, "users", getAuth().currentUser.uid);
		const user_data = await getDoc(userRef);
		setTimeLimit(user_data.data().timer);
		setSeconds(user_data.data().timer);
		setIsActive(true);
	}, [])

	const reveal = () => {
		setIsActive(false)
		setShowBack(true)
	}

	const next_card = (correct) => {

		if (correct) {
			// Do something 
		} else {
			// Do something else			
		}
		// Load next card info

		setSeconds(timeLimit)
		setShowBack(false)
		setIsActive(true)
	}

	useEffect(() => {
		let interval;
		if (isActive) {
			interval = setInterval(() => {
				// We compare against 1 because this is before subtracting the value
				if (seconds == 1) {
					reveal()
				}
				setSeconds(seconds => seconds - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isActive, seconds]);


	// Calculate the color of the timer (also used for the Bien buttom)
	const time_passed_percentage = (seconds / timeLimit) * 100

	let color = "red"
	if (time_passed_percentage > 66) {
		color = "green"
	} else if (time_passed_percentage > 33) {
		color = "yellow"
	} else if (time_passed_percentage > 0) {
		color = "orange"
	}

	const [palabra, frase] = showBack ? ["Su traduccion", "Su definición"] : ["La palabra", "Una frase de ejemplo"]

	const buttoms = showBack ? <Group grow position="apart" style={{ marginBottom: 5, marginTop: 5 }}>
		<Button color="red" onClick={next_card}>Mal</Button>
		<Button color={color} disabled={seconds == 0} onClick={next_card}>Bien</Button>
	</Group> : <Button onClick={reveal}>Mostrar respuesta</Button>

	return (
		<Paper radius={0} style={{ width: "100vw", height: "100vh" }}>

			<Center style={{ width: "100vw", height: "100vh" }}>
				<Card style={{ width: "70vw", height: "70vh", margin: 'auto' }}>
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
				</Card>
			</Center>
		</Paper>
	)
}

export default Review;