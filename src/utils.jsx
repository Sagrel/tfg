import { getAuth } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { createContext } from "react";
import { Star } from "tabler-icons-react";

export const sameDay = (date1, date2) => {
	return date1.toDateString() === date2.toDateString()
}

export const isYesterday = (date) => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	return sameDay(date, yesterday)
}

export const isToday = (date) => {
	const today = new Date();
	return sameDay(date, today)
}


// Quita todas las propiedades undefined, esto hace falta porque firebase explota si una propiedad es undefined
export const cleanObject = (obj) => {
	for (const key in obj) {
		if (obj[key] === undefined) {
			delete obj[key];
		}
	}
	return obj
}

export const handleImageUpload = (file) => {
	const apiKey = "2f96d4553b7ba2244a0ce62f3d3d749b";

	return new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('image', file);

		fetch('https://api.imgbb.com/1/upload?key=' + apiKey, {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((result) => resolve(result.data.url))
			.catch(() => reject(new Error('Upload failed')));
	})
}

export const defaultAchivements = {
	"Tenaz": { logro: "Consigue una racha de % días", milestones: [5, 15, 40, 100], progress: 0 },
	"Erudito": { logro: "Acierta % repasos", milestones: [5, 15, 40, 100, 200], progress: 0 },
	"Sabelo todo": { logro: "Aprende % tarjetas nuevas", milestones: [10, 25, 75, 150, 300, 500, 750, 1000], progress: 0 },
	"Infalible": { logro: "Acierta % repasos seguidos", milestones: [5, 15, 40, 100, 200], progress: 0 },
	"El que persiste": { logro: "Inicia sesion % fines de semana", milestones: [2, 5, 10, 20, 50], progress: 0 },
	"Fotogenico": { logro: "Añade % foto de perfil", milestones: [1], progress: 0 },
	"Creador de conocimiento": { logro: "Crea % lecciones", milestones: [2, 5, 10, 20, 35], progress: 0 },
	"Terminator": { logro: "Termina % lecciones", milestones: [2, 5, 10, 20, 35], progress: 0 },
	"Estudiante modelo": { logro: "Aprueba % test sin fallos", milestones: [2, 5, 10, 20, 35], progress: 0 },
	"Empollon": { logro: "Lee las notas durante % minutos", milestones: [2, 5, 10, 20, 35], progress: 0 },
}

export const checkAchivement = async (logro, notifications) => {
	const db = getFirestore()
	const user = getAuth().currentUser
	const userRef = doc(db, "users", user.uid)
	const userData = (await getDoc(userRef)).data()
	const lvl = defaultAchivements[logro].milestones.findIndex((x) => x == userData[logro])
	if (!userData.profesor && lvl != -1) {
		notifications.showNotification({
			title: `Logro conseguido: ${logro}`,
			message: `Has alcanzado el nivel ${lvl + 1}`,
			color: "yellow",
			icon: (<Star />)
		})
	}
}

export const Show = ({ condition, children }) => {
	return (
		<>
			{

				condition &&
				children
			}
		</>
	)
}

export const UserContext = createContext();

export const createDeck = async (title, content, notes, cards, questions, userId, mazoId) => {
	const db = getFirestore()
	const creador = getAuth().currentUser.uid
	const mazosRef = collection(db, 'users', userId, "mazos");

	// La primera vez que se llama se generan en el profesor y se guardan los ids para usar los mismos en los alumnos
	if (mazoId) {
		const mazoRef = doc(db, mazosRef.path, mazoId)
		await setDoc(mazoRef, { title, content, creador })
	} else {
		mazoId = (await addDoc(mazosRef, { title, content, creador })).id;
	}

	const notasRef = collection(db, mazosRef.path, mazoId, "notas");
	notes.forEach(async (note) => {
		if (note.id) {
			const noteRef = doc(db, notasRef.path, note.id)
			const { id, ...newNote } = note
			await setDoc(noteRef, cleanObject(newNote))
		} else {
			const doc = await addDoc(notasRef, note)
			note.id = doc.id
		}
	});
	const tarjetasRef = collection(db, mazosRef.path, mazoId, "tarjetas");
	cards.forEach(async (card) => {
		card = cleanObject(card)
		if (card.id) {
			const cardRef = doc(db, tarjetasRef.path, card.id)
			const { id, ...newCard } = card
			await setDoc(cardRef, newCard)
		} else {
			const doc = await addDoc(tarjetasRef, { interval: 1, ...card })
			card.id = doc.id
		}
	});
	const preguntasRef = collection(db, mazosRef.path, mazoId, "preguntas");
	questions.forEach(async (question) => {
		question = cleanObject(question)
		if (question.id) {
			const preguntaRef = doc(db, preguntasRef.path, question.id)
			const { id, ...newQuestion } = question
			await setDoc(preguntaRef, newQuestion)
		} else {
			const doc = await addDoc(preguntasRef, question)
			question.id = doc.id
		}
	});

	return mazoId
}

export const editDeck = async (title, content, notes, cards, questions, deletedCards, deletedNotes, deletedQuestions, userId, mazoId) => {
	const db = getFirestore()
	const mazosRef = collection(db, 'users', userId, "mazos");
	const mazoRef = doc(db, 'users', userId, "mazos", mazoId);
	await updateDoc(mazoRef, { title, content });
	const notasRef = collection(db, mazosRef.path, mazoId, "notas");
	notes.forEach(async (note) => {
		if (note.id) {
			const noteRef = doc(db, notasRef.path, note.id)
			const { id, ...newNote } = note
			if ((await getDoc(noteRef)).exists) {
				await updateDoc(noteRef, cleanObject(newNote))
			} else {
				await setDoc(noteRef, cleanObject(newNote))
			}
		} else {
			const doc = await addDoc(notasRef, note)
			note.id = doc.id
		}
	});
	const tarjetasRef = collection(db, mazosRef.path, mazoId, "tarjetas");
	cards.forEach(async (card) => {
		card = cleanObject(card)
		if (card.id) {
			const cardRef = doc(db, tarjetasRef.path, card.id)
			const { id, ...newCard } = card
			if ((await getDoc(cardRef)).exists) {
				await updateDoc(cardRef, newCard)
			} else {
				await setDoc(cardRef, newCard)
			}
		} else {
			const doc = await addDoc(tarjetasRef, { interval: 1, ...card })
			card.id = doc.id
		}
	});
	const preguntasRef = collection(db, mazosRef.path, mazoId, "preguntas");
	questions.forEach(async (question) => {
		question = cleanObject(question)
		if (question.id) {
			const preguntaRef = doc(db, preguntasRef.path, question.id)
			const { id, ...newQuestion } = question
			if ((await getDoc(preguntaRef)).exists) {
				await updateDoc(preguntaRef, newQuestion)
			} else {
				await setDoc(preguntaRef, newQuestion)
			}
		} else {
			const doc = await addDoc(preguntasRef, question)
			question.id = doc.id
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
}

