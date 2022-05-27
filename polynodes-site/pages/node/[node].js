import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useEffect, useState, useCallback, Fragment } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";
import copy from "copy-to-clipboard";
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
  const clickFooter2 = useCallback(() => {
    window.location.href = "https://fleek.co/";
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
          <a href="/">PolyNodes</a>
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
          <div>
            {node && node.id && (
              <div
                className={styles.detailsNode}
                style={{ textAlign: "center" }}
              >
                <div>
                  <div className={styles.gridThree}>
                    <div>
                      {node.status[0] === "completed" ? (
                        <Fragment>
                          <div className={styles.nodeLabel}>Ready Since</div>
                          <div className={styles.details}>
                            {new Date(node.statusDate[0]).toLocaleString()}
                          </div>
                        </Fragment>
                      ) : (
                        <div>
                          <div className={styles.nodeLabel}>Status</div>
                          <div className={styles.details}>
                            {capitalizeFirstLetter(String(node.status))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {node.keys &&
                    node.keys.map(
                      ({ evmChainID, address, ethBalance }, index) => (
                        <div className={styles.gridThree}>
                          <div className={styles.nodeDetailWrapper}>
                            {evmChainID === "80001" ? (
                              <div>
                                <div style={{ fontSize: "24px" }}>
                                  Mumbai ({evmChainID})
                                </div>
                                {address ? (
                                  <div className={styles.details}>
                                    Node Wallet:{" "}
                                    <a target="_blank"
                                      href={`https://mumbai.polygonscan.com/address/${address}`}
                                    >
                                      <div
                                        className={styles.link}
                                        style={{ display: "inline-block" }}
                                      >
                                        {address}{" "}
                                      </div>
                                    </a>
                                    {"   "}{" "}
                                    <div style={{ display: "inline-block" }}>
                                      (Balance: {ethBalance})
                                    </div>
                                  </div>
                                ) : (
                                  <div className={styles.details}>
                                    Node Wallet:{" "}
                                    <div
                                      className={styles.link}
                                      style={{ display: "inline-block" }}
                                    >
                                      No Wallet Found
                                    </div>
                                  </div>
                                )}
                                {node.defaultContract_80001 &&
                                node.defaultContract_80001[0] ? (
                                  <div className={styles.details}>
                                    Oracle Contract:{" "}
                                    <a target="_blank"
                                      href={`https://mumbai.polygonscan.com/address/${node.defaultContract_80001[0]}`}
                                    >
                                      <div
                                        className={styles.link}
                                        style={{ display: "inline-block" }}
                                      >
                                        {node.defaultContract_80001[0]}
                                      </div>
                                    </a>
                                    <button
                                      className={styles.connectButton}
                                      style={{
                                        display: "inline-block",
                                        width: "70px",
                                      }}
                                      onClick={(e) => {
                                        copy(node.defaultContract_80001[0].toString());
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : (
                                  <div className={styles.details}>
                                    Oracle Contract:{" "}
                                    <div
                                      className={styles.link}
                                      style={{ display: "inline-block" }}
                                    >
                                      No Contract Found
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: "24px" }}>
                                  Mainnet ({evmChainID})
                                </div>
                                {address ? (
                                  <div className={styles.details}>
                                    Node Wallet:{" "}
                                    <a target="_blank"
                                      href={`https://polygonscan.com/address/${address}`}
                                    >
                                      <div
                                        className={styles.link}
                                        style={{ display: "inline-block" }}
                                      >
                                        {address}{" "}
                                      </div>
                                    </a>
                                    {"   "}
                                    <div style={{ display: "inline-block" }}>
                                      (Balance: {ethBalance})
                                    </div>
                                  </div>
                                ) : (
                                  <div className={styles.details}>
                                    Node Wallet:{" "}
                                    <div
                                      className={styles.link}
                                      style={{ display: "inline-block" }}
                                    >
                                      No Wallet Found
                                    </div>
                                  </div>
                                )}
                                {node.defaultContract_137 &&
                                node.defaultContract_137[0] ? (
                                  <div className={styles.details}>
                                    Oracle Contract:{" "}
                                    <a target="_blank"
                                      href={`https://polygonscan.com/address/${node.defaultContract_137[0]}`}
                                    >
                                      <div
                                        className={styles.link}
                                        style={{ display: "inline-block" }}
                                      >
                                        {node.defaultContract_137[0]}
                                      </div>
                                    </a>
                                    <button
                                      className={styles.connectButton}
                                      style={{
                                        display: "inline-block",
                                        width: "70px",
                                      }}
                                      onClick={(e) => {
                                        copy(node.defaultContract_137[0].toString());
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ) : (
                                  <div className={styles.details}>
                                    Oracle Contract:{" "}
                                    <div
                                      className={styles.link}
                                      style={{ display: "inline-block" }}
                                    >
                                      No Contract Found
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>
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
                  console.log("Working with job", job);
                  return (
                    <div
                      key={index}
                      className={styles.jobCard}
                      onClick={() =>
                        router.replace(`../nodeId/${nodeId}/job/${job.name}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h3>{job.name}</h3>
                      {/* <h4>
                        Status:
                        <span style={{ marginLeft: "10px" }}>
                          {capitalizeFirstLetter(String(job.status))}
                        </span>
                      </h4> */}
                      {/* <h4> */}
                      <div
                        onClick={(e) => {
                          copy(job.externalJobID.toString().replace(/-/g, ""));
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        Job Id:{" "}
                        <span className={styles.jobId}>
                          {job.externalJobID}
                        </span>
                      </div>
                      <div style={{ display: "inline-block" }}>
                        <div>
                          <Fragment>Oracle: </Fragment>
                          {job.chainId === "80001" ? (
                            <a className={styles.jobId}
                              target="_blank"
                              href={`https://mumbai.polygonscan.com/address/${job.contractAddress}`}
                            >
                              <span className={styles.jobId}>
                                {job.contractAddress}
                              </span>
                            </a>
                          ) : (
                            <a
                              target="_blank"
                              href={`https://polygonscan.com/address/${job.contractAddress}`}
                            >
                              <span className={styles.jobId}>
                                {job.contractAddress}
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                      {/* </h4> */}
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

export default Node;
