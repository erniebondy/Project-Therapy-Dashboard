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

        client.fname = 'TEST F222';
        client.lname = 'TEST L222';
        client.dob = '1992-03-26';
        client.nickname = '';

        // Insert into database
        const rsp = await fetch(`${API_URL}/client`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(client)
        });

        const {ok} = await rsp.json();
        console.log(ok);
    }

    return <>
        <div className="h4 mt-2 mb-2">Add New Client</div>
        <form onSubmit={addClient}>
            <input className="form-control mt-2" type="text" name="fname" id="fname" required placeholder='First Name' onChange={onChangeHandler} />
            <input className="form-control mt-2" type="text" name="lname" id="lname" required placeholder='Last Name' onChange={onChangeHandler} />
            <br />

            <div className="row g-3 align-items-center">
                <div className="col-auto">
                    <label htmlFor="date-of-birth">Date of Birth</label>
                </div>
                <div className="col-auto">
                    <input className="form-control mt-2" type="date" name="dob" id="date-of-birth" required onChange={onChangeHandler} />
                </div>
            </div>
            <br />
            <button type='submit' className="btn btn-primary">Add</button>
        </form>
    </>;
}

export default ClientNew;