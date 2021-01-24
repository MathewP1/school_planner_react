
import React, { Component } from 'react';
import './school_planner.css';
import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import update from 'react-addons-update';

class Cell extends Component {
    static getDerivedStateFromProps(props, state) {
        if (props.content !== state.content) {
          return { content: props.content };
        }
        return null;
      }

    constructor(props) {
        super(props);
        this.state = {
            content: props.content,
        }
    }
    render() {
        return (
            <div className="box">
                    {this.state.content}
            </div>
        );
    } 
}

class AddActivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classes : this.props.classes,
            groups : this.props.groups,
            teachers : this.props.teachers,
            rooms: this.props.rooms,
            slots : [...Array(45).keys()],
        }
        if (this.props.current) {
            // check whether add or edit
            // set current stuff
                this.state.current_room = this.props.current["room"];
                this.state.current_slot = this.props.current["slot"];
                if (this.props.current["edit"]) {
                    this.state.button_text = "Edit activity";
                    this.state.edit = true;
                    this.state.current_teacher = this.props.current["teacher"];
                    this.state.current_group = this.props.current["group"];
                    this.state.current_class = this.props.current["class"];
                } else {
                    this.state.button_text = "Add activity";
                    this.state.edit = false;
                    this.state.current_teacher = this.props.teachers[0];
                    this.state.current_group = this.props.groups[0];
                    this.state.current_class = this.props.classes[0];
                }
                
        }
    }


    validateEntry() {
        let selected_activity = {
                                "room": this.state.current_room,
                                "slot": this.state.current_slot,
                                "teacher": this.state.current_teacher,
                                "class": this.state.current_class,
                                "group": this.state.current_group,
                                "edit": this.state.edit
                            };
        let message = this.props.validate(selected_activity);

        if (typeof message !== "undefined") {
            this.setState({error_msg: message})
        } else {
            this.setState({error_msg: ""})
        }
    }

    cancel() {
        this.props.cancel();
    }

    onRoomChange = (event) => {
        this.setState({current_room: event.target.value});
    }
    
    onTeacherChange = (event) => {
        this.setState({current_teacher: event.target.value});
    }

    onGroupChange = (event) => {
        this.setState({current_group: event.target.value});
    }

    onClassChange = (event) => {
        this.setState({current_class: event.target.value});
    }


    render(){
        return (
            <div>
                <div>
                    <h2>Select room: </h2>
                    <select name="room_select" value={this.state.current_room} onChange={this.onRoomChange} disabled={this.state.edit}>
                        {
                            this.state.rooms.map((room, index) => {
                                return (<option key={index} value={room}>{room}</option>)
                            })
                        }
                    </select>
                </div>
                <div>
                    <h2>Select teacher: </h2>
                    <select name="teacher_select" value={this.state.current_teacher} onChange={this.onTeacherChange}>
                        {
                            this.state.teachers.map((teacher, index) =>
                            {
                                return (<option key={index} value={teacher}>{teacher}</option>)
                            })
                        }
                    </select>
                </div>
                <div>
                    <h2>Select group: </h2>
                    <select name="group_select" value={this.state.current_group} onChange={this.onGroupChange}>
                        {
                            this.state.groups.map((group, index) =>{
                                return (<option key={index} value={group}>{group}</option>)
                            })
                        }
                    </select>
                </div>
                <div>
                    <h2>Select class: </h2>
                    <select name="class_select" value={this.state.current_class} onChange={this.onClassChange}>
                        {
                            this.state.classes.map((classs, index) => {
                                return (<option key={index} value={classs}>{classs}</option>)
                            })
                        }
                    </select>
                </div>
                <div>
                    <h2>Selected slot: {this.state.current_slot}</h2>
                    
                </div>
                <div>
                    <button onClick={() => this.validateEntry()}>{this.state.button_text}</button>
                    <button onClick={() => this.cancel()}>Cancel</button>
                </div>
                <div>
                    <h3>{this.state.error_msg}</h3>
                </div>



            </div>
        );
    }
}

class SchoolPlanner extends Component {
    constructor() {
        super();
        let dummy = {"rooms" : []};
        this.state = {
            planner_data : dummy,
            cells : new Array(45),
        };
    }

    updateCells(room) {
        this.setState({
            current_room : room
        }, () => this.updateCallback());
    }

    clearCells(room) {
        setTimeout(() => {
            this.state.planner_data.activities.forEach(item => {
                if (item.room === room) {
                    this.updateCell(item.slot, "");
                }
            });
        }, 100);
    }

    updateCallback() {
        // add new stuff
        setTimeout(() => {
            this.state.planner_data.activities.forEach(item => {
                if (item.room === this.state.current_room) {
                    this.updateCell(item.slot, item.teacher + " " + item.group + " " + item.class);
                }
            });
        }, 100);
    }

    updateCell(slot, content) {
        this.setState(update(this.state, {
            cells: {
                [slot-1]: {
                    $set: content,
                }
            }
        }));

    }

