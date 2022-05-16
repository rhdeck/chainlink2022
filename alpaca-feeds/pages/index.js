import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import instance from "../instance";
import instanceKeeper from "../instanceKeeper";
import { ethers } from "ethers";

export default function Home() {
  const [price, setPrice] = useState([]);
  const [equities, setEquities] = useState([]);
  const [lastUpkeep, setLastUpkeep] = useState();

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
      const provider = new ethers.providers.AlchemyProvider("maticmum")
      const currentBlock = await provider.getBlockNumber()
      const currentBlockInfo = await provider.getBlock(currentBlock)
      const pastBlockInfo = await provider.getBlock(Number(priceBlock[1]))
      const minutes = Math.floor((currentBlockInfo.timestamp-pastBlockInfo.timestamp)/60)
      const seconds = ((currentBlockInfo.timestamp-pastBlockInfo.timestamp)%60)
      setLastUpkeep(`${minutes} minutes and ${seconds} seconds since last update`)
      setPrice(newPrice);
    } catch (err) {
      console.log("Error Message: ", err.message);
    }
  };

  const getEquities = async () => {
    const equitiesLength = await instanceKeeper.numEquities();
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

  useEffect(() => {
    getEquities();
  }, []);

  useEffect(() => {
    getPriceandFeed();
  }, [equities]);

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
          <h2>Equities</h2>
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
          <h4 style={{textAlign:"center", fontWeight:"normal"}}>{lastUpkeep}</h4>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by PolyNodes
        </a>
      </footer>
    </div>
  );
}
