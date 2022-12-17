import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

import trellis from './Viva-Magenta-trellis-pattern.png'; 

import { GiphyFetch } from "@giphy/js-fetch-api";
import {
  Carousel
} from "@giphy/react-components";

const giphyFetch = new GiphyFetch("vQ6dNPifItkPzKpOK5SzCPR2gntsyUFr");
function CarouselDemo() {
  const fetchGifs = (offset, number) =>
    giphyFetch.search("waves", { offset, limit: 10 });
  return <Carousel fetchGifs={fetchGifs} gifHeight={50} gutter={8} />;
}

function App() {
  const getEthereumObject = () => window.ethereum;
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState(0); 
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState("");
  
  const contractAddress = "0xc40E2ac7936C8b16D472DA73533b4Cae7eAAF572";
  const contractABI = abi.abi;  

 useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  }, []);
  
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	useEffect(() => {
		if(currentAccount !== "") {
			getWaveCount();
			getAllWaves();		
		}	
	}, [currentAccount])


const getAllWaves = async () => {
		try {
		  const { ethereum } = window;
		  if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
	
			
			const waves = await wavePortalContract.getAllWaves();
	
			let wavesCleaned = [];
			waves.forEach(wave => {
			  wavesCleaned.push({
				address: wave.waver,
				timestamp: new Date(wave.timestamp * 1000),
				message: wave.message
			  });
			});
	
			console.log('Got Waves', wavesCleaned)
			setAllWaves(wavesCleaned.reverse());
		  } else {
			console.log("Ethereum object doesn't exist!")
		  }
		} catch (error) {
		  console.log(error);
		}
	  };
  	useEffect(() => {
		let wavePortalContract;
	  
		const onNewWave = (from, timestamp, message) => {
		  console.log('NewWave', from, timestamp, message);
		  setAllWaves(prevState => [
			...prevState,
			{
			  address: from,
			  timestamp: new Date(timestamp * 1000),
			  message: message,
			},
		  ]);
		};
	  
		if (window.ethereum) {
		  const provider = new ethers.providers.Web3Provider(window.ethereum);
		  const signer = provider.getSigner();
	  
		  wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
		  wavePortalContract.on('NewWave', onNewWave);
		}
	  
		return () => {
		  if (wavePortalContract) {
			wavePortalContract.off('NewWave', onNewWave);
		  }
		};
	  }, []);
  
const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;
			
			if (!ethereum) {
				console.log("Make sure you have metamask!");
				return;
			} else {
				console.log("We have the ethereum object", ethereum);
			}
			
			/*
			* Check if we're authorized to access the user's wallet
			*/
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
			} else {
				console.log("No authorized account found")
			}
		} catch (error) {
			console.log(error);
		}
	}
const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };
const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        localStorage.setItem('waveCount', count)
        setWaveCount(parseInt(count));
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        setMessage("")
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        localStorage.setItem('waveCount', count)
        setWaveCount(parseInt(count));
        console.log("Retrieved total wave count...", count.toNumber());
        setWaveCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
const getWaveCount = async () => {
		try {
			const { ethereum } = window;
		
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
		
				let count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());
				setWaveCount(count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
		  	console.log(error)
		}
	}
	
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am heather and I launched the iPhone at the Palo Alto Apple Store so that's pretty cool right? Connect your Ethereum wallet and wave at me!
           <h3>Wave Count:</h3>
          <p>{waveCount}</p>
         
        </div>
      
        <div className="inputContainer">
					<input value={message} onChange={(e) => setMessage(e.target.value)} className="app__input" placeholder="✍🏽"/>
				</div>
        
        <button className="waveButton" onClick={wave}>
         👋🏽 Wave at Me
        </button>
    
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            🐺 Connect Wallet
          </button>
        )}
        
        
        <div className="waveContainer">
         {allWaves.map((wave, index) => {
          return (
            <div key={index} >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div>
        
            
            <p><img src={trellis} alt="Vivid Magenta, Color of the Year 2023!" width="100"/></p>
            <p>#magentaverse</p>

        <footer><p><CarouselDemo /></p></footer>
      </div>
    </div>
  );
}

export default App;






