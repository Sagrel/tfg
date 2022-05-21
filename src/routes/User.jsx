import { Avatar, Button, Group, ScrollArea, Text, Stack, Modal, TextInput, useMantineTheme } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useNotifications } from "@mantine/notifications";
import { deleteUser, getAuth, updateProfile } from "firebase/auth";
import { deleteDoc, doc, getDoc, getFirestore, increment, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Logout, Photo, Trash, Upload, X } from "tabler-icons-react";
import { checkAchivement, handleImageUpload } from "../utils";

// TODO Add graphs with info on reviews, cards learned, had cards, ...
// TODO Show titles
// TODO show points
const User = () => {
    const notifications = useNotifications();
    const user = getAuth().currentUser;

    const [confirmModal, setConfirmModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const [userName, setUserName] = useState(user.displayName)
    const [imageUrl, setImageUrl] = useState(user.photoURL)

    const [loading, setLoading] = useState(false)

    const theme = useMantineTheme();

    const navigate = useNavigate();


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
                        if (imageUrl != user.photoURL) {
                            const db = getFirestore();
                            const userRef = doc(db, "users", user.uid);
                            await updateDoc(userRef, { Fotogenico: increment(1) })
                            checkAchivement("Fotogenico", notifications)
                        }
                        await updateProfile(user, { displayName: userName, photoURL: imageUrl })
                        notifications.showNotification({ message: "Cambios guardados correctamente", color: "green" })
                        setEditModal(false)
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
                    <Avatar size="xl" src={user.photoURL}></Avatar>
                    <h1>{user.displayName}</h1>
                </Group>
                <p>
                    Aqui podriamos poner informacion como el número de palabras aprendidas,
                    opciones para cambiar la contraseña o cualquier otra cosa relacionada con el usuario
                </p>
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
            </Stack>
        </ScrollArea>
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