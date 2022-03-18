import { useState } from "react"

const Create = () => {

	const [text, setText] = useState("")
	const [words, setWords] = useState([])


	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
			<h2>Introduce el texto</h2>
			<textarea defaultValue={text} rows={20} onChangeCapture={(e) => {				
				setText(e.target.value)

				const segmenter = new Intl.Segmenter('en-En', { granularity: 'word' /*sentence or word*/ });
				setWords([...segmenter.segment(e.target.value)])
				console.log(words)
				// get_words translations(e.target.value, setWords)
			}}></textarea>
			<p>{words.filter(w => w.isWordLike).map(w => w.segment).join(",").toString() }</p>
			{
				
				/*
				<ul>
					{Object.keys(words).map((e, i) => {
						return (<li key={i}>{e} = <input value={words[e]} onChangeCapture={(t) => { setWords(previousState => ({ ...previousState, [e]: t.value })) }}></input></li>)
					})}
			</ul>
			*/
			}


		</div>
	)
}

export default Create




const get_words = (text, setState) => {
	let words = [...new Set(text.match(/[a-z'-]+/gi))]


	const get_translation = async (word) => {
		const res = await fetch("https://translate.mentality.rip/translate", {
			method: "POST",
			body: JSON.stringify({
				q: word,
				source: "en",
				target: "es"
			}),
			headers: { "Content-Type": "application/json" }
		});

		return (await res.json()).translatedText
	}

	for (const w of words) {

		get_translation(w).then((translated) => {
			setState(previousState => ({ ...previousState, [w]: translated }))
		})
	}
}
