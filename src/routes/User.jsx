import { useTheme } from "@emotion/react";
import { Avatar, Button, Group, ScrollArea, Text, Stack, Modal, TextInput, useMantineTheme, Card, SimpleGrid, Grid, RingProgress, Box, Center, Tooltip } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useNotifications } from "@mantine/notifications";
import { deleteUser, getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Logout, Photo, Trash, Upload, X } from "tabler-icons-react";
import { checkAchivement, handleImageUpload, Show, UserContext } from "../utils";
import { getTitle, useAchivements } from "./Achivements";

export const useEstadisticasAlumno = (id) => {
    const [cardStats, setCardStats] = useState(null)

    useEffect(async () => {
        const db = getFirestore()

        const mazosRef = collection(db, "users", id, "mazos");
        const mazos = await getDocs(mazosRef);

        const infoMazos = await Promise.all(mazos.docs.map(async (mazo) => {

            const tarjetasRef = collection(db, "users", id, "mazos", mazo.id, "tarjetas");
            const tarjetas = (await getDocs(tarjetasRef)).docs.map(doc => doc.data())

            const total = tarjetas.length
            const tarjetasEnAprendizaje = tarjetas.filter(t => t["due date"])

            const nuevas = total - tarjetasEnAprendizaje.length
            const fallidas = tarjetasEnAprendizaje.filter(t => t["failed"]).length

            const nFacil = tarjetas.map(t => t.nFacil ?? 0).reduce((a, b) => a + b, 0)
            const nOk = tarjetas.map(t => t.nOk ?? 0).reduce((a, b) => a + b, 0)
            const nDificil = tarjetas.map(t => t.nDificil ?? 0).reduce((a, b) => a + b, 0)
            const nFallos = tarjetas.map(t => t.nFallos ?? 0).reduce((a, b) => a + b, 0)

            // if intervalo < 30 { aprendiendo } else { madura } 
            const aprendiendo = tarjetasEnAprendizaje.filter(t => t["interval"] < 30).length
            const maduras = tarjetasEnAprendizaje.length - aprendiendo


            return { total, nuevas, fallidas, aprendiendo, maduras, nFacil, nOk, nDificil, nFallos }
        }))
        const data = infoMazos
            .reduce(
                (a, b) => ({
                    total: a.total + b.total,
                    nuevas: a.nuevas + b.nuevas,
                    fallidas: a.fallidas + b.fallidas,
                    aprendiendo: a.aprendiendo + b.aprendiendo,
                    maduras: a.maduras + b.maduras,
                    nFacil: a.nFacil + b.nFacil,
                    nOk: a.nOk + b.nOk,
                    nDificil: a.nDificil + b.nDificil,
                    nFallos: a.nFallos + b.nFallos,
                    nTotal: a.nTotal + b.nFacil + b.nOk + b.nDificil + b.nFallos
                })
                , { total: 0, nuevas: 0, fallidas: 0, aprendiendo: 0, maduras: 0, nFacil: 0, nOk: 0, nDificil: 0, nFallos: 0, nTotal: 0 }
            )
        setCardStats(
            {
                ...data,
                nuevasPorcentaje: ((data.nuevas / data.total) * 100),
                fallidasPorcentaje: ((data.fallidas / data.total) * 100),
                aprendiendoPorcentaje: ((data.aprendiendo / data.total) * 100),
                madurasPorcentaje: ((data.maduras / data.total) * 100),
                nFacilPorcentaje: ((data.nFacil / data.nTotal) * 100),
                nOkPorcentaje: ((data.nOk / data.nTotal) * 100),
                nDificilPorcentaje: ((data.nDificil / data.nTotal) * 100),
                nFallosPorcentaje: ((data.nFallos / data.nTotal) * 100)
            }
        )
    }
        , [])

    return cardStats;
}

