import { useReducer, useEffect, useState, useContext } from "react";
import { AppContext } from "../components/App";

const API_URL = import.meta.env.VITE_API_URL;

const dbActions = {none: 0, new: 1, update: 2};

function UserMilestones() {

    const {userId} = useContext(AppContext);
    const [userClients, setUserClients] = useState(null);
    const [clientMilestones, setClientMilestones] = useState(null);
    const [milestones, setMilestones] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);

    // May need custom hooks

    useEffect(() => {
        fetchUserClients();
        fetchMilestones();
    }, []);

    async function saveClientMilestones() {
        const rsp = await fetch(`${API_URL}/user/client/milestones`, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, selectedClient})
        });

        const {ok} = await rsp.json();

        if (ok)
            setSaveButtonDisabled(true);
    }

    function addMilestone() {

        if (!selectedClient)
            return alert('No client selected!');
        if (!selectedMilestone)
            return alert('No milestone selected!');

        const date = document.getElementById('expected-date').value;
        if (!date)
            return alert('No date selected!');

        // Add expected date to milestone
        selectedMilestone.expected = date;
        selectedMilestone.completed = false;
        selectedMilestone.dbAction = dbActions.new;

        // Update client milestones
        const next = [...userClients];
        const client = next.find(v => v.id == selectedClient.id);
        client.milestones.push(selectedMilestone);
        setUserClients(next);

        setSaveButtonDisabled(false);
    }

    async function fetchMilestones() {
        const rsp = await fetch(`${API_URL}/admin/milestone`);
        const {data} = await rsp.json();
        setMilestones(data);
    }

    async function fetchUserClients() {
        const rsp = await fetch(`${API_URL}/user/${userId}/clients`);
        const {data} = await rsp.json();

        if (!data)
            return;

        for (const client of data) {
            const rsp = await fetch(`${API_URL}/user/${userId}/client/${client.id}/milestones`)
            const {data} = await rsp.json();
            client.milestones = data;
            // client.modified = false;
        }
        setUserClients(data);
    }

    function clientMilestonesTable() {
        if (!userClients)
            return;
        
        if (!selectedClient)
            return;
        
        return (
            selectedClient.milestones.map(ms => <tr key={ms.id}>
                <td>{`${ms.definition}`}</td>
                <td>{`${ms.expected}`}</td>
            </tr>)
        );
    }

    function handleCompletedChange(e, ms) {
        ms.dbAction = dbActions.update;
        ms.completed = e.target.checked;
        setSelectedClient(prev => {
            // const next = {...prev, modified: true};
            const next = {...prev};
            return next;
        });
        setSaveButtonDisabled(false);
    }

    function removeClientMilestone(msIdx) {
        const next = {...selectedClient};
        next.milestones.splice(msIdx, 1);
        // next.modified = true;
        setSaveButtonDisabled(false);
        setSelectedClient(next);
    }

    return <>
        <style>
            {`th {
                border: 1px solid black;
            }`}
        </style>
        <h4>Milestones</h4>
        <div id="clients">
            {/* Clients */}
            <select name="clients" id="clients" defaultValue="default" onChange={e => setSelectedClient(userClients.find(v => v.id == e.target.value))}>
                <option value="default" disabled hidden>Select Client</option>
                {(userClients?.length > 0) &&
                    userClients.map(c => <option key={c.id} value={c.id}>{c.fullname}</option>)
                }
            </select>

            {/* Milestones */}
            <select name="milestones" id="milestones" defaultValue="default" onChange={e => setSelectedMilestone(milestones.find(v => v.id == e.target.value))}>
                <option value="default" disabled hidden>Select Milestone</option>
                {(milestones?.length > 0) &&
                    milestones.map(ms => <option key={ms.id} value={ms.id}>{`${ms.definition}`}</option>)
                }
            </select>
            <input type="date" name="expected-date" id="expected-date" />
            <button onClick={addMilestone}>Add</button>
        </div>

        {/* Client Milestones */}
        <div id="client-milestones">
            <h4>Client Milestones</h4>
            <button disabled={saveButtonDisabled} onClick={saveClientMilestones}>Save</button>
            <table id="client-table">
                <thead>
                    <tr>
                        <th>Milestone</th>
                        <th>Expected</th>
                        <th>Completed</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {(selectedClient?.milestones?.length > 0) && 
                        selectedClient.milestones.map((ms, msIdx) =>
                            <tr key={msIdx}>
                                <td>{`${ms.definition}`}</td>
                                <td>{`${ms.expected ? ms.expected : ''}`}</td>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        name="ms-completed" 
                                        id={`ms-${msIdx}-completed`} 
                                        onChange={(e) => handleCompletedChange(e, ms)}
                                        checked={ms.completed}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => removeClientMilestone(msIdx)}>X</button>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    </>

}

export default UserMilestones;