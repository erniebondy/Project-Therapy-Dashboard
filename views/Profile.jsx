    import { BrowserRouter, Routes, Router, Link, useNavigate, Outlet } from "react-router";
import { useContext } from 'react';
import { AppContext } from '../components/App';


function Profile(props) {

    const navigate = useNavigate();
    const {userId} = useContext(AppContext);

    return <>
        <div className='container'>
            <div className='h2 pt-4 pb-4'>Profile {userId}</div>
            <nav>
                <ul className="nav">
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'edit'}>Edit Profile</Link>{' '}
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'clients'}>Clients</Link>{' '}
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'client/new'}>Add New Client</Link>{' '}                        
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'schedule'}>Schedule</Link>{' '}
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'milestones'}>Milestones</Link>{' '}
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active' to={'/'}>Logout</Link>                
                    </li>

                </ul>
            </nav>
            <Outlet />
        </div>
    </>
}

export default Profile;