import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import instance from "../instance";
import instanceKeeper from "../instanceKeeper";

export default function Home() {
  const [price, setPrice] = useState([]);
  const [equities, setEquities] = useState([]);

  const loader = (
    <div className={styles.overlay}>
      <div className={styles.overlay__inner}>
        <div className={styles.overlay__content}>
          <img src="../images/abstract.png" className={styles.spinner}></img>
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
        newPrice.push(`Price: ${Number(priceBlock[0] / 100)}`);
      }
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
        <h1 className={styles.title}>Alpaca Feeds</h1>
        {!price.length > 0 ? (
          <div className={styles.cardTwo}>
            {loader}
          </div>
        ) : (
          <div className={styles.gridTwo}>
            <div className={styles.grid}>
              <div className={styles.cardTwo}>
                <h2>Equities</h2>
              </div>
            </div>
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
