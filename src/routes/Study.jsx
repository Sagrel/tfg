import { Group, ScrollArea, Stack } from "@mantine/core";
import { Link } from "react-router-dom";

const Level = ({ elem }) => {
    return (
        <>
            <Link className="Tema" style={{ width: "70%", borderTopLeftRadius: "25px", borderBottomLeftRadius: "25px" }} to={`/review/${elem}`}>{elem}</Link>
            <Link className="Tema" style={{ width: "15%" }} to={`/teoria/${elem}`}>Teoría</Link>
            <Link className="Tema" style={{ width: "15%", borderTopRightRadius: "25px", borderBottomRightRadius: "25px" }} to={`/reading/${elem}`}>Leer</Link>
        </>
    )
}

const Study = () => {
    let ejercicios = ["Presentaciones", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres"]


    return (
        <ScrollArea style={{ height: "100vh", width: "100%" }} type="always">
            <Stack>
                <Group>
                    <Link className="Tema" style={{ borderRadius: "25px" }} to="/review">
                        Repasar todo
                    </Link>
                    <h4>
                        Te faltan 5 repasos para alcanzar tu objetivo diario
                    </h4>
                    <Link className="Tema" style={{ borderRadius: "25px" }} to="/create">
                        Añadir contenido
                    </Link>
                </Group>
                {
                    ejercicios.map((elem, i) => <div key={i}><Level elem={elem}></Level></div>)
                }
            </Stack>

        </ScrollArea>)

}

export default Study;