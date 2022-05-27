import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ethers } from "ethers";

export default function Home() {
  const [problems, setProblems] = useState({});
  const clickFooter = useCallback(() => {
    window.location.href = "https://finity.polygon.technology/";
  }, []);
  const clickFooter2 = useCallback(() => {
    window.location.href = "https://fleek.co/";
  }, []);

  const router = useRouter();

  const initialFormData = Object.freeze({
    name: "",
  });

  const [formData, updateFormData] = useState(initialFormData);
  const [feedback, setFeedback] = useState(false);

  const handleChange = async (e) => {
    updateFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (formData && formData.name && !/^[a-z0-9]+$/i.test(formData.name)) {
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
  }, [formData]);

  const createNode = async () => {
    setFeedback(true);
    //check the problems
    if (problems.name || problems.ownerWallet) {
      setFeedback(false);
      return;
    }
    const newBody = {
      key: formData.name,
      ownerWallet: formData.ownerWallet,
    };
    const body = JSON.stringify(newBody);

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
    router.replace(`../nodes`);
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
            <div style={{ textAlign: "center" }}>Creating Node...</div>
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
      <main className={styles.main}>
        {feedback && showFeedback}
        {!feedback && (
          <div>
            <h1 className={styles.header1}>Create Node</h1>
            <div className={styles.detailsNode}>
          <p>You're almost there! Provide a name for your PolyNodes server and it will be ready for you in about five minutes.</p>
          <p>If you share your wallet address, PolyNodes will create a Chainlink oracle contract connect to your new server
          and assign you as the owner of that contract.</p>
        </div>
            <div className={styles.inputContainer}>
              <label
                className={`${styles.inputLabel} ${
                  problems.name && styles.errorLabel
                }`}
              >
                Node Name
              </label>
              <input
                className={`${styles.inputTicker} ${
                  problems.name && styles.errorTicker
                }`}
                onChange={handleChange}
                name="name"
                id="name"
                placeholder="Node Name"
                autoComplete="off"
                type="text"
              />
              {problems.name && (
                <div className={styles.errorText}>{problems.name}</div>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label
                className={`${styles.inputLabel} ${
                  problems.ownerWallet && styles.errorLabel
                }`}
              >
                Owner Wallet (EVM)
              </label>
              <input
                className={`${styles.inputTicker} ${
                  problems.ownerWallet && styles.errorTicker
                }`}
                onChange={handleChange}
                name="ownerWallet"
                id="ownerWallet"
                placeholder="0x000000000000000000000000"
                autoComplete="off"
                type="text"
              />
              {problems.ownerWallet && (
                <div className={styles.errorText}>{problems.ownerWallet}</div>
              )}
            </div>
            <div>
              <button
                className={styles.exploreButton}
                style={{ marginTop: "15px" }}
                onClick={createNode}
                disabled={!!problems.name || !!problems.ownerWallet}
              >
                {!!problems.name || !!problems.ownerWallet
                  ? "Fix Problems..."
                  : "Create Node"}
              </button>
            </div>
            <div className={styles.nav}>
              <button
                className={styles.navButton}
                onClick={() => router.replace(`/nodes`)}
              >
                {"< "}Back to Nodes
              </button>
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

        <button className={styles.finityButton} onClick={clickFooter2}>
          <div style={{ marginLeft: "15px" }}>Created with </div>
          <img
            className={styles.finityLogo}
            src="../images/fleek-logo.png"
          ></img>
        </button>

      </footer>
    </div>
  );
}
