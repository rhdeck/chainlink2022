import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";
import { render } from "react-dom";
// import AceEditor from "react-ace";

// import "ace-builds/src-noconflict/mode-java";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/ext-language_tools";

export default function Home() {
  const [feedback, setFeedback] = useState(false);
  const [source, setSource] = useState();

  function onChange(newValue) {
    setSource(newValue);
  }

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);

  const router = useRouter();

  const nodeId = router.query.nodeId;

  const initialFormData = Object.freeze({
    name: "",
    chain: "",
    minPayment: "",
    parameters: "",
    oracleAddress: "",
    source: "",
  });

  const [formData, updateFormData] = useState(initialFormData);

  const handleChange = async (e) => {
    console.log(e);
    updateFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const createJob = async () => {
    setFeedback(true);
    const newParams = formData.parameters.split(",").map((s) => s.trim());
    const newBody = {
      name: formData.name,
      source: formData.source,
      parameters: newParams,
      minPayment: formData.minPayment,
      oracleAddress: formData.oracleAddress,
      chainId: formData.chain,
    };
    const body = JSON.stringify(newBody);

    try {
      const data = await fetch(
        `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}/jobs`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer POLYNODES",
          },
          body: body,
        }
      );
      const response = data.json();
      console.log("response: ", response);
    } catch (err) {
      console.log(err.message);
    }
    router.replace(`../node/${nodeId}`);
  };

  let showFeedback;

  if (feedback) {
    showFeedback = (
      <div className={styles.overlay}>
        <div className={styles.overlay__inner}>
          <div className={styles.overlay__content}>
            <img
              src="../../images/abstract.png"
              className={styles.spinner}
            ></img>
            <div style={{ textAlign: "center" }}>Creating Job...</div>
          </div>
        </div>
      </div>
    );
  }

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
      <main className={styles.main} suppressHydrationWarning>
        {showFeedback}
        <h1 className={styles.header1}>Create Job</h1>
        <div className={styles.gridTwo}>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Job Name</label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="name"
              id="name"
              placeholder="Job Name"
              autoComplete="off"
              type="text"
            />
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Chain ID</label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="chain"
              id="chain"
              placeholder="Chain ID (i.e. 80001)"
              autoComplete="off"
              type="text"
            />
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Minimum Payment</label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="minPayment"
              id="minPayment"
              placeholder="Minimum Payment"
              autoComplete="off"
              type="text"
            />
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Parameters</label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="parameters"
              id="parameters"
              placeholder="Parameters"
              autoComplete="off"
              type="text"
            />
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Oracle Address</label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              value={formData.oracleAddress}
              name="oracleAddress"
              id="oracleAddress"
              placeholder="Oracle Address"
              autoComplete="off"
              type="text"
            />
          </div>
        </div>
        <div className={styles.inputContainer}>
          <label className={styles.inputLabel}>Source Code</label>
          <div className={styles.informationWrapper}>
            <p className={styles.information}>
              You can access any of the parameters via the inputData. E.g.
              referencing inputData.ticker would fetch the parameter called,
              "ticker". You can use the await keyword. Return the function that
              you want.
            </p>
            <p>
              fetch, crypto and ethers are all loaded into memory for this
              lambda function.
            </p>
          </div>
          <div>
            <textarea
              className={styles.inputArea}
              onChange={handleChange}
              name="source"
              id="source"
              placeholder="Enter job source code here..."
              autoComplete="off"
            >
              {formData.source}
            </textarea>
            {/* { typeof window !== "undefined" && <AceEditor 
          className={styles.inputCode}
          mode="javascript"
          theme="github"
          name="source"
          id="source"
          placeholder="Enter job source code here..."
          onChange={onChange}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />} */}
          </div>
        </div>
        <div>
          <button
            className={styles.exploreButton}
            style={{ margin: "25px 0" }}
            onClick={createJob}
          >
            Create Job
          </button>
          <div className={styles.nav}>
            <button
              className={styles.navButton}
              onClick={() => router.replace(`/node/${nodeId}`)}
            >
              {"< "}Back to Jobs
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