export const UserStats = ({ profesores, achivements, cardStats }) => {
    return <Stack>
        <h2>Profesores</h2>
        {
            profesores.length > 0
                ?
                <SimpleGrid cols="4" m="md">
                    {
                        profesores.map((profe, idx) => {
                            return (
                                <Card key={idx}>
                                    <Stack align="center" >
                                        <Avatar size="xl" src={profe.photo}></Avatar>
                                        <Text>{profe.name}</Text>
                                    </Stack >
                                </Card>
                            )
                        })
                    }
                </SimpleGrid>
                :
                <Text>No hay ningun profesor</Text>
        }
        <h2>Estadisticas</h2>
        <Card>
            <h3>Titulos conseguidos</h3>
            <SimpleGrid cols={4}>
                {
                    Object.keys(achivements).map(name => <Text key={name}>{getTitle(name, achivements[name].milestones, achivements[name].progress)[0]}</Text>)
                }
            </SimpleGrid>
        </Card>
        <Group grow>
            <Card>
                <Center>
                    <Tooltip
                        label="El numero de tarjetas organizadas por su grado de retención"
                        withArrow
                    >
                        <h3>Conteo de tarjetas</h3>
                    </Tooltip>
                </Center>
                {cardStats &&

                    <Group position="center" style={{ width: "100%" }}>
                        <RingProgress sections={
                            [
                                { value: cardStats.nuevasPorcentaje, color: "blue" },
                                { value: cardStats.fallidasPorcentaje, color: "red" },
                                { value: cardStats.aprendiendoPorcentaje, color: "yellow" },
                                { value: cardStats.madurasPorcentaje, color: "green" }
                            ]
                        } />
                        <Stack>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.blue, height: "1em", width: "1em" })} />
                                <Text>Nuevas: {cardStats.nuevas} {cardStats.nuevasPorcentaje.toFixed(2)}%</Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.red, height: "1em", width: "1em" })} />
                                <Text>Reaprendiendo: {cardStats.fallidas} {cardStats.fallidasPorcentaje.toFixed(2)}% </Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.yellow, height: "1em", width: "1em" })} />
                                <Text>Aprendiendo: {cardStats.aprendiendo} {cardStats.aprendiendoPorcentaje.toFixed(2)}%</Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.green, height: "1em", width: "1em" })} />
                                <Text>Maduras: {cardStats.maduras} {cardStats.madurasPorcentaje.toFixed(2)}%</Text>
                            </Group>
                        </Stack>
                    </Group>
                }
            </Card>
            <Card>
                <Center>
                    <Tooltip
                        label="El numero respuestas organizadas por la velocidad de respuesta"
                        withArrow
                    >
                        <h3>Facilidad de tarjetas</h3>
                    </Tooltip>
                </Center>
                {cardStats &&

                    <Group position="center" style={{ width: "100%" }}>
                        <RingProgress sections={
                            [
                                { value: cardStats.nFacilPorcentaje, color: "green" },
                                { value: cardStats.nOkPorcentaje, color: "blue" },
                                { value: cardStats.nDificilPorcentaje, color: "yellow" },
                                { value: cardStats.nFallosPorcentaje, color: "red" }
                            ]
                        } />
                        <Stack>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.green, height: "1em", width: "1em" })} />
                                <Text>Facil: {cardStats.nFacil} {cardStats.nFacilPorcentaje.toFixed(2)}%</Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.blue, height: "1em", width: "1em" })} />
                                <Text>Bien: {cardStats.nOk} {cardStats.nOkPorcentaje.toFixed(2)}% </Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.yellow, height: "1em", width: "1em" })} />
                                <Text>Dificil: {cardStats.nDificil} {cardStats.nDificilPorcentaje.toFixed(2)}%</Text>
                            </Group>
                            <Group >
                                <Box sx={(theme) => ({ background: theme.colors.red, height: "1em", width: "1em" })} />
                                <Text>Mal: {cardStats.nFallos} {cardStats.nFallosPorcentaje.toFixed(2)}%</Text>
                            </Group>
                        </Stack>
                    </Group>
                }
            </Card>
        </Group>
    </Stack>
}

export const useProfesores = (id) => {
    const [profesores, setProfesores] = useState([])

    useEffect(async () => {
        const db = getFirestore()
        const userRef = doc(db, "users", id)
        const userData = (await getDoc(userRef)).data()
        setProfesores(
            await Promise.all(
                (userData.profesores ?? []).map(async profesorId => {
                    const prof = await getDoc(doc(db, "users", profesorId))
                    return { id: prof.id, ...prof.data() }
                })
            ))
    }, [])

    return profesores
}

