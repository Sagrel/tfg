import { Avatar, Button, Group, ScrollArea, Text, Stack, Modal } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { deleteUser, getAuth } from "firebase/auth";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { useState } from "react";
import { Logout, Trash } from "tabler-icons-react";

// TODO Add graphs with info on reviews, cards learned, had cards, ...
// TODO Show titles
// TODO show points
const User = () => {
    const notifications = useNotifications();
    const user = getAuth().currentUser;

    const [modal, setModal] = useState(false)

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} p="lg" type="never">
            <Modal zIndex={11} opened={modal} onClose={() => setModal(false)} centered>

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
                    <Button onClick={() => setModal(false)} color="blue">Cancelar</Button>
                </Group>
            </Modal>
            <Stack>
                <Group>
                    <Avatar src={user.photoURL}></Avatar>
                    <Text>{user.displayName}</Text>
                </Group>
                <p>
                    Aqui podriamos poner informacion como el número de palabras aprendidas,
                    opciones para cambiar la contraseña o cualquier otra cosa relacionada con el usuario
                </p>
                <Group>
                    <Button rightIcon={<Logout></Logout>} onClick={() => {
                        getAuth().signOut();
                    }}>Cerrar sesión</Button>
                    <Button color="red" rightIcon={<Trash></Trash>} onClick={() => setModal(true)}>Eliminar cuenta</Button>
                </Group>
            </Stack>
        </ScrollArea>
    )
}

export default User;