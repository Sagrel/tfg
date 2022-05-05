import { Avatar, Button, Group, Text } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { deleteUser, getAuth } from "firebase/auth";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { Logout, Trash } from "tabler-icons-react";

// TODO Add graphs with info on reviews, cards learned, had cards, ...
// TODO Show titles
// TODO show points
const User = () => {
    const notifications = useNotifications();
    const user = getAuth().currentUser;

    return (<>
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
            <Button color="red" rightIcon={<Trash></Trash>} onClick={async () => {
                try {
                    await deleteDoc(doc(getFirestore(), "users", user.uid))
                    await deleteUser(user)
                    notifications.showNotification({ message: "Cuenta eliminada" })
                } catch (_) {
                    notifications.showNotification({ message: "Algo ha fallado y no hemos podido eliminar la cuenta" })
                }
            }}>Eliminar cuenta</Button>
        </Group>
    </>
    )
}

export default User;