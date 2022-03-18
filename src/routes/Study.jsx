import { Link } from "react-router-dom";

const Study = () => {
    let ejercicios = ["Presentaciones", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres"]
 

    return (<>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2em" }}>
            <Link className="Tema" style={{ borderRadius: "25px" }} to="/review">
                Repasar todo
            </Link>
            <h4>
                Te faltan 5 repasos para alcanzar tu objetivo diario
            </h4>
            <Link className="Tema" style={{ borderRadius: "25px" }} to="/create">
                Añadir contenido
            </Link>
        </div>

        {
            ejercicios.map((elem, i) => {
                return (
                    <div key={i} style={{ display: "flex", width: "100%" }}>
                        <Link className="Tema" style={{ width: "70%", borderTopLeftRadius: "25px", borderBottomLeftRadius: "25px" }} to={`/review/${elem}`}>{elem}</Link>
                        <Link className="Tema" style={{ width: "15%" }} to={`/teoria/${elem}`}>Teoría</Link>
                        <Link className="Tema" style={{ width: "15%", borderTopRightRadius: "25px", borderBottomRightRadius: "25px" }} to={`/reading/${elem}`}>Leer</Link>

                    </div>
                )

            })
        }
    </>)

}

export default Study;