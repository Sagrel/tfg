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