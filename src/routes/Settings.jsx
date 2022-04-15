import { ActionIcon, Button, Group, NumberInput, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon } from '@modulz/radix-icons';
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

const Settings = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const [chaged, setChanged] = useState(false);

    const [time, setTime] = useState(null);

    useEffect(async () => {
        const db = getFirestore();
        const userRef = doc(db, "users", getAuth().currentUser.uid);
        const user_data = await getDoc(userRef);
        setTime(user_data.data().timer);
    }, [])

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
            <Group>
                <Text>Tiempo maximo de repaso</Text>
                <NumberInput value={time} onChange={(t) => {
                    setTime(t)
                    setChanged(true)
                }} max={100}
                    min={0}></NumberInput>
            </Group>
            <Button disabled={!chaged} onClick={async () => {
                const db = getFirestore();
                const userRef = doc(db, "users", getAuth().currentUser.uid);
                await updateDoc(userRef, {
                    timer: time
                });
                setChanged(false);
            }}>Guardar cambios</Button>
        </Stack>
    )
}
export default Settings;