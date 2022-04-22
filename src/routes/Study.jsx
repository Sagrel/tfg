import { Button, Center, Group, Popover, RingProgress, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Check } from "tabler-icons-react";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";

const Level = ({ elem }) => {
    const p = Math.min(elem.aprendiendo, elem.total);
    const percentage = Math.round(p / elem.total * 100);

    const [opened, setOpened] = useState(false);
    const navigate = useNavigate();


    let ring = p == elem.total ?
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
                        <Text size="xl">{elem.title}</Text>
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
    const [pending, setPending] = useState(0)
    const [racha, setRacha] = useState(0)
    const [mazos, setMazos] = useState([]);

    useEffect(async () => {
        const user = getAuth().currentUser;
        if (!user) return;
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef)
        setRacha(userDoc.data().racha ?? 0)

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
            const tarjetasPendientes = tarjetas.docs.filter(t => t.data()["due date"])
            // Numero de tarjetas en aprendizaje
            const aprendiendo = tarjetasPendientes.length
            // Numero de tarjetas en aprendizaje que tienes pendiente para hoy
            const pending = tarjetasPendientes.filter(t => t.data()["due date"] <= Date.now()).length
            // Actualizamos el numero de tarjetas a repasar
            setPending(old => old + pending)
            // Nos quedamos con la información del mazo que nos importa
            return { id: mazo.id, ...mazo.data(), total, aprendiendo }
        })))
    }, [])

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Stack>
                <Group position="center" grow>
                    { /* TODO Add the number of reviews to the buttom */}
                    <Button onClick={() => { navigate("review/galleta") /* change url*/ }}>
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
                        mazos.map((elem, i) => <div key={i}><Level elem={elem}></Level></div>)
                    }
                </SimpleGrid>
            </Stack>

        </ScrollArea>)

}

export default Study;