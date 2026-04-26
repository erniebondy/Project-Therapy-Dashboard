import { useEffect, useState } from 'react';

const clientInit = {fname: null, lname: null, dob: null};

function ClientNew() {

    const API_URL = import.meta.env.VITE_API_URL;
    const [client, setClient] = useState(clientInit);

    function onChangeHandler(ev) {
        setClient(prev => {
            prev[ev.target.name] = ev.target.value;
            return prev;
        });
    }

    async function addClient(ev) {

        ev.preventDefault();

        client.fname = 'TEST F';
        client.lname = 'TEST L';
        client.dob = '1992-03-26';
        client.nickname = '';

        // Insert into database
        const rsp = await fetch(`${API_URL}/db/client`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(client)
        });

        const {ok} = await rsp.json();
        console.log(ok);
    }

    return <>
        <h2>Add New Client</h2>
        <form onSubmit={addClient}>
            <label htmlFor="fname">First Name</label>
            <input type="text" name="fname" id="fname" required onChange={onChangeHandler} />
            <br />
            <label htmlFor="lname">Last Name</label>
            <input type="text" name="lname" id="lname" required onChange={onChangeHandler} />
            <br />
            <label htmlFor="date-of-birth">Date of Birth</label>
            <input type="date" name="dob" id="date-of-birth" required onChange={onChangeHandler} />
            <br />
            <button type='submit'>Add</button>
        </form>
    </>;
}

export default ClientNew;