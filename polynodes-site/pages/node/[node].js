import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from 'next/link'

function Node() {
  const [jobs, setJobs] = useState();
  const [node, setNode] = useState();

  const router = useRouter();

  const nodeId = router.query.node;

  function compare( a, b ) {
    if ( a.id < b.id ){
      return -1;
    }
    if ( a.id > b.id ){
      return 1;
    }
    return 0;
  }
  

  const listJobs = async () => {
    if (!nodeId) {
      return;
    }
    try {
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}/jobs`,
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
        }
      );
      let jobs = await data.json();
      jobs = jobs.sort( compare );
      setJobs(jobs)
console.log(jobs)
    } catch (err) {
      console.log(err.message);
    }
  };

  const nodeDetails = async () => {
    try {
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}`,
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
        }
      );
      const nodeData = await data.json();
        setNode(nodeData)
        console.log(nodeData)
    } catch (err) {
      console.log(err.message);
    }
  };

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  const goToJob = useCallback(
    (name) => {
      window.location.href = `../nodeId/${nodeId}/job/${name}`;
    },
    [nodeId]
  );

  useEffect(() => {
    listJobs();
    nodeDetails();
  }, [nodeId]);

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
        <Link className={styles.polygonscan} style={{fontSize:"1.25rem"}} href="../nodes">Back to Nodes</Link>
        {!node ? <div></div> :
        <div className={styles.gridThree}>
          <div style={{fontSize:"1.25rem"}}>
        <p>{nodeId}</p>
        <p>Status: {node.status}</p>
        <p>Chain: {node.defaultChainId}</p>
        </div>
        <button  style={{margin:"auto"}} className={styles.exploreButton} onClick={() => router.replace(`../nodeId/" + nodeId`)}>Create Job</button>
        </div>
  }
       
        <div className={styles.grid}>
          <h2>Jobs</h2>
          {!jobs || !node ? (
            <div className={styles.overlay}>
              <div className={styles.overlay__inner}>
                <div className={styles.overlay__content}>
                  <img
                    src="../images/abstract.png"
                    className={styles.spinner}
                  ></img>
                  <div style={{ textAlign: "center" }}>Retrieving {nodeId}</div>
                </div>
              </div>
            </div>
          ) : (
            jobs.map((job, index) => {
              return (
                <div
                  key={index}
                  className={styles.card}
                  onClick={() => router.replace(`../nodeId/${nodeId}/job/${job.name}`)}
                  style={{ cursor: "pointer" }}
                >
                  <h4>{job.name}</h4>
                  <h5>Status: {job.status}</h5>
                </div>
              );
            })
          )}
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

export default Node;
