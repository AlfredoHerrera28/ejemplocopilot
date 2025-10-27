document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants with delete icon
        const participants = details.participants || [];
        const participantsHTML = participants.length
          ? `<ul class="participants-list">${participants
              .map((p) => `
                <li class="participant-item">
                  <span class="participant-name">${p}</span>
                  <button class="remove-participant-btn" title="Remove" data-activity="${name}" data-participant="${p}">✖</button>
                </li>`)
              .join("")}</ul>`
          : `<p class="no-participants">No participants yet — be the first to sign up!</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add event for delete icon
        activityCard.querySelectorAll('.remove-participant-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const activityName = btn.getAttribute('data-activity');
            const participant = btn.getAttribute('data-participant');
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activityName)}/remove?email=${encodeURIComponent(participant)}`, {
                method: 'POST',
              });
              const result = await response.json();
              if (response.ok) {
                messageDiv.textContent = result.message || 'Participant removed.';
                messageDiv.className = 'success';
                messageDiv.classList.remove('hidden');
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || 'Error removing participant.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 4000);
            } catch (error) {
              messageDiv.textContent = 'Failed to remove participant.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 4000);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Recarga la lista de actividades
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
