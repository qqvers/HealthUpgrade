import React, { useState, useEffect, useContext } from "react";
import styles from "./BMICalculator.module.css";
import { LoginContext } from "../Context/LoginContext";
import { useNavigate } from "react-router-dom";

const BMICalculator = () => {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(0);
  const { isLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const handleAgeChange = (e) => setAge(e.target.value);
  const handleHeightChange = (e) => setHeight(e.target.value);
  const handleWeightChange = (e) => setWeight(e.target.value);

  const calculateBMI = (e) => {
    e.preventDefault();
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(bmiValue);
  };

  const getBMIClassification = (bmi) => {
    if (bmi < 16 && bmi > 0) return "Severe Thinness";
    if (bmi >= 16 && bmi < 17) return "Moderate Thinness";
    if (bmi >= 17 && bmi < 18.5) return "Mild Thinness";
    if (bmi >= 18.5 && bmi < 25) return "Normal";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    if (bmi >= 30 && bmi < 35) return "Obese Class I";
    if (bmi >= 35 && bmi < 40) return "Obese Class II";
    if (bmi >= 40) return "Obese Class III";
    return "";
  };

  function getBMIRange(classification) {
    const ranges = {
      "Severe Thinness": "< 16",
      "Moderate Thinness": "16 - 17",
      "Mild Thinness": "17 - 18.5",
      Normal: "18.5 - 25",
      Overweight: "25 - 30",
      "Obese Class I": "30 - 35",
      "Obese Class II": "35 - 40",
      "Obese Class III": "> 40",
    };
    return ranges[classification];
  }

  const bmiClassification = getBMIClassification(bmi);

  return (
    <>
      {isLoggedIn && (
        <div className={styles.bmiCalculator}>
          <div className={styles.bmiResult}>
            {bmi > 0 ? <p>Your BMI: {bmi.toFixed(2)}</p> : <p>Your BMI: </p>}
          </div>
          <div className={styles.bmiContainer}>
            <form onSubmit={calculateBMI} className={styles.bmiForm}>
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={handleAgeChange}
                required
              />
              <input
                type="number"
                placeholder="Height in cm"
                value={height}
                onChange={handleHeightChange}
                required
              />
              <input
                type="number"
                placeholder="Weight in kg"
                value={weight}
                onChange={handleWeightChange}
                required
              />
              <button type="submit">Calculate BMI</button>
            </form>
            <div className={styles.bmiTable}>
              <table>
                <thead>
                  <tr>
                    <th>Classification</th>
                    <th>BMI range - kg/m2</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Severe Thinness",
                    "Moderate Thinness",
                    "Mild Thinness",
                    "Normal",
                    "Overweight",
                    "Obese Class I",
                    "Obese Class II",
                    "Obese Class III",
                  ].map((classification) => (
                    <tr
                      key={classification}
                      className={
                        bmiClassification === classification
                          ? styles.highlighted
                          : ""
                      }
                    >
                      <td>{classification}</td>
                      <td>{getBMIRange(classification)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BMICalculator;
