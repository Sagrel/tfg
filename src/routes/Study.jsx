import { Button, Center, Group, Popover, RingProgress, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Check } from "tabler-icons-react";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";



const Level = ({ elem, canLearn }) => {
    const percentageLearning = Math.round((elem.aprendiendo - elem.pendientes) / elem.total * 100);
    const percentageFailed = Math.round(elem.fallidas / elem.total * 100);
    const percentagePending = Math.round((elem.pendientes - elem.fallidas) / elem.total * 100);
    const percentageNew = 100 - percentageLearning - percentageFailed - percentagePending;

    const [opened, setOpened] = useState(false);
    const navigate = useNavigate();


    let ring = percentageFailed == 0 && percentagePending == 0 && percentageNew == 0 ?
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

            sections={[
                { value: percentageLearning, color: 'teal' },
                { value: percentagePending, color: 'yellow' },
                { value: percentageFailed, color: 'red' },
                { value: percentageNew, color: 'blue' }]}
            label={

                <Text weight={700} align="center" size="xl">
                    <Text color="blue" weight={700} size="xl" inherit component="span">
                        {Math.min(elem.total - elem.aprendiendo, canLearn)}
                    </Text>
                    /
                    <Text color="red" weight={700} size="xl" inherit component="span">
                        {elem.fallidas}
                    </Text>
                    /
                    <Text color="yellow" weight={700} size="xl" inherit component="span">
                        {elem.pendientes - elem.fallidas}
                    </Text>
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
                        <Text size="xl">{elem.title}</Text>
                        {ring}
                    </Stack >
                }
                width={260}
                position="bottom"
                withArrow
            >
                <Stack>
                    <Button disabled={elem.aprendiendo == elem.total || canLearn == 0} onClick={() => { navigate("review/" + elem.id) }}>Aprender nuevas</Button>
                    <Button onClick={() => { navigate("teoria/" + elem.id) }}>Ver Notas</Button>
                    <Button onClick={() => { navigate("reading/" + elem.id) }}>Leer</Button>
                    <Button onClick={() => { navigate("create/" + elem.id) }}>Editar</Button>
                </Stack>
            </Popover >
        </Center>
    )
}


// FIXME updates in other windows like editing a level or seting the daily streak seem to happen after the screen renders so it's outdated
const Study = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState(0)
    const [racha, setRacha] = useState(0)
    const [mazos, setMazos] = useState([]);
    const [canLearn, setCanLearn] = useState(0)

    useEffect(async () => {
        const user = getAuth().currentUser;
        if (!user) return;
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()
        setRacha(userData.racha ?? 0) // FIXME this happens before the change is actually done in the database
        setCanLearn(userData.learnLimit - userData.learnedToday)
        const mazosRef = collection(db, "users", user.uid, "mazos");
        const mazos = await getDocs(mazosRef);
        // TODO should I sort this in some way?
        setMazos(await Promise.all(mazos.docs.map(async (mazo) => {
            // Tarjetas dentro del mazo en cuestion
            const tarjetasRef = collection(db, "users", user.uid, "mazos", mazo.id, "tarjetas");
            const tarjetas = await getDocs(tarjetasRef)
            // Numero total de tarjetas en el mazo
            const total = tarjetas.docs.length
            // Array con las tarjetas que están en proceso de aprendizaje
            const tarjetasEnAprendizaje = tarjetas.docs.filter(t => t.data()["due date"])
            // Numero de tarjetas en aprendizaje
            const aprendiendo = tarjetasEnAprendizaje.length
            // Array con las tarjetas que has fallado
            const fallidas = tarjetasEnAprendizaje.filter(t => t.data()["failed"]).length
            // Numero de tarjetas en aprendizaje que tienes pendiente para hoy
            const pendientes = tarjetasEnAprendizaje.filter(t => new Date(t.data()["due date"]) <= new Date()).length
            // Actualizamos el numero de tarjetas a repasar
            setPending(old => old + pendientes)
            // Nos quedamos con la información del mazo que nos importa
            return { id: mazo.id, ...mazo.data(), total, aprendiendo, fallidas, pendientes }
        })))
    }, [])

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Stack>
                <Group position="center" grow>
                    <Button onClick={() => { navigate("review") }}>
                        Repasar pendientes {pending}
                    </Button>
                    <Center>
                        <h4>
                            Racha de días: {racha}
                        </h4>
                    </Center>
                    <Button onClick={() => { navigate("create") }}>
                        Añadir contenido
                    </Button>
                </Group>
                <SimpleGrid cols={2}>
                    {
                        mazos.map((elem, i) => <div key={i}><Level elem={elem} canLearn={canLearn}></Level></div>)
                    }
                </SimpleGrid>
            </Stack>

        </ScrollArea>)

}

export default Study;