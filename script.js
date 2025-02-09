document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('modal');
  const userDataForm = document.getElementById('userDataForm');

  userDataForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const waterIntake = document.getElementById('waterIntake').value;
    const calories = document.getElementById('caloriesInput').value;
    const heartRate = document.getElementById('heartRateInput').value;
    const sleepHours = document.getElementById('sleepHours').value;
    const diet = document.querySelector('input[name="diet"]:checked').value;

    const cardValues = document.querySelectorAll('.card .card-value');
    cardValues[0].innerText = waterIntake + 'L';
    cardValues[1].innerText = calories + ' kcal';
    cardValues[2].innerText = heartRate + ' BPM';
    cardValues[3].innerText = sleepHours + ' hrs';

    if (diet === 'weightloss' || diet === 'musclegain') {
      const newUrl = window.location.origin + window.location.pathname + '?diet=' + encodeURIComponent(diet);
      window.history.replaceState({}, '', newUrl);
    } else {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    const recommendedWater = 3;  
    const recommendedSleep = 8;      
    const recommendedCalories = 2200; 

    const waterPercent = Math.min((parseFloat(waterIntake) / recommendedWater) * 100, 100);
    const sleepPercent = Math.min((parseFloat(sleepHours) / recommendedSleep) * 100, 100);
    const caloriesPercent = Math.min((parseFloat(calories) / recommendedCalories) * 100, 100);

    console.log("Progress Percentages:", { waterPercent, sleepPercent, caloriesPercent });

    const waterProgressFill = document.querySelector('#waterProgressItem .progress-fill');
    const waterProgressLabel = document.getElementById('waterProgressLabel');
    if (waterProgressFill && waterProgressLabel) {
      waterProgressFill.style.width = waterPercent + '%';
      waterProgressLabel.innerText = `${waterIntake}L / ${recommendedWater}L`;
    } else {
      console.error('Water progress elements not found.');
    }

    const sleepProgressFill = document.querySelector('#sleepProgressItem .progress-fill');
    const sleepProgressLabel = document.getElementById('sleepProgressLabel');
    if (sleepProgressFill && sleepProgressLabel) {
      sleepProgressFill.style.width = sleepPercent + '%';
      sleepProgressLabel.innerText = `${sleepHours} hrs / ${recommendedSleep} hrs`;
    } else {
      console.error('Sleep progress elements not found.');
    }

    const caloriesProgressFill = document.querySelector('#caloriesProgressItem .progress-fill');
    const caloriesProgressLabel = document.getElementById('caloriesProgressLabel');
    if (caloriesProgressFill && caloriesProgressLabel) {
      caloriesProgressFill.style.width = caloriesPercent + '%';
      caloriesProgressLabel.innerText = `${calories} kcal / ${recommendedCalories} kcal`;
    } else {
      console.error('Calories progress elements not found.');
    }

    modal.style.display = 'none';
    return false;
  });

  fetch('/.netlify/functions/exercises')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched exercise data:', data);
      const exerciseList = document.getElementById('exerciseList');
      if (!exerciseList) {
        console.error('Element with id "exerciseList" not found in the DOM.');
        return;
      }

      if (data.exercises && data.exercises.length > 0) {
        data.exercises.forEach(exercise => {
          console.log('Rendering exercise:', exercise);
          const card = document.createElement('div');
          card.className = 'exercise-card';
          card.innerHTML = `
            <h3>${exercise.name}</h3>
            <p>Duration: ${exercise.duration} mins</p>
            <p>Calories Burned: ${exercise.calories} kcal</p>
          `;
          exerciseList.appendChild(card);
        });
      } else {
        exerciseList.innerText = 'No exercises found.';
      }
    })
    .catch(error => {
      console.error('Error fetching exercises:', error);
      const exerciseList = document.getElementById('exerciseList');
      if (exerciseList) {
        exerciseList.innerText = 'Failed to load exercises.';
      }
    });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});


