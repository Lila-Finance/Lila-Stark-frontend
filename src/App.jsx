import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { stark, uint256, AccountInterface, constants,CallData } from "starknet"
import './styles/App.css';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';
import { useConnect, useDisconnect, useAccount, useNetwork, useWaitForTransaction } from '@starknet-react/core';

const TWITTER_HANDLE = 'WTFAcademy_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

window.chainLogo = {};
chainLogo = ethLogo;

// function rpc(chain) {
//   return {
//     nodeUrl: `https://${chain.network}.example.org`
//   }
// }
const LIFI_CONTRACT = '0x06fba4abcca41b2ae445f6c97d1da9e71567a560be908bc2df7606635c9057f8';
const USDC_ADDRESS = "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"

const getUserOrder = async () => {
  // get the user nonce (call )
  // call the 
  const createOrderCalldata = ["10000", "3", "0", "1", "0" ]
  const callTx = await account.execute(
    {
        contractAddress: LIFI_CONTRACT,
        entrypoint: "create_order",
        calldata: createOrderCalldata
      }
  );
  const status = await account.waitForTransaction(callTx.transaction_hash);
}
const App = () => {
  const [value, setValue] = useState();
  const [minted, setMinted] = useState(false)
  const [orders, setOrders] = useState([]);

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address, status } = useAccount()
  const { chain } = useNetwork()
  const [hash, setHash] = useState(undefined)
  const { data, isLoading, error } = useWaitForTransaction({ hash, watch: true })

  const [isFormVisible, setFormVisible] = useState(false);
  const [formInput, setFormInput] = useState({
    amount: '',
    interest: '',
    term: '',
    strategy: ''
  });
  

  useEffect(() => {
  }, [minted])


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    createOrder(formInput)
    // Close the form popup after submission
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
        <div class="grid grid-cols-3 grid-flow-col gap-4">

        <button className='cta-button mint-button' onClick={() => setFormVisible(true)}>
            Pick Orders
          </button>
          
          <button className='cta-button mint-button' onClick={() => setFormVisible(true)}>
            Create Order
          </button>

          <button className='cta-button mint-button' onClick={withdraw}>
            Withdraw
          </button>
          </div>

          <div className="overflow-x-auto">
          <h2 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Your orders</h2>
          <table className="w-full table-fixed border-collapse border border-red-800">
            <thead>
              <tr className="bg-red-200">
                <th className="border border-red-150 px-4 py-2 w-1/3">Order ID</th>
                <th className="border border-red-150 px-4 py-2 w-1/3">Order Type</th>
                <th className="border border-red-150 px-4 py-2 w-1/3">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="bg-white">
                  <td className="border border-red-150 px-4 py-2">{order.id}</td>
                  <td className="border border-red-150 px-4 py-2">{order.type}</td>
                  <td className="border border-red-150 px-4 py-2">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
        </div>

          {isFormVisible && (
          <div className="popup-form">
            <div className="popup-form bg-white p-5 rounded-lg shadow-lg">
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col">
                Amount:
                <input
                  type="text"
                  name="amount"
                  className="mt-1 p-2 border border-gray-300 rounded"
                  value={formInput.amount}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Interest:
                <input
                  type="text"
                  name="interest"
                  className="bg-red-150 mt-1 p-2 border border-gray-300 rounded"
                  value={formInput.interest}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Term:
                <input
                  type="text"
                  name="term"
                  className="mt-1 p-2 border border-gray-300 rounded"
                  value={formInput.term}
                  onChange={handleInputChange}
                />
              </label>
              <label className="flex flex-col">
                Strategy:
                <input
                  type="text"
                  name="strategy"
                  className="mt-1 p-2 border border-gray-300 rounded"
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

        </div>
		);
	}

  const mintedTip = () => {
    return (
      <p>Minted Successfully!</p>
    )
  }

  const withdraw = async () => {
    const withdrawData = [ LIFI_CONTRACT ] 
    const callTx = await account.execute(
      {
          contractAddress: "0x03ca3c1b060088408797accebe72938ef8a5ac672c68bd3a92a5c193ad30ba3b",
          entrypoint: "wuthdraw",
          calldata: withdrawData
        }
    );
    const status = await account.waitForTransaction(callTx.transaction_hash);
    console.log("Withdaw worked yay : ",status)
  }

  const createOrder = async (formData) => {
    // console.log(chain)
    console.log(account)
    try {
      // const createOrderCalldata_ = [ LIFI_CONTRACT, formData.amount, "0" ]
      
      // const ercTx = await account.execute(
      //   {
      //       contractAddress: USDC_ADDRESS,
      //       entrypoint: "approve",
      //       calldata: createOrderCalldata_
      //     },
      // )

      // const status_ = await account.waitForTransaction(ercTx.transaction_hash);
      // console.log("erc status : ", status_)
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


      const newOrder = { id: orders.length + 1, type: '...', status: '...' }; 
      setOrders([...orders, newOrder]);
    }
    catch (error) {
      console.log(error);
    }
  }
    
	return (
		<div className="App">
			<div className="container mx-auto center ">

      <div className="w-full 2xl:max-w-7xl 3xl:max-w-[1400px] mx-auto pt-5 md:pt-9 pb-14 px-6 md:px-8 xl:px-12">
        {/* Wrapper start */}
        <div className="w-full flex items-center justify-between gap-10">
          {/* left side */}
          <div className="w-screen grid grid-cols-2">
          <div>
          <img src="./images/logo.svg" alt="site_logo" />
          </div>

          <div className='items-right'>
          <img alt="Network logo" className="logo" src={chainLogo} />
                { status == 'connected' ? <button onClick = {disconnect} className = 'ru-button'> Wallet: {address.slice(0, 6)}...{address.slice(-4)}</button> : <p> Not Connected </p> }
          </div>
          
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
        {minted && mintedTip()}


      
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
