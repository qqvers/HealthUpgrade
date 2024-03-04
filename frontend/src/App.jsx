import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import BMICalculator from "./components/BMICalculator/BMICalculator";
import CalorieCalculator from "./components/CalorieCalculator/CalorieCalculator";
import SchedulePlanner from "./components/SchedulePlanner/SchedulePlanner";
import VerifiedSources from "./components/VerifiedSources/VerifiedSources";
import MealPlanner from "./components/MealPlanner/MealPlanner";
import Login from "./components/Login/Login";

import Footer from "./components/Footer/Footer";
import Signup from "./components/Signup/Signup";
import { ProductsProvider } from "./components/ProductsContext/ProductsContext";

function App() {
  return (
    <ProductsProvider>
      <Router>
        <div>
          <Header />
          <Routes>
            <Route path="/bmi-calculator" element={<BMICalculator />} />
            <Route path="/calorie-calculator" element={<CalorieCalculator />} />
            <Route path="/schedule-planner" element={<SchedulePlanner />} />
            <Route path="/verified-sources" element={<VerifiedSources />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Login />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ProductsProvider>
  );
}

export default App;
