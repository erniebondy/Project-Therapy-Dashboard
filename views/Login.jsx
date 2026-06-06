import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AppContext } from '../components/App';
import { Link } from 'react-router';

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

        if (ok) {
            setUserId(userId);
            navigate('/profile');
        }
    }

    return <>
        <div className="container">
            <div className='h2 pt-4 pb-4'>Login</div>
            
            <input className="form-control mt-2" onChange={e => setUsername(e.target.value)} type="text" name="username" id="username" placeholder="username" autoComplete="username" required />
            <input className="form-control mt-2" onChange={e => setPassword(e.target.value)} type="password" name="password" id="password" placeholder='password' required />
            <br />
            <button type="button" className="btn btn-primary" onClick={() => handleLogin(username, password)}>Login</button>
            <br />
            <br />
            <Link className='link-primary' to={'/profile/new'}>Create Account</Link>
        </div>
    </>
}

export default Login;