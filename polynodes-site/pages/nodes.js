import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from 'next/link'

function Nodes() {

  const [nodes, setNodes] = useState();

  const router = useRouter();

  const listNodes = async () => {
    try {
      const data = await fetch(
        "https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes",
        {
          headers: {
          Authorization: "Bearer POLYNODES"
          }
        }
      );
      const allData = await data.json();
      setNodes(allData)
      console.log("allData ", allData)
    } catch (err) {
      console.log(err.message);
    }
  };

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  const createNode = useCallback(() => {
    window.location.href = `./node`;
  }, []);


  useEffect(() => {
listNodes()
  }, [])

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
      <div>
      <main className={styles.main}>
        <h1 className={styles.header1}>PolyNodes
        <button className={styles.exploreButton} style={{marginBottom:"20px"}} onClick={() => router.replace('./node')}>Create Node</button></h1>
    
        <div  className={styles.grid} >
          {!nodes ? 
                  <div className={styles.overlay}>
                  <div className={styles.overlay__inner}>
                    <div className={styles.overlay__content}>
                      <img src="../images/abstract.png" className={styles.spinner}></img>
                      <div style={{ textAlign: "center" }}>Retrieving Nodes</div>
                    </div>
                  </div>
                </div> :
          nodes.map((node) => {
            return(
              <div key={node.key} className={styles.card} onClick={() => router.replace(`/node/${node.key}`)} style={{cursor:"pointer"}}>
                <h3>{node.key}</h3>
                <h4>Status: {node.status}</h4>
            </div>
           )  
          })}
        </div>
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
    </div>
  );
}

export default Nodes;
