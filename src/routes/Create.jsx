import { useState } from "react"

import { RichTextEditor } from '@mantine/rte';
import { Button } from "@mantine/core";

const get_text = (html_text) => {
	return new DOMParser()
		.parseFromString(html_text, "text/html")
		.documentElement.textContent;
	// FIXME this does not account for line endings!! 
}

const get_words = (text) => {
	const word_segmenter = new Intl.Segmenter('en-En', { granularity: 'word' });
	const sentence_segmenter = new Intl.Segmenter('en-En', { granularity: 'sentence' })
	const sentences = [...sentence_segmenter.segment(text)]
	console.log(sentences)
	const res = sentences.map((sentence) => {
		const sentence_text = sentence.segment;
		//let words = [...word_segmenter.segment(sentence_text)]
		return [sentence_text, [...word_segmenter.segment(sentence_text)].filter(w => w.isWordLike).map(w => w.segment.toLowerCase())]
	})
	console.log(res)
	return [...res]
}

// TODO Hide this?
const apiKey = "2f96d4553b7ba2244a0ce62f3d3d749b";


const handleImageUpload = (file) =>
	new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('image', file);

		fetch('https://api.imgbb.com/1/upload?key=' + apiKey, {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((result) => resolve(result.data.url))
			.catch(() => reject(new Error('Upload failed')));
	});

const Create = () => {
	const [words, setWords] = useState([])

	const [value, onChange] = useState("Put something here");
	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
			<h2>Introduce el texto</h2>
			<RichTextEditor value={value} onChange={onChange} onImageUpload={handleImageUpload} />
			<Button onClick={() => setWords(get_words(get_text(value)))}>Extraer palabras</Button>
			{
				words.map(([sentence, parts]) => {
					return <p>{sentence + " ==> " + parts.join(" : ").toString()} </p>
				})
			}
		</div>
	)
}

export default Create

// TODO Some how translate the words and sentences
const get_words_translated = (text, setState) => {
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
