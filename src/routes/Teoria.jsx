import { useParams } from "react-router-dom"

// TODO Load the notes of the level and display them
// TODO Allow the user to add their own notes
const Teoria = () => {
	const { tema } = useParams()
	let html = "Teoria  sobre " + tema + ", puede contener html como esto <div style=\"background-color:red;\">Hola mundo</div> asi podemos incluir imagenes y enlaces a nuestro antojo"

	return (<div dangerouslySetInnerHTML={{ __html: html }}></div>)

}

export default Teoria