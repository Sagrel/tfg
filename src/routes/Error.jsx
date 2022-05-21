import { Paper, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";

const Error = () => {

    return (
        <Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
            <Stack align="center" justify="center" style={{ width: "100vw", height: "100vh" }}>
                <Text color="red" size="xl" weight={500}>404</Text>
                <Text size="xl" weight={500}>La pagina a la que intentas acceder no existe</Text>
                <Text size="xl" weight={500}>Volver a <Link to={"/"}>inicio</Link></Text>
            </Stack>
        </Paper >
    )
}

export default Error;