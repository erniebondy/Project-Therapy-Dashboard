import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../components/App';

const API_URL = import.meta.env.VITE_API_URL;



const session = window.sessionStorage;
//session.clear();
//console.log('ses', session);

function strToBool(str) {
    return str.toLowerCase() === 'true';
}

function highlightCellToggle(event) {
    const target = event.currentTarget;

    if (!strToBool(target.attributes.enabled.value))
        return;

    if (event.type === 'mouseover') {
        target.style.border = '1px solid red';
    }
    else if (event.type === 'mouseout') {
        // target.style.border = '1px solid white';
        target.style.border = null;
    }
}

function getMonthName(date) {
    return date.toLocaleDateString({}, {month: 'long'});
}

const header = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const cellSize = 100;
const columnsCount = 7;

function Schedule() {

    const initCellsText = (session.cellsText) ? JSON.parse(session.cellsText) : null;
    const [cellsText, setCellsText] = useState(initCellsText);
    const [disableSave, setDisableSave] = useState(true);
    const [tasks, setTasks] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const {userId} = useContext(AppContext);

    const tracker = new Date(currentDate);
    tracker.setDate(1);

    const firstDate = new Date(tracker);
    // console.log('firstDate', firstDate);

    tracker.setMonth(tracker.getMonth() + 1);
    tracker.setDate(0);

    const lastDate = new Date(tracker);
    // console.log('lastDate', lastDate);

    const daysInMonth = lastDate.getDate();
    const firstWeekOffset = firstDate.getDay();

    const rowsCount = Math.ceil((daysInMonth + firstWeekOffset) / 7);
    
    useEffect(() => {
        fetchCellsText(currentDate);
        fetchTasks();
    }, []);
    
    // Create calendar cells
    const cells = [];
    for (let i = 0; i < rowsCount * columnsCount; ++i) {
        const enabled = !(i - firstWeekOffset + 1 > daysInMonth || i < firstWeekOffset);
        const dayNum = (i + 1) - firstWeekOffset;
        const id = `day_${dayNum}`;
        const txtId = 'ta_' + id;
        cells.push(
            <div key={i} 
                 id={id} 
                 enabled={enabled.toString()} 
                 onMouseOver={(e) => highlightCellToggle(e)} 
                 onMouseOut={(e) => highlightCellToggle(e)}
            >
                {(enabled) && <>
                    <p>{`${dayNum}`}</p>
                    <textarea name={txtId} id={txtId} 
                        onChange={handleTextChange} 
                        style={{position: 'relative', resize: 'none', width: '100%'}}
                        value={(cellsText) ? (cellsText[txtId]) ? cellsText[txtId] : '' : ''}
                    ></textarea>
                </>}
            </div>
        );
    }

    function handleTextChange(e) {
        setCellsText(prev => {
            const next = {...prev};
            if (e.target.value === '')
                delete next[e.target.id];
            else
                next[e.target.id] = e.target.value;

            //session.setItem('cellsText', JSON.stringify(prev));
            return next;
        });

        setDisableSave(false);
    }

    async function handleSaveClick() {
        const key = `${currentDate.getFullYear()}_${currentDate.getMonth()}`;
        const rsp = await fetch(`${API_URL}/user/schedule/month`,{
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, key, cellsText})
        });

        const {ok} = await rsp.json();
        setDisableSave(ok);
    }

    async function fetchCellsText(date) {
        const key = `${date.getFullYear()}_${date.getMonth()}`;
        const rsp = await fetch(`${API_URL}/user/${userId}/schedule/month/${key}`);
        const {data} = await rsp.json();
        setCellsText(JSON.parse(data));
    }

    async function fetchTasks() {
        const rsp = await fetch(`${API_URL}/user/${userId}/tasks`);
        const {data} = await rsp.json();
        if (data)
            setTasks(JSON.parse(data));
    }

    async function handleAddTask(e) {
        const textElem = document.getElementById('task-text');
        const text = textElem.value;
        const task = {text, priority: 0, completed: false};
        const next = (tasks) ? [...tasks, task] : [task];

        const rsp = await fetch(`${API_URL}/user/tasks`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, tasks: next})
        });

        const {ok} = await rsp.json();
        if (!ok)
            return;
        
        setTasks(next);
        textElem.value = '';
    }

    async function handleCompletedCheck(e, idx) {
        const next = [...tasks];
        const task = next[idx];
        task.completed = e.target.checked;

        const rsp = await fetch(`${API_URL}/user/tasks`, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, tasks: next})
        });

        const {ok} = await rsp.json();
        if (!ok)
            return;
        
        setTasks(next);
    }

    async function handleRemoveTask(idx) {
        const next = tasks.toSpliced(idx, 1);
        const rsp = await fetch(`${API_URL}/user/task`, {
            method: 'DELETE',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userId, tasks: next})
        });

        const {ok} = await rsp.json();
        if (ok)
            setTasks(next);
    }

    function handleChangeCurrentDate(changeAmount) {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + changeAmount);
        
        setCurrentDate(next);
        fetchCellsText(next);
    }

    return <>
        <h3>Schedule - {getMonthName(currentDate)}</h3>
        <button onClick={() => handleChangeCurrentDate(-1)}>{'<'}</button>
        <button onClick={() => handleChangeCurrentDate(1)}>{'>'}</button>
        <button disabled={disableSave} onClick={handleSaveClick}>Save</button>
        <br />
        <br />
        <div id="content" style={{display: 'flex', flexWrap: 'wrap'}}>
            <div id="calendar">

                {/* Calendar header */}
                <div id='calendar-header' style={{
                    display: 'grid', 
                    gridTemplate: `${cellSize*0.25}px / repeat(${columnsCount}, ${cellSize}px)`, 
                    border: '1px solid cyan'
                }}>
                    {header.map(h => <div key={h}>{h}</div>)}
                </div>

                {/* Calendar */}
                <div id='calendar-body' style={{
                    display: 'grid', 
                    gridTemplate: `repeat(${rowsCount}, ${cellSize}px) / repeat(${columnsCount}, ${cellSize}px)`, 
                    border: '1px solid red'
                }}>
                    {cells}
                </div>
            </div>

            {/* Tasks */}
            <div id="tasks" style={{border: '1px solid green'}}>
                <h3>Tasks</h3>
                <input id='task-text' type="text" />
                <button onClick={handleAddTask}>Add</button>
                <br /> <br />
                {(tasks && tasks.length > 0) &&
                    <table>
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Completed</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((t, i) => {
                                const id = `task_${i}`;
                                const strike = t.completed ? 'line-through' : '';

                                return <tr key={i}>
                                    <td><label htmlFor={id} style={{textDecorationLine: strike}}>{`${t.text}`}</label></td>
                                    <td><input type="checkbox" 
                                               name={id} 
                                               id={id} 
                                               checked={t.completed} 
                                               onChange={(e) => handleCompletedCheck(e, i)} 
                                    /></td>
                                    {/* If user should edit task */}
                                    <td>
                                        {/* <button>Save</button> */}
                                        <button onClick={() => handleRemoveTask(i)}>Remove</button>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    </>
}

export default Schedule;