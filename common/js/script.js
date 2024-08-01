import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

new Swiper(".swiper", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

const reservationElement = document.getElementById("reservation");
if (reservationElement) {
  reservationElement.addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // ファイルをBase64エンコード
    const frontFile = form.querySelector("#intl-license-front").files[0];
    const backFile = form.querySelector("#intl-license-back").files[0];

    const frontBase64 = await fileToBase64(frontFile);
    const backBase64 = await fileToBase64(backFile);

    formData.set("intl-license-front", removeBase64Prefix(frontBase64));
    formData.set("intl-license-back", removeBase64Prefix(backBase64));

    try {
      const response = await fetch(
        "https://japan-crc.com/api-go/inbound-request",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log(result);
      alert("Reservation successful!");
    } catch (error) {
      console.error("Error:", error);
      alert("There was a problem with your reservation.");
    }
  });
}
const reservationJapanElement = document.getElementById("reservation-japan");

if (reservationJapanElement) {
  reservationJapanElement.addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // ファイルをBase64エンコード
    const frontFile = form.querySelector("#intl-license-front").files[0];
    const backFile = form.querySelector("#intl-license-back").files[0];

    const frontBase64 = await fileToBase64(frontFile);
    const backBase64 = await fileToBase64(backFile);

    formData.set("intl-license-front", frontBase64);
    formData.set("intl-license-back", backBase64);

    try {
      const response = await fetch(
        "https://japan-crc.com/api-go/inbound-request-japan",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      alert("予約処理に失敗しました。");
    }
  });
}

function removeBase64Prefix(base64String) {
  return base64String.replace(/^data:image\/\w+;base64,/, "");
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
document
  .getElementById("simulation")
  .addEventListener("change", async function (e) {
    e.preventDefault();

    document.getElementById("simulation_price").innerHTML = "";
    const err_msg = document.getElementById("simulation_msg");

    const form = document.getElementById("simulation");
    const formData = new FormData(form);

    try {
      const start_date = new Date(formData.get("start_date"));
      const end_date = new Date(formData.get("end_date"));
      const members = parseInt(formData.get("members"), 10);
      const date_difference = (end_date - start_date) / (1000 * 60 * 60 * 24);

      if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
        err_msg.innerText = "Please select date";
        return;
      }

      if (date_difference <= 3) {
        err_msg.innerText = "Please select a period of more than 5 days";
        return;
      }

      const start_date_str = start_date.toISOString().split("T")[0]; // yyyy-mm-dd
      const end_date_str = end_date.toISOString().split("T")[0]; // yyyy-mm-dd

      const url = `https://japan-crc.com/api-go/reservation-global-plan?loan_datetime=${encodeURIComponent(
        start_date_str
      )}&return_datetime=${encodeURIComponent(end_date_str)}`;

      const response = await fetch(url);
      const result = await response.json();

      const total_plan_price = result.reduce((total, item) => {
        return total + parseInt(item.plan_price, 10);
      }, 0);

      const facility_fee = members * 45300;

      const total_price = total_plan_price + facility_fee;

      document.getElementById("simulation_price").innerHTML =
        "¥" + total_price.toLocaleString();
      err_msg.innerText = ""; // エラーメッセージをクリア
    } catch (error) {
      console.error("Error:", error);
      err_msg.innerText = "An error occurred while calculating the simulation.";
    }
  });
