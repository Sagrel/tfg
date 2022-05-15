import { Center, RingProgress, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core"
import { getAuth } from "firebase/auth"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { useState, useEffect } from "react"
import { Star } from "tabler-icons-react"
import { defaultAchivements } from "../utils"


const Achivement = ({ name, logro, milestones, progress }) => {
    const active = milestones.findIndex((puntos) => puntos > progress)
    const nivel = active == -1 ? milestones.length : active;
    const target = milestones[active]

    return (
        <Stack justify="center" align="center">
            <h2>{name + " Lvl." + (nivel == milestones.length ? "Max" : nivel)}</h2>
            <RingProgress
                roundCaps
                sections={[{ value: (progress / target) * 100, color: active == -1 ? "yellow" : "teal" }]}
                label={
                    active == -1 ?
                        < Center >
                            <ThemeIcon color="yellow" variant="light" radius="xl" size="xl">
                                <Star size={22} />
                            </ThemeIcon>
                        </Center >
                        :
                        <Text align="center" size="xl" weight="bold">{progress} / {target} </Text>
                }
            />
            <Text>{target ? logro.replace("%", target) : "¡Has completado este logo!"}</Text>
        </Stack>
    )
}

const Achivements = () => {

    const [achivements, setAchivements] = useState(defaultAchivements)

    useEffect(async () => {
        const db = getFirestore();
        const userRef = doc(db, "users", getAuth().currentUser.uid);
        const user_data = await (await getDoc(userRef)).data();

        defaultAchivements.Tenaz.progress = user_data.Tenaz ?? 0
        defaultAchivements.Erudito.progress = user_data.Erudito ?? 0
        defaultAchivements["Sabelo todo"].progress = user_data["Sabelo todo"] ?? 0
        defaultAchivements.Infalible.progress = user_data.Infalible ?? 0
        defaultAchivements["El que persiste"].progress = user_data["El que persiste"] ?? 0
        defaultAchivements.Fotogenico.progress = user_data.Fotogenico ?? 0
        defaultAchivements["Creador de conocimiento"].progress = user_data["Creador de conocimiento"] ?? 0
        defaultAchivements.Terminator.progress = user_data.Terminator ?? 0
        defaultAchivements["Estudiante modelo"].progress = user_data["Estudiante modelo"] ?? 0
        defaultAchivements.Empollon.progress = user_data.Empollon ?? 0
        setAchivements({ ...defaultAchivements })
    }, [])


    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">

            <SimpleGrid cols={2} p="lg">
                {Object.keys(achivements).map(key =>
                    <Center key={key}>
                        <Achivement {...achivements[key]} name={key} ></Achivement>
                    </Center>
                )}
            </SimpleGrid >

        </ScrollArea>
    )
}

export default Achivements;