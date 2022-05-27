import Head from "next/head";
import styles from "../../../../styles/Home.module.css";
import { useEffect, useState, useCallback, Fragment } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Link from "next/link";
import copy from "copy-to-clipboard";

function Node() {
  const [job, setJobs] = useState();
  const [showLoader, setShowLoader] = useState();
  console.log(job);

  const router = useRouter();

  const nodeId = router.query.nodeId;
  const jobId = router.query.job;

  const listJob = async (jobId, nodeId) => {
    if (!nodeId || !jobId) {
      return;
    }
    try {
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}/jobs/${jobId}`,
        {
          headers: {
            Authorization: "Bearer POLYNODES",
          },
        }
      );
      const jobs = await data.json();
      const sourceArray = [""];
      let count = 0;
      let counter = 0;
      const sourceArrayTwo = [];
      const lines = jobs.source.split("\n").map((line) => {
        return line.replace(/\s/g, "\u00A0");
      });
      jobs["sourceArray"] = lines;
      setJobs(jobs);
      setShowLoader(false);
      console.log("jobs ", jobs);
    } catch (err) {
      console.log(err.message);
      setShowLoader(false);
    }
  };

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);
  const clickFooter2 = useCallback(() => {
    window.location.href = "https://fleek.co/";
  }, []);


  useEffect(() => {
    listJob(jobId, nodeId);
  }, [jobId, nodeId]);

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
        <h1 className={styles.header1}>
          Job Details
          <button
            className={styles.connectButton}
            style={{
              marginLeft: "0",
              fontSize: "1.25rem",
              textDecoration: "underline",
              backgroundColor: "inherit",
            }}
            onClick={() => router.replace(`/node/${nodeId}`)}
          >
            Back to Jobs
          </button>
        </h1>
        <div className={styles.grid}>
          {!job ? (
            <div className={styles.overlay}>
              <div className={styles.overlay__inner}>
                <div className={styles.overlay__content}>
                  <img
                    src="../../../images/abstract.png"
                    className={styles.spinner}
                  ></img>
                  <div style={{ textAlign: "center" }}>Retrieving {jobId}</div>
                </div>
              </div>
            </div>
          ) : (
            <div key={job} className={styles.cardJob}>
              <div>
                <h2
                  style={{
                    textAlign: "center",
                    maxWidth: "400px",
                    margin: "auto",
                    marginBottom: "10px",
                  }}
                >
                  {job.name}
                </h2>
                <div>
                  Status: <p className={styles.jobText}>{job.status}</p>
                </div>
                <div style={{ display: "inline-block" }}>
                  Oracle Address:{" "}
                  <p className={styles.jobText}>
                    <div className={styles.details}>
                      {job.chainId ==="80001"?
                      <Link
                        href={`https://mumbai.polygonscan.com/address/${job.contractAddress}`}
                      >
                        <div className={styles.linkTwo}>
                          {job.contractAddress}
                        </div>
                      </Link>:
                      <Link
                        href={`https://polygonscan.com/address/${job.contractAddress}`}
                      >
                        <div className={styles.linkTwo}>
                          {job.contractAddress}
                        </div>
                      </Link>}
                    </div>
                  </p>
                </div>
                <button
                  className={styles.connectButton}
                  style={{ display: "inline-block", width:"70px" }}
                  onClick={(e) => {
                    copy(job.contractAddress.toString());
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  Copy
                </button>
                <div>
                  Chain: <p className={styles.jobText}>{job.chainId}</p>
                </div>
                <div>
                  Minimum Payment:{" "}
                  <p className={styles.jobText}>
                    {Number(job.minPayment).toFixed(3)} LINK
                  </p>
                </div>
                <div style={{ display: "inline-block"}}>
                  External Job ID:{" "}
                  <p className={styles.jobText}>{job.externalJobID}</p>
                </div>
                <button
                  className={styles.connectButton}
                  style={{ display: "inline-block", width:"70px" }}
                  onClick={(e) => {
                    copy(job.externalJobID.toString());
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  Copy
                </button>
                <div>
                  Parameters:
                  {job.parameters ? (
                    job.parameters.map((param) => {
                      return <p className={styles.jobText}>{param}</p>;
                    })
                  ) : (
                    <div></div>
                  )}
                </div>
                <div>
                  Source:{" "}
                  <p className={styles.jobText}>
                    {job.sourceArray.map((text) => {
                      return (
                        <Fragment>
                          {text}
                          <br />
                        </Fragment>
                      );
                    })}
                  </p>
                </div>
              </div>
            </div>
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

         <button className={styles.finityButton} onClick={clickFooter2}>
          <div style={{ marginLeft: "15px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="../../../images/fleek-logo.png"
          ></img>
        </button>


        
      </footer>
    </div>
  );
}

export default Node;
