import { Center, ScrollArea, SimpleGrid, Text, Timeline } from "@mantine/core"



const Achivement = ({ milestones, progress }) => {
    const active = milestones.findIndex(({ puntos }) => puntos > progress)
    return (
        <Timeline
            active={active == -1 ? milestones.length : active - 1}
            bulletSize={20}
            lineWidth={4} >
            {
                milestones.map(({ nombre, logro, puntos }) => {
                    return (<Timeline.Item title={nombre} key={nombre}>
                        <Text color="dimmed" size="sm"> {logro}</Text>
                        <Text size="xs" mt={4}>{progress >= puntos ? "Conseguido" : `Progreso: ${progress}/${puntos}`}</Text>
                    </Timeline.Item>
                    )
                })
            }
        </Timeline >
    )
}

const Achivements = () => {


    const achivements = [
        {
            milestones: [
                { nombre: "Aprendiz", logro: "Aprende 20 palabras", puntos: "20" },
                { nombre: "Intermedio", logro: "Aprende 50 palabras", puntos: "50" },
                { nombre: "Nativo", logro: "Aprende 100 palabras", puntos: "100" }
            ], progress: 69
        },
        {
            milestones: [
                { nombre: "Empezando", logro: "Conectate 2 dias seguidos", puntos: "2" },
                { nombre: "Motivado", logro: "Conectate 10 dias seguidos", puntos: "10" },
                { nombre: "Maestro de los habitos", logro: "Conectate 40 dias seguidos", puntos: "40" }
            ], progress: 1
        }
    ]


    // TODO Add a key to Achivement to remove errors in the console
    // TODO make it better looking
    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Center>
                <SimpleGrid cols={2} >
                    {achivements.map((e) => <Achivement {...e} key={e.name}></Achivement>)}
                </SimpleGrid >
            </Center>
        </ScrollArea>
    )
}

export default Achivements;