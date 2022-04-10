import { render } from "react-dom";
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import App from "./routes/App";

import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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



import Study from "./routes/Study"
import Achivements from "./routes/Achivements"
import User from "./routes/User"
import Settings from "./routes/Settings"
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
          <BrowserRouter>
            <Routes>
              <Route path="login" element={<Login />}></Route>
              <Route path="register" element={<Register />}></Route>
              <Route path="/" element={<App />}>
                <Route path="study" element={<Study />}></Route>
                <Route path="achivements" element={<Achivements />}></Route>
                <Route path="user" element={<User />}></Route>
                <Route path="settings" element={<Settings />}></Route>
              </Route>
              <Route path="teoria/:tema" element={<Teoria />}></Route>
              <Route path="reading/:tema" element={<Reading />}></Route>
              <Route path="review/:tema" element={<Review />}></Route>
              <Route path="create" element={<Create />}></Route>
              <Route path="*" element={<Error />}></Route>
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