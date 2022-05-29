import { Avatar, Button, Card, Center, Group, Modal, Popover, RingProgress, ScrollArea, SimpleGrid, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Check, Notebook } from "tabler-icons-react";
import { useState, useEffect, useContext } from "react";
import { getAuth } from "firebase/auth";
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import { createDeck, UserContext } from "../utils";
import { useNotifications } from "@mantine/notifications";
import { getEstadisticasAlumnosMazo, getEstadisticasUnMazo, UserStats } from "./User";

const ProfesorLevel = ({ elem, alumnos, setStats }) => {

    const [opened, setOpened] = useState(false);
    const navigate = useNavigate();

    return (
        <Center>
            <Popover
                opened={opened}
                onClose={() => setOpened(false)}
                target={
                    <Stack align="center" onClick={() => setOpened((o) => !o)} style={{ cursor: "pointer" }}>
                        <Text size="xl">{elem.title}</Text>
                        <RingProgress
                            sections={[{ value: 100, color: "blue" }]}
                            label={
                                <Center>
                                    <ThemeIcon variant="light" radius="xl" size="xl">
                                        <Notebook size={40} />
                                    </ThemeIcon>
                                </Center>
                            }
                        />
                    </Stack >
                }
                width={260}
                position="bottom"
                withArrow
            >
                <Stack>
                    <Button onClick={async () => {
                        setStats(await getEstadisticasAlumnosMazo(alumnos, elem.id))
                        setOpened(false)
                    }}>Estadisticas</Button>
                    <Button onClick={() => { navigate("create/" + elem.id) }}>Editar</Button>
                </Stack>
            </Popover >
        </Center>
    )
}

