import { render } from "react-dom";
import { useEffect, useState, useContext } from "react";
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
import { NotificationsProvider } from '@mantine/notifications';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { isToday, isYesterday } from "./utils"




// Redirects the user to the logging window if not logged in
const Aunthenticated = ({ children }) => {
  const location = useLocation()
  if (!getAuth().currentUser) {
    return (<Navigate to="/login" element={<Login />} replace state={{ from: location.pathname }} />)
  }

  return children
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

  const [logged, setLogged] = useState(false);


  useEffect(() => {
    const auth = getAuth();

    setLogged(auth.currentUser != null);

    onAuthStateChanged(auth, async (user) => {
      setLogged(user != null);
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        const last = new Date(userDoc.data().lastSignInTime) ?? new Date(user.metadata.lastSignInTime)

        const today = new Date().toDateString()

        if (isToday(last)) {
          updateDoc(userRef, { lastSignInTime: today })
        } else if (isYesterday(last)) {
          // TODO Show notification somewhere    
          const userDoc = await getDoc(userRef)
          updateDoc(userRef, { racha: (userDoc.data().racha ?? 1) + 1, lastSignInTime: today, learnedToday: 0 })
        } else {
          // TODO Show notification somewhere    
          updateDoc(userRef, { racha: 1, lastSignInTime: today, learnedToday: 0 })
        }
      }
    });
  }, [])


  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme: colorScheme }}>
        <NotificationsProvider>
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