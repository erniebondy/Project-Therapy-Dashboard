import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AppContext } from '../components/App';

function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const {setUserId} = useContext(AppContext);

    async function handleLogin(username, password) {
        // const loggedIn = await login(username, password);
        // setLoggedIn(loggedIn);

        // props.useStateSetUserId(13);
        setUserId(99);

        navigate('/profile');
        if (loggedIn) {
            navigate('/profile');
        }
    }

    return <>
        <h2>Login</h2>        
        <label htmlFor="username">Username</label>
        <input onChange={(ev) => setUsername(ev.target.value)} type="text" name="username" id="username" placeholder="username" autoComplete="username" required />
        <br />
        <label htmlFor="password">Password</label>
        <input onChange={(ev) => setPassword(ev.target.value)} type="password" name="password" id="password" required />
        <br />
        <button onClick={() => handleLogin(username, password)}>Login</button>

        <br />
        <nav>
            <a href="/">Create Account</a>
        </nav>
    </>
}

export default Login;