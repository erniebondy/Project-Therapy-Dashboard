import { BrowserRouter, Routes, Route } from "react-router";
import { useState, useEffect, createContext } from 'react';
import Login from '../views/Login';
import Profile from '../views/Profile';
import ProfileEdit from '../views/ProfileEdit';
import Clients from '../views/Clients';
import ClientNew from '../views/ClientNew';
import Schedule from '../views/Schedule'

export const AppContext = createContext();

function App() {

    const [userId, setUserId] = useState(1);

    console.log('APP MOUNTED current user id', userId);

    return (
        <AppContext.Provider value={{userId, setUserId}} >
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/client'>
                        <Route path='new' element={<ClientNew />} />
                    </Route>
                    { (userId) && 
                        <Route path='/profile' element={<Profile />}>
                            <Route path='edit' element={<ProfileEdit />} />
                            <Route path='clients' element={<Clients />} />
                            <Route path='schedule' element={<Schedule />} />
                        </Route>
                    }
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;