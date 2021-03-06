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
      {/* <div className={styles.logo}>
        <div className={styles.logoText}>
          <Link href="/">PolyNodes</Link>
        </div>
      </div> */}{" "}
      <div className={styles.mainwrapper}>
        <main className={styles.mainnologo}>
          <h1 className={styles.header1}>PolyNodes</h1>

          <p className={styles.indexText}>
            The easiest way to make your own Chainlink Oracle on Polygon.
          </p>
          <p className={styles.indexText}>
            With the click of a button, create and deploy{" "}
            <a href="https://polygon.technology" target="_blank">
              Polygon
            </a>{" "}
            nodes to run on{" "}
            <a href="https://chain.link/" target="_blank">
              Chainlink
            </a>
            . Make your job as easy as defining a javascript lambda.
          </p>
          <p className={styles.indexText}>
            The team is grateful to Polygon and{" "}
            <a href="https://cope.studio/" target="_blank">
              Cope Studios
            </a>{" "}
            for open sourcing the Figma design system for a cool web3 look.
          </p>
          <p className={styles.indexText}>
            The Polynodes app is on IPFS and hosted via{" "}
            <a href="https://fleek.co/" target="_blank">
              fleek.co
            </a>
          </p>
          <p className={styles.indexText}>
            We built a equities price oracle with PolyNodes! You can check it out at {" "}
            <a href="https://alpaca.polynodes.xyz/" target="_blank">
              alpaca.polynodes.xyz
            </a>
          </p>
          {/* <button
            className={styles.finityButton}
            onClick={() => router.replace("./nodes")}
          >
            Start Exploring Nodes
          </button> */}
        </main>
        {/* <div className={styles.polynodewrapper}>
      <img src = "./images/Polynodestransparent.png"/>
      </div> */}
      </div>
      <footer className={styles.footer}>
        <button className={styles.finityButton} onClick={clickFooter}>
          <div style={{ marginRight: "5px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="https://assets.website-files.com/61f6b057c024d3274ee3a052/61f6e2b3e6ce5e8a000000bd_logoPurple.svg"
          ></img>
        </button>

        <button className={styles.finityButton} onClick={clickFooter2}>
          <div style={{ marginLeft: "15px" }}>Hosted on </div>
          <img
            className={styles.finityLogo}
            src="../images/fleek-logo.png"
          ></img>
        </button>
      </footer>
    </div>
  );
}
