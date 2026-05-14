import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AppContext } from '../components/App';

const API_URL = import.meta.env.VITE_API_URL;

function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const {setUserId} = useContext(AppContext);

    async function handleLogin(username, password) {

        if (username === null || password === null)
            return;

        if (username.trim().length < 1 || password.trim().length < 1)
            return;

        const rsp = await fetch(`${API_URL}/login/${username}/${password}`);
        const {ok, userId} = await rsp.json();

        console.log('ok userId', ok, userId);
        if (ok) {
            setUserId(userId);
            navigate('/profile');
        }
    }

    async function test() {
        const username = "ernie";
        const password = "123";
        const rsp = await fetch(`${API_URL}/login`, {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const {ok} = await rsp.json();
        console.log('ok', ok);
    }

    return <>
        <h2>Login</h2>

        <button onClick={test}>TEST</button>
        <br /><br />
        
        <label htmlFor="username">Username</label>
        <input onChange={e => setUsername(e.target.value)} type="text" name="username" id="username" placeholder="username" autoComplete="username" required />
        <br />
        <label htmlFor="password">Password</label>
        <input onChange={e => setPassword(e.target.value)} type="password" name="password" id="password" required />
        <br />
        <button onClick={() => handleLogin(username, password)}>Login</button>

        <br />
        <nav>
            <a href="/">Create Account</a>
        </nav>
    </>
}

export default Login;