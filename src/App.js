import { useEffect, useState } from "react";
import "./App.css";
import contract from "./contracts/NFTCollectible.json";
import { ethers } from "ethers";
import { Fragment } from "../node_modules/react/cjs/react.production.min";

const contractAddress = "0x10f69DBbCd82Bb4F5EFFa5c0d2B36Ed33B6e8675";

const abi = contract.abi;

const headerPicture = new URL('../headerimg.jpg', import.meta.url);

const TWITTER_HANDLE = "itoukatyo";

const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [metamaskError, setMetamaskError] = useState(null);
  const [mineStatus, setMineStatus] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    const network = await ethereum.request({ method: "eth_chainId" });

    if (accounts.length !== 0 && network.toString() === '0x13881') {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setMetamaskError(false);
      setCurrentAccount(account);
    } else {
      setMetamaskError(true);
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install MetaMask!");
    }

    try {
      const network = await ethereum.request({ method: 'eth_chainId' });

      if (network.toString() === '0x13881') {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Found an account! Address: ", accounts[0]);
        setMetamaskError(null);
        setCurrentAccount(accounts[0]);
      }
      else {
        setMetamaskError(true);
      }
    }
    catch (err) {
      console.log(err);
    }

  };

  const mintNftHandler = async () => {
    try {

      setMineStatus('mining');

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, {
          value: ethers.utils.parseEther("0.01"),
        });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: ${nftTxn.hash}`);
        setMineStatus('success');

      } else {
        setMineStatus('error');
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      setMineStatus('error');
      console.log(err);
    }
  }


  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    );
  };


  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <Fragment>
      <div className="header">
        <img src={headerPicture} />
      </div>
      <div className="main-app">
        <h1>Scrappy Squirrels Tutorial</h1>
        <div>{currentAccount ? mintNftButton() : connectWalletButton()}</div>
        {metamaskError && <div className='metamask-error' style={{ color: 'red', width: '100%', textAlign: 'center' }}>Metamask から Polygon Testnet に接続してください！</div>}
        <div className='mine-submission'>
          {mineStatus === 'success' && <div className={mineStatus} style={{color: 'red',backgroundColor: 'greenyellow',padding: '15px 0',marginTop: '15px',borderRadius: '15px'}}>
            <p>NFT minting successful!</p>
            <p className='success-link'>
              <a href={`https://testnets.opensea.io/${currentAccount}/`}>Click here</a>
              <span> to view your NFT on OpenSea.</span>
            </p>
          </div>}
          {mineStatus === 'mining' && <div className={mineStatus} style={{color: 'red',backgroundColor: 'blueviolet',padding: '15px 0',marginTop: '15px',borderRadius: '15px'}}>
            <span>Transaction is mining</span>
            </div>}
            {mineStatus === 'error' && <div className={mineStatus} style={{color: 'red',backgroundColor: 'blueviolet',padding: '15px 0',marginTop: '15px',borderRadius: '15px'}}>
            <p>Transaction failed. Make sure you have at least 0.01 MATIC in your MetaMask and try again.</p>
            </div>}
        </div>
        <p>
          Your address being conncted
          <br />
          <span>
            {currentAccount}
          </span>
        </p>
        
        <div className='footer' style={{verticalAlign: 'bottom',paddingTop: '80px'}}>
          <p>
            SMART CONTRACT Address
            <br />
            <span>
              <a href={`https:mumbai.polygonscan.com/address/${contractAddress}`}>{contractAddress}</a>
            </span>
          </p>
          <div className='underLogo' >
            For studying with UNCHAIN
            <br />
            <a className="footer-link" href={TWITTER_LINK}>{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default App;