    componentDidMount() {
        fetch('/api/planner')
            .then(res => res.json())
            .then(planner_data => this.setState({planner_data}, () => 
            {
                if (typeof this.state.planner_data.rooms !== 'undefined' && this.state.planner_data.rooms.length > 0) {
                    this.updateCells(this.state.planner_data.rooms[0])
                }
            }));
    }

    getGroups() {
        return this.state.planner_data.groups;
    }

    getClasses() {
        return this.state.planner_data.classes;
    }

    getTeachers() {
        return this.state.planner_data.teachers;
    }

    getRooms() {
        return this.state.planner_data.rooms;
    }

    validateActivity(selected_activity){
        let teacher = selected_activity["teacher"];
        let classs = selected_activity["class"];
        let group = selected_activity["group"];
        let room = selected_activity["room"];
        let slot = selected_activity["slot"];
        let edit = selected_activity["edit"];
        if (typeof teacher === "undefined" || typeof classs === "undefined" || typeof group === "undefined") {
            return "Undefined values";
        }
        let msg = "";
        if (!edit) {

            this.state.planner_data.activities.forEach((item) => {
                if (item.room === room && item.slot === slot) {
                    msg = "Can't add activity at the same time";
                }
                else if (item.teacher === teacher && item.slot === slot) {
                    msg = "Teacher can't be in two places at the same time";
                }
            });

            if (msg === "") {
                let activity = {"class": classs, "group": group, "room": room, "slot": slot, "teacher": teacher};
                this.addActivity(activity);
                this.cancelAdd();
                return msg;
            }
        } else {

            // this.state.planner_data.activities.forEach((item) => {
            //     if (item.teacher === teacher && item.slot === slot) {
            //         msg = "Teacher can't be in two places at the same time";
            //     }
            // });

            if (msg === "") {
                let activity = {"class": classs, "group": group, "room": room, "slot": slot, "teacher": teacher};
                this.editActivity(activity);
                this.cancelAdd();
                return msg;
            }
        }
        

        return msg;
    }

