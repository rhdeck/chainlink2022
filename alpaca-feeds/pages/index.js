import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import instance from "../instance";
import instanceKeeper from "../instanceKeeper";

export default function Home() {
  const [price, setPrice] = useState([]);
  const [equities, setEquities] = useState([]);
  const [lastUpkeep, setLastUpkeep] = useState([]);
  const [pastTimestamp, setPastTimestamp] = useState();

  const loader = (
    <div className={styles.overlay}>
      <div className={styles.overlay__inner}>
        <div className={styles.overlay__content}>
          <img src="../images/abstract.png" className={styles.spinner}></img>
          <div style={{textAlign:"center"}}>Retrieving Blockchain Data</div>
        </div>
      </div>
    </div>
  );

  const getPriceandFeed = async () => {
    let newPrice = [];

    let priceBlock;
    try {
      for (let i = 0; i < equities.length; i++) {
        priceBlock = await instance.getPriceandBlock(equities[i]);
        newPrice.push(`$${Number(priceBlock[0] / 100)}`);
      }
      
      setPrice(newPrice);
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const getEquities = async () => {
    let timeStamp;
    try {
    timeStamp = await instanceKeeper.lastTimeStamp()
    } catch (err) {
      console.log(err.message)
    }
    if(!pastTimestamp) {
    setPastTimestamp(timeStamp)
    }

    let equitiesLength;

    try {
    equitiesLength = await instanceKeeper.numEquities();
    } catch (err) {
      console.log(err.message)
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
      const time = Date.now()
      const currentTime = Math.floor(time / 1000)
      const hours = Math.floor((currentTime-pastTimestamp)/3600).toString().padStart(2,"0")
      const minutes = Math.floor(((currentTime-pastTimestamp)%3600)/60).toString().padStart(2,"0")
      const seconds = ((currentTime-pastTimestamp)%60).toString().padStart(2,"0")
      if(!isNaN(seconds)) {
      setLastUpkeep([hours, minutes, seconds])
      }
  }, [pastTimestamp])

  useEffect(() => {
    getEquities();
  }, []);

  const [timer, setTimer] = useState();

  useEffect(() => {
    if (timer) {
      clearInterval(timer)
    }
    const newInterval = setInterval(() => {
      getTimeInterval();
    }, 500)

    setTimer(newInterval)

  }, [pastTimestamp]);

  const [timerTwo, setTimerTwo] = useState();

  useEffect(() => {
    if (timerTwo) {
      clearInterval(timerTwo)
    }
    const newInterval = setInterval(() => {
      getEquities()
      console.log("Equities Ran")
    }, 60000)

    setTimerTwo(newInterval)

  }, []);

  useEffect(() => {
    getPriceandFeed();
  }, [equities]);

  const clickFooter = useCallback(() => {
    window.location.href="https://finity.polygon.technology/"
  }, [])

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
      <div className={styles.logo}>Alpaca Feeds</div>
      <main className={styles.main}>
        <h1>Alpaca Feeds</h1>
        <h4>(Powered by PolyNodes)</h4>
        <p style={{width:"50%", textAlign:"center"}}>Alpaca Market Feeds are updated continuously on the Polygon Blockchain via Chainlink nodes.</p>
        {!price.length > 0 ? (
          <div className={styles.cardTwo}>
            {loader}
          </div>
        ) : (
          <div>
          <div className={styles.gridTwo}>
            <div className={styles.grid}>
              {price.map((price, index) => {
                return (
                  <div key={index} className={styles.card}>
                    
                    <h2>{equities[index]}</h2>
                    <p>{price}</p>
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className={styles.timer}>
          
            <div className={styles.timerIcon}><div className={styles.timerHands}></div></div>
            <div className={styles.timerText}>{lastUpkeep[0]}<p style={{opacity:"60%", display:"inline-block"}}>H : </p> {lastUpkeep[1]}<p style={{opacity:"60%", display:"inline-block"}}>M : </p> {lastUpkeep[2]}<p style={{opacity:"60%", display:"inline-block"}}>S</p></div>
            </div>
            <div style={{textAlign:"center", marginTop:".5rem"}}>Since Last Update</div>
          
          </div>
        )}
      </main>

      <footer className={styles.footer}>

          <button className={styles.finityButton} onClick={clickFooter}>Developed with <img src="https://assets.website-files.com/61f6b057c024d3274ee3a052/61f6e2b3e6ce5e8a000000bd_logoPurple.svg"></img></button>

      </footer>
    </div>
  );
}
