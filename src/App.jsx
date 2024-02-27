import React, { useEffect, useState } from 'react';
import { ethers, Wallet } from "ethers";
import { stark, uint256, AccountInterface, constants,CallData } from "starknet"
import './styles/App.css';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import { useConnect, useDisconnect, useAccount, useNetwork, useWaitForTransaction, useContractRead } from '@starknet-react/core';
import {abi} from "./abi.json"
import { useContract } from "@starknet-react/core";

const TWITTER_HANDLE = 'WTFAcademy_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

window.chainLogo = {};
chainLogo = ethLogo;

// function rpc(chain) {
//   return {
//     nodeUrl: `https://${chain.network}.example.org`
//   }
// }
const LIFI_CONTRACT = '0x013a4a29217bf4144895181f0d31dc0b0c0c6214111eb717e7d949e72638ef65';
const USDC_ADDRESS = "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"

const App = () => {
  
  const [value, setValue] = useState();
  const [minted, setMinted] = useState(false)
  const [orders, setOrders] = useState([]);

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address, status } = useAccount()
  const { chain } = useNetwork()
  const [hash, setHash] = useState(undefined)
  const { contract } = useContract({ abi: abi, address: LIFI_CONTRACT, provider: account});
  

  const [isFormVisible, setFormVisible] = useState(false);
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [isPickupFormVisible, setPickupFormVisible] = useState(false);
  const [isWithdrawFormVisible, setWithdrawFormVisible] = useState(false);
  
  const [formInput, setFormInput] = useState({
    amount: '',
    interest: '',
    term: '',
    strategy: ''
  });

  const user_order = async () => {
    let nonce = await contract.get_nonce(address);
    let newOrders = []
    for(let i=0; i<nonce; i++){
      let order = await contract.get_order_user(address, i);
      let id = await contract.get_order_id(address, i);
      const newOrder = { id: id.toString(), amount: order.amount.toString(), status: "Unfilled", interest: order.interest.toString() }; 
      if ( order.filled == true ){
        newOrder.status = "Filled"
      }
      newOrders.push(newOrder)
      console.log("ORDERs:", orders, newOrder)
    }
    setOrders(newOrders);
  }

  useEffect(()=>{
    console.log({status})
    if (status == 'connected'){
    user_order()
    }
  }, [status]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleCreateFormSubmit = (e) => {
    e.preventDefault();
    
    createOrder(formInput)
    // Close the form popup after submission
    setCreateFormVisible(false);
    setFormVisible(false);
  };
  const handlePickupFormSubmit = (e) => {
    e.preventDefault();
    pickOrder(formInput.id)
    // Close the form popup after submission
    setPickupFormVisible(false);
    setFormVisible(false);
  };
  const handleWithdrawFormSubmit = (e) => {
    e.preventDefault();
    withdraw(formInput.id)
    // Close the form popup after submission
    setWithdrawFormVisible(false);
    setFormVisible(false);
  };


	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
      <br></br>
      {connectors.map((connector) => (
        <div className="flex items-center justify-center h-screen" key={connector.id}>
        <button className="cta-button connect-wallet-button " onClick={() => connect({ connector })}>
          Connect {connector.name}
        </button>
        </div>
      ))}
    </div>
	);

	// Form to enter domain name and data
	const renderInputForm = () => {
    
    console.log("here : ", chain)
		if (chain.network !== "goerli") {
      console.log('chain:', chain)
			return (
				<div className="connect-wallet-container">
        <p>Please Switch to Starknet Goerli Testnet</p>
      </div>
			);
		}
		return (
			<div className="flex flex-col items-center">

        <div className={!isFormVisible ? '' : 'blur-effect'}>

        
        <div className="form-container">
          <div class="grid grid-cols-3 grid-flow-col gap-4 mb-28">

            <button className='cta-button mint-button' onClick={() => {setFormVisible(!isFormVisible);setPickupFormVisible(!isPickupFormVisible)}}>
              Pick Orders
            </button>
            
            <button className='cta-button mint-button' onClick={() => {setFormVisible(!isFormVisible);setCreateFormVisible(!isCreateFormVisible)}}>
              Create Order
            </button>

            <button className='cta-button mint-button' onClick={() => {setFormVisible(!isFormVisible);setWithdrawFormVisible(!isWithdrawFormVisible)}}>
              Withdraw
            </button>
          </div>

         {orders.length!=0 && <div className="overflow-x-auto">
            <h2 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Your orders</h2>
            <table className="w-full border-collapse border border-red-800">
              {<thead>
                <tr className="bg-red-200">
                  <th className="border border-red-150 px-4 py-2 w-1/3">Order ID</th>
                  <th className="border border-red-150 px-4 py-2 w-1/3">Order Amount</th>
                  <th className="border border-red-150 px-4 py-2 w-1/3">Order Interest</th>
                  <th className="border border-red-150 px-4 py-2 w-1/3">Order Status</th>
                </tr>
              </thead>}
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="bg-white">
                    <td className="border border-red-150 px-4 py-2">{order.id}</td>
                    <td className="border border-red-150 px-4 py-2">{order.amount}</td>
                    <td className="border border-red-150 px-4 py-2">{order.interest}%</td>
                    <td className="border border-red-150 px-4 py-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
        </div>

          {isCreateFormVisible && (
          <div className="pjustify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl bg-white p-5 rounded-lg shadow-lg">
            <form onSubmit={handleCreateFormSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col">
                Amount:
                <input
                  type="text"
                  name="amount"
                  className="inputBorder mt-1 p-2 border-2 border-gray-300 rounded bg-white text-blue-300"
                  value={formInput.amount}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Interest:
                <input
                  type="text"
                  name="interest"
                  className="inputBorder mt-1 p-2 border-2 border-gray-300 rounded bg-white text-blue-300"
                  value={formInput.interest}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Term:
                <input
                  type="text"
                  name="term"
                  className="inputBorder mt-1 p-2 rounded bg-white text-blue-300"
                  value={formInput.term}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Strategy:
                <input
                  type="text"
                  name="strategy"
                  className="inputBorder mt-1 p-2 border-2 border-gray-300 rounded bg-white text-blue-300"
                  value={formInput.strategy}
                  onChange={handleInputChange}
                />
              </label>
             
              <button type="submit" className="bg-red-500 text-white p-2 rounded mt-4 hover:bg-blue-700">
                  Submit
                </button>
            </form>
            </div>
          </div>
        )}

        {isPickupFormVisible && (
          <div class="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl bg-white p-5 rounded-lg shadow-lg">
            <form onSubmit={handlePickupFormSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col">
                Id
                <input
                  type="text"
                  name="id"
                  className="inputBorder mt-1 p-2 border-2 border-gray-300 rounded bg-white text-blue-300"
                  value={formInput.id}
                  onChange={handleInputChange}
                />
              </label>
             
              <button type="submit" className="bg-red-500 text-white p-2 rounded mt-4 hover:bg-blue-700">
                  Submit
                </button>
            </form>
            </div>
          </div>
        )}

        {isWithdrawFormVisible && (
            <div class="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl bg-white p-5 rounded-lg shadow-lg">
              <form onSubmit={handleWithdrawFormSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col">
                  id:
                  <input
                    type="text"
                    name="id"
                    className="inputBorder mt-1 p-2 border-2 border-gray-300 rounded bg-white text-blue-300"
                    value={formInput.id}
                    onChange={handleInputChange}
                  />
                </label>
              
                <button type="submit" className="bg-red-500 text-white p-2 rounded mt-4 hover:bg-blue-700">
                    Submit
                  </button>
              </form>
              </div>
            </div>
          )}

        </div>
		);
	}

  const mintedTip = () => {
    return (
      <p>Minted Successfully!</p>
    )
  }

  const withdraw = async (id) => {
    await contract.withdraw(id)
  }

  const createOrder = async (formData) => {
    // console.log(chain)
    console.log(account)
    try {
      const createOrderCalldata_ = [ LIFI_CONTRACT, formData.amount, "0" ]
      
      const ercTx = await account.execute(
        {
            contractAddress: USDC_ADDRESS,
            entrypoint: "approve",
            calldata: createOrderCalldata_
          },
      )

      const status_ = await account.waitForTransaction(ercTx.transaction_hash);
      console.log("erc status : ", status_)
      const createOrderCalldata = [formData.amount, formData.interest, "0", formData.term, "0" ]
      const callTx = await account.execute(
        {
            contractAddress: LIFI_CONTRACT,
            entrypoint: "create_order",
            calldata: createOrderCalldata
          }
      );
      const status = await account.waitForTransaction(callTx.transaction_hash);
      console.log(status)
      if (status.execution_status === 'SUCCEEDED') {
        setMinted(() => {return true});
      }
      else {}
      await user_order();

    }
    catch (error) {
      console.log(error);
    }
  }

  const pickOrder = async (id) => {
    
    let order = await contract.get_order(id);
    let interestAmount = order.amount * order.interest / 100n;
    console.log(order, interestAmount)
    const createOrderCalldata_ = [ LIFI_CONTRACT, Number(interestAmount), "0"]
      
    const ercTx = await account.execute(
      {
          contractAddress: USDC_ADDRESS,
          entrypoint: "approve",
          calldata: createOrderCalldata_
        },
    )

    const status_ = await account.waitForTransaction(ercTx.transaction_hash);
    console.log("erc status : ", status_)

    await contract.fulfill_order(id);
  }
  
  
	return (
		// <div className="App"> 
      <div className="App bg-[url('../public/images/bg.svg')"> 
			{/* <div className="container mx-auto center bg-custom-name h-64 w-full bg-cover"> */}
      <div className="ccontainer">

        {/* Wrapper start */}
        <div className="customHeader w-full flex items-center">
          {/* left side */}
          <div className="w-full grid grid-cols-2">
            <div>
            <img src="./images/logo.svg" alt="site_logo" />
            </div>

            <div className='items-right'>
                  { status == 'connected' ? <button onClick = {disconnect} className = 'py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-blue-300 rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'> {address.slice(0, 10)}...{address.slice(-4)}</button> : <button className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'> Not Connected </button> }
            </div>
          </div>
        </div>
        
        {(status == 'connected') && renderInputForm()}
        <div></div>
        <div></div>

        <div class="h-screen grid grid-cols-3">

        {!(status == 'connected') && renderNotConnectedContainer()}
        <div></div>

        {!(status == 'connected') && 
        (<div class="p-6">

          <div class="grid gap-4 grid-cols-4">
          <div class="w-24 h-24 bg-red-100"></div>
            <div class="w-24 h-24 bg-red-150"></div>
            <div class="w-24 h-24 bg-red-200"></div>
            <div class="w-24 h-24 bg-red-250"></div>
            <div class="w-24 h-24 bg-red-600"></div>
            <div class="w-24 h-24 bg-red-700"></div>

            <div class="w-24 h-24 bg-red-100"></div>
            <div class="w-24 h-24 bg-red-150"></div>
            <div class="w-24 h-24 bg-red-200"></div>
            <div class="w-24 h-24 bg-red-250"></div>
            <div class="w-24 h-24 bg-red-600"></div>
            <div class="w-24 h-24 bg-red-700"></div>

            <div class="w-24 h-24 bg-red-100"></div>
            <div class="w-24 h-24 bg-red-150"></div>
            <div class="w-24 h-24 bg-red-200"></div>
            <div class="w-24 h-24 bg-red-250"></div>
            <div class="w-24 h-24 bg-red-600"></div>
            <div class="w-24 h-24 bg-red-700"></div>
            
          </div>
          </div>)

        }
        

        

        
      </div>

      
        {/*<img className="connect-wallet-container" src="./src/WTF.png" alt="WTF png" /><br></br>*/}
        

        {/* <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div> */}
			</div>
		</div>
	);
}

export default App;
