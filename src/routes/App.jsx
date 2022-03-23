import './App.css';

import study from "../icons/study.png"
import achivements from "../icons/achivements.png"
import user from "../icons/user.png"
import settings from "../icons/settings.png"
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Navbar, AspectRatio, Image } from '@mantine/core';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const App = () => {
    let icons = [study, achivements, user, settings]
    let states = ["study", "achivements", "user", "settings"]

    // TODO make this not suck
    const navbar_width = window.innerHeight / icons.length;

    const navigate = useNavigate();
    useEffect(() => {
        
        const auth = getAuth();

        if (!auth.currentUser) {
            navigate("login");
        }

        onAuthStateChanged(auth, (user) => {
            if (!auth.currentUser) {
                navigate("login");
            }
        });
    })

    return (
        <AppShell
            navbar={<Navbar width={{ base: navbar_width }} height={"100vh"} >{
                icons.map((icon, i) => {
                    return (
                        <NavLink to={states[i]} key={i} style={(({ isActive }) => ({
                            // TODO make this not suck
                            background: isActive ? "red" : ""
                        }))}>
                            <AspectRatio ratio={1} sx={{ maxWidth: navbar_width }} mx="auto">
                                <Image
                                    key={icon} src={icon} alt={icon}
                                />
                            </AspectRatio>
                        </NavLink>
                    )
                })
            }</Navbar>}
            //header={<Header height={60} p="xs">{/* Header content */}</Header>}
            styles={(theme) => ({
                main: {
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    color: theme.colorScheme !== 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
                },
            })}
        >
            {/* Your application here */}
            <Outlet></Outlet>
        </AppShell>
    )
}

export default App;