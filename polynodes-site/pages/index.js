import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from 'next/link'

export default function Home() {

  const router = useRouter();

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
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
        <div className={styles.logoText}><Link href="/">PolyNodes</Link></div>
      </div>
      <main className={styles.main}>
        <h1 className={styles.header1}>PolyNodes</h1>
        <p className={styles.indexText}>PolyNodes is a platform created to enhance the use of the Polygon 
        blockchain on Chainlink by making it extremely easy to create Polygon Chainlink nodes. 
          With the click of a button, users can create and deploy Polygon nodes to run on Chainlink. Users 
          can then create jobs to run 
          on those nodes.</p>
    <button className={styles.finityButton} onClick={() => router.replace('./nodes')}>Start Exploring Nodes</button>
          
      </main>

      <footer className={styles.footer}>
        <button className={styles.finityButton} onClick={() => router.replace("/nodes")}>
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

