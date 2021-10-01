const fromVideoReq = document.getElementById("formVideoRequest");
let listOfRequests = document.getElementById("listOfRequests");

let inputValue = "newFirst";
let search = "";
let userId = "";

function debounce(fun, time) {
  let timing;
  return function (...args) {
    clearTimeout(timing);
    timing = setTimeout(() => fun.apply(this, args), time);
  };
}

function createElemnts(fakeData, isPrepend = false) {
  let containerData = document.createElement("div");
  containerData.innerHTML = `<div class="card mb-3">
  <div class="card-body d-flex justify-content-between flex-row">
    <div class="d-flex flex-column">
      <h3>${fakeData.topic_title}</h3>
      <p class="text-muted mb-2">${fakeData.topic_details}</p>
      <p class="mb-0 text-muted">
        ${
          fakeData.expected_result &&
          `<strong>Expected results:</strong> ${fakeData.expected_result}`
        }
      </p>
    </div>
    <div class="d-flex flex-column text-center">
      <a id="given_up_${fakeData._id}" class="btn btn-link">🔺</a>
      <h3 id="counter_${fakeData._id}">
      ${fakeData.votes.ups.length - fakeData.votes.downs.length}</h3>
      <a id="given_down_${fakeData._id}" class="btn btn-link">🔻</a>
    </div>
  </div>
  <div class="card-footer d-flex flex-row justify-content-between">
    <div>
      <span class="text-info">${fakeData.status.toUpperCase()}</span>
      &bullet; added by <strong>${fakeData.author_name}</strong> on
      <strong>${new Date(fakeData.submit_date).toLocaleDateString()}</strong>
    </div>
    <div
      class="d-flex justify-content-center flex-column 408ml-auto mr-2"
    >
      <div class="badge badge-success">${fakeData.target_level}</div>
    </div>
  </div>
</div>`;

  if (isPrepend) listOfRequests.prepend(containerData);
  else listOfRequests.appendChild(containerData);

  let ups = document.getElementById(`given_up_${fakeData._id}`);
  let counter = document.getElementById(`counter_${fakeData._id}`);
  let down = document.getElementById(`given_down_${fakeData._id}`);

  ups.addEventListener("click", function (el) {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: fakeData._id, vote_type: "ups" }),
    })
      .then((bold) => bold.json())
      .then((data) => (counter.innerHTML = data.votes.ups - data.votes.downs));
  });

  down.addEventListener("click", function (el) {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id: fakeData._id, vote_type: "downs" }),
    })
      .then((bold) => bold.json())
      .then((data) => (counter.innerHTML = data.votes.ups - data.votes.downs));
  });
}

function loadAllReq(sortBy = "newFirst", searching = "") {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searching}`
  )
    .then((bold) => bold.json())
    .then((data) => {
      listOfRequests.innerHTML = "";
      data.forEach((e) => createElemnts(e));
    });
}

function checkValidaty(formData) {
  //   const name = formData.get("author_name");
  //   const email = formData.get("author_email");
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");

  // const emailPattern =
  //   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // if (!name)
  //   document.querySelector("[name=author_name]").classList.add("is-invalid");
  // if (!email || !emailPattern.test(email))
  //   document.querySelector("[name=author_email]").classList.add("is-invalid");
  if (!topic || topic.length > 50)
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  if (!topicDetails)
    document.querySelector("[name=topic_details]").classList.add("is-invalid");

  let allinvalidElem = document
    .getElementById("formVideoRequest")
    .querySelectorAll(".is-invalid");

  if (allinvalidElem.length) {
    allinvalidElem.forEach((e) => {
      e.addEventListener("input", function (el) {
        this.classList.remove("is-invalid");
      });
    });
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  let sortByElems = document.querySelectorAll("[id*=sort_by]");
  let searchTerm = document.getElementById("search_box");

  const formLogin = document.querySelector(".login-form");
  const appContent = document.querySelector(".app-content");

  if (window.location.search) {
    userId = new URLSearchParams(window.location.search).get("id");
    formLogin.classList.add("d-none");
    appContent.classList.remove("d-none");
  }

  loadAllReq();

  sortByElems.forEach((elem) => {
    elem.addEventListener("click", function (e) {
      e.preventDefault();
      inputValue = this.querySelector("input").value;
      loadAllReq(inputValue, search);
      this.classList.add("active");

      if (inputValue == "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }
    });
  });

  fromVideoReq.addEventListener("submit", function (e) {
    e.preventDefault();

    const fromData = new FormData(fromVideoReq);

    fromData.append("author_id", userId);

    let isinvalid = checkValidaty(fromData);

    if (!isinvalid) return;

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: fromData,
    })
      .then((bold) => bold.json())
      .then((data) => createElemnts(data, true));
  });

  searchTerm.addEventListener(
    "input",
    debounce(function (e) {
      search = e.target.value;
      loadAllReq(inputValue, search);
    }, 300)
  );
});
