import Head from "next/head";
import styles from "../../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import React from "react";
import { render } from "react-dom";
import { ethers } from "ethers";
// import AceEditor from "react-ace";

// import "ace-builds/src-noconflict/mode-java";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/ext-language_tools";

const initialFormData = Object.freeze({
  name: "",
  chain: "80001",
  minPayment: "0.1",
  parameters: "",
  oracleAddress: "",
  source: "",
});
export default function Home() {
  const [feedback, setFeedback] = useState(false);
  const [source, setSource] = useState();
  const [problems, setProblems] = useState({});
  const [node, setNode] = useState();
  function onChange(newValue) {
    setSource(newValue);
  }

  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);
  const clickFooter2 = useCallback(() => {
    window.location.href = "https://fleek.co/";
  }, []);

  const router = useRouter();

  const nodeId = router.query.nodeId;

  const [formData, updateFormData] = useState(initialFormData);

  const handleChange = async (e) => {
    console.log(e);
    updateFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };
  const getNode = useCallback(async () => {
    if (!nodeId) return;
    const data = await fetch(
      `https://4nxj58hwac.execute-api.us-east-1.amazonaws.com/dev/nodes/${nodeId}`,
      {
        headers: {
          Authorization: "Bearer POLYNODES",
        },
      }
    );
    const response = await data.json();
    setNode(response);
  }, [nodeId]);
  useEffect(() => {
    getNode();
  }, [nodeId]);
  useEffect(() => {
    if (node) {
      console.log("Nodes ahoy", node);
      const key = `defaultContract_${formData.chain}`;
      const contract = node[key];
      console.log({ key, contract });
      if (contract) {
        console.log("Found my contract", contract);
        updateFormData((old) => ({ ...old, oracleAddress: contract[0] }));
      }
    }
  }, [node, formData.chain]);
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

  useEffect(() => {
    if (formData && formData.name && !/^[a-z0-9]+$/.test(formData.name)) {
      setProblems((old) => ({
        ...old,
        name: "Name can only contain letters and numbers",
      }));
    } else if (!formData.name) {
      setProblems((old) => ({
        ...old,
        name: "Name is required",
      }));
    } else {
      setProblems((old) => ({ ...old, name: "" }));
    }

    if (
      formData &&
      formData.chain &&
      !["80001", "137"].includes(formData.chain)
    ) {
      setProblems((old) => ({
        ...old,
        chain: "Chain must be 80001 or 137",
      }));
    } else if (!formData.chain) {
      setProblems((old) => ({
        ...old,
        chain: "Chain is required",
      }));
    } else {
      setProblems((old) => ({ ...old, chain: "" }));
    }

    if (
      formData &&
      formData.ownerWallet &&
      !ethers.utils.isAddress(formData.ownerWallet)
    ) {
      setProblems((old) => ({
        ...old,
        ownerWallet:
          "Invalid address: should be 0x followed by forty hexadecimal characters",
      }));
    } else {
      setProblems((old) => ({ ...old, ownerWallet: "" }));
    }

    // @Todo: validate minPayment -> doesnt work if the minpayment
    // starts with a number and contains characters
    const minPayment = parseFloat(formData.minPayment);
    if (isNaN(minPayment) || minPayment < 0) {
      console.log("here");
      setProblems((old) => ({
        ...old,
        minPayment:
          "Min payment must be a number and greater than or equal to 0",
      }));
    } else if (!formData.minPayment) {
      setProblems((old) => ({
        ...old,
        minPayment: "Min Payment is required",
      }));
    } else {
      setProblems((old) => ({ ...old, minPayment: "" }));
    }

    // @TODO: prefill oracle address (right now its required)
    if (
      formData &&
      formData.oracleAddress &&
      !ethers.utils.isAddress(formData.oracleAddress)
    ) {
      setProblems((old) => ({
        ...old,
        oracleAddress:
          "Invalid address: should be 0x followed by forty hexadecimal characters",
      }));
    } else if (!formData.oracleAddress) {
      setProblems((old) => ({
        ...old,
        oracleAddress: "Oracle Address is required",
      }));
    } else {
      setProblems((old) => ({ ...old, oracleAddress: "" }));
    }
    //check job for alphas and commas
    if (formData.parameters) {
      const goodParameterString = formData.parameters
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.replace(/[^a-z0-9 ]/g, ""))
        .join(",");
      console.log("Comparing", formData.parameters, "to", goodParameterString);
      if (formData.parameters !== goodParameterString) {
        setProblems((old) => ({
          ...old,
          parameters:
            "Parameters can only contain letters and numbers separated by commas",
        }));
      } else {
        setProblems((old) => ({ ...old, parameters: "" }));
      }
    }
  }, [formData]);
  console.log("Problem count", Object.values(problems).filter(Boolean).length);
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
        {
          <div>
            on
            {nodeId}
          </div>
        }
        <div className={styles.gridTwo}>
          <div className={styles.inputContainer}>
            <label
              className={`${styles.inputLabel} ${
                problems.name && styles.errorLabel
              }`}
            >
              Job Name
            </label>
            <input
              className={`${styles.inputTicker} ${
                problems.name && styles.errorTicker
              }`}
              onChange={handleChange}
              name="name"
              id="name"
              placeholder="Job Name"
              value={formData.name}
              autoComplete="off"
              type="text"
              autoFocus
            />
            {problems.name && (
              <div className={styles.errorText}>{problems.name}</div>
            )}
          </div>
          <div className={styles.inputContainer}>
            <label
              className={`${styles.inputLabel} ${
                problems.chain && styles.errorLabel
              }`}
            >
              Chain ID
            </label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="chain"
              value={formData.chain}
              id="chain"
              placeholder="Chain ID (i.e. 80001)"
              autoComplete="off"
              type="text"
            />
            {problems.chain && (
              <div className={styles.errorText}>{problems.chain}</div>
            )}
          </div>
          <div className={styles.inputContainer}>
            <label
              className={`${styles.inputLabel} ${
                problems.minPayment && styles.errorLabel
              }`}
            >
              Minimum Payment
            </label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              value={formData.minPayment}
              name="minPayment"
              id="minPayment"
              placeholder="Minimum Payment"
              autoComplete="off"
              type="text"
            />
            {problems.minPayment && (
              <div className={styles.errorText}>{problems.minPayment}</div>
            )}
          </div>
          <div className={styles.inputContainer}>
            <label
              className={`${styles.inputLabel} ${
                problems.parameters && styles.errorLabel
              }`}
            >
              Parameters
            </label>
            <input
              className={styles.inputTicker}
              onChange={handleChange}
              name="parameters"
              id="parameters"
              value={formData.parameters}
              placeholder="Parameters"
              autoComplete="off"
              type="text"
            />
            {problems.parameters && (
              <div className={styles.errorText}>{problems.parameters}</div>
            )}
          </div>
          <div className={styles.inputContainer}>
            <label
              className={`${styles.inputLabel} ${
                problems.oracleAddress && styles.errorLabel
              }`}
            >
              Oracle Address{" "}
              {node &&
                node[`defaultContract_${formData.chain}`][0] ==
                  formData.oracleAddress && (
                  <span className={styles.jobIdDefault}>(Using Default)</span>
                )}
            </label>
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
            {problems.oracleAddress && (
              <div className={styles.errorText}>{problems.oracleAddress}</div>
            )}
          </div>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.detailsNode}>
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
          <label className={styles.inputLabel}>Source Code</label>
          <div>
            <textarea
              className={styles.inputArea}
              onChange={handleChange}
              name="source"
              id="source"
              placeholder="Enter job source code here..."
              autoComplete="off"
              value={formData.source}
            />
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
            disabled={Object.values(problems).filter(Boolean).length}
          >
            {!Object.values(problems).filter(Boolean).length
              ? "Create Job"
              : "Almost done..."}
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
