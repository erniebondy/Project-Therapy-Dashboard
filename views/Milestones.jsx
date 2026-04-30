import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const adminUrl = API_URL + '/admin'

function Milestones() {
    
    const [milestones, setMilestones] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [categories, setCategories] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        fetchMilestones();
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const rsp = await fetch(`${adminUrl}/milestone/category`);
        const {data} = await rsp.json();
        setCategories(data);
    }

    async function fetchMilestones() {
        const rsp = await fetch(`${adminUrl}/milestone`);
        const {data} = await rsp.json();
        setMilestones(data);
    }

    function handleRowClick(e, ms) {
        if (e.target.localName !== 'td' && e.target.id !== 'ms-definition')
            return;
        
        highlightRow(e);
        setSelectedMilestone(ms);
    }

    function highlightRow(e) {
        const table = document.getElementById('milestones');
        table.querySelectorAll('tr').forEach(tr => tr.style.backgroundColor = '');

        let row = e.target.parentElement;
        while (row.localName !== 'tr') {
            row = row.parentElement;
            break;
        }
        row.style.backgroundColor = 'cyan';
    }

    function handleSetSelectedCategories(e, cat) {
        const next = [...selectedCategories];
        const index = next.findIndex(c => c.id === cat.id);
        if (index >= 0 && !e.target.checked) // Item found and unchecked (remove)
            next.splice(index, 1);
        else if (index < 0 && e.target.checked) // Item not found and checked (add)
            next.push(cat);
        setSelectedCategories(next);
    }

    function addCategories() {
        if (selectedCategories.length < 1)
            return alert('No category selected!');
        if (!selectedMilestone)
            return alert('No milestone selected!');

        // Add only new categories to selected milestone
        const nextMilestone = {...selectedMilestone};
        const nextCategories = [...nextMilestone.categories];
        for (const selCat of selectedCategories) {
            if (!nextCategories.find(c => c.id === selCat.id))
                nextCategories.push(selCat);
        }
        
        // Set milestone
        nextMilestone.categories = nextCategories;
        setSelectedMilestone(nextMilestone);

        // Set milestones
        const idx = milestones.findIndex(ms => ms.id === nextMilestone.id);
        const next = [...milestones];
        next[idx] = nextMilestone;
        setMilestones(next);

        // Clear selected categories
        setSelectedCategories([]);
        const elems = Array.from(document.querySelectorAll('input')).filter(elem => elem.id.substring(0, 'checkbox'.length) === 'checkbox');
        for (const elem of elems)
            elem.checked = false;
    }

    function removeCategory(msIdx, catIdx) {
        const next = [...milestones];
        next[msIdx].categories.splice(catIdx, 1);
        setMilestones(next);
    }

    function removeMilestone(msIdx) {
        const next = [...milestones];
        next.splice(msIdx, 1);
        setMilestones(next);
    }

    function handleDefinitionChange(value, msIdx) {
        const next = [...milestones];
        next[msIdx].definition = value;
        setMilestones(next);
    }

    async function saveMilestones() {
        const rsp = await fetch(`${adminUrl}/milestone`, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({milestones})
        });

        const {ok} = await rsp.json();
        if (ok)
            alert('Milestones have been updated!');
        else
            alert('Milestones have NOT been updated!');
    }

    return <>
        <h2>Milestones</h2>
        <button onClick={saveMilestones}>Save</button>

        <div id='content' style={{border: 'solid 1px blue', display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
            <div id='content-milestones' style={{border: '1px solid red'}}>
                <table id='milestones'>
                    <thead>
                        <tr>
                            <th>Milestone</th>
                            <th>Actions</th>
                            <th>Categories</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {milestones?.length > 0 && milestones.map((ms, msIdx) => {
                            return (
                                <tr key={ms.id} onClick={e => handleRowClick(e, ms)}>
                                    {/* Milestone */}
                                    {/* Add styling */}
                                    <td><input type="text" 
                                               onChange={e => handleDefinitionChange(e.target.value, msIdx)} 
                                               name="ms-definition" 
                                               id="ms-definition" 
                                               value={`${ms.definition}`}
                                    /></td>
                                    {/* Actions */}
                                    <td>
                                        <button onClick={() => removeMilestone(msIdx)}>Delete</button>
                                    </td>
                                    {/* Categories */}
                                    <td>
                                        {ms.categories.map((cat, catIdx) =>
                                            <div key={cat.id} style={{display: 'inline-block', border: '1px solid black', margin: '0 2px'}}>
                                                <label>{`${cat.description}`}</label>{' '}
                                                <button onClick={() => removeCategory(msIdx, catIdx)}>X</button>
                                            </div>
                                        )}
                                    </td>
                                    {/* Actions */}
                                    {/* <td>
                                        <button>Edit</button>
                                        <button>Delete</button>
                                    </td> */}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div id='content-categories' style={{border: '1px solid cyan'}}>
                <h4>Categories</h4>
                {categories?.length > 0 && <>
                    <button onClick={addCategories}>Add</button>
                    {categories.map(cat => {
                        const id = 'checkbox-' + cat.description.toLowerCase()
                        return <div key={cat.id}>
                            <input type="checkbox" name={id} id={id} onChange={(e) => handleSetSelectedCategories(e, cat)}/>
                            <label htmlFor={id}>{`${cat.description}`}</label>
                        </div>
                    })}
                </>}
            </div>
        </div>

    </>
}

export default Milestones;