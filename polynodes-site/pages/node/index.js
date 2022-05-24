import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/router';

export default function Home() {

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  const router = useRouter();

  const initialFormData = Object.freeze({
    name: ""
  });

  const [formData, updateFormData] = useState(initialFormData);

  const handleChange = async (e) => {
    updateFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const createNode = async () => {
   
    const newBody = {
      key: formData.name
    }
    const body = JSON.stringify(newBody)

    try {
      await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer POLYNODES",
          },
          body: body,
        }
      );

    } catch (err) {
      console.log(err.message);
    }
    router.replace(`../nodes`)
  };

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
          <a href="/">PolyNodes</a>
        </div>
      </div>
      <main className={styles.main}>
        <h1 className={styles.header1}>PolyNodes</h1>
        <a className={styles.polygonscan} style={{fontSize:"1.25rem"}} href="../nodes">Back to Nodes</a>
        <div className={styles.grid} style={{alignItems:"center"}}>
          <div className={styles.header2}>Create Node</div>
          <div className={styles.gridTwo}>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              style={{margin:"auto"}}
              name="name"
              id="name"
              placeholder="Node Name"
              autoComplete="off"
              type="text"
            />
            </div>
          <div>
            <button className={styles.exploreButton} style={{marginTop:"15px"}} onClick={createNode}>
              Create Node
            </button>
          </div>
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
  );
}
