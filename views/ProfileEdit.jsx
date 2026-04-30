import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../components/App';

const API_URL = import.meta.env.VITE_API_URL;

function ProfileEdit() {

    const {userId} = useContext(AppContext);
    const [user, setUser] = useState(null);

    console.log(user);

    useEffect(() => {
        fetchUser();
    }, []);

    async function fetchUser() {
        const rsp = await fetch(`${API_URL}/user/${userId}`);
        const {data} = await rsp.json();
        if (data)
            return setUser(data);

        console.error('Unable to retrieve user data!');
    }

    async function saveUser() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone_number = document.getElementById('phone-number').value;
        const next = {...user, username, email, phone_number};

        setUser(next);

        const rsp = await fetch(`${API_URL}/user`, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({user: next})
        });

        const {ok} = await rsp.json();
        if (ok)
            alert('User updated!');
        else
            alert('User could NOT be updated!');
    }

    return <>
        <h4>Edit</h4>
        <label htmlFor="username">Username: </label>
        {/* <input type="text" name="username" id="username" placeholder="username" value={user?.username ?? ''} 
               onChange={(e) => setUser(prev => ({...prev, username: e.target.value}))}/> */}
        <input type="text" name="username" id="username" placeholder="username" defaultValue={user?.username ?? ''} />
        <br />
        <label htmlFor="email">Email: </label>
        <input type="email" name="email" id="email" placeholder="email" defaultValue={user?.email ?? ''}/>
        <br />
        <label htmlFor="phone-number">Phone #: </label>
        <input type="text" name="phone-number" id="phone-number" defaultValue={user?.phone_number ?? ''}/>
        <br />
        <button onClick={saveUser}>Save</button>
    </>
}

export default ProfileEdit;