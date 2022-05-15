import { ActionIcon, Button, Group, NumberInput, ScrollArea, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { SunIcon, MoonIcon } from '@modulz/radix-icons';
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

const Settings = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const notifications = useNotifications()

    const [settings, setSettings] = useState(null)

    useEffect(async () => {
        const db = getFirestore();
        const userRef = doc(db, "users", getAuth().currentUser.uid);
        const user_data = await (await getDoc(userRef)).data();
        setSettings({
            timer: user_data.timer, learnLimit: user_data.learnLimit, easyBonus: user_data.easyBonus, okBonus: user_data.okBonus, hardBonus: user_data.hardBonus,
        })
    }, [])

    return (
        <ScrollArea style={{ height: "100vh", width: "80vw" }} type="never">
            <Stack p="lg">
                <Text size="xl">Ajustes</Text>

                <Group grow>
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
                <Group grow>
                    <Text>Tiempo maximo de repaso</Text>
                    <NumberInput value={settings?.timer} onChange={(t) => setSettings(old => ({ ...old, timer: t }))} max={100} min={0} />
                </Group>
                <Group grow>
                    <Text>Tarjetas nuevas por día</Text>
                    <NumberInput value={settings?.learnLimit} onChange={(t) => setSettings(old => ({ ...old, learnLimit: t }))} max={999} min={0} />
                </Group>
                <Group grow>
                    <Text>Bonus dificil</Text>
                    <NumberInput value={settings?.hardBonus} onChange={(t) => setSettings(old => ({ ...old, hardBonus: t }))} max={999} min={0} precision={2} />
                </Group>
                <Group grow>
                    <Text>Bonus ok</Text>
                    <NumberInput value={settings?.okBonus} onChange={(t) => setSettings(old => ({ ...old, okBonus: t }))} max={999} min={0} precision={2} />
                </Group>
                <Group grow>
                    <Text>Bonus facil</Text>
                    <NumberInput value={settings?.easyBonus} onChange={(t) => setSettings(old => ({ ...old, easyBonus: t }))} max={999} min={0} precision={2} />
                </Group>
                <Button onClick={async () => {
                    try {
                        const db = getFirestore();
                        const userRef = doc(db, "users", getAuth().currentUser.uid);
                        await updateDoc(userRef, settings);
                        notifications.showNotification({
                            title: "Ajustes guardados",
                            color: "green"
                        })
                    } catch (e) {
                        notifications.showNotification({
                            title: "Ha habido un error, prueba más tarde",
                            color: "red"
                        })
                        console.error(e)
                    }
                }}>Guardar cambios</Button>
            </Stack >
        </ScrollArea>
    )
}
export default Settings;