const User = () => {
    const notifications = useNotifications();
    const user = getAuth().currentUser;

    const [confirmModal, setConfirmModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const [originalUserName, setOriginalUserName] = useState(null)
    const [userName, setUserName] = useState(null)
    const [originalImageUrl, setOriginalImageUrl] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)

    const [loading, setLoading] = useState(false)


    const theme = useMantineTheme();

    const isProfesor = useContext(UserContext)

    const navigate = useNavigate();


    useEffect(async () => {
        const db = getFirestore()
        const user = getAuth().currentUser
        const userRef = doc(db, "users", user.uid)
        const userData = (await getDoc(userRef)).data()

        setUserName(userData.name)
        setOriginalUserName(userData.name)
        setImageUrl(userData.photo)
        setOriginalImageUrl(userData.photo)
    }, [])

    const myID = getAuth().currentUser.uid

    const achivements = useAchivements(myID)
    const cardStats = useEstadisticasAlumno(myID)
    const profesores = useProfesores(myID)

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">

            <Modal zIndex={11} opened={confirmModal} onClose={() => setConfirmModal(false)} centered>

                <Text size="xl" align="center">¿Estas seguro de que quieres eliminar tu cuenta?</Text>
                <Text size="xl" align="center" my="md">Esta acción <Text component="span" weight={700}>NO</Text> se puede deshacer</Text>
                <Group grow>
                    <Button onClick={async () => {
                        try {
                            await deleteDoc(doc(getFirestore(), "users", user.uid))
                            await deleteUser(user)
                            notifications.showNotification({ message: "Cuenta eliminada" })
                        } catch (error) {
                            console.error(error)
                            notifications.showNotification({ message: "Algo ha fallado y no hemos podido eliminar la cuenta" })
                        }
                    }} color="red">Eliminar</Button>
                    <Button onClick={() => setConfirmModal(false)} color="blue">Cancelar</Button>
                </Group>
            </Modal>

            <Modal zIndex={11} opened={editModal} onClose={() => setEditModal(false)} centered>
                <form onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                        const db = getFirestore();
                        const userRef = doc(db, "users", user.uid);
                        if (imageUrl != originalImageUrl) {
                            await updateDoc(userRef, { Fotogenico: increment(1) })
                            checkAchivement("Fotogenico", notifications)
                        }
                        await updateDoc(userRef, { name: userName, photo: imageUrl })
                        notifications.showNotification({ message: "Cambios guardados correctamente", color: "green" })
                        setEditModal(false)
                        setOriginalImageUrl(imageUrl)
                        setOriginalUserName(userName)
                    } catch (e) {
                        console.error(e)
                        notifications.showNotification({ message: "Hemos encontrado un error, prueba más tarde", color: "red" })
                    }
                }}>
                    <TextInput label="Nombre de usuario" required value={userName} onChange={(e) => setUserName(e.target.value)} ></TextInput>
                    <Dropzone
                        onDrop={
                            async (files) => {
                                setLoading(true)
                                setImageUrl(await handleImageUpload(files[0]))
                            }
                        }
                        loading={loading}
                        onReject={(_) => notifications.showNotification({ message: "Ese archivo no es valido", color: "red" })
                        }
                        maxSize={3 * 1024 ** 2}

                        accept={IMAGE_MIME_TYPE}
                        multiple={false}
                        my="md"
                    >
                        {(status) => dropzoneChildren(status, theme)}
                    </Dropzone>
                    <Text>Preview:</Text>
                    <img style={{ maxWidth: "100%" }} src={imageUrl} onLoad={() => setLoading(false)} />
                    <Group grow>
                        <Button color={"red"}
                            onClick={() => setEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar cambios
                        </Button>
                    </Group>
                </form>
            </Modal>

            <Stack p="lg">
                <Group>
                    <Avatar size="xl" src={originalImageUrl}></Avatar>
                    <h1>{originalUserName}</h1>
                </Group>
                <Group>
                    <Button rightIcon={<Edit />} onClick={() => {
                        setEditModal(true)
                    }}>Editar</Button>
                    <Button rightIcon={<Logout />} onClick={async () => {
                        await getAuth().signOut();
                        navigate("/login")
                    }}>Cerrar sesión</Button>
                    <Button color="red" rightIcon={<Trash />} onClick={() => setConfirmModal(true)}>Eliminar cuenta</Button>
                </Group>
                <Show condition={!isProfesor}>
                    <UserStats achivements={achivements} cardStats={cardStats} profesores={profesores} />
                </Show>
            </Stack >
        </ScrollArea >
    )
}

export default User;




function getIconColor(status, theme) {
    return status.accepted
        ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
        : status.rejected
            ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
            : theme.colorScheme === 'dark'
                ? theme.colors.dark[0]
                : theme.colors.gray[7];
}

function ImageUploadIcon({ status, ...props }) {
    if (status.accepted) {
        return <Upload {...props} />;
    }

    if (status.rejected) {
        return <X {...props} />;
    }

    return <Photo {...props} />;
}

const dropzoneChildren = (status, theme) => (
    <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <ImageUploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={80} />

        <div>
            <Text size="xl" inline>
                Arrastra la imagen aquí o haz click para seleccionarla
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Solo se permite una imagen con un maximo de 5 mg
            </Text>
        </div>
    </Group>
);