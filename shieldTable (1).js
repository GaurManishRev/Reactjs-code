import React, {Component, Fragment} from 'react';
import ReactTable from "react-table";
import axios from 'axios';
import moment from "moment";
import {deactivateShieldTableUrl, deleteShieldTableUrl, loginShielTabledUrl} from "./SecurityURL";
import Authnavbar from "../layout/authnavbar";
import Footer from "../layout/footer/Footer";
import './shieldTable.css'
import Button from '@material-ui/core/Button'
import red from '@material-ui/core/colors/red';
import '../../assets/css-loader.css'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

const redTheme = createMuiTheme({ palette: { primary: red } })

class ShieldTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showLoader: false,

        }
    }

    componentDidMount() {
        const token = localStorage.getItem('GwalletUser');
        const access_Token = ('token: ', JSON.parse(token).access_token);
        this.setState({showLoader: true});
        axios.get(loginShielTabledUrl, {
            headers: {
                'Authorization': 'Bearer ' + access_Token
            }
        })
            .then((response) => {
                this.setState({showLoader: true});
                this.setState({data: response.data.value}, () => {
                    this.setState({showLoader: false});
                })


            })
            .catch((error) => {
                console.log(error.response.data)
            })
    }

    deactivateShield = (shieldId) => {
        const token = localStorage.getItem('GwalletUser');
        const access_Token = ('token: ', JSON.parse(token).access_token);

        this.setState({showLoader: true});
        axios.post(deactivateShieldTableUrl+`${shieldId}`, {}, {
            headers: {
                'Authorization': 'Bearer ' + access_Token
            }
        })
            .then((response) => {
                axios.get(loginShielTabledUrl, {
                    headers: {
                        'Authorization': 'Bearer ' + access_Token
                    }
                }).then((response) => {

                    this.setState({data: response.data.value},() => {
                        this.setState({showLoader: false});
                    })

                }).catch((error) => {
                    console.log(error.response.data)
                })
            }).catch((error) => {
            console.log(error.response.data)

        })
    }

    deleteShield = (shieldId) => {
        const token = localStorage.getItem('GwalletUser');
        const access_Token = ('token: ', JSON.parse(token).access_token);
        this.setState({showLoader: true});
        axios.get(deleteShieldTableUrl+`${shieldId}`, {
            headers: {
                'Authorization': 'Bearer ' + access_Token
            }
        })
            .then((response) => {
                axios.get(loginShielTabledUrl, {
                    headers: {
                        'Authorization': 'Bearer ' + access_Token
                    }
                })
                    .then((response) => {
                        this.setState({data: response.data.value},() => {
                            this.setState({showLoader: false});
                        })

                    })
                    .catch((error) => {
                        console.log(error.response.data)
                    })
            }).catch((error) => {
            console.log(error.response.data)

        })
    }


    render() {
        const columns = [
            {
                id: 'createdAt',
                Header: 'Date',
                accessor: d => <Fragment>{moment(d.createdAt).format("DD-MM-YYYY")}</Fragment>
            },
            {
                Header: 'Browser',
                accessor: 'browser',
            }, {
                Header: 'Location',
                accessor: 'location',
            }, {
                Header: 'IP Address',
                accessor: 'ipAddress',
            }, {
                Header: 'Status',
                Cell: props =>
                    <Fragment>
                        {props.original.active ? <p style={{color:'#30a310'}}>Activated</p> : <p style={{color:'red'}}>Deactivated</p>}
                    </Fragment>
            },
            {
                Header: 'Action',
                Cell: props => <div>
                    {props.original.active ? <MuiThemeProvider theme={redTheme}><Button variant="contained" color="primary"
                                                     onClick={this.deactivateShield.bind(this, props.original.shieldId)}>Deactivate
                        </Button> </MuiThemeProvider>:
                        <MuiThemeProvider theme={redTheme}>  <Button variant="contained" color="primary"
                                onClick={this.deleteShield.bind(this, props.original.shieldId)}>Delete IP
                        </Button></MuiThemeProvider>}

                </div>,
                sortable: false
            },];
        return (
            <div>
                {this.state.showLoader ?
                    <div className="loader loader-default is-active" data-text="please wait ..."
                         data-blink
                         id="loginLoader">
                    </div> : null}
                <Authnavbar routing={this.props.history} match={this.props.match}/>
                <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                    <h3 className='text-center mt-3'>LOGIN SHIELD</h3>
                    <div className='container'>
                        <ReactTable className='mt-3 table-custom'
                                    columns={columns}
                                    data={this.state.data}
                        />
                    </div>
                </div>
                <Footer routing={this.props.history} match={this.props.match}/>
            </div>
        );
    }
}

export default ShieldTable;
