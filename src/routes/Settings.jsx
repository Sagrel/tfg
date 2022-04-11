import { ActionIcon, Button, Grid, Group, Input, NumberInput, Slider, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon } from '@modulz/radix-icons';
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
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
            { /* TODO make this work some how https://www.reddit.com/r/reactjs/comments/sp4pid/how_to_set_responsive_values_for_titles_and_texts/ */}
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

const MARKS = [
    { value: 0, label: 'xs' },
    { value: 25, label: 'sm' },
    { value: 50, label: 'md' },
    { value: 75, label: 'lg' },
    { value: 100, label: 'xl' },
];

export default Settings;