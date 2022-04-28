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
