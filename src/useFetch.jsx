import { useEffect, useState } from "react";

export default function useFetch(path, dependencies = []) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null)

	useEffect(() => {
		fetch(path)
			.then(json => {
				json.json()
					.then(result => setData(result))
					.catch(err => setError(err))
					.finally(() => setLoading(false))
			})
			.catch(err => setError(err))
	}, [])

	return [loading, error, data]
}