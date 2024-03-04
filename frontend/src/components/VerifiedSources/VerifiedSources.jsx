import React, { useEffect, useContext } from "react";
import styles from "./VerifiedSources.module.css";
import { LoginContext } from "../Context/LoginContext";
import { useNavigate } from "react-router-dom";

const VerifiedSources = () => {
  const { isLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const sources = [
    {
      title: "Sebastian Kot",
      description:
        '"Sebastian Kot, as a personal trainer, is an expert in fitness and a healthy lifestyle. He has extensive knowledge in strength exercises, functional training, and nutrition."',
      url: "https://www.youtube.com/@SebaKot",
    },
    {
      title: "WK Dzik",
      description: "Book about the basics of strength training",
      url: "https://wkdzik.pl/fundamenty",
    },
    {
      title: "WK Dzik",
      description: "Book about healthy nutrition",
      url: "https://wkdzik.pl/fundamenty",
    },
    {
      title: "Dietetyka oparta na faktach",
      description:
        "\"Radosław Smolik, a certified dietitian. Founder of 'Evidence-Based Nutrition', a trainer, and author of many publications based on scientific evidence about nutrition, food, and supplementation.\"",
      url: "https://www.dietetykaopartanafaktach.pl/",
    },
    {
      title: "Świadomy Trening",
      description:
        '"I am a personal trainer specializing in strength training, which is accessible to everyone! Contrary to myths, strength training is suitable for women, older people, and teenagers. Everyone can benefit from this type of activity and significantly improve their life quality!"',
      url: "https://swiadomytrening.pl/milosz_szkudlarek/",
    },
    {
      title: "Dr. Andrew Huberman",
      description:
        '"Andrew Huberman is a neurobiologist and a full professor in the Department of Neurobiology. He has made numerous significant contributions in the areas of brain development, brain function, and neural plasticity."',
      url: "https://www.hubermanlab.com/",
    },
    {
      title: "Szymon Moszny",
      description:
        '"In the last 12 years, I have trained 1200 personal trainers. I\'ve lectured at congresses for thousands of people. As a physiotherapist, I take the best of what the medical world offers. I enjoy sharing knowledge."',
      url: "https://www.youtube.com/@SzymonMoszny",
    },
    {
      title: "Motywator Dietetyczny",
      description: '"How to change eating habits intelligently!"',
      url: "https://www.youtube.com/@MotywatorDietetyczny",
    },
    {
      title: "Dr. Ryszard Biernat",
      description:
        '"Ryszard Biernat is a graduate of the Józef Piłsudski University of Physical Education in Warsaw, specializing in physical education with a focus on movement rehabilitation."',
      url: "https://www.youtube.com/@rozumciao7378",
    },
  ];

  return (
    <>
      {isLoggedIn && (
        <div className={styles.verifiedSources}>
          {sources.map((source, index) => (
            <div key={index} className={styles.sourceItem}>
              <h2 className={styles.sourceTitle}>{source.title}</h2>
              <a
                href={source.url}
                className={styles.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Source
              </a>
              <p className={styles.sourceDescription}>{source.description}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default VerifiedSources;