async function fetchMealPlan() {
  try {
    const response = await fetch('/.netlify/functions/mealplanapi');
    if (!response.ok) {
      throw new Error('Failed to fetch meal plan');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;
  }
}



document.addEventListener('DOMContentLoaded', async () => {
  const mealList = document.getElementById('mealList');
  const nutritionTotals = document.getElementById('nutritionTotals');

  mealList.innerHTML = '<div class="loading">Loading meal plan...</div>';

  try {
    const { meals, dailyTotals } = await fetchMealPlan();

    mealList.innerHTML = '';

    meals.forEach(meal => {
      const mealCard = document.createElement('div');
      mealCard.className = 'meal-card';
      mealCard.innerHTML = `
        <div class="meal-type">${meal.mealType}</div>
        <div class="food-name">${meal.food}</div>
        <div class="nutrition-info">
          <div class="nutrition-item">Calories: ${meal.calories}</div>
          <div class="nutrition-item">Protein: ${meal.protein}g</div>
          <div class="nutrition-item">Carbs: ${meal.carbs}g</div>
          <div class="nutrition-item">Fat: ${meal.fat}g</div>
          <div class="serving-size">Serving: ${meal.servingSize}</div>
        </div>
      `;
      mealList.appendChild(mealCard);
    });

    nutritionTotals.innerHTML = `
      <div class="total-item">
        <div class="total-value">${dailyTotals.calories}</div>
        <div class="total-label">Total Calories</div>
      </div>
      <div class="total-item">
        <div class="total-value">${dailyTotals.protein}g</div>
        <div class="total-label">Total Protein</div>
      </div>
      <div class="total-item">
        <div class="total-value">${dailyTotals.carbs}g</div>
        <div class="total-label">Total Carbs</div>
      </div>
      <div class="total-item">
        <div class="total-value">${dailyTotals.fat}g</div>
        <div class="total-label">Total Fat</div>
      </div>
    `;

  } catch (error) {
    mealList.innerHTML = `
      <div class="error">
        Failed to load meal plan. Please try again later.
      </div>
    `;
  }
});

document.getElementById('refreshMealPlan')?.addEventListener('click', async () => {
  location.reload();
});


document.addEventListener('DOMContentLoaded', async () => {
  const ctx = document.getElementById('nutritionChart').getContext('2d');

  const gradientCalories = ctx.createLinearGradient(0, 0, 0, 400);
  gradientCalories.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
  gradientCalories.addColorStop(1, 'rgba(0, 123, 255, 0)');

  const gradientProtein = ctx.createLinearGradient(0, 0, 0, 400);
  gradientProtein.addColorStop(0, 'rgba(40, 167, 69, 0.5)');
  gradientProtein.addColorStop(1, 'rgba(40, 167, 69, 0)');

  const gradientCarbs = ctx.createLinearGradient(0, 0, 0, 400);
  gradientCarbs.addColorStop(0, 'rgba(255, 193, 7, 0.5)');
  gradientCarbs.addColorStop(1, 'rgba(255, 193, 7, 0)');

  const gradientFat = ctx.createLinearGradient(0, 0, 0, 400);
  gradientFat.addColorStop(0, 'rgba(220, 53, 69, 0.5)');
  gradientFat.addColorStop(1, 'rgba(220, 53, 69, 0)');

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const nutritionChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Total Calories (kcal)',
        data: new Array(labels.length).fill(0),
        type: 'line',
        fill: true,
        backgroundColor: gradientCalories,
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Total Protein (g)',
        data: new Array(labels.length).fill(0),
        type: 'line',
        fill: true,
        backgroundColor: gradientProtein,
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Total Carbs (g)',
        data: new Array(labels.length).fill(0),
        type: 'line',
        fill: true,
        backgroundColor: gradientCarbs,
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y2'
      },
      {
        label: 'Total Fat (g)',
        data: new Array(labels.length).fill(0),
        type: 'line',
        fill: true,
        backgroundColor: gradientFat,
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y3'
      }
    ]
  };

  const nutritionChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, family: "'Segoe UI', system-ui, sans-serif" },
        bodyFont: { size: 13, family: "'Segoe UI', system-ui, sans-serif" },
        padding: 12,
        displayColors: false
      },
      legend: {
        display: true,
        labels: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        title: { display: true, text: 'Calories (kcal)' },
        ticks: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Protein (g)' },
        ticks: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      },
      y2: {
        beginAtZero: true,
        position: 'left',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Carbs (g)' },
        ticks: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      },
      y3: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Fat (g)' },
        ticks: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      },
      x: {
        ticks: { font: { family: "'Segoe UI', system-ui, sans-serif" } }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  const nutritionChart = new Chart(ctx, {
    type: 'line',
    data: nutritionChartData,
    options: nutritionChartOptions
  });

  try {
    const mealPlanData = await fetchMealPlan();
    const dailyTotals = mealPlanData.dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const caloriesArray = new Array(labels.length).fill(dailyTotals.calories);
    const proteinArray = new Array(labels.length).fill(dailyTotals.protein);
    const carbsArray = new Array(labels.length).fill(dailyTotals.carbs);
    const fatArray = new Array(labels.length).fill(dailyTotals.fat);

    nutritionChart.data.datasets[0].data = caloriesArray;
    nutritionChart.data.datasets[1].data = proteinArray;
    nutritionChart.data.datasets[2].data = carbsArray;
    nutritionChart.data.datasets[3].data = fatArray;
    nutritionChart.update();
  } catch (error) {
    console.error('Error fetching nutrition data for chart:', error);
  }
});