const Level = ({ elem, canLearn, setStats }) => {
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
                    <Button onClick={() => { navigate("reading/" + elem.id) }}>Leer</Button>
                    <Button onClick={() => { navigate("teoria/" + elem.id) }}>Ver Notas</Button>
                    <Button onClick={async () => {
                        setStats(await getEstadisticasUnMazo(getAuth().currentUser.uid, elem.id))
                        setOpened(false)
                    }}>Estadisticas</Button>
                    <Button disabled={elem.creador != getAuth().currentUser.uid} onClick={() => { navigate("create/" + elem.id) }}>Editar</Button>
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

    // Estado añadir alumno
    const [open, setOpen] = useState(false)
    const [busqueda, setBusqueda] = useState("")
    const [alumnos, setAlumnos] = useState([])
    const [misAlumnos, setMisAlumnos] = useState([])
    const [seleccionados, setSeleccionados] = useState([])

    const [stats, setStats] = useState(null)
    const isProfesor = useContext(UserContext)

    const user = getAuth().currentUser

    const notifications = useNotifications()

    useEffect(async () => {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()

        const mazosRef = collection(db, "users", user.uid, "mazos");
        const mazos = await getDocs(mazosRef);

        if (isProfesor) {
            let misAlumnos = userData.alumnos ?? []
            setMisAlumnos(misAlumnos)
            const usersRef = collection(db, "users")
            const users = await getDocs(usersRef)
            setAlumnos(
                users.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => !misAlumnos.includes(user.id) && !user.profesor)
            )
            setMazos(mazos.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } else {
            setRacha(userData.racha ?? 0) // FIXME this happens before the change is actually done in the database 
            setCanLearn(userData.learnLimit - userData.learnedToday)


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
        }

    }, [isProfesor])

    return (
        <ScrollArea style={{ height: "100%", width: "80vw" }} type="never">
            <Modal opened={open} onClose={() => setOpen(false)} centered size="xl">
                <h2>Selecciona los alumnos que quieras añadir</h2>
                <TextInput label="Buscar" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                <SimpleGrid cols={3} m="md">
                    {
                        alumnos
                            .filter(alumno => alumno.name.toUpperCase().includes(busqueda.toUpperCase()))
                            .map(alumno =>
                                <Card key={alumno.id}
                                    onClick={
                                        () => setSeleccionados(old => {
                                            const idx = old.findIndex((elem => elem == alumno.id))
                                            if (idx == -1) {
                                                return [...old, alumno.id]
                                            } else {
                                                old.splice(idx, 1)
                                                return [...old]
                                            }
                                        })
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    <Stack align="center">
                                        <Avatar size="xl" src={alumno.photo}></Avatar>
                                        <Text color={seleccionados.includes(alumno.id) ? "green" : ""}>{alumno.name}</Text>
                                    </Stack >
                                </Card>
                            )
                    }
                </SimpleGrid>
                <Group grow >
                    <Button color="red" onClick={() => {
                        setSeleccionados([])
                        setOpen(false)
                    }
                    }>Cancelar</Button>
                    <Button color="green" disabled={seleccionados.length == 0} onClick={async () => {
                        try {
                            const user = getAuth().currentUser
                            const db = getFirestore();
                            const userRef = doc(db, "users", user.uid);
                            updateDoc(userRef, { alumnos: arrayUnion(...seleccionados) })
                            setSeleccionados([])
                            setOpen(false)

                            await Promise.all(
                                mazos.map(async mazo => {
                                    const notes = (await getDocs(collection(db, "users", user.uid, "mazos", mazo.id, "notas"))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                    const cards = (await getDocs(collection(db, "users", user.uid, "mazos", mazo.id, "tarjetas"))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                    const questions = (await getDocs(collection(db, "users", user.uid, "mazos", mazo.id, "preguntas"))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                    return Promise.all(
                                        seleccionados.map(async alumno => {
                                            await updateDoc(doc(db, "users", alumno), { profesores: arrayUnion(user.uid) })

                                            // HACK we override the data, that's not good, it removes the progress. I don't really know what to do in this case
                                            if ((await getDoc(doc(db, "users", alumno, "mazos", mazo.id))).exists) {
                                                await deleteDoc(doc(db, "users", alumno, "mazos", mazo.id))
                                            }

                                            return createDeck(mazo.title ?? "", mazo.content ?? "", notes, cards, questions, alumno, mazo.id)
                                        })
                                    )
                                })
                            )
                            setAlumnos(alumnos.filter(old => !seleccionados.includes(old)))
                            notifications.showNotification({ color: "green", title: "Alumnos añadidos" })
                        } catch (e) {
                            console.error(e)
                            notifications.showNotification({ color: "red", title: "Hemos encontrado un error" })
                        }

                    }}>Añadir</Button>
                </Group>
            </Modal>
            <Modal size="lg" opened={stats != null} onClose={() => setStats(null)} centered >
                <UserStats cardStats={stats} />
            </Modal>
            <Stack p="lg">
                {
                    isProfesor ?
                        <Group position="center" grow>
                            <Button onClick={() => setOpen(true)}>
                                Añadir alumno
                            </Button>
                            <Button onClick={() => navigate("create")}>
                                Añadir contenido
                            </Button>
                        </Group>
                        :
                        <Group position="center" grow>
                            <Button disabled={pending === 0} onClick={() => navigate("review")}>
                                Repasar pendientes {pending}
                            </Button>
                            <Center>
                                <h4>
                                    Racha de días: {racha}
                                </h4>
                            </Center>
                            <Button onClick={() => navigate("create")}>
                                Añadir contenido
                            </Button>
                        </Group>
                }

                <SimpleGrid cols={2}>
                    {
                        isProfesor
                            ?
                            mazos.map((elem, i) => <ProfesorLevel key={i} elem={elem} alumnos={misAlumnos} setStats={setStats} />)
                            :
                            // TODO group by creator with array.groupBy 
                            mazos.map((elem, i) => <Level key={i} elem={elem} canLearn={canLearn} setStats={setStats} />)
                    }
                </SimpleGrid>
            </Stack>
        </ScrollArea>
    )

}

export default Study;