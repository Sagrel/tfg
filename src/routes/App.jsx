
import { Book, School, Settings, Trophy, User } from 'tabler-icons-react';
import { Paper, Tabs } from '@mantine/core';
import Study from './Study';
import SettingsTab from './Settings';
import Achivements from './Achivements';
import UserTab from './User';
import { useContext } from 'react';
import { Show, UserContext } from '../utils';
import Students from './Students';

const App = () => {
    const isProfesor = useContext(UserContext)

    return (
        <Paper style={{ width: "100%", height: "100%" }} radius={0}>
            <Tabs grow orientation="vertical" position="center" style={{ width: "100%", height: "100vh" }} >
                <Tabs.Tab style={{ height: "25vh" }} icon={<Book size="10vw" />}><Study /></Tabs.Tab>

                <Tabs.Tab style={{ height: "25vh" }} icon={isProfesor ? <School size="10vw" /> : <Trophy size="10vw" />}>
                    <Show condition={isProfesor}>
                        <Students />
                    </Show>
                    <Show condition={!isProfesor}>
                        <Achivements />
                    </Show>
                </Tabs.Tab>

                <Tabs.Tab style={{ height: "25vh" }} icon={<User size="10vw" />}><UserTab /></Tabs.Tab>
                <Tabs.Tab style={{ height: "25vh" }} my="0" icon={<Settings size="10vw" />}><SettingsTab /></Tabs.Tab>
            </Tabs >
        </Paper>
    )
}

export default App;