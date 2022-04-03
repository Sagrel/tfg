import { Center, RingProgress, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core"
import { Check } from 'tabler-icons-react';

const Achivement = ({ name, description, progress, total }) => {
    const p = Math.min(progress, total);
    const percentage = Math.round(p / total * 100);

    let ring = null;
    if (p == total) {
        ring = (<RingProgress
            sections={[{ value: 100, color: 'teal' }]}
            label={
                <Center>
                    <ThemeIcon color="teal" variant="light" radius="xl" size="xl">
                        <Check size={22} />
                    </ThemeIcon>
                </Center>
            }
        />)
    } else {
        ring = (<RingProgress
            sections={[{ value: percentage, color: 'blue' }]}
            label={
                <Text color="blue" weight={700} align="center" size="xl">
                    {percentage}%
                </Text>
            }
        />)
    }

    return (
        <Stack align="center">
            <Text size="xl">{name}</Text>
            {ring}
            <Text>{description}</Text>
        </Stack>
    )
}

const Achivements = () => {
    let achivements = [
        { name: "Racha de dias", description: "Repasa 7 días seguidos", progress: 5, total: 7 },
        { name: "Constancia", description: "No te saltes ningun repaso durante un mes", progress: 2, total: 30 },
        { name: "Novato", description: "Aprende 20 palabras", progress: 35, total: 20 },
        { name: "Intermedio", description: "Aprende 50 palabras", progress: 35, total: 50 },
        { name: "Nativo", description: "Aprende 100 palabras", progress: 35, total: 100 },
    ]
    
    return (
        <SimpleGrid cols={4} >
            {achivements.map((e) => <Achivement {...e} key={e.name}></Achivement>)}
        </SimpleGrid>
    )

}

export default Achivements;