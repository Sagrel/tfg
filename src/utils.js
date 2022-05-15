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