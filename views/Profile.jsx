import { BrowserRouter, Routes, Router, Link, useNavigate, Outlet } from "react-router";
import { useContext } from 'react';
import { AppContext } from '../components/App';


function Profile(props) {

    const navigate = useNavigate();
    const {userId} = useContext(AppContext);

    return <>
        <h2>Profile {userId}</h2>
        <nav>
            <button onClick={ () => { navigate('edit') }}>
                Profile
                {/* <Link to={'/profile'}>Profile</Link>{' '} */}
            </button>
            <Link to={'clients'}>Clients</Link>{' '}
            <Link to={'schedule'}>Schedule</Link>{' '}
            <Link to={'milestones'}>Milestones</Link>{' '}
            <Link to={'/'}>Logout</Link>
        </nav>
        <Outlet />
    </>
}

export default Profile;