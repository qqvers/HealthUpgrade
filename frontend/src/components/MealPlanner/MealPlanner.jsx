import React, { useState, useEffect, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "./MealPlanner.module.css";
import moment from "moment";
import { ProductsContext } from "../ProductsContext/ProductsContext";
import { LoginContext } from "../Context/LoginContext";
import { useNavigate } from "react-router-dom";

const getUniqueItemId = () => `item-${Date.now()}`;

const MealPlanner = () => {
  const [state, setState] = useState({
    days: {},
    trash: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    weight: "",
  });
  const [currentWeek, setCurrentWeek] = useState(moment());
  const { products } = useContext(ProductsContext);
  const [suggestions, setSuggestions] = useState([]);

  const [dailyMacros, setDailyMacros] = useState({});
  const { jwtToken } = useContext(LoginContext);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const { isLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchMealsAndUpdateState = async () => {
      try {
        const response = await fetch("http://localhost:5000/meals", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const mealData = await response.json();

        setState((prevState) => ({
          ...prevState,
          days: mealData.meals.days || {},
          trash: mealData.trash || [],
        }));
        setIsDataFetched(true);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }
    };

    fetchMealsAndUpdateState();
  }, []);

  const saveMeals = async () => {
    try {
      const response = await fetch("http://localhost:5000/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ meals: state }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Failed to save meals:", error);
    }
  };

  const calculateMacros = async (name, weight) => {
    try {
      const response = await fetch(
        `http://localhost:5000/search?query=${name}`
      );
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const data = await response.json();

      return {
        protein: (data.nutrientProtein / 100) * weight,
        fat: (data.nutrientFat / 100) * weight,
        carbs: (data.nutrientCarbo / 100) * weight,
        energy: (data.energy / 100) * weight,
      };
    } catch (error) {
      console.error("Error fetching product macros:", error);
      return { protein: 0, fat: 0, carbs: 0, energy: 0 };
    }
  };

  const calculateAndAddMacros = (date, macros) => {
    setDailyMacros((prevMacros) => {
      const currentMacros = prevMacros[date] || {
        protein: 0,
        fat: 0,
        carbs: 0,
        energy: 0,
      };
      return {
        ...prevMacros,
        [date]: {
          protein: currentMacros.protein + macros.protein,
          fat: currentMacros.fat + macros.fat,
          carbs: currentMacros.carbs + macros.carbs,
          energy: currentMacros.energy + macros.energy,
        },
      };
    });
  };

  const handleProductNameChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, name: value });

    if (value.length >= 4) {
      const matchSuggestions = products.filter((product) =>
        product.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(matchSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, name: suggestion });
    setSuggestions([]);
  };

  const handlePrevWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, "week"));
  };
  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, "week"));
  };
  const saveToJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "schedule.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const recalculateDailyMacros = (date, items) => {
    const newMacros = items.reduce(
      (acc, item) => ({
        protein: acc.protein + item.macros.protein,
        fat: acc.fat + item.macros.fat,
        carbs: acc.carbs + item.macros.carbs,
        energy: acc.energy + item.macros.energy,
      }),
      { protein: 0, fat: 0, carbs: 0, energy: 0 }
    );

    setDailyMacros((prevMacros) => ({
      ...prevMacros,
      [date]: newMacros,
    }));
  };

  const calculateAndDeductMacros = (date, macros) => {
    setDailyMacros((prevMacros) => {
      const currentMacros = prevMacros[date] || {
        protein: 0,
        fat: 0,
        carbs: 0,
        energy: 0,
      };
      return {
        ...prevMacros,
        [date]: {
          protein: currentMacros.protein - macros.protein,
          fat: currentMacros.fat - macros.fat,
          carbs: currentMacros.carbs - macros.carbs,
          energy: currentMacros.energy - macros.energy,
        },
      };
    });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === "trash") {
      const sourceColumn = [...state.days[source.droppableId]];
      const [removedItem] = sourceColumn.splice(source.index, 1);
      setState((prevState) => ({
        ...prevState,
        days: {
          ...prevState.days,
          [source.droppableId]: sourceColumn,
        },
      }));
      calculateAndDeductMacros(source.droppableId, removedItem.macros);
    } else {
      if (source.droppableId === destination.droppableId) {
        const column = [...state.days[source.droppableId]];
        const [movedItem] = column.splice(source.index, 1);
        column.splice(destination.index, 0, movedItem);
        setState((prevState) => ({
          ...prevState,
          days: {
            ...prevState.days,
            [source.droppableId]: column,
          },
        }));
      } else {
        const sourceColumn = [...state.days[source.droppableId]];
        const destColumn = [...state.days[destination.droppableId]];
        const [movedItem] = sourceColumn.splice(source.index, 1);
        destColumn.splice(destination.index, 0, movedItem);

        setState((prevState) => ({
          ...prevState,
          days: {
            ...prevState.days,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destColumn,
          },
        }));

        recalculateDailyMacros(source.droppableId, sourceColumn);
        recalculateDailyMacros(destination.droppableId, destColumn);
      }
    }
  };

  const handleAddItem = async (date, name, weight) => {
    const newItemId = getUniqueItemId();
    const content = `${name}, ${weight} g`;
    const macros = await calculateMacros(name, weight);

    setState((prevState) => {
      const currentItemsForDay = prevState.days[date] || [];
      const newItem = { id: newItemId, content, macros };
      return {
        ...prevState,
        days: {
          ...prevState.days,
          [date]: [...currentItemsForDay, newItem],
        },
      };
    });

    calculateAndAddMacros(date, macros);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { date, name, weight } = formData;
    await handleAddItem(date, name, parseInt(weight));
    setShowForm(false);
    setFormData({ date: "", name: "", weight: "" });
  };

  const getDayNames = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = currentWeek.clone().startOf("isoWeek").add(i, "days");
      return {
        date: date.format("YYYY-MM-DD"),
        dayName: date.format("dddd"),
      };
    });
  };

  const loadFromJson = (event) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      const content = e.target.result;
      try {
        const parsedData = JSON.parse(content);

        setState(parsedData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    fileReader.readAsText(event.target.files[0]);
  };
  const handleFileInputClick = () => {
    document.getElementById("fileInput").click();
  };

  const initializeWeek = (weekMoment, existingDays) => {
    const weekStart = weekMoment.clone().startOf("isoWeek");
    const days = { ...existingDays };
    for (let i = 0; i < 7; i++) {
      const dayKey = weekStart.clone().add(i, "days").format("YYYY-MM-DD");
      if (!days[dayKey]) {
        days[dayKey] = [];
      }
    }
    return days;
  };

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      days: initializeWeek(currentWeek, prevState.days),
    }));
  }, [currentWeek, isDataFetched]);

  const recalculateWeeklyMacros = (weekDays) => {
    let newDailyMacros = {};

    for (const [date, items] of Object.entries(weekDays)) {
      newDailyMacros[date] = items.reduce(
        (acc, item) => ({
          protein: acc.protein + item.macros.protein,
          fat: acc.fat + item.macros.fat,
          carbs: acc.carbs + item.macros.carbs,
          energy: acc.energy + item.macros.energy,
        }),
        { protein: 0, fat: 0, carbs: 0, energy: 0 }
      );
    }

    setDailyMacros(newDailyMacros);
  };

  useEffect(() => {
    const newDays = initializeWeek(currentWeek, state.days);
    setState((prevState) => ({
      ...prevState,
      days: newDays,
    }));
    recalculateWeeklyMacros(newDays);
  }, [currentWeek, isDataFetched]);

  return (
    <>
      {isLoggedIn && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.container}>
            {getDayNames().map(({ date, dayName }) => (
              <Droppable droppableId={date} key={date}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.column}
                    style={{
                      backgroundImage: snapshot.isDraggingOver
                        ? "radial-gradient(circle, rgba(154, 245, 253, 1) 1%, rgba(164, 241, 189, 1) 100%)"
                        : "radial-gradient(circle, rgba(255, 255, 255, 1) 1%, rgba(203, 235, 219, 1) 100%)",
                    }}
                  >
                    <h3>{dayName}</h3>
                    <h4>{date}</h4>
                    {(state.days[date] || []).map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.item}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging
                                ? "lightgreen"
                                : "white",
                            }}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    <div className={styles.macrosSummary}>
                      <p>
                        Protein: {(dailyMacros[date]?.protein ?? 0).toFixed(2)}{" "}
                        g
                      </p>
                      <p>Fat: {(dailyMacros[date]?.fat ?? 0).toFixed(2)} g</p>
                      <p>
                        Carbs: {(dailyMacros[date]?.carbs ?? 0).toFixed(2)} g
                      </p>
                      <p>
                        Energy: {(dailyMacros[date]?.energy ?? 0).toFixed(2)}{" "}
                        kcal
                      </p>
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
            <div>
              <button onClick={handlePrevWeek} className={styles.addButton}>
                Previous Week
              </button>
              <button onClick={handleNextWeek} className={styles.addButton}>
                Next Week
              </button>
              <button onClick={saveMeals} className={styles.addButton}>
                Save
              </button>
              <button onClick={saveToJson} className={styles.addButton}>
                Download .json
              </button>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                accept=".json"
                onChange={loadFromJson}
              />
              <button
                onClick={handleFileInputClick}
                className={styles.addButton}
              >
                Load .json
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className={styles.addButton}
              >
                Add Product
              </button>
              {showForm && (
                <form onSubmit={handleFormSubmit} className={styles.form}>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      const formattedDate = moment(e.target.value).format(
                        "YYYY-MM-DD"
                      );
                      setFormData({ ...formData, date: formattedDate });
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleProductNameChange}
                    required
                  />
                  <div className={styles.suggestions}>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Weight (grams)"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    required
                  />

                  <button type="submit">Add Product</button>
                  <button type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </form>
              )}
              <Droppable droppableId="trash" key="trash">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.trash}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? "darkred"
                        : "darkgrey",
                    }}
                  >
                    <h3>Delete</h3>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      )}
    </>
  );
};
export default MealPlanner;
