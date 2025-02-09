const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const diet = (event.queryStringParameters && event.queryStringParameters.diet)
    ? event.queryStringParameters.diet.toLowerCase()
    : 'default';

  const mealQueries = {
    default: {
      breakfast: ['oatmeal', 'eggs', 'yogurt', 'smoothie', 'toast with avocado'],
      lunch: ['chicken salad', 'quinoa bowl', 'turkey sandwich', 'tuna wrap', 'vegetable soup'],
      dinner: ['grilled chicken', 'salmon', 'stir fry', 'pasta', 'rice bowl'],
      snack: ['apple', 'almonds', 'protein bar', 'banana', 'carrots']
    },
    weightloss: {
      breakfast: ['green smoothie', 'egg white omelette', 'oatmeal with berries', 'low-fat yogurt', 'avocado toast'],
      lunch: ['grilled chicken salad', 'vegetable soup', 'quinoa salad', 'lean turkey wrap', 'mixed greens salad'],
      dinner: ['steamed fish', 'grilled vegetables', 'zucchini noodles', 'baked chicken breast', 'stir-fried tofu'],
      snack: ['celery sticks', 'cucumber slices', 'apple', 'carrot sticks', 'handful of almonds']
    },
    musclegain: {
      breakfast: ['protein shake', 'scrambled eggs with spinach', 'oatmeal with protein powder', 'Greek yogurt with berries', 'whole grain toast with peanut butter'],
      lunch: ['chicken breast with brown rice', 'turkey sandwich on whole grain bread', 'lean beef salad', 'grilled salmon with quinoa', 'lentil soup'],
      dinner: ['steak with sweet potatoes', 'grilled chicken with whole wheat pasta', 'baked cod with veggies', 'shrimp stir-fry', 'tofu and vegetable curry'],
      snack: ['protein bar', 'boiled eggs', 'cottage cheese', 'mixed nuts', 'Greek yogurt']
    }
  };

  const selectedMealQueries = mealQueries[diet] || mealQueries['default'];

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  try {
    const mealPlan = await Promise.all(
      mealTypes.map(async (mealType) => {
        const queryArray = selectedMealQueries[mealType];
        const randomQuery = queryArray[Math.floor(Math.random() * queryArray.length)];

        // Make a request to the Nutritionix API
        const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': process.env.NUTRITIONIX_APP_ID,    
            'x-app-key': process.env.NUTRITIONIX_API_KEY,  
          },
          body: JSON.stringify({ query: randomQuery })
        });

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) {
          return {
            mealType,
            food: randomQuery,
            calories: 10,
            protein: 30,
            carbs: 0,
            fat: 0
          };
        }

        const foodItem = data.foods[0];
        return {
          mealType,
          food: foodItem.food_name,
          calories: Math.round(foodItem.nf_calories),
          protein: Math.round(foodItem.nf_protein),
          carbs: Math.round(foodItem.nf_total_carbohydrate),
          fat: Math.round(foodItem.nf_total_fat),
          servingSize: `${foodItem.serving_qty} ${foodItem.serving_unit}`,
          imageUrl: foodItem.photo.thumb
        };
      })
    );

    const dailyTotals = mealPlan.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        meals: mealPlan,
        dailyTotals
      })
    };

  } catch (error) {
    console.error('Error fetching meal plan:', error);
    const dummyMeals = [
      {
        mealType: 'breakfast',
        food: 'Oatmeal',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 2,
        servingSize: '1 cup'
      },
      {
        mealType: 'lunch',
        food: 'Chicken Salad',
        calories: 350,
        protein: 30,
        carbs: 15,
        fat: 12,
        servingSize: '1 bowl'
      },
      {
        mealType: 'dinner',
        food: 'Grilled Salmon',
        calories: 400,
        protein: 35,
        carbs: 0,
        fat: 22,
        servingSize: '1 fillet'
      },
      {
        mealType: 'snack',
        food: 'Apple',
        calories: 95,
        protein: 0,
        carbs: 25,
        fat: 0,
        servingSize: '1 medium'
      }
    ];

    const dummyDailyTotals = dummyMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        meals: dummyMeals,
        dailyTotals: dummyDailyTotals
      })
    };
  }
};
