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
  useEffect(() => {
    console.log("Working with node", node);
  }, [node]);
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
        <h1 className={styles.header1}>About {nodeId}</h1>

        <button
          className={styles.addButton}
          style={{
            // flex: 1,
            display: "inline-block",
            marginBottom: "20px",
            fontSize: "1.25rem",
            borderColor: "red",
            color: "red",
            // textDecoration: "underline",
            // backgroundColor: "inherit",
          }}
          onClick={deleteNode}
        >
          Delete Me
        </button>
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
            {node && node.id && (
              <div className={styles.detailWrap}>
                <div className={styles.gridThree}>
                  <div className={styles.nodeDetailWrapper}>
                    <div className={styles.nodeLabel}>Node Name</div>
                    <div className={styles.details}>{nodeId}</div>
                  </div>
                  <div className={styles.nodeDetailWrapper}>
                    <div className={styles.nodeLabel}>Status</div>
                    <div className={styles.details}>
                      {capitalizeFirstLetter(String(node.status))}
                    </div>
                  </div>
                  <div className={styles.nodeDetailWrapper}>
                    <div className={styles.nodeLabel}>Default EVM Chain</div>
                    <div className={styles.details}>{node.defaultChainId}</div>
                  </div>
                </div>
                {node.keys &&
                  node.keys.map(({ evmChainID, address }, index) => (
                    <div className={styles.gridThree}>
                      <div className={styles.nodeDetailWrapper}>
                        <div className={styles.nodeLabel}>
                          Wallet for chain {evmChainID}
                        </div>
                        <div className={styles.details}>{address}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className={styles.gridTwo}>
              {(!jobs || !Array.isArray(jobs) || !jobs.length) && (
                <h2 style={{ color: "white" }}>{jobs}</h2>
              )}
              {jobs &&
                Array.isArray(jobs) &&
                jobs.length &&
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
                })}
            </div>
            {node && node.id && (
              <button
                className={styles.addButton}
                onClick={() => router.replace(`../nodeId/${nodeId}`)}
                style={{ margin: "20px 20px" }}
              >
                {"+ "} Add a Job
              </button>
            )}
          </div>
        )}
        <div className={styles.nav}>
          <button
            className={styles.navButton}
            onClick={() => router.replace(`/nodes`)}
          >
            {"< "}Back to Nodes
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

export default Node;
