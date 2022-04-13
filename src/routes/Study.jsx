import { Button, Center, Group, Popover, RingProgress, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Check } from "tabler-icons-react";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, doc, getDocs, getFirestore } from "firebase/firestore";

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
                    <Stack align="center" onClick={() => setOpened((o) => !o)} style={{ cursor: "pointer" }}>
                        <Text size="xl">{elem.name}</Text>
                        {ring}
                    </Stack >
                }
                width={260}
                position="bottom"
                withArrow
            >
                <Stack>
                    {/* I should use the uid of the lesson instead of the name */}
                    <Button onClick={() => { navigate("review/" + elem.id) }}>Aprender nuevas</Button>
                    <Button onClick={() => { navigate("teoria/" + elem.id) }}>Ver Notas</Button>
                    <Button onClick={() => { navigate("reading/" + elem.id) }}>Leer</Button>
                    <Button onClick={() => { navigate("create/" + elem.id) }}>Editar</Button>
                </Stack>
            </Popover >
        </Center>
    )
}



const Study = () => {
    const navigate = useNavigate();

    const [mazos, setMazos] = useState([]);

    useEffect(async () => {
        const user = getAuth().currentUser;
        if (!user) return;
        const db = getFirestore();
        const mazosRef = collection(db, "users", user.uid, "mazos");
        const mazos = await getDocs(mazosRef);
        mazos.forEach(mazo => {
            setMazos(old => {
                // TODO add a "added" field or something to order the decks, this is random right now?
                return [...old, { id: mazo.id, ...mazo.data() }]
            })
        })
    }, [])

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Stack>
                <Group position="center" grow>
                    { /* TODO Add the number of reviews to the buttom */ }
                    <Button onClick={() => { navigate("review/galleta") /* change url*/ }}>
                        Repasar todo
                    </Button>
                    <h4>
                        {/* TODO actuallyt keep track of the currect daily streak */}
                        Te faltan 5 repasos para alcanzar tu objetivo diario
                    </h4>
                    <Button onClick={() => { navigate("create") }}>
                        Añadir contenido
                    </Button>
                </Group>
                <SimpleGrid cols={2}>

                    {
                        // TODO Actually show the progress instead of using random values
                        mazos.map((elem, i) => <div key={i}><Level elem={elem} progress={Math.random() * 100} total={95}></Level></div>)
                    }
                </SimpleGrid>
            </Stack>

        </ScrollArea>)

}

export default Study;