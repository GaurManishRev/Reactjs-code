import React, { Component } from 'react'
import './createTrade.css'
import Authnavbar from '../layout/authnavbar';
import Footer from '../layout/footer/Footer'
import { getSellAdDetail, sell, getDetails } from './createTradeUrl'
import { getToken } from "../../commonFunction/getAccessToken";
import axios from 'axios';

class createTrade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adsellAllDetails: [],
            multipleInputs: {},
            labelInput: [],
            sellAllDetails: []

        }
    }

    componentDidMount() {
        console.log(this.props.location.state.advertisementId);
        this.getSellAdvertismentDetails()

        axios.get(getDetails + `AdvertisementId=${this.props.location.state.advertisementId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response)
                this.setState({sellAllDetails: response.data.value })
                console.log(eval(this.state.sellAllDetails))
            }).catch((error) => {
                console.log(error)
            })
    

    }

    getSellAdvertismentDetails = () => {
        axios.get(getSellAdDetail + `AdvertisementId=${this.props.location.state.advertisementId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response)
                this.setState({ adsellAllDetails: response.data.value })
                console.log(eval(this.state.adsellAllDetails))
            }).catch((error) => {
                console.log(error)
            })
    }

    userDetails = (e, emailindex, index, adsellAllDetail) => {

        this.state.multipleInputs[adsellAllDetail] = e.target.value
        // console.log(adsellAllDetail, this.state.multipleInputs[adsellAllDetail])
        this.setState({ labelInput: adsellAllDetail })
    }
    handelSubmit = () => {
        console.log(JSON.stringify(this.state.multipleInputs))
        const body = {
            walletCode: this.props.location.state.walletCode,
            advertisementId: this.state.sellAllDetails['advertisementId'],
            timer: this.state.sellAllDetails['paymentWindowTime'],
            authenticationCode: '',
            status: 0,
            quantity: this.props.location.state.quantity,
            paymentInfo: JSON.stringify(this.state.multipleInputs)
            
        }
        axios.post(sell, body, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        })
            .then((response) => {
                console.log(response)
            })
    }

    render() {
        return (
            <div>
                <Authnavbar routing={this.props.history} match={this.props.match} />
                <div className='createDiv p-4'>
                    <div className='container'>
                        Creating Your Trade
                    </div>
                </div>

                <div className="container">
                    <div className="border rounded my-5">
                        <h6 className="bg-light p-2">Payment Details</h6>
                        <div className="p-3">
                            {Object.keys(this.state.adsellAllDetails).map((adsellAllDetail, index) =>
                                <div className="" key={`input${index}`}>
                                    <label className="mb-0 mt-3">{adsellAllDetail}</label>
                                    <input type="text" className="form-control w-50" placeholder={adsellAllDetail} onChange={(e) => this.userDetails(e, `email${index}`, index, adsellAllDetail)} />
                                </div>
                            )}



                            <div className="mt-5">
                                <button type="button" className="btn btn-custom" onClick={this.handelSubmit}>Continue</button>
                            </div>


                        </div>
                    </div>
                </div>


                <Footer routing={this.props.history} match={this.props.match} />
            </div>
        )
    }
}

export default createTrade;
