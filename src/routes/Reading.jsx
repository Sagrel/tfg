const Reading = () => {

	let text = ["Aqui deberia aparecer un texto con varios parrafos, con el boton de arriba se lee todo el texto automaticamente, aunque podriamos poner un boton por parrafo", "Este sería el 2º parrafo", "Y este el tercero"]

	return (<>
		<button onClick={() => {
			let msg = new SpeechSynthesisUtterance();
			let voices = window.speechSynthesis.getVoices();
			voices = voices.filter((v) => v.lang.includes("en-GB") || v.lang.includes("en-US"))
			msg.voice = voices[0];

			msg.volume = 1; // From 0 to 1
			msg.rate = 1; // From 0.1 to 10
			msg.pitch = 1; // From 0 to 2
			msg.text = "This is just an example";
			msg.lang = 'en';
			window.speechSynthesis.speak(msg);
		}}>Pulsa para iniciar audio</button>
		{text.map((e, i) => {
			return (<p key={i}> {e}</p>)
		})}

		<p>
			Al final podriamos poner preguntas sobre el texto para comprobar que el alumno a comprendido el texto realmente.
			Tambien podriamos poner preguntas despues de cada parrafo.
		</p>
	</>)

}

export default Reading