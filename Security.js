import React, {Component, Fragment} from 'react';
import './security.css'
import {getToken} from '../../commonFunction/getAccessToken'
import Button from '@material-ui/core/Button'
import Authnavbar from "../layout/authnavbar";
import Footer from "../layout/footer/Footer";
import googleAuth from '../../assets/google-authentication.png'
import loginAlert from '../../assets/login_Alert.png'
import shield from '../../assets/login_shield.png'
import axios from 'axios'
import alertify from "alertifyjs";
import {
    loginAlertGet,
    loginAlertPost,
    loginShieldUrl,
    isQuestionInsertedURL,
    getquestion,
    savequestion, qrCodeUrl, qrCodeSubmitUrl
} from "./SecurityURL";
import {Link} from "react-router-dom";
import Modal from 'react-modal';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#7389a0',
        },
    },
});


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: '50%',
        bottom: 'auto',
        width: '50%',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#0d3756',
        color: '#ffffff'


    }
};


class Security extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showLoader: false,
            loginAlertStatus: '',
            ShieldActivated: '',
            GoogleAuthActivated: '',
            questionData: {
                questionId1: '',
                question1: '',
                answer1: '',
                questionId2: '',
                question2: '',
                answer2: '',
                questionId3: '',
                question3: '',
                answer3: '',
            },
            questionSubmitted: false,
            questions: [],
            questionModal: false,
            QRModal: false,
            DisableAuthModal: false,
            gaOtpModal: false,
            QRcode: '',
            qrCodeEntered: '',
            privateCode: '',
            DisableQrCodeEntered: '',

            DisableCodeRequired: '',
            CodeRequired: ''
        }
    }


    componentDidMount() {
        // Login alerts
        this.getLoginAlertStatus();


        // Google Auth
        this.questionInserted();
        const googleAuthStat = localStorage.getItem('googleAuth');
        if (googleAuthStat === 't') {
            this.setState({GoogleAuthActivated: true})
        } else {
            this.setState({GoogleAuthActivated: false})
        }

        // Login Shield
        const shieldStat = localStorage.getItem('loginshield');
        if (shieldStat === 't') {
            this.setState({ShieldActivated: true})
        } else {
            this.setState({ShieldActivated: false})
        }


    }

    questionInserted = () => {
        axios.get(isQuestionInsertedURL, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                if (response.data.value === false) {
                    this.getQuestions()
                } else {
                    this.setState({questionSubmitted: true})
                }
            })
            .catch((error) => {
                console.log(error.response.data.value)
            })
    };

    getQuestions = () => {
        axios.get(getquestion, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response.data.value)
                this.setState({questions: response.data.value})
            })
            .catch((error) => {
                console.log(error.response.data)
            })
    };

    getLoginAlertStatus = () => {
        this.setState({showLoader: true});
        axios.get(loginAlertGet, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {


                // this.setState({showLoader: false});
                if (response.data.value.LoginAlert === true) {
                    this.setState({loginAlertStatus: false});
                } else {
                    this.setState({loginAlertStatus: true});
                }
                this.setState({showLoader: false});
            })
    };


    // On button click
    loginAlert = () => {

        this.setState({showLoader: true});

        axios.get(loginAlertPost,
            {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            })
            .then((response) => {
                alertify.success(response.data.value.value);
                this.setState({showLoader: true});
                this.getLoginAlertStatus();
            })
            .catch((error) => {
                console.log(error.response.data)
            });
    };


    // Button Click
    setLoginShield = () => {
        this.setState({showLoader: true});
        axios.get(loginShieldUrl, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                this.setState({ShieldActivated: !this.state.ShieldActivated, showLoader: false}, () => {

                    if (this.state.ShieldActivated) {
                        localStorage.setItem('loginshield', 't')
                    } else {
                        localStorage.setItem('loginshield', 'f')
                    }
                    alertify.success(response.data.value.value);
                });

            })
            .catch((error) => {
                console.log(error.response.data)
            })
    };

    openGoogleAuthModal = () => {

        if (this.state.GoogleAuthActivated === true) {
            this.setState({DisableAuthModal: true})
        } else if (this.state.questionSubmitted) {
            // open QR code
            this.setState({QRModal: true})
            this.qrCodeModal()
        } else {
            this.setState({questionModal: true});

        }

    };


    DisableSubmitOtpCode = async (e) => {
        if (e) e.preventDefault();

        await this.validateDisableCode()

        if (!this.state.DisableCodeRequired) {

            const body = {
                opt: this.state.DisableQrCodeEntered,
                loginbool: false,
                transbool: false
            }

            axios.post(qrCodeSubmitUrl, body, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            })
                .then((response) => {
                    console.log(response.data.value)
                    alertify.success('Google Auth Disable')
                    this.setState({GoogleAuthActivated: !this.state.GoogleAuthActivated}, () => {
                        if (this.state.GoogleAuthActivated) {
                            localStorage.setItem('googleAuth', 't')
                        } else {
                            localStorage.setItem('googleAuth', 'f')
                        }
                    })
                    this.setState({DisableAuthModal: false});

                }).catch((error) => {
                console.log(error.response.data)
                alertify.error(error.response.data.value);
            })
        }
    }


    modalClose = () => {
        this.setState({questionModal: false});
    };

    modalqrClose = () => {
        this.setState({QRModal: false});
    };
    modalqrCodeClose = () => {
        this.setState({gaOtpModal: false});
    };
    modalDisableqrCodeClose = () => {
        this.setState({DisableAuthModal: false});
    };


    handleChangeQuestionOne = (e) => {
        console.log(this.state.questionData);

        let questionData = {...this.state.questionData}
        questionData.question1 = e.target.value;

        this.setState({questionData}, () => {
            let i;
            for (i = 0; i < this.state.questions.length; i++) {
                if (this.state.questions[i].question === this.state.questionData.question1) {
                    questionData.questionId1 = this.state.questions[i].questionId;
                    this.setState({questionData})
                }
            }
        })
    };

    handleChangeAnswerOne = (e) => {
        let questionData = {...this.state.questionData}
        questionData.answer1 = e.target.value
        this.setState({questionData})
    };
    handleChangeQuestionTwo = (e) => {
        // let questionDatas = [...this.state.questions];
        // console.log(questionDatas);
        // let index = questionDatas.indexOf(this.state.questions[5]);
        // if (index > -1) {
        //     questionDatas.splice(index, 1);
        // }
        // console.log('parth', questionDatas);
        //
        //

        let questionData = {...this.state.questionData}
        questionData.question2 = e.target.value;
        this.setState({questionData}, () => {
            let j;
            for (j = 0; j < this.state.questions.length; j++) {
                if (this.state.questions[j].question === this.state.questionData.question2) {
                    questionData.questionId2 = this.state.questions[j].questionId;
                    this.setState({questionData})
                }
            }
        })
    };

    handleChangeAnswerTwo = (e) => {
        let questionData = {...this.state.questionData}
        questionData.answer2 = e.target.value
        this.setState({questionData})
    };
    handleChangeQuestionThree = (e) => {
        let questionData = {...this.state.questionData}
        questionData.question3 = e.target.value;

        this.setState({questionData}, () => {
            let k;
            for (k = 0; k < this.state.questions.length; k++) {
                if (this.state.questions[k].question === this.state.questionData.question3) {
                    questionData.questionId3 = this.state.questions[k].questionId;
                    this.setState({questionData})
                }
            }
        })
    };

    handleChangeAnswerThree = (e) => {
        let questionData = {...this.state.questionData}
        questionData.answer3 = e.target.value
        this.setState({questionData})
    };

    questionNext = () => {
        axios.post(savequestion, this.state.questionData, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        }).then((response) => {
            console.log(response.data);
            this.setState({QRModal: true})
            this.qrCodeModal()
        }).catch((error) => {
            console.log(error.response.data)
        })
    };

    qrCodeModal = () => {

        axios.get(qrCodeUrl, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response.data.value)
                this.setState({QRcode: response.data.value.QrCodeURL})
                this.setState({privateCode: response.data.value.PrivateCode})
            })
    }

    qrNext = () => {
        this.setState({QRModal: false})
        this.setState({questionModal: false})
        this.setState({gaOtpModal: true})
    }

    validateCode = () => {
        this.setState({CodeRequired: false})
        if (this.state.qrCodeEntered === '') {
            this.setState({CodeRequired: true})
        }
    }

    codeEnter = (e) => {
        this.setState({qrCodeEntered: e.target.value}, () => {
            this.validateCode()
        })
    };

    validateDisableCode = () => {
        this.setState({DisableCodeRequired: false})
        if (this.state.DisableQrCodeEntered === '') {
            this.setState({DisableCodeRequired: true})
        }

    }

    DisableCode = (e) => {

        this.setState({DisableQrCodeEntered: e.target.value}, () => {
            this.validateDisableCode()
        })
    }

    submitOtpCode = async (e) => {
        if (e) e.preventDefault();

        await this.validateCode()

        if (!this.state.CodeRequired) {

            const body = {
                opt: this.state.qrCodeEntered,
                loginbool: true,
                transbool: true
            };
            axios.post(qrCodeSubmitUrl, body, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            })
                .then((response) => {
                    console.log(response.data.value)
                    this.setState({gaOtpModal: false});
                    this.setState({GoogleAuthActivated: !this.state.GoogleAuthActivated}, () => {
                        if (this.state.GoogleAuthActivated) {
                            localStorage.setItem('googleAuth', 't')
                        } else {
                            localStorage.setItem('googleAuth', 'f')
                        }
                    })

                }).catch((error) => {
                console.log(error.response.data)
                alertify.error(error.response.data.value);
            })
        }
    }


    render() {
        return (
            <Fragment>
                <Modal
                    isOpen={this.state.questionModal}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalClose}
                    contentLabel="Example Modal"
                >
                    <div className='container '>
                        <div className='p-4 row'>
                            <div className='col-12 d-flex justify-content-center'>
                                <select className='w-50' onChange={this.handleChangeQuestionOne}>
                                    {this.state.questions.map(question =>
                                        <option
                                            value={question.question}>{question.questionId}.{question.question}</option>
                                    )}
                                </select>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center '>
                                <input className='w-50' type='text' onChange={this.handleChangeAnswerOne}/>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center'>
                                <select className='w-50' onChange={this.handleChangeQuestionTwo}>
                                    {this.state.questions.map(question =>
                                        <option
                                            value={question.question}>{question.questionId}.{question.question}</option>
                                    )}
                                </select>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center'>
                                <input className='w-50' type='text' onChange={this.handleChangeAnswerTwo}/>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center'>
                                <select className='w-50' onChange={this.handleChangeQuestionThree}>
                                    {this.state.questions.map(question =>
                                        <option
                                            value={question.question}>{question.questionId}.{question.question}</option>
                                    )}
                                </select>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center'>
                                <input className='w-50' type='text' onChange={this.handleChangeAnswerThree}/>
                            </div>
                            <div className='col-12 mt-3 d-flex justify-content-center'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary"
                                            onClick={this.questionNext}>Next</Button>
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>

                </Modal>
                <Modal
                    isOpen={this.state.QRModal}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalqrClose}
                    contentLabel="Example Modal"
                >
                    <div className='container '>
                        <div className='row'>
                            <div className='col-12 d-flex justify-content-center'>
                                <img src={googleAuth} alt='authimage'/>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <h3>Authentication</h3>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>Step 1 of 2</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>Scan QR Code</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <img src={this.state.QRcode} alt='qrcode'/>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>{this.state.privateCode}</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary" onClick={this.qrNext}>Next </Button>
                                </MuiThemeProvider>
                            </div>

                        </div>
                    </div>

                </Modal>
                <Modal
                    isOpen={this.state.gaOtpModal}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalqrCodeClose}
                    contentLabel="Example Modal"
                >
                    <div className='container '>
                        <div className='row'>
                            <div className='col-12 d-flex justify-content-center'>
                                <img src={googleAuth} alt='authimage'/>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <h3>Authentication</h3>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>Step 2 of 2</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>Enter Auth Code</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center mb-3'>
                                <input type='text' className='text-center inputSec' onChange={this.codeEnter}/>
                            </div>
                            <div className='col-12 d-flex justify-content-center mb-3'>
                                {this.state.CodeRequired ? <p className='errMsgSec'>Auth code required</p> : null}
                            </div>

                            <div className='col-12 d-flex justify-content-center mt-3'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary"
                                            onClick={this.submitOtpCode}>Submit </Button>
                                </MuiThemeProvider>
                            </div>

                        </div>
                    </div>

                </Modal>
                <Modal
                    isOpen={this.state.DisableAuthModal}
                    onAfterOpen={this.afterOpenModal}
                    style={customStyles}
                    onRequestClose={this.modalDisableqrCodeClose}
                    contentLabel="Example Modal"
                >
                    <div className='container '>
                        <div className='row'>
                            <div className='col-12 d-flex justify-content-center'>
                                <img src={googleAuth} alt='authimage'/>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <h3>Authentication</h3>
                            </div>
                            <div className='col-12 d-flex justify-content-center'>
                                <p>Enter Auth Code</p>
                            </div>
                            <div className='col-12 d-flex justify-content-center mb-3'>
                                <input type='text' className='text-center inputSec' onChange={this.DisableCode}/>
                            </div>
                            <div className='col-12 d-flex justify-content-center mb-3'>
                                {this.state.DisableCodeRequired ?
                                    <p className='errMsgSec'>Auth code required</p> : null}
                            </div>

                            <div className='col-12 d-flex justify-content-center mt-3'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary"
                                            onClick={this.DisableSubmitOtpCode}>Submit </Button>
                                </MuiThemeProvider>
                            </div>

                        </div>
                    </div>

                </Modal>
                <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                    {this.state.showLoader ?
                        <div className="loader loader-default is-active" data-text="please wait ..."
                             data-blink
                             id="loginLoader">
                        </div> : null}
                    <Authnavbar routing={this.props.history} match={this.props.match}/>
                    <div style={{flex: 1}}>
                        <div className='GoogleAuth row '>
                            <div className='col-6 '>
                                <p className='googleAuthLeft '><img src={googleAuth} alt='googleAuth'
                                                                    className='mx-3'/> Google Authentication</p>
                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary" className='googleAuthRight'
                                            onClick={this.openGoogleAuthModal}>
                                        {this.state.GoogleAuthActivated ? 'Disable' : 'Enable'}
                                    </Button>
                                </MuiThemeProvider>

                            </div>
                        </div>
                        <div className='GoogleAuth row '>
                            <div className='col-6 '>
                                <p className='googleAuthLeft'><img src={loginAlert} alt='googleAuth' className='mx-3'/>Login
                                    Alert</p>
                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <MuiThemeProvider theme={theme}>
                                    <Button variant="contained" color="primary" className='googleAuthRight'
                                            onClick={this.loginAlert}>
                                        {this.state.loginAlertStatus ? 'Enable' : 'Disable'}
                                    </Button>
                                </MuiThemeProvider>

                            </div>
                        </div>
                        <div className='GoogleAuth row mb-5'>
                            <div className='col-6 '>
                                <p className='googleAuthLeft '><img src={shield} alt='googleAuth' className='mx-3'/>Login
                                    Shield</p>
                            </div>
                            <div className='col-6 d-flex justify-content-end'>
                                <MuiThemeProvider theme={theme}>
                                    <Link to={'/sieldtable'} style={{color: 'white'}}> <Button variant="contained"
                                                                                               color="primary"
                                                                                               className='googleAuthRight'>
                                        View
                                    </Button></Link>

                                    <Button variant="contained" color="primary"
                                            className='googleAuthRight ml-4 text-center'
                                            onClick={this.setLoginShield}>
                                        {this.state.ShieldActivated ? 'Disable' : 'Enable'}
                                    </Button>
                                </MuiThemeProvider>

                            </div>
                        </div>
                    </div>

                    <Footer routing={this.props.history} match={this.props.match}/>
                </div>
            </Fragment>

        );
    }
}

export default Security;
