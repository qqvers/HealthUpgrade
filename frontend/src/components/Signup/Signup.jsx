import React, { useState } from "react";
import styles from "./Signup.module.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [responseStatus, setResponseStatus] = useState(true);

  const validateEmail = (email) => {
    return email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
  };

  const validateForm = () => {
    let tempErrors = {};
    let valid = true;

    if (!email || !validateEmail(email)) {
      tempErrors.email = "Please enter a valid email address.";
      valid = false;
    }

    if (!password || password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = { email, password };

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRegistrationSuccess(true);
        setResponseStatus(true);
      } else {
        setResponseStatus(false);
        setErrors({
          ...errors,
          form: data.error
            ? data.error.message
            : "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrors({
        ...errors,
        form: error.message
          ? error.message
          : "Network error. Please try again.",
      });
    }
  };

  return (
    <div className={styles.signupContainer}>
      {registrationSuccess ? (
        <p className={styles.success}>Registration successful!</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <p className={styles.Title}>Sign up</p>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? styles.errorField : ""}
            />
            {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? styles.errorField : ""}
            />
            {errors.password && (
              <p className={styles.errorMsg}>{errors.password}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? styles.errorField : ""}
            />
            {errors.confirmPassword && (
              <p className={styles.errorMsg}>{errors.confirmPassword}</p>
            )}
          </div>

          {errors.form && <p className={styles.errorMsg}>{errors.form}</p>}
          {!responseStatus && (
            <p className={styles.errorMsg}>User already exist.</p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Signup;
