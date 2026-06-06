import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

const API_URL = import.meta.env.VITE_API_URL;

function ProfileNew() {

    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [password, setPassword] = useState(null);
    const navigate = useNavigate();

    function validate() {
        if (!password)
            return {valid: false, message: 'No password!'};

        const data = [[username, 'username'], [email, 'email'], [phoneNumber, 'phone number']];

        for (let i = 0; i < data.length; ++i) {
            let value = data[i][0];
            if (!value)
                return {valid: false, message: `Improper ${data[i][1]}!`};

            value = value.trim();
            
            if (value.search(' ') >= 0)
                return {valid: false, message: `No spaces allowed in ${data[i][1]}!`};
        }

        const regex = new RegExp('.+@.+[.].+');
        if (!regex.test(email))
            return {valid: false, message: 'Improper email format!'};

        return {valid: true, message: null};
    }

    async function saveProfile() {
        const rsp = await fetch(`${API_URL}/profile/new`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({username, email, phoneNumber, password})
        });
        const {ok, message} = await rsp.json();

        if (ok) {
            alert('Login created!');
            navigate('/');
            return;
        }
        alert('Account error! ' + message);
    }

    function TEST() {
        const a = 'ernie2';
        const b = 'me@mail.com';
        const c = '123-321-1234';
        const d = 'pass';
        document.getElementById('username').value = a;
        document.getElementById('email').value = b;
        document.getElementById('phone-number').value = c;
        document.getElementById('password').value = d;

        setUsername(a);
        setEmail(b);
        setPhoneNumber(c);
        setPassword(d);
    }

    return <>
        <h3>New Profile</h3>
        <label htmlFor="username">Username: </label>
        <input type="text" name="username" id="username" placeholder="username" onChange={e => setUsername(e.target.value)} required />
        <br />
        <label htmlFor="email">Email: </label>
        <input type="email" name="email" id="email" placeholder="email" onChange={e => setEmail(e.target.value)} required/>
        <br />
        <label htmlFor="phone-number">Phone #: </label>
        <input type="text" name="phone-number" id="phone-number" placeholder="123-321-1234" onChange={e => setPhoneNumber(e.target.value)}/>
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" id="password" onChange={e => setPassword(e.target.value)}/>
        <br />
        <button onClick={async () => {
            const isValid = validate();
            if (!isValid.valid) {
                return alert(isValid.message);
            }
            saveProfile();
        }}>Create</button>

        <button onClick={TEST}>Test</button>

        <br />
        <br />
        <Link to={'/'}>Login</Link>

    </>
}

export default ProfileNew;