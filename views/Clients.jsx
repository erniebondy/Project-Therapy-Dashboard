import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../components/App';

const API_URL = import.meta.env.VITE_API_URL;

function Clients() {

    
    const {userId} = useContext(AppContext);
    
    const [userClients, setUserClients] = useState(null);
    const [clients, setClients] = useState(null);
    const [clientOptVal, setClientOptVal] = useState('default');
    const [clientDetails, setClientDetails] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        getUserClients();
    }, []);

    async function getUserClients() {
        const rsp = await fetch(`${API_URL}/user/${userId}/clients`);
        const {data} = await rsp.json();
        setUserClients(data);
    }

    // async function getClientDetails(clientId) {
    //     const rsp = await fetch(`${API_URL}/user/${userId}/client/${clientId}/details`);
    //     const {data} = await rsp.json();
    //     setClientDetails((data) ? data : '');
    // }

    function tableRowClick(ev, client) {
        const {target} = ev;
        
        if (target.parentElement.nodeName !== 'TR')
            return;

        // Clear backgound-color of each row
        document.getElementById('clients-table').querySelectorAll('tr').forEach((r) => r.style.backgroundColor = '');
        
        // Change background-color of target row
        target.parentElement.style.backgroundColor = 'powderblue';
        
        setSelectedClient(client);
        setClientDetails(client.details);
        //getClientDetails(client.id);
    }

    async function showPopup(event) {

        // Fetch unassigned clients
        const rsp = await fetch(`${API_URL}/user/${userId}/unassigned-clients`);
        const {data} = await rsp.json();
        
        if (!data)
            return;

        setClients(data);

        // Adjust popup position
        const {clientX, clientY} = event;
        const clientList = document.getElementById('client-list-popup');
        clientList.style.left = `${clientX}px`;
        clientList.style.top = `${clientY}px`;
    }

    async function addClientToUser(client) {
        const rsp = await fetch(`${API_URL}/user/client`,{
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, clientId: client.id})
        });
        const {ok} = await rsp.json();
        if (ok)
            setUserClients(prev => [...prev, client]);
        else
            console.error(`[ERROR] Could NOT add client ${client.fullname}`);
    }

    async function deleteUserClient(client) {
        const rsp = await fetch(`${API_URL}/user/client`, {
            method: 'DELETE',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, clientId: client.id})
        });

        const {ok} = await rsp.json();
        
        if (!ok)
            return console.error(`[ERROR] Could NOT remove client ${client.fullname}`);

        setUserClients(prev => prev.toSpliced(prev.findIndex(c => c.id === client.id), 1));
        setSelectedClient(null);
    }

    async function saveClientDetails() {
        const rsp = await fetch(`${API_URL}/client/details`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, clientId: selectedClient.id, clientDetails})
        });

        const {ok} = await rsp.json();
        if (ok)
            alert('Client updated!');
    }

    return <>

        {/* Add client popup */}
        <div id='client-list-popup' className='popup' popover='manual'>
            {(clients?.length > 0) ? <>
                <select name="clients" id="clients" value={clientOptVal} onChange={(e) => setClientOptVal(e.target.value)}>
                    <option value="default" disabled hidden>Select Client</option>
                    {clients.map(client => <option key={client.id} value={client.id}>{`${client.fullname} (${client.age})`}</option>)}
                </select>
                <br />                
                <button popoverTarget='client-list-popup' popoverTargetAction='hide' onClick={
                    () => {
                        addClientToUser(clients.find(c => c.id === Number(clientOptVal)));
                        setClientOptVal('default');
                    }
                }>Add</button>
            </> : 
                <p>No new clients available!</p>
            }
            <button popoverTarget='client-list-popup' popoverTargetAction='hide' onClick={() => setClientOptVal('default')}>Cancel</button>
        </div>

        <h4>Clients</h4>
        <div className="toolbar">
            <button popoverTarget='client-list-popup' popoverTargetAction='show' onClick={showPopup}>Add New Client</button>
        </div>
        <br />

        {/* User clients table */}
        {(userClients?.length > 0) &&
            <div className="container" style={{display: 'flex'}}>
                <table id='clients-table' style={{border: '1px solid red', borderCollapse: 'collapse', borderSpacing: 'none'}}>
                    <tbody>
                        {userClients.map((client) => {
                            return (
                                <tr key={client.id} onClick={(e) => tableRowClick(e, client)}>
                                    <td>{client.fname}</td>
                                    <td>{client.lname}</td>
                                    <td>{client.age_years}</td>
                                    <td>
                                        <button>Edit</button>
                                        <button onClick={() => deleteUserClient(client)}>Remove</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div id="details" style={{border: '1px solid black'}}>
                    <h4>Details</h4>
                    {(selectedClient) && <>
                        {/* SEE OTHER USER NOTES */}
                        <p>{`${selectedClient.fullname} (${selectedClient.age})`}</p>
                        <button onClick={saveClientDetails}>Save</button>
                        <br /><br />
                        <textarea name="client-details" 
                                id="client-details" 
                                value={clientDetails ? clientDetails : ''} 
                                onChange={e => {
                                    const value = e.target.value;
                                    setClientDetails(value);
                                    selectedClient.details = value;
                                }}
                        ></textarea>
                    </>}
                </div>
                <div id="milestones" style={{border: '1px solid red'}}>
                    <h4>Milestones</h4>
                    {/* <button onClick={() => addMilestone(selectedClient.id)}>Add</button> */}
                    {/* Definition | Expected Completion Date | Actual Completion Date */}
                </div>
            </div>
        }
        
    </>
}

export default Clients;