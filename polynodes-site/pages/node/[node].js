import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";

function Node() {
  const [jobs, setJobs] = useState();
  const [node, setNode] = useState();

  const router = useRouter();

  const nodeId = router.query.node;

  function compare(a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }

  const deleteNode = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      setShowLoader(true);
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}`,
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
          method: "DELETE",
        }
      );
      setShowLoader(false);
      router.replace(`/nodes`);
    }
  }, [nodeId, router]);
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
      let jobList = await data.json();
      if (jobList.length == 0) {
        setJobs("No Jobs Created");
        return;
      }
      jobList = jobList.sort(compare);
      setJobs(jobList);
    } catch (err) {
      console.log(err.message);
    }
  };

  const nodeDetails = async () => {
    if (!nodeId) {
      return;
    }
    try {
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}`,
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
        }
      );
      let nodeData = await data.json();
      setNode(nodeData);
    } catch (err) {
      console.log(err.message);
      setNode({});
    }
  };

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    listJobs();
    nodeDetails();
  }, [nodeId]);

  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    if (!jobs || !node) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [jobs, node]);

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
        <button
          className={styles.connectButton}
          style={{
            // flex: 1,
            // marginLeft: "0",
            fontSize: "1.25rem",
            // textDecoration: "underline",
            // backgroundColor: "inherit",
          }}
          onClick={() => router.replace(`/nodes`)}
        >
          {"< "}Back to Nodes
        </button>
        <h1 className={styles.header1}>
          About {nodeId}
          <button
            className={styles.connectButton}
            style={{
              // flex: 1,
              // marginLeft: "0",
              fontSize: "1.25rem",
              // textDecoration: "underline",
              // backgroundColor: "inherit",
            }}
            onClick={deleteNode}
          >
            Delete Me
          </button>
        </h1>
        {showLoader && (
          <div className={styles.overlay}>
            <div className={styles.overlay__inner}>
              <div className={styles.overlay__content}>
                <img
                  src="../../images/abstract.png"
                  className={styles.spinner}
                ></img>
                <div style={{ textAlign: "center" }}>Loading {nodeId}</div>
              </div>
            </div>
          </div>
        )}
        {!showLoader && (
          <div className={styles.polygonscan}>
            {node && (
              <div className={styles.gridThree}>
                <div style={{ fontSize: "1.25rem" }}>
                  <p>Node Name: {nodeId}</p>
                  <p>Status: {capitalizeFirstLetter(String(node.status))}</p>
                  <p>Chain: {node.defaultChainId}</p>
                </div>
                <button
                  style={{
                    margin: "auto",
                    backgroundColor: "#8e40f2",
                    color: "#ffff",
                  }}
                  className={styles.exploreButton}
                  onClick={() => router.replace(`../nodeId/${nodeId}`)}
                >
                  Create Job
                </button>
              </div>
            )}

            <div className={styles.grid}>
              {jobs == "No Jobs Created" ? (
                <h2>{jobs}</h2>
              ) : (
                jobs.map((job, index) => {
                  return (
                    <div
                      key={index}
                      className={styles.card}
                      onClick={() =>
                        router.replace(`../nodeId/${nodeId}/job/${job.name}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h3>{job.name}</h3>
                      <h4>
                        <div>Status: </div>
                        <div style={{ marginLeft: "10px" }}>
                          {capitalizeFirstLetter(String(job.status))}
                        </div>
                      </h4>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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
