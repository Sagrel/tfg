import { Button, Center, Group, Popover, RingProgress, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Check } from "tabler-icons-react";
import { useState } from "react";

const Level = ({ elem, progress, total }) => {
    const p = Math.min(progress, total);
    const percentage = Math.round(p / total * 100);

    const [opened, setOpened] = useState(false);
    const navigate = useNavigate();


    let ring = p == total ?
        (<RingProgress
            sections={[{ value: 100, color: 'teal' }]}
            label={
                <Center>
                    <ThemeIcon color="teal" variant="light" radius="xl" size="xl">
                        <Check size={22} />
                    </ThemeIcon>
                </Center>
            }
        />) :
        (<RingProgress
            sections={[{ value: percentage, color: 'blue' }]}
            label={
                <Text color="blue" weight={700} align="center" size="xl">
                    {percentage}%
                </Text>
            }
        />)


    return (
        <Center>
            <Popover
                opened={opened}
                onClose={() => setOpened(false)}
                target={
                    <Stack align="center" onClick={() => setOpened((o) => !o)}>
                        <Text size="xl">{elem}</Text>
                        {ring}
                    </Stack >
                }
                width={260}
                position="bottom"
                withArrow
            >
                <Stack>
                    {/* TODO Boton para editar */}
                    <Button onClick={() => { navigate("review/" + elem) }}>Aprender nuevas</Button>
                    <Button onClick={() => { navigate("teoria/" + elem) }}>Ver Notas</Button>
                    <Button onClick={() => { navigate("reading/" + elem) }}>Leer</Button>
                </Stack>
            </Popover >
        </Center>
    )
}

// TODO Actually load the decks from the server
const Study = () => {
    let ejercicios = ["Presentaciones", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres", "Hobies", "Direcciones", "De donde eres"]
    const navigate = useNavigate();

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Stack>
                <Group position="center" grow>

                    <Button onClick={() => { navigate("review/galleta") /* change url*/ }}>
                        Repasar todo
                    </Button>
                    <h4>
                        Te faltan 5 repasos para alcanzar tu objetivo diario
                    </h4>
                    <Button onClick={() => { navigate("create") }}>
                        Añadir contenido
                    </Button>
                </Group>
                <SimpleGrid cols={2}>

                    {
                        // TODO Actually show the progress instead of using random values
                        ejercicios.map((elem, i) => <div key={i}><Level elem={elem} progress={Math.random() * 100} total={95}></Level></div>)
                    }
                </SimpleGrid>
            </Stack>

        </ScrollArea>)

}

export default Study;