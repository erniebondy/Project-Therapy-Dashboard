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
        <div className="h4 mt-2 mb-2">Edit Profile</div>
        {/* Username */}
        <div className="row g-3 align-items-center">
            <div className="col-auto">
                <label htmlFor="username">Username: </label>
            </div>
            <div className="col-auto">
                <input className="form-control mt-2" type="text" name="username" id="username" placeholder="username" defaultValue={user?.username ?? ''} />
            </div>
        </div>

        {/* Email */}
        <div className="row g-3 align-items-center">
            <div className="col-auto">
                <label htmlFor="email">Email: </label>
            </div>
            <div className="col-auto">
                <input className="form-control mt-2" type="email" name="email" id="email" placeholder="email" defaultValue={user?.email ?? ''}/>
            </div>
        </div>

        {/* Phone # */}
        <div className="row g-3 align-items-center">
            <div className="col-auto">
                <label htmlFor="phone-number">Phone #: </label>
            </div>
            <div className="col-auto">
                <input className="form-control mt-2" type="text" name="phone-number" id="phone-number" defaultValue={user?.phone_number ?? ''}/>
            </div>
        </div>

        <br />

        {/* Button */}
        <div className="row g-3 align-items-center">
            <button className="btn btn-primary" onClick={saveUser}>Save</button>    
        </div>
    </>
}

export default ProfileEdit;