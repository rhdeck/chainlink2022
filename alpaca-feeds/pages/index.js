import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import instance from "../instance";
import instanceKeeper from "../instanceKeeper";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import abi from "../src/utils/Keepers.json";
import { ethers } from "ethers";

export default function Home() {
  const [price, setPrice] = useState([]);
  const [equities, setEquities] = useState([]);
  const [lastUpkeep, setLastUpkeep] = useState([]);
  const [pastTimestamp, setPastTimestamp] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [instanceThree, setInstanceThree] = useState();
  const [fee, setFee] = useState();
  const [loading, setLoading] = useState(false);

  const dappAddress = "0x577079b8E3562FEa524Dc99Ea31Abbd58dd5e57a";

  const loader = (
    <div className={styles.overlay}>
      <div className={styles.overlay__inner}>
        <div className={styles.overlay__content}>
          <img src="../images/abstract.png" className={styles.spinner}></img>
          <div style={{ textAlign: "center" }}>Retrieving Blockchain Data</div>
        </div>
      </div>
    </div>
  );

  const [ticker, setTicker] = useState("");

  const handleChange = async (e) => {
    const upperCase = e.target.value.toUpperCase();
    if (equities.includes(upperCase)) {
      setEquities([upperCase]);
    } else if (
      !upperCase ||
      (upperCase.length < ticker.length && upperCase.length <= 2)
    ) {
      getEquities();
    }
    setTicker(e.target.value);
  };

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {},
    },
  };

  let web3Modal;

  async function init() {
    try {
      if (window !== undefined) {
        web3Modal = new Web3Modal({
          network: "matic",
          cacheProvider: true,
          providerOptions,
        });

        web3Modal.show = true;
      }

      await web3Modal.connect();
    } catch (err) {
      console.log(err.message);
    }
  }

  const fetchAccountData = useCallback(async () => {
    const { ethereum } = window;

    let chainId;
    let accounts = [];

    if (ethereum) {
      // Get connected chain id from Ethereum node
      chainId = await ethereum.request({ method: "eth_chainId" });
      // Load chain information over an HTTP API

      // Get list of accounts of the connected wallet
      try {
        accounts = await ethereum.request({ method: "eth_accounts" });
      } catch (err) {
        console.log(err.message);
      }
      // MetaMask does not give you all accounts, only the selected account
      if (accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const instanceThree = new ethers.Contract(dappAddress, abi, signer);
        setInstanceThree(instanceThree);
        setCurrentAccount(accounts[0]);

        console.log("Got accounts", accounts);
      } else {
      }
    } else {
    }
  }, []);

  async function onConnect() {
    try {
      await init();
      window.location.reload();
      console.log("Opening a dialog", web3Modal);
    } catch (err) {
      console.log(err);
    }

    let provider;
    try {
      provider = await web3Modal.connect();
    } catch (err) {
      console.log("Could not get a wallet connection", err);
    }
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
      fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
      fetchAccountData();
    });
  }

  const getPriceandFeed = async () => {
    let newPrice = [];

    let priceBlock;
    try {
      for (let i = 0; i < equities.length; i++) {
        priceBlock = await instance.getPriceandBlock(equities[i]);
        newPrice.push(`$${Number(priceBlock[0] / 100).toFixed(2)}`);
      }

      setPrice(newPrice);
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const getEquities = async () => {
    const theFee = await instanceKeeper.EquityFee();

    setFee(theFee);
    let timeStamp;
    try {
      timeStamp = await instanceKeeper.lastTimeStamp();
    } catch (err) {
      console.log(err.message);
    }
    if (!pastTimestamp) {
      setPastTimestamp(timeStamp);
    }

    let equitiesLength;

    try {
      equitiesLength = await instanceKeeper.numEquities();
    } catch (err) {
      console.log(err.message);
    }
    let equity;
    let allEquities = [];

    try {
      for (let i = 0; i < Number(equitiesLength); i++) {
        equity = await instanceKeeper.equities(i);
        allEquities.push(equity);
      }
      setEquities(allEquities);
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const getTimeInterval = useCallback(() => {
    const time = Date.now();
    const currentTime = Math.floor(time / 1000);
    const hours = Math.floor((currentTime - pastTimestamp) / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor(((currentTime - pastTimestamp) % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = ((currentTime - pastTimestamp) % 60)
      .toString()
      .padStart(2, "0");
    if (!isNaN(seconds)) {
      setLastUpkeep([hours, minutes, seconds]);
    }
  }, [pastTimestamp]);

  const submitNewTicker = async () => {
    if (ticker) {
      if (currentAccount) {
        const overrides = {
          value: fee.toString(),
          //sending one ether
        };

        console.log("overrides ", overrides);
        const upperCase = ticker.toUpperCase();

        const gas = await instanceThree.estimateGas.addEquity(
          upperCase,
          overrides
        );
        console.log("gas ", gas);

        if (equities.includes(upperCase)) {
          setEquities([upperCase]);
          alert("This ticker already exists!");
        } else {
          try {
            const receipt = await instanceThree.addEquity(upperCase, overrides);
            setLoading(ticker);
            setTicker("");
            await receipt.wait();
            getEquities();
            setLoading(false);
          } catch (err) {
            console.log(err.message);
          }
        }
      } else {
        alert("PLEASE CONNECT WALLET!");
      }
    }
  };

  useEffect(() => {
    getEquities();
  }, []);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const [timer, setTimer] = useState();

  useEffect(() => {
    if (timer) {
      clearInterval(timer);
    }
    const newInterval = setInterval(() => {
      getTimeInterval();
    }, 500);

    setTimer(newInterval);
  }, [pastTimestamp]);

  const [timerTwo, setTimerTwo] = useState();

  useEffect(() => {
    if (timerTwo) {
      clearInterval(timerTwo);
    }
    const newInterval = setInterval(() => {
      getEquities();
    }, 60000);

    setTimerTwo(newInterval);
  }, []);

  useEffect(() => {
    getPriceandFeed();
  }, [equities]);

  useEffect(() => {
    getPriceandFeed();
  }, [currentAccount]);

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Alpaca Feeds (Powered by PolyNodes)</title>
        <meta
          name="description"
          content="Current Alpaca feeds running on Polygon Mainnet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.logo}>
        <div className={styles.logoText}>Alpaca Feeds</div>
        {!currentAccount ? (
          <button
            style={{ marginRight: "10px" }}
            onClick={onConnect}
            className={styles.connectButton}
          >
            Connect
          </button>
        ) : (
          <div className={styles.address}>
            <img width="48px" height="48px" src="./images/badge.png" />
            {currentAccount}
          </div>
        )}
      </div>
      <main className={styles.main}>
        {!price.length > 0 ? (
          <div className={styles.cardTwo}>{loader}</div>
        ) : (
          <div>
            <div className={styles.gridTwo}>
              <div>
                <h1 className={styles.header1}>Alpaca Feeds</h1>
                <h4 className={styles.header2}>(Powered by PolyNodes)</h4>
                <div className={styles.description}>
                  <p>
                    Alpaca market feeds are updated continuously on the Polygon
                    blockchain via Chainlink nodes.
                  </p>
                  <p>Don't see a ticker? Submit one here.</p>
                  <a href="https://mumbai.polygonscan.com/address/0xe934b71053845886a5F400E8ad289aA0B3E7B602#readContract">
                    Polygonscan
                  </a>
                </div>
              </div>
              <div className={styles.grid}>
                {price.map((price, index) => {
                  if (price != "$0.00") {
                    return (
                      <div key={index} className={styles.card}>
                        <h2>{equities[index]}</h2>
                        <p>{price}</p>
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className={styles.card}>
                        <h2>{equities[index]}</h2>
                        <p className={styles.pulse}>Loading...</p>
                      </div>
                    );
                  }
                })}
                <div className={styles.card} style={{ padding: "0" }}>
                  <input
                    className={styles.inputTicker}
                    onChange={handleChange}
                    name="ticker"
                    id="ticker"
                    value={ticker}
                    placeholder="AAPL"
                    autoComplete="off"
                    type="text"
                    style={{ textTransform: "uppercase" }}
                  />
                  <button
                    className={styles.inputButton}
                    onClick={submitNewTicker}
                  >
                    Submit Ticker Request {(Number(fee) / 10 ** 18).toFixed(2)}{" "}
                    MATIC
                  </button>
                </div>
                {loading && (
                  <div className={styles.cardTransaction}>
                    Submitting request for {loading}
                  </div>
                )}
              </div>
              <div style={{ width: "50%" }}></div>
            </div>

            <div className={styles.timer}>
              <div className={styles.timerIcon}>
                <div className={styles.timerHands}></div>
              </div>
              <div className={styles.timerText}>
                {lastUpkeep[0]}
                <p style={{ opacity: "60%", display: "inline-block" }}>
                  H :{" "}
                </p>{" "}
                {lastUpkeep[1]}
                <p style={{ opacity: "60%", display: "inline-block" }}>
                  M :{" "}
                </p>{" "}
                {lastUpkeep[2]}
                <p style={{ opacity: "60%", display: "inline-block" }}>S</p>
              </div>
            </div>
            <div className={styles.updateText}>Since Last Update</div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <button className={styles.finityButton} onClick={clickFooter}>
          <div style={{ marginRight: "5px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="https://assets.website-files.com/61f6b057c024d3274ee3a052/61f6e2b3e6ce5e8a000000bd_logoPurple.svg"
          ></img>
        </button>
      </footer>
    </div>
  );
}
