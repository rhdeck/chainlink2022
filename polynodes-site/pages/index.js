import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

    const clickFooter2 = useCallback(() => {
    window.location.href = "https://fleek.co/";
  }, []);


  return (
    <div className={styles.container}>
      <Head>
        <title>PolyNodes</title>
        <meta
          name="description"
          content="Easily create Chainlink nodes on the Polygon Mainnet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.logo}>
        <div className={styles.logoText}>
          <Link href="/">PolyNodes</Link>
        </div>
      </div>
      <main className={styles.main}>
        <h1 className={styles.header1}>PolyNodes</h1>
        <p className={styles.indexText}>
          The easiest way to make your own Chainlink Oracle on Polygon.
        </p>
        <p className={styles.indexText}>
          With the click of a button, create and deploy Polygon nodes to run on
          Chainlink. Make your job as easily as defining a javascript lambda.
        </p>
        <button
          className={styles.finityButton}
          onClick={() => router.replace("./nodes")}
        >
          Start Exploring Nodes
        </button>
      </main>

      <footer className={styles.footer}>
        <button
          className={styles.finityButton}
          onClick={() => router.replace("/nodes")}
        >
          <div style={{ marginRight: "5px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="https://assets.website-files.com/61f6b057c024d3274ee3a052/61f6e2b3e6ce5e8a000000bd_logoPurple.svg"
          ></img>
        </button>

        <button className={styles.finityButton} onClick={clickFooter2}>
          <div style={{ marginLeft: "15px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="../images/fleek-logo.png"
          ></img>
        </button>

      </footer>
    </div>
  );
}
