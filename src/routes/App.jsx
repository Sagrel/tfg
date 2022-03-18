import './App.css';

import study from "../icons/study.png"
import achivements from "../icons/achivements.png"
import user from "../icons/user.png"
import settings from "../icons/settings.png"
import { NavLink, Outlet } from 'react-router-dom';
import useStyles from "../styles"

const App = () => {
    let icons = [study, achivements, user, settings]
    let states = ["study", "achivements", "user", "settings"]

    const { classes } = useStyles();

    return (<>
        <div className={classes.sidebar} >
            {
                icons.map((icon, i) => {
                    return (
                        <NavLink to={states[i]} key={i} style={(({ isActive }) => ({
                            background: isActive ? "red" : ""
                        }))}>
                            < img key={icon} src={icon} alt={icon} className={classes.icon} ></img>
                        </NavLink>
                    )
                })
            }
        </div>

        <div className="Content" >
            <Outlet></Outlet>
        </div>
    </>
    );
}

export default App;