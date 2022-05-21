import { render } from "react-dom";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import App from "./routes/App";

import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfYSFS8ilwGLaiB4I5M4ZL1ZA3q3VZa-4",
  authDomain: "tfg-antoniogc.firebaseapp.com",
  projectId: "tfg-antoniogc",
  storageBucket: "tfg-antoniogc.appspot.com",
  messagingSenderId: "160418861206",
  appId: "1:160418861206:web:97ad6dfc79e8c5a38372b7"
};

// Initialize Firebase
initializeApp(firebaseConfig);


import Review from "./routes/Review";
import Create from "./routes/Create";
import Teoria from "./routes/Teoria";
import Reading from "./routes/Reading";
import Error from "./routes/Error";
import Login from "./routes/Login";
import Register from "./routes/Register";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useColorScheme, useLocalStorageValue } from "@mantine/hooks";
import { NotificationsProvider, useNotifications } from '@mantine/notifications';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, increment, updateDoc } from "firebase/firestore";
import { checkAchivement, isToday, isYesterday } from "./utils"




// Redirects the user to the logging window if not logged in
const Aunthenticated = ({ children }) => {
  const location = useLocation()
  if (!getAuth().currentUser) {
    return (<Navigate to="/login" element={<Login />} replace state={{ from: location.pathname }} />)
  }

  return children
}

const Content = () => {

  const notifications = useNotifications();

  useEffect(() => {
    const auth = getAuth();

    return onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      notifications.clean();
      notifications.showNotification({
        title: "Sesión iniciada",
        message: `Bienvenido ${user.displayName}`
      })
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const last = new Date(userDoc.data().lastSignInTime) ?? new Date(user.metadata.lastSignInTime) ?? new Date()

      const today = new Date().toDateString()

      if (isToday(last)) {
        updateDoc(userRef, { lastSignInTime: today })
      } else if (isYesterday(last)) {
        const userData = userDoc.data()
        const newRacha = (userData.racha ?? 0) + 1
        const batidoRecord = (userData.Tenaz ?? 0) < newRacha
        const newTenaz = batidoRecord ? newRacha : (userData.Tenaz ?? 0)
        await updateDoc(userRef, { racha: newRacha, lastSignInTime: today, learnedToday: 0, Tenaz: newTenaz })

        if (batidoRecord) {
          checkAchivement("Tenaz", notifications)
        }

        if (today.includes("Sun") || today.includes("Sat")) {
          await updateDoc(userRef, { "El que persiste": increment() })
          checkAchivement("El que persiste", notifications)
        }
      } else {
        await updateDoc(userRef, { racha: 1, lastSignInTime: today, learnedToday: 0 })
        notifications.showNotification({ title: "Has perdido tu racha", color: "red" })
      }

    });
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/" element={<Aunthenticated ><App /></Aunthenticated>} />
        <Route path="teoria/:tema" element={<Aunthenticated><Teoria /></Aunthenticated>} />
        <Route path="reading/:tema" element={<Aunthenticated><Reading /></Aunthenticated>} />
        { /* The no params version reviews every thing, the one with a paremeter only adds new words to the learning list */}
        <Route path="review/" element={<Aunthenticated><Review /></Aunthenticated>} />
        <Route path="review/:mazo" element={<Aunthenticated><Review /></Aunthenticated>} />
        { /* The no params version creates a new lesson, the one with a paremeter only edits it*/}
        <Route path="create/:mazo" element={<Aunthenticated><Create /></Aunthenticated>} />
        <Route path="create" element={<Aunthenticated><Create /></Aunthenticated>} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}

const Index = () => {

  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorageValue({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
  });


  const toggleColorScheme = (value) => {
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme: colorScheme }}>
        <NotificationsProvider>
          <Content />
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

render(
  <Index></Index>
  ,
  document.getElementById("root")
);