import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
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
	"Estudiante modelo": { logro: "Aprueba % test csin fallos", milestones: [2, 5, 10, 20, 35], progress: 0 },
	"Empollon": { logro: "Lee las notas de % lecciones", milestones: [2, 5, 10, 20, 35], progress: 0 },
}

export const checkAchivement = async (logro, notifications) => {
	const db = getFirestore()
	const user = getAuth().currentUser
	const userRef = doc(db, "users", user.uid)
	const userData = (await getDoc(userRef)).data()
	const lvl = defaultAchivements[logro].milestones.findIndex((x) => x == userData[logro])
	if (lvl != -1) {
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