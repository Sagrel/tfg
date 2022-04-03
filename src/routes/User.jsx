import { Avatar, Button, Group, Text } from "@mantine/core";
import { getAuth } from "firebase/auth";
import { Logout } from "tabler-icons-react";

const User = () => {

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
        <Button rightIcon={<Logout></Logout>} onClick={() => {
            getAuth().signOut();
        }}>Cerrar sesión</Button>
    </>
    )
}

export default User;