import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";

function Nodes() {
  const [nodes, setNodes] = useState();

  const router = useRouter();

  function compare(a, b) {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key > b.key) {
      return 1;
    }
    return 0;
  }

  const listNodes = async () => {
    try {
      const data = await fetch(
        "https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes",
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
        }
      );
      let allData = await data.json();
      if (allData.length == 0) {
        setNodes("No Nodes Created");
        return;
      }
      allData = allData.sort(compare);
      setNodes(allData);
      console.log("allData ", allData);
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

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const [timer, setTimer] = useState();
  useEffect(() => {
    listNodes();
  }, []);
  useEffect(() => {
    if (timer) clearInterval(timer);
    setTimer(
      setInterval(() => {
        if (
          nodes &&
          Array.isArray(nodes) &&
          nodes.find(({ status }) => status !== "completed")
        )
          listNodes();
      }, 10000)
    );
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [nodes]);
  console.log("Rendering nodes", nodes);
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
        <h1 className={styles.header1}>Nodes</h1>
        <div className={styles.detailsNode}>
          Below is a list of the nodes currently deployed on PolyNodes. Click on
          a node to see the jobs running on it. Nodes marked as initializing
          usually take about 5 minutes to deploy.
        </div>
        <div className={styles.gridTwo}>
          {!nodes ? (
            <div className={styles.overlay}>
              <div className={styles.overlay__inner}>
                <div className={styles.overlay__content}>
                  <img
                    src="../images/abstract.png"
                    className={styles.spinner}
                  ></img>
                  <div style={{ textAlign: "center" }}>Retrieving Nodes</div>
                </div>
              </div>
            </div>
          ) : nodes == "No Nodes Created" ? (
            <h2>{nodes}</h2>
          ) : (
            nodes.map(({ key, status, ...rest }) => {
              console.log("Looking at object in nodes", key, rest);
              return (
                <div
                  key={key}
                  className={[styles.card, styles[status]].join(" ")}
                  onClick={() => router.replace(`/node/${key}`)}
                  style={{ cursor: "pointer" }}
                >
                  <h3 className={styles.nodeName}>{key}</h3>
                  <h4 className={styles.nodeStatus}>
                    {status === "uninitalized"
                      ? "Initializing"
                      : capitalizeFirstLetter(status)}
                  </h4>
                </div>
              );
            })
          )}
        </div>
        <button
          className={styles.addButton}
          style={{ margin: "20px 20px" }}
          onClick={() => router.replace("./node")}
        >
          {"+ "} Add a Node
        </button>
        <div className={styles.nav}>
          <button
            className={styles.navButton}
            onClick={() => router.replace(`./`)}
          >
            Home
          </button>
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

export default Nodes;
