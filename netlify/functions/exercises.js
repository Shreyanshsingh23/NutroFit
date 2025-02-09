const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  let durationAdjustment = 0;
  let calorieAdjustment = 0;

  try {
    const { diet } = event.queryStringParameters || {};

    if (diet) {
      switch (diet.toLowerCase()) {
        case 'weight-loss':
          durationAdjustment = 10;   
          calorieAdjustment = -50;   
          break;
        case 'muscle-gain':
          durationAdjustment = -5;   
          calorieAdjustment = 50;    
          break;
        case 'maintenance':
        default:
          break;
      }
    }

    const apiResponse = await fetch('https://wger.de/api/v2/exercise/?language=2&limit=10');
    const data = await apiResponse.json();

    let exercises = [];

    if (data.results && data.results.length > 0) {
      exercises = data.results.map(exercise => ({
        name: exercise.name,
        duration: Math.floor(Math.random() * 40) + 20 + durationAdjustment,
        calories: Math.floor(Math.random() * 400) + 100 + calorieAdjustment
      }));
    } else {
      exercises = [
        { name: "Push Up", duration: 30, calories: 100 },
        { name: "Squat", duration: 40, calories: 150 },
        { name: "Plank", duration: 20, calories: 50 }
      ].map(ex => ({
        name: ex.name,
        duration: ex.duration + durationAdjustment,
        calories: ex.calories + calorieAdjustment
      }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ exercises })
    };
  } catch (error) {
    const dummyExercises = [
      { name: "Push Up", duration: 30, calories: 100 },
      { name: "Squat", duration: 40, calories: 150 },
      { name: "Plank", duration: 20, calories: 50 }
    ].map(ex => ({
      name: ex.name,
      duration: ex.duration + durationAdjustment,
      calories: ex.calories + calorieAdjustment
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ exercises: dummyExercises })
    };
  }
};
