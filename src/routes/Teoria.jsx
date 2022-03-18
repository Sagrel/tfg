import { useParams } from "react-router-dom"

const Teoria = () => {
	const { tema } = useParams()
	let html = "Teoria  sobre " + tema + ", puede contener html como esto <div style=\"background-color:red;\">Hola mundo</div> asi podemos incluir imagenes y enlaces a nuestro antojo"

	return (<div dangerouslySetInnerHTML={{ __html: html }}></div>)

}

export default Teoria