import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon } from '@modulz/radix-icons';
const Settings = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return (<>
        <p>Aqui pondriamos configuraciones basicas, como el numero maximo de repasos diarios, el objetivo diario
            de palabras nuevas y otros ajustes similares.
        </p>
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
    </>)
}

export default Settings;