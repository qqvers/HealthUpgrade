const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

const serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pcz2-f1ee9-default-rtdb.firebaseio.com",
});

const getAuthToken = (req, x, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else {
    req.authToken = null;
  }
  next();
};

app.use(getAuthToken);

app.post("/meals", async (req, res) => {
  const { authToken } = req;
  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const uid = decodedToken.uid;

    const mealData = req.body;
    const dbRef = admin.database().ref(`meals/${uid}`);
    await dbRef.set(mealData);

    res.status(200).json({ message: "Meals saved successfully" });
  } catch (error) {
    console.error("Error saving meals:", error);
    res.status(500).json({ error: "Failed to save meals" });
  }
});

app.get("/meals", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.user_id;

    const dbRef = admin.database().ref(`meals/${userId}`);
    dbRef.once("value", (snapshot) => {
      const mealData = snapshot.val();
      if (mealData) {
        res.status(200).json(mealData);
      } else {
        res.status(404).json({ message: "Meals not found" });
      }
    });
  } catch (error) {
    console.error("Error verifying token or retrieving meals:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/schedule", async (req, res) => {
  const { authToken } = req;
  try {
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const uid = decodedToken.uid;

    const scheduleData = req.body;
    const dbRef = admin.database().ref(`schedules/${uid}`);
    await dbRef.set(scheduleData);

    res.status(200).json({ message: "Schedule saved successfully" });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

app.get("/schedule", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.user_id;

    const dbRef = admin.database().ref(`schedules/${userId}`);
    dbRef.once("value", (snapshot) => {
      const scheduleData = snapshot.val();
      if (scheduleData) {
        res.status(200).json(scheduleData);
      } else {
        res.status(404).json({ message: "Schedule not found" });
      }
    });
  } catch (error) {
    console.error("Error verifying token or retrieving schedule:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    const dbRef = admin.database().ref("login");
    const newUserRef = dbRef.push();
    newUserRef.set({
      email: email,
      password: password,
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.status(201).json({ token: customToken });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      res.status(400).json({ error: "Email already in use" });
    } else {
      console.error("Error creating new user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

app.post("/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    res.status(200).json({ uid });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json({ error: "Unauthorized - Invalid ID token" });
  }
});

const FDC_API_KEY = "34tfrpcZzlLvhXKeToPDYhm3f5mJuZh2onXkwp7A";

//http://localhost:5000/search?query=cornflakes
app.get("/search", (req, res) => {
  const query =
    req.query.query || "Chicken breast tenders, breaded, cooked, microwaved";
  const pagesize = req.query.pagesize || 1;

  const api_url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(
    FDC_API_KEY
  )}&query=${encodeURIComponent(query)}&pageSize=${encodeURIComponent(
    pagesize
  )}`;

  fetch(api_url)
    .then((response) => response.json())
    .then((data) => {
      if (data.foods && data.foods.length > 0) {
        const product = data.foods[0];

        const nutrientsInfo = {
          Protein: null,
          "Total lipid (fat)": null,
          "Carbohydrate, by difference": null,
          Energy: null,
        };

        product.foodNutrients.forEach((nutrient) => {
          if (nutrientsInfo.hasOwnProperty(nutrient.nutrientName)) {
            nutrientsInfo[nutrient.nutrientName] = {
              value: nutrient.value,
              unitName: nutrient.unitName,
            };
          }
        });

        const result = {
          productName: product.description,
          nutrientProtein: nutrientsInfo.Protein
            ? nutrientsInfo.Protein.value
            : "N/A",
          unitNameProtein: nutrientsInfo.Protein
            ? nutrientsInfo.Protein.unitName
            : "N/A",
          nutrientFat: nutrientsInfo["Total lipid (fat)"]
            ? nutrientsInfo["Total lipid (fat)"].value
            : "N/A",
          unitNameFat: nutrientsInfo["Total lipid (fat)"]
            ? nutrientsInfo["Total lipid (fat)"].unitName
            : "N/A",
          nutrientCarbo: nutrientsInfo["Carbohydrate, by difference"]
            ? nutrientsInfo["Carbohydrate, by difference"].value
            : "N/A",
          unitNameCarbo: nutrientsInfo["Carbohydrate, by difference"]
            ? nutrientsInfo["Carbohydrate, by difference"].unitName
            : "N/A",
          energy: nutrientsInfo.Energy ? nutrientsInfo.Energy.value : "N/A",
          energyUnit: nutrientsInfo.Energy
            ? nutrientsInfo.Energy.unitName
            : "N/A",
        };

        res.json(result);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

//http://localhost:5000/product-names
app.get("/product-names", (req, res) => {
  const query = req.query.query || "";
  const pageSize = req.query.pageSize || 10000;

  const api_url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(
    FDC_API_KEY
  )}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;

  fetch(api_url)
    .then((response) => response.json())
    .then((data) => {
      if (data.foods && data.foods.length > 0) {
        const uniqueProductNames = new Set(
          data.foods.map((product) => product.description)
        );

        const uniqueProductsArray = [...uniqueProductNames];
        res.json(uniqueProductsArray);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    })
    .catch((error) => res.status(500).json({ error: error.message }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