    addActivity(activity) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity)
        };
        fetch('/api/add_activity', requestOptions)
            .then(res => res.json())
            .then(result => {
                if (result["result"] === true) {
                    console.log("Setting state");
                    this.setState(({planner_data}) => ({
                        planner_data : {
                            ...planner_data,
                            activities: [...planner_data.activities, activity]
                        }
                    }));
                    this.updateCell(activity["slot"], activity["teacher"] + " " + activity["group"] + " " + activity["class"]);
                }
            });
    }

    editActivity(activity) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity)
        };
        fetch('/api/edit_activity', requestOptions)
            .then(res => res.json())
            .then(result => {
                if (result["result"] === true) {

                    let data = {...this.state.planner_data};
                    data.activities.forEach((item) => {
                        if (item.slot === activity["slot"])
                        {
                            item = activity;
                        }
                    });
                    this.setState({planner_data: data});
                    this.updateCell(activity["slot"], activity["teacher"] + " " + activity["group"] + " " + activity["class"]);
                }
            })
    }

    onRoomChange = (event) => {
        this.clearCells(this.state.current_room);
        this.updateCells(event.target.value);
    }

    renderCell(i) {
        return (
            <Cell
                content = {this.state.cells[i-1]}
            />
        );
    }

    cancelAdd() {
        this.setState({add: false});
    }


    onCellClick(i) {
        i=i-1;
        if (typeof this.state.cells[i] === "undefined" || this.state.cells[i] === "") {
            this.setState({add : {"slot" : i+1, "room" : this.state.current_room, "edit": false}})
        } else {
            this.state.planner_data.activities.forEach(item => {
                if (item.slot === i+1 && item.room === this.state.current_room) {
                    this.setState({
                        add : {"slot": i+1, "room": item.room, "teacher": item.teacher, "group": item.group, "class": item.class, "edit": true}
                    });
                }
            });
        }
    }

    render() {
        if (this.state.add) {
            return(
                <div>
                    <AddActivity groups={this.getGroups()} 
                                 classes={this.getClasses()} 
                                 teachers={this.getTeachers()} 
                                 rooms={this.getRooms()}
                                 validate={this.validateActivity.bind(this)}
                                 current={this.state.add}
                                 cancel={this.cancelAdd.bind(this)}
                    />
                </div>
            );
        }
        return (
            <div>
                <div>
                    <p>Select room:</p>
                    <select name="select" value={this.state.current_room} onChange={this.onRoomChange}>
                        {
                        this.state.planner_data.rooms.map((room, index) => {
                            return (<option key={index} value={room}>{room}</option>);
                        })}
                    </select>
                </div>
                <MDBTable bordered>
                    <MDBTableHead>
                        <tr>
                            <th>#Time</th>
                            <th>Monday</th>
                            <th>Tuesday</th>
                            <th>Wednesday</th>
                            <th>Thursday</th>
                            <th>Friday</th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        <tr>
                            <th>8:00-8:45</th>
                            <td onClick={() => this.onCellClick(1)}>{this.renderCell(1)}</td>
                            <td onClick={() => this.onCellClick(2)}>{this.renderCell(2)}</td>
                            <td onClick={() => this.onCellClick(3)}>{this.renderCell(3)}</td>
                            <td onClick={() => this.onCellClick(4)}>{this.renderCell(4)}</td>
                            <td onClick={() => this.onCellClick(5)}>{this.renderCell(5)}</td>
                        </tr>
                        <tr>
                            <th>8:55-9:40</th>
                            <td onClick={() => this.onCellClick(6)}>{this.renderCell(6)}</td>
                            <td onClick={() => this.onCellClick(7)}>{this.renderCell(7)}</td>
                            <td onClick={() => this.onCellClick(8)}>{this.renderCell(8)}</td>
                            <td onClick={() => this.onCellClick(9)}>{this.renderCell(9)}</td>
                            <td onClick={() => this.onCellClick(10)}>{this.renderCell(10)}</td>
                        </tr>
                        <tr>
                            <th>9:50-10:35</th>
                            <td onClick={() => this.onCellClick(11)}>{this.renderCell(11)}</td>
                            <td onClick={() => this.onCellClick(12)}>{this.renderCell(12)}</td>
                            <td onClick={() => this.onCellClick(13)}>{this.renderCell(13)}</td>
                            <td onClick={() => this.onCellClick(14)}>{this.renderCell(14)}</td>
                            <td onClick={() => this.onCellClick(15)}>{this.renderCell(15)}</td>
                        </tr>
                        <tr>
                            <th>10:45-11:30</th>
                            <td onClick={() => this.onCellClick(16)}>{this.renderCell(16)}</td>
                            <td onClick={() => this.onCellClick(17)}>{this.renderCell(17)}</td>
                            <td onClick={() => this.onCellClick(18)}>{this.renderCell(18)}</td>
                            <td onClick={() => this.onCellClick(19)}>{this.renderCell(19)}</td>
                            <td onClick={() => this.onCellClick(20)}>{this.renderCell(20)}</td>
                        </tr>
                        <tr>
                            <th>11:40-12:25</th>   
                            <td onClick={() => this.onCellClick(21)}>{this.renderCell(21)}</td>
                            <td onClick={() => this.onCellClick(22)}>{this.renderCell(22)}</td>
                            <td onClick={() => this.onCellClick(23)}>{this.renderCell(23)}</td>
                            <td onClick={() => this.onCellClick(24)}>{this.renderCell(24)}</td>
                            <td onClick={() => this.onCellClick(25)}>{this.renderCell(25)}</td>
                        </tr>
                        <tr>
                            <th>12:35-13:20</th>
                            <td onClick={() => this.onCellClick(26)}>{this.renderCell(26)}</td>
                            <td onClick={() => this.onCellClick(27)}>{this.renderCell(27)}</td>
                            <td onClick={() => this.onCellClick(28)}>{this.renderCell(28)}</td>
                            <td onClick={() => this.onCellClick(29)}>{this.renderCell(29)}</td>
                            <td onClick={() => this.onCellClick(30)}>{this.renderCell(30)}</td>
                        </tr>
                        <tr>
                            <th>13:30-14:15</th>
                            <td onClick={() => this.onCellClick(31)}>{this.renderCell(31)}</td>
                            <td onClick={() => this.onCellClick(32)}>{this.renderCell(32)}</td>
                            <td onClick={() => this.onCellClick(33)}>{this.renderCell(33)}</td>
                            <td onClick={() => this.onCellClick(34)}>{this.renderCell(34)}</td>
                            <td onClick={() => this.onCellClick(35)}>{this.renderCell(35)}</td>
                        </tr>
                        <tr>
                            <th>14:25-15:10</th>
                            <td onClick={() => this.onCellClick(36)}>{this.renderCell(36)}</td>
                            <td onClick={() => this.onCellClick(37)}>{this.renderCell(37)}</td>
                            <td onClick={() => this.onCellClick(38)}>{this.renderCell(38)}</td>
                            <td onClick={() => this.onCellClick(39)}>{this.renderCell(39)}</td>
                            <td onClick={() => this.onCellClick(40)}>{this.renderCell(40)}</td>
                        </tr>
                        <tr>
                            <th>15:20-16:05</th>
                            <td onClick={() => this.onCellClick(41)}>{this.renderCell(41)}</td>
                            <td onClick={() => this.onCellClick(42)}>{this.renderCell(42)}</td>
                            <td onClick={() => this.onCellClick(43)}>{this.renderCell(43)}</td>
                            <td onClick={() => this.onCellClick(44)}>{this.renderCell(44)}</td>
                            <td onClick={() => this.onCellClick(45)}>{this.renderCell(45)}</td>
                        </tr>
                    </MDBTableBody>
                </MDBTable>
            </div>
        );
    }
}

export default SchoolPlanner;