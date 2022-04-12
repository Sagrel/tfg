import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Book, Settings, Trophy, User } from 'tabler-icons-react';
import { Paper, Tabs } from '@mantine/core';
import Study from './Study';
import SettingsTab from './Settings';
import Achivements from './Achivements';
import UserTab from './User';

const App = () => {

    const navigate = useNavigate();
    useEffect(() => {

        const auth = getAuth();

        if (!auth.currentUser) {
            navigate("login");
        } else {
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    navigate("login");
                }
            });
        }
    })

    // TODO we are gonna check if the current user is a professor quite a lot. Use a context to pass that info around

    return (
        <Paper style={{ width: "100vw", height: "100vh" }} radius={0}>
            <Tabs grow orientation="vertical" position="center" style={{ width: "100vw", height: "100vh" }} >
                <Tabs.Tab style={{ height: "25vh" }} icon={<Book size="10vw" />}><Study /></Tabs.Tab>

                { /* TODO Si el usuario es un profesor esto se cambiaría por una pestaña mostrando la info de sus alumos */ }
                <Tabs.Tab style={{ height: "25vh" }} icon={<Trophy size="10vw" />}><Achivements></Achivements></Tabs.Tab>
                { /* TODO check if we have a user icon we can use */ }
                <Tabs.Tab style={{ height: "25vh" }} icon={<User size="10vw" />}><UserTab></UserTab></Tabs.Tab>
                <Tabs.Tab style={{ height: "25vh" }} icon={<Settings size="10vw" />}><SettingsTab /></Tabs.Tab>
            </Tabs >
        </Paper>
    )
}

export default App;