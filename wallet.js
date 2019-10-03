import React, {Component, Fragment} from 'react';
import Authnavbar from "../layout/authnavbar";
import Deposit from '../../assets/Deposit.png'
import Withdrawl from '../../assets/Withdrawal.png'
import History from '../../assets/history.png'
import axios from "axios";
import moment from "moment";
import ReactTable from 'react-table'
//css
import wallet from './wallet.module.css'
import './wallet.css'
import QRCode from 'qrcode.react';
import Button from '@material-ui/core/Button'
import {MuiThemeProvider} from '@material-ui/core/styles';
import Footer from "../layout/footer/Footer";
import Modal from 'react-modal';
import copy from '../../assets/copy-icon.png'
import {getUserDepositAddress, getUserWallet, withdrawWalletUrl,historyWalletUrl} from "./walletURL";
import {getToken} from "../../commonFunction/getAccessToken";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import alertyjs from 'alertifyjs'


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: '50%',
        bottom: 'auto',
        width: '60%',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};
Modal.setAppElement('#root');

class Wallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedB: false,
            showLoader: false,
            modalIsOpenDeposit: false,
            modalIsOpenWithdraw: false,
            modalIsOpenHistory: false,
            coinName: '',
            coinDetail: [],
            currentCoin: '',
            depositCoinName: '',
            depositCoinCode: '',
            depositCoinAddress: '',
            withdrawCoinName: '',
            withdrawCoinCode: '',
            withdrawCoinBalance: '',
            withdrawAddressRequired: false,
            withdrawAmountRequired: false,
            withdrawAmountInvalid: false,
            withdrawAddress: '',
            withdrawAmount: '',
            historyData:'',
        }
    }

    componentDidMount() {
        this.getUserWallet();
        this.setState({showLoader: true})

    }

    getUserWallet = () => {
        axios.get(getUserWallet, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response.data.value);
                this.setState({coinDetail: response.data.value});
                this.setState({showLoader: false})
            }).catch((error) => {
            console.log(error.response)
        })
    };


    handleCheck = () => {
        if (this.state.checkedB === true) {
            this.setState({checkedB: false})
        } else if (this.state.checkedB === false) {
            this.setState({checkedB: true})
        }
    };

    modalOpenDeposit = (walletCode, walletName) => (e) => {
        this.setState({depositCoinCode: walletCode, depositCoinName: walletName});


        for (let i = 0; i < this.state.coinDetail.length; i++) {
            if (this.state.coinDetail[i].walletCode === walletCode) {
                if (this.state.coinDetail[i].walletAddress) {
                    this.setState({depositCoinAddress: this.state.coinDetail[i].walletAddress}, () => {
                        this.setState({modalIsOpenDeposit: true});
                    })
                } else {
                    axios.get(getUserDepositAddress + `${walletCode}`, {
                        headers: {
                            'Authorization': 'Bearer ' + getToken()
                        }
                    }).then((response) => {
                        this.setState({depositCoinAddress: response.data.value}, () => {
                            this.setState({modalIsOpenDeposit: true});
                            this.setState({showLoader: false})
                        })
                    }).catch((error) => {
                        console.log(error)
                    })
                }


            }
        }

    };

    modalCoseDeposit = () => {
        this.setState({modalIsOpenDeposit: false});
    };

    modalOpenWithdraw = (walletCode, walletName, walletBalance) => (e) => {
        this.setState({
            withdrawAddress: '',
            withdrawAmount: '',
            withdrawAddressRequired: false,
            withdrawAmountRequired: false,
            withdrawAmountInvalid: false,
            withdrawCoinName: walletName,
            withdrawCoinCode: walletCode,
            withdrawCoinBalance: walletBalance
        }, () => {
            this.setState({modalIsOpenWithdraw: true});
        });
    };

    validateWithdrawAddress = () => {
        this.setState({withdrawAddressRequired: false});
        if (!this.state.withdrawAddress) {
            this.setState({withdrawAddressRequired: true})
        }
    };

    handleWithdrawAddressChange = (event) => {
        this.setState({withdrawAddress: event.target.value}, () => {
            this.validateWithdrawAddress()
        })
    };

    validateWithdrawAmount = () => {
        this.setState({withdrawAmountRequired: false, withdrawAmountInvalid: false});
        if (!this.state.withdrawAmount) {
            this.setState({withdrawAmountRequired: true})
        } else {
            if (!/^[0-9]*(?:\.[0-9]*)?$/.test(this.state.withdrawAmount)) {
                this.setState({withdrawAmountInvalid: true})
            }
        }
    };


    handleWithdrawAmountChange = (event) => {
        this.setState({withdrawAmount: event.target.value}, () => {
            this.validateWithdrawAmount()
        })
    };

    handleWithdrawSubmit = async () => {
        await this.validateWithdrawAddress();
        await this.validateWithdrawAmount();

        if (!this.state.withdrawAddressRequired && !this.state.withdrawAmountRequired && !this.state.withdrawAmountInvalid) {
            const requestBody = {
                walletCode: this.state.withdrawCoinCode,
                toAddress: this.state.withdrawAddress,
                amount: this.state.withdrawAmount
            };
            axios.post(withdrawWalletUrl, requestBody, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            })
                .then(response => {
                    alertyjs.success('Transaction successful');
                    this.modalCloseWithdraw();
                    this.getUserWallet()

                })
                .catch(error => {
                    alertyjs.error(error.response.data.value);
                    console.log(error.response)
                })
        }
    };

    modalCloseWithdraw = () => {
        this.setState({modalIsOpenWithdraw: false, withdrawAddress: '', withdrawAmount: ''});
    };


    modalOpenHistory = (walletCode) => (e) => {
        this.setState({showLoader: true})
       
        axios.get(historyWalletUrl + `${walletCode}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        }).then((response) => {
            console.log(response.data.value);
            this.setState({historyData: response.data.value}, () => {
            this.setState({modalIsOpenHistory: true});
            this.setState({showLoader: false})
            })
            
        }).catch((error) => {
            console.log(error)
        })
    };



    modalCloseHistory = () => {
        this.setState({modalIsOpenHistory: false});
    };


    render() {
      
        const columns = [
            {
                id: 'createdAt',
                Header: <p>Coin Name</p>,
                width: 200,
             
   Cell: props => <p>
                    {props.original.walletName}
                </p>
            },
            {
                Header: <p>Balance</p>,
                // accessor: 'walletBalance',
                width: 200,
                Cell: props => <p>
                    {props.original.walletBalance ?
                        <p>{parseFloat(props.original.walletBalance).toFixed(8)}</p> :
                        parseFloat(0).toFixed(8)
                    }</p>
            }, {
                Header: '',
                width: 600,
                Cell: props =>
                    <div className='text-center'>
                        <Button className={wallet.tableButton + ' mr-3'} variant="outlined" color="primary"
                                onClick={this.modalOpenDeposit(props.original.walletCode, props.original.walletName)}><span>
                                    <img src={Deposit} alt="deposit"
                            style={{marginRight: '10px'}}/></span>Deposit</Button>

                        <Button className={wallet.tableButton + ' mr-3'} variant="outlined"
                                onClick={this.modalOpenWithdraw(props.original.walletCode, props.original.walletName, props.original.walletBalance)}
                                color="secondary">
                            <span>
                                <img src={Withdrawl} alt='withdrawl' style={{marginRight: '10px'}}/>
                            </span>
                            Withdrawal
                        </Button>
                    
                        <Button className={wallet.tableButton} variant="outlined"
                                onClick={this.modalOpenHistory(props.original.walletCode)}><span><img src={History} alt='withdrawl'
                                                                           style={{marginRight: '10px'}}/></span>History</Button>
                    </div>
            },
        ];
        
const historyColumns = [
    {
        Header: 'Wallet Address',
        accessor: 'walletAddress',
        width:300,
        style: { 'white-space': 'unset' }
    },
    {
        Header: 'Debit Amount',
        accessor: 'debitAmount',
        width:120

    },
    {
        Header: 'Credit Amount',
        accessor: 'creditAmount',
        width:120
    },

    {
        id: 'createdAt',
        Header: 'Created Date',
        accessor:  d => <Fragment>{moment(d.createdAt).format("DD-MM-YYYY")}</Fragment>,
        width:120
    },
    {
        Header: 'Status',
        accessor: 'status',
        sortable: false,
        width:100
    }
    ];
        return (
            <Fragment>
                {this.state.showLoader ?
                    <div className="loader loader-default is-active" data-text="Verifying, please wait ..."
                         data-blink
                         id="loginLoader">
                    </div> : null}

                {/*    DEPOSIT MODAL STARTS  */}
                <Modal
                    isOpen={this.state.modalIsOpenDeposit}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalCoseDeposit}
                    contentLabel="Example Modal"
                >
                    <div className='container'>
                        <div className='row'>
                            <div className='col-6'>
                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <i className="fas fa-times" style={{cursor: 'pointer'}}
                                   onClick={this.modalCoseDeposit}/>
                             </div>
                        </div>
                        <hr/>
                        <div className='card'>
                            <div className='p-3' style={{backgroundColor: '#e5e5e5', height: '50px'}}>
                                Deposit {this.state.depositCoinName.toUpperCase()}
                            </div>
                            <div className='w-75 m-auto'>
                                <div className='col-12  mt-3'>
                                    <strong>{this.state.depositCoinCode.toUpperCase()} Address</strong>
                                    <div className="form-group d-flex ">
                                        <input className="form-control " type="text"
                                               placeholder={this.state.depositCoinAddress} readOnly/>
                                        <CopyToClipboard text={this.state.depositCoinAddress}
                                                         onCopy={() => alertyjs.success('Address copied successfully')}>
                                            <img src={copy} alt='serchc' className='copybtn'/>
                                        </CopyToClipboard>

                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className="alert alert-warning alert-dismissible fade show  bitadd"
                                         role="alert">
                                        <strong>Deposit fee 0.0002000</strong>
                                        <p>This deposit address only accept {this.state.depositCoinCode.toUpperCase()}.
                                            Do not send other coins to
                                            it.</p>
                                    </div>
                                </div>
                                <div className='col-12 d-flex justify-content-center'>
                                    <QRCode value={this.state.depositCoinAddress}/>
                                </div>
                                <div className='col-12 d-flex justify-content-center mb-5 mt-3'>
                                    <Button variant="contained" color="primary" className='qeButton'>
                                        Generate new address
                                    </Button>
                                </div>

                            </div>

                        </div>
                    </div>

                </Modal>
                {/*    DEPOSIT MODAL ENDS  */}


                {/* WITHDRAW MODAL STARTS */}
                <Modal
                    isOpen={this.state.modalIsOpenWithdraw}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalCloseWithdraw}
                    contentLabel="Example Modal"
                >
                    <div className='container'>
                        <div className='row'>
                            <div className='col-6'>

                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <i className="fas fa-times" style={{cursor: 'pointer'}}
                                   onClick={this.modalCloseWithdraw}/>
                            </div>
                        </div>
                        <hr/>
                        <div className='card'>
                            <div className='p-3' style={{backgroundColor: '#e5e5e5', height: '50px'}}>
                                Withdraw {this.state.withdrawCoinName.toUpperCase()}
                            </div>
                            <div className='w-75 m-auto'>
                                <div className='col-12  mt-3'>
                                    <div className='row'>
                                        <div className='col-6 d-flex justify-content-end'>
                                            <p>Available balance</p>
                                        </div>
                                        <div className='col-6'>
                                            <input className="form-control" type="text"
                                                   style={{backgroundColor: 'black', color: '#ffffff'}}
                                                   placeholder={this.state.withdrawCoinBalance ? parseFloat(this.state.withdrawCoinBalance).toFixed(8) : parseFloat(0).toFixed(8)}
                                                   readOnly={true}/>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-12 m-2  '>
                                    <div className='row'>
                                        <div className='col-6 d-flex justify-content-end'>
                                            <p>{this.state.withdrawCoinCode} Address*</p>
                                        </div>
                                        <div className='col-6'>
                                            <input className="form-control " type="text"
                                                   value={this.state.withdrawAddress}
                                                   onChange={this.handleWithdrawAddressChange}/>
                                        </div>
                                        {this.state.withdrawAddressRequired ?
                                            <p className="text-danger">{this.state.withdrawCoinCode} address
                                                required</p> : null}
                                    </div>
                                </div>
                                <div className='col-12 m-2'>
                                    <div className='row'>
                                        <div className='col-6 d-flex justify-content-end'>
                                            <p>{this.state.withdrawCoinName} Amount*</p>
                                        </div>
                                        <div className='col-6'>
                                            <input className="form-control " type="text"
                                                   value={this.state.withdrawAmount}
                                                   onChange={this.handleWithdrawAmountChange}/>
                                            {/*<button className='btn btn-secondary px-2 mr-1 mt-1'>25%*/}
                                            {/*</button>*/}
                                            {/*<button className='btn btn-secondary px-2 mr-1 mt-1'>50%*/}
                                            {/*</button>*/}
                                            {/*<button className='btn btn-secondary px-2 mr-1 mt-1'>75%*/}
                                            {/*</button>*/}
                                            {/*<button className='btn btn-secondary px-2 mr-1 mt-1'>100%*/}
                                            {/*</button>*/}
                                            {/*<div className="alert alert-info alert-dismissible fade show "*/}
                                            {/*     role="alert">*/}
                                            {/*    <p style={{fontSize: '12px'}}>Maximum BTC*/}
                                            {/*        Withdrawl: <strong>0.000000</strong></p>*/}
                                            {/*</div>*/}
                                        </div>
                                        {this.state.withdrawAmountRequired ?
                                            <p className="text-danger">{this.state.withdrawCoinName} amount
                                                required</p> : null}
                                        {this.state.withdrawAmountInvalid ?
                                            <p className="text-danger">{this.state.withdrawCoinName} amount
                                                invalid</p> : null}
                                    </div>
                                </div>


                                <div className='col-12 d-flex justify-content-center mb-5'>
                                    <Button variant="contained" color="primary" onClick={this.handleWithdrawSubmit}>
                                        submit
                                    </Button>
                                </div>

                            </div>

                        </div>
                    </div>

                </Modal>
                {/* WITHDRAW MODAL ENDS */}

                <Modal
                    isOpen={this.state.modalIsOpenHistory}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalCloseHistory}
                    contentLabel="Example Modal"
                >
                    <div className='container'>
                        <div className='row'>
                            <div className='col-6'>
                                History
                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <i className="fas fa-times" style={{cursor: 'pointer'}}
                                   onClick={this.modalCloseHistory}/>
                            </div>
                        </div>
                        <hr/>
                        <div className='row'>
                            <div className='col-4 d-flex justify-content-center'>
                                <Button variant="contained" color="primary">
                                    Deposit
                                </Button>
                            </div>
                            <div className='col-4 d-flex justify-content-center'>
                                <Button variant="contained" color="primary">
                                    History
                                </Button>
                            </div>
                            <div className='col-4 d-flex justify-content-center'>
                                <Button variant="contained" color="primary">
                                    Transaction
                                </Button>
                            </div>
                            <div className='card container mt-4'>
                                {!this.state.historyData.length?
                                <div className='text-center p-5'>
                                    There are no deposit yet.
                                </div>

                                :<ReactTable className='mt-3 table-custom'
                                columns={historyColumns}
                                data={this.state.historyData}
                                defaultPageSize={8}
                                />}
                            </div>
                        </div>

                    </div>

                </Modal>

                <div className='mb-5'>
                    <Authnavbar routing={this.props.history} match={this.props.match}/>
                    <div className={wallet.barTop}>

                        <div className={wallet.bar}>
                            <p className={wallet.textColor}>Estimated assets value<span
                                className={wallet.greenText}> 124,4400</span></p>
                        </div>
                        <div className={wallet.contPadding + " p-0"} style={{border: '1px #cccccc solid'}}>
                            <div className={wallet.tablePad}>
                               
                                       
                                            <ReactTable className='mt-3 table-custom'
                                                        columns={columns}
                                                        data={this.state.coinDetail}
                                                        defaultPageSize={8}
                                            />
                                        
                                 
                            </div>
                        </div>
                    </div>
                </div>
                <Footer routing={this.props.history} match={this.props.match}/>
            </Fragment>
        );
    }
}

export default Wallet;
