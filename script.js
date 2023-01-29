"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class workout {
  id = (Date.now() + "").slice(-10);
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = new Date();
  }
  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class running extends workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.pace = duration / distance;
    this.type = "running";
    this.description = this.setDescription();
  }
}
class cycling extends workout {
  constructor(distance, duration, coords, elevation) {
    super(distance, duration, coords);
    this.elevation = elevation;
    this.speed = distance / duration;
    this.type = "cycling";
    this.description = this.setDescription();
  }
}

class app {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;
    console.log(workoutEl);
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log(workout);
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("couldnt find your location");
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    if (this.#workouts) {
      this.#workouts.forEach((work) => this._renderMarker(work));
    }
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapEvent) {
    this.#mapEvent = mapEvent.latlng;
    form.classList.remove("hidden");
    // inputType.value === "running"
    //   ? cad.querySelector.classList.remove("hidden") &&
    //     elev.querySelector.classList.add("hidden")
    //   : elev.querySelector.classList.remove("hidden") &&
    //     cad.querySelector.classList.add("hidden");
    form.addEventListener("change", this._toggleElevation.bind(this));
    form.addEventListener("submit", this._newWorkout.bind(this));
  }
  _hideForm(e) {}
  _toggleElevation() {
    if (inputType.value === "running") {
      document.querySelector(".cad").classList.remove("form__row--hidden");
      document.querySelector(".elev").classList.add("form__row--hidden");
    } else {
      document.querySelector(".cad").classList.add("form__row--hidden");
      document.querySelector(".elev").classList.remove("form__row--hidden");
    }
  }
  _newWorkout(e) {
    e.preventDefault();
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    console.log(this.#workouts);

    const { lat, lng } = this.#mapEvent;
    let workout;
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    if (!allPositive(distance, duration) || !validInputs(distance, duration)) {
      if (distance == 0 && duration == 0) return;
      return alert("insert valid numbers");
    }

    if (type == "running") {
      const cadence = +inputCadence.value;
      workout = new running(distance, duration, [lat, lng], cadence);

      this._renderList(workout);
    } else {
      const elevation = +inputElevation.value;
      workout = new cycling(distance, duration, [lat, lng], elevation);
      this._renderList(workout);
    }
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    this.#workouts.push(workout);
    this._setLocalStorage();
    this._renderMarker(workout);

    form.classList.add("hidden");
  }
  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === "running" ? "🏃💨" : "🚴‍♂️"}`)
      .openPopup();
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach((work) => this._renderList(work));
    console.log(data);
  }
  _renderList(workout) {
    let html;
    if (workout.type === "running") {
      html = `<li class="workout workout--running" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <!-- each detail in a div and span for each thing in it-->
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    } else {
      html = `
        <li class="workout workout--cycling" data-id="${workout.id}">
                    <h2 class="workout__title">${workout.description}</h2>
                    <div class="workout__details">
                      <span class="workout__icon">🚴‍♀️</span>
                      <span class="workout__value">${workout.distance}</span>
                      <span class="workout__unit">km</span>
                    </div>
                    <div class="workout__details">
                      <span class="workout__icon">⏱</span>
                      <span class="workout__value">${workout.duration}</span>
                      <span class="workout__unit">min</span>
                    </div>
                    <div class="workout__details">
                      <span class="workout__icon">⚡️</span>
                      <span class="workout__value">${workout.speed}</span>
                      <span class="workout__unit">km/h</span>
                    </div>
                    <div class="workout__details">
                      <span class="workout__icon">⛰</span>
                      <span class="workout__value">${workout.elevation}</span>
                      <span class="workout__unit">m</span>
  </div>
</li> `;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const App = new app();
