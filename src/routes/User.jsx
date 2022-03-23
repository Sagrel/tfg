import { Button } from "@mantine/core";
import { getAuth } from "firebase/auth";

const User = () => {



    return (<>
        <p>
            Aqui podriamos poner informacion como el número de palabras aprendidas,
            opciones para cambiar la contraseña o cualquier otra cosa relacionada con el usuario

        </p>
        <Button onClick={() => {
            getAuth().signOut();
        }}>Cerrar sesión</Button>
    </>
    )
}

export default User;