import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../components/App';

const API_URL = import.meta.env.VITE_API_URL;

function ProfileEdit() {

    const {userId} = useContext(AppContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    async function fetchUser() {
        const rsp = await fetch(`${API_URL}/db/user/${userId}`);
        const {data} = await rsp.json();
        if (data)
            return setUser(data);

        console.error('Unable to retrieve user data!');
    }

    return <>
        <h4>Edit</h4>
        <label htmlFor="username">Username: </label>
        <input type="text" name="username" id="username" placeholder="username" value={user?.username ?? ''} 
               onChange={(e) => setUser(prev => ({...prev, username: e.target.value}))}/>
        <br />
        <label htmlFor="email">Email: </label>
        <input type="email" name="email" id="email" placeholder="email"/>
        <br />
        <label htmlFor="phone-number">Phone #: </label>
        <input type="text" name="phone-number" id="phone-number" />
    </>
}

export default ProfileEdit;