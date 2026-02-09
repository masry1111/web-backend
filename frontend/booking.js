console.log("booking.js loaded");
alert("booking.js is running");

//load room
function loadRoom() {
    var roomId = localStorage.getItem("roomId");

    if (!roomId) {
        document.getElementById("message").innerText = "No room selected.";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:5000/api/rooms/" + roomId, true);
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var data = null;
            try { data = JSON.parse(xhr.responseText); } catch (e) {}

            if (xhr.status !== 200 || !data) {
                document.getElementById("message").innerText =
                    (data && data.error) ? data.error : "Failed to load room.";
                return;
            }

            document.getElementById("roomName").innerText =
                data.type + " - $" + data.price;
        }
    };

    xhr.send();
}


//confirm booking
function confirmBooking() {
    var roomId = localStorage.getItem("roomId");
    var checkInDate = document.getElementById("checkIn").value;
    var checkOutDate = document.getElementById("checkOut").value;

    if (!checkInDate || !checkOutDate) {
        document.getElementById("message").innerText = "Please select dates.";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/api/booking", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                document.getElementById("message").innerText =
                    "Booking successful! Redirecting...";

                setTimeout(function () {
                    window.location.href = "./mybookings.html";
                }, 800);

                return;
            }

            document.getElementById("message").innerText =
                xhr.responseText || "Booking failed.";
        }
    };

    xhr.send(JSON.stringify({
        roomId: roomId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate
    }));
}
//run on page load
loadRoom();