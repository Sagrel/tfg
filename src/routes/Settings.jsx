import { ActionIcon, Grid, Group, Slider, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon } from '@modulz/radix-icons';
const Settings = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return (
        <Stack style={{ height: "100vh", width: "70vw" }}>
            <Text size="xl">Ajustes</Text>
            <Group>
                <Text>Cambiar el tema</Text>
                <ActionIcon
                    variant="outline"
                    color={dark ? 'yellow' : 'blue'}
                    onClick={() => toggleColorScheme()}
                    title="Toggle color scheme"
                >
                    {dark ? (
                        <SunIcon style={{ width: 18, height: 18 }} />
                    ) : (
                        <MoonIcon style={{ width: 18, height: 18 }} />
                    )}
                </ActionIcon>
            </Group>
            { /* TODO make this work some how https://www.reddit.com/r/reactjs/comments/sp4pid/how_to_set_responsive_values_for_titles_and_texts/ */ }
            <p>
                <Text>Cambiar tamaño de letra</Text>
                <Slider
                    label={(val) => MARKS.find((mark) => mark.value === val).label}
                    defaultValue={50}
                    step={25}
                    marks={MARKS}
                    styles={{ markLabel: { display: 'none' } }}
                />
            </p>
        </Stack>
    )
}

const MARKS = [
    { value: 0, label: 'xs' },
    { value: 25, label: 'sm' },
    { value: 50, label: 'md' },
    { value: 75, label: 'lg' },
    { value: 100, label: 'xl' },
];

export default Settings;