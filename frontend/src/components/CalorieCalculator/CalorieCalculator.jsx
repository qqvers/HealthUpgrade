import React, { useState, useEffect, useContext } from "react";
import styles from "./CalorieCalculator.module.css";
import { LoginContext } from "../Context/LoginContext";
import { useNavigate } from "react-router-dom";

const CalorieCalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [goal, setGoal] = useState("maintain");
  const [calories, setCalories] = useState(null);
  const { isLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const calculateCalories = (e) => {
    e.preventDefault();

    let bmr;
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    let maintenanceCalories = bmr * Number(activityLevel);
    switch (goal) {
      case "lose":
        maintenanceCalories -= 400;
        break;
      case "gain":
        maintenanceCalories += 400;
        break;
      default:
        break;
    }

    setCalories(Math.round(maintenanceCalories));
  };

  return (
    <>
      {isLoggedIn && (
        <div className={styles.calorieCalculator}>
          {calories ? (
            <p className={styles.result}>
              Your daily caloric needs: {calories} kcal
            </p>
          ) : (
            <p className={styles.result}>Your daily caloric needs:</p>
          )}
          <form onSubmit={calculateCalories} className={styles.calorieForm}>
            <input
              className={styles.input}
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
            <select
              className={styles.select}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              className={styles.input}
              type="number"
              placeholder="Height in cm"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <select
              className={styles.select}
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
            >
              <option value="1.2">Sedentary (little or no exercise)</option>
              <option value="1.375">
                Lightly active (light exercise/sports 1-3 days/week)
              </option>
              <option value="1.55">
                Moderately active (moderate exercise/sports 3-5 days/week)
              </option>
              <option value="1.725">
                Very active (hard exercise/sports 6-7 days a week)
              </option>
              <option value="1.9">
                Extra active (very hard exercise/sports & physical job)
              </option>
            </select>
            <select
              className={styles.select}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="lose">Weight Loss</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Weight Gain</option>
            </select>
            <button className={styles.button} type="submit">
              Calculate
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CalorieCalculator;
