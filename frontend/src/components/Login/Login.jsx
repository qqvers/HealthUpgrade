import React, { useState, useContext } from "react";
import styles from "./Login.module.css";
import { ProductsContext } from "../ProductsContext/ProductsContext";
import { LoginContext } from "../Context/LoginContext";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setProducts } = useContext(ProductsContext);
  const { updateToken } = useContext(LoginContext);

  const validateEmail = (email) => {
    return email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
  };

  const validateForm = () => {
    let valid = true;
    setLoginError("");
    setPasswordError("");

    if (!login || !validateEmail(login)) {
      setLoginError("Please enter a valid email address.");
      valid = false;
    }

    if (!password || password.length <= 5) {
      setPasswordError("Password must be longer than 5 characters.");
      valid = false;
    }

    return valid;
  };

  async function fetchProductNames() {
    try {
      const response = await fetch("http://localhost:5000/product-names");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productNames = await response.json();
      setProducts(productNames);
      console.log(productNames);
      return productNames;
    } catch (error) {
      console.error("Could not fetch product names:", error);
      setProducts([]);
      return [];
    }
  }
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        login,
        password
      );
      const token = await userCredential.user.getIdToken();

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: token }),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        updateToken(data.sessionToken || token);
        fetchProductNames();
        navigate("/schedule-planner");
      } else {
        setPasswordError(
          data.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      setIsSubmitting(false);

      setPasswordError(
        error.message || "Authentication error. Please try again."
      );
    }
  };
  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <p className={styles.Title}>Login</p>

        <div className={styles.formGroup}>
          <label htmlFor="login">Email:</label>
          <input
            type="email"
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className={loginError ? styles.errorField : ""}
            disabled={isSubmitting}
          />
          {loginError && <p className={styles.errorMsg}>{loginError}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? styles.errorField : ""}
            disabled={isSubmitting}
          />
          {passwordError && (
            <p className={styles.errorMsg}>
              Wrong email or password, try again.
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
