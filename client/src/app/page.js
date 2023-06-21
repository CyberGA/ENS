"use client";

import Image from 'next/image'
import styles from './page.module.css'
import Head from "next/head";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // ENS
  const [ens, setENS] = useState(null);
  // Save the address of the currently connected account
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);


  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    const signer = web3Provider.getSigner();
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress();
    // Calls the function to set the ENS or Address

    if (needSigner) {
      return signer;
    }
    return web3Provider;
  };

  /**
   * Sets the ENS, if the current connected address has an associated ENS or else it sets
   * the address of the connected account
   */

  const searchENS = async () => {
    if (address.length == 0) {
      alert("Please provide the ethereum address")
      return
    }

    setLoading(prev => true)
    const web3Provider = await getProviderOrSigner();
    // Lookup the ENS related to the given address
    var _ens = await web3Provider.lookupAddress(address);
    // If the address has an ENS set the ENS
    if (_ens) {
      setENS(_ens);
    } else {
      setENS(null)
      alert("No name was found")
    }
    setLoading(prev => false)
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [walletConnected]);


  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to ENS checker!
          </h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            Check if your wallet address is registered on the ENS domain
          </div>
          {
            loading ? <div className={styles.description}>
              Loading...
            </div> : <>
              {
                ens !== null && <div className={styles.description}>
                  {`We found ${ens} for the address provided`}
                </div>
              }
            </>
          }

          {walletConnected && <div className={styles.addressField}>
            <input type="text" placeholder='Enter any eth address' value={address} onChange={(e) => setAddress(prev => e.target.value)} />
          </div>}

          {walletConnected ? <button onClick={searchENS} className={styles.button}>
            Search
          </button> : <button onClick={connectWallet} className={styles.button}>
            Connect Wallet
          </button>}
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by cyberga.eth
      </footer>
    </div>
  );
}
