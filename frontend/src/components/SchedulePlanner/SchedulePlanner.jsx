import React, { useState, useEffect, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "./SchedulePlanner.module.css";
import moment from "moment";
import { LoginContext } from "../Context/LoginContext";
import { useNavigate } from "react-router-dom";

const getUniqueItemId = () => `item-${Date.now()}`;

const SchedulePlanner = () => {
  const [state, setState] = useState({
    days: {},
    trash: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    sets: "",
    name: "",
    repetitions: "",
    weight: "",
    comment: "",
  });
  const [currentWeek, setCurrentWeek] = useState(moment());
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
    const fetchDataAndUpdateState = async () => {
      try {
        const response = await fetch("http://localhost:5000/schedule", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const scheduleData = await response.json();

        setState((prevState) => ({
          ...prevState,
          days: scheduleData.schedule.days || {},
          trash: scheduleData.trash || [],
        }));
        setIsDataFetched(true);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      }
    };

    fetchDataAndUpdateState();
  }, []);

  const saveSchedule = async () => {
    try {
      const response = await fetch("http://localhost:5000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ schedule: state }),
      });

      if (!response.ok) {
        console.log(jwtToken);
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
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
    const downloadJson = document.createElement("a");
    downloadJson.setAttribute("href", dataStr);
    downloadJson.setAttribute("download", "schedule.json");
    document.body.appendChild(downloadJson);
    downloadJson.click();
    downloadJson.remove();
  };
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (destination.droppableId === "trash") {
      const sourceColumn = state.days[source.droppableId];
      if (sourceColumn) {
        const newSourceColumn = [...sourceColumn];
        newSourceColumn.splice(source.index, 1);
        setState((prevState) => ({
          ...prevState,
          days: {
            ...prevState.days,
            [source.droppableId]: newSourceColumn,
          },
        }));
      }
      return;
    }

    const sourceColumn = state.days[source.droppableId];
    const destColumn = state.days[destination.droppableId];

    if (sourceColumn && destColumn) {
      if (source.droppableId === destination.droppableId) {
        const newColumn = [...sourceColumn];
        const [removed] = newColumn.splice(source.index, 1);
        newColumn.splice(destination.index, 0, removed);
        setState((prevState) => ({
          ...prevState,
          days: {
            ...prevState.days,
            [source.droppableId]: newColumn,
          },
        }));
      } else {
        const newSourceColumn = [...sourceColumn];
        const newDestColumn = destColumn ? [...destColumn] : [];
        const [removed] = newSourceColumn.splice(source.index, 1);
        newDestColumn.splice(destination.index, 0, removed);
        setState((prevState) => ({
          ...prevState,
          days: {
            ...prevState.days,
            [source.droppableId]: newSourceColumn,
            [destination.droppableId]: newDestColumn,
          },
        }));
      }
    }
  };

  const handleAddItem = (date, content) => {
    const newItemId = getUniqueItemId();
    setState((prevState) => {
      const currentItemsForDay = prevState.days[date] || [];

      const newItem = { id: newItemId, content };

      return {
        ...prevState,
        days: {
          ...prevState.days,
          [date]: [...currentItemsForDay, newItem],
        },
      };
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { date, name, sets, repetitions, weight, comment } = formData;
    const content = `${name},${sets} sets, ${repetitions} reps, ${weight} kg${
      comment ? `, ${comment}` : ""
    }`;
    handleAddItem(date, content);
    setShowForm(false);
    setFormData({
      date: "",
      name: "",
      repetitions: "",
      sets: "",
      weight: "",
      comment: "",
    });
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
              <button onClick={saveSchedule} className={styles.addButton}>
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
                Add Exercise
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
                    placeholder="Exercise Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Sets"
                    value={formData.sets}
                    onChange={(e) =>
                      setFormData({ ...formData, sets: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Repetitions"
                    value={formData.repetitions}
                    onChange={(e) =>
                      setFormData({ ...formData, repetitions: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Weight (kg)"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Comment (Optional)"
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                  />
                  <button type="submit">Add Exercise</button>
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
export default SchedulePlanner;